#!/usr/bin/env python3

import argparse
import os
import time

from enum import Enum, auto

from mc14500util import BYTE_FMT, NIBBLE_FMT, NIBBLE3_FMT, MC14500_VERSION, srec_checksum, cmd_order, valid_depth

# ----------------------------------------------------------------------------------------------------
# Disassembler of the MC14500 Industrial Control Unit (ICU) that is also called 1-bit processor.
# ----------------------------------------------------------------------------------------------------

# (c) 2010 Urs Lindegger
# (c) 2024 Damir Maleničić

# ----------------------------------------------------------------------------------------------------
# Hardware dependent configuration, adjust to match your hardware
# Allowed values for ROM_WIDTH are 8, 12 or 16
# Allowed values for ROM_CMD_ORDER are cmd_order['ins_first'] or cmd_order['ins_last']
# ----------------------------------------------------------------------------------------------------
rom_width = 8
max_rom_depth = 0
rom_cmd_order = cmd_order['ins_last']

# global variables definition
rom = []
error_counter = 0

input_file_format = {
    'srec': 0,
    'hex': 1,
    'bin': 2,
}

# noinspection SpellCheckingInspection
"""
Maps the instruction code to the corresponding assembly mnemonic for the MC14500 ICU instruction set.
"""
# noinspection SpellCheckingInspection
instruction = {0: 'NOPO',
               1: 'LD',
               2: 'LDC',
               3: 'AND',
               4: 'ANDC',
               5: 'OR',
               6: 'ORC',
               7: 'XNOR',
               8: 'STO',
               9: 'STOC',
               10: 'IEN',
               11: 'OEN',
               12: 'JMP',
               13: 'RTN',
               14: 'SKZ',
               15: 'NOPF'}


def to_hex_io_address(io_address, rom_width_):
    """
    Converts an io address as hex string with length depending on the rom width
    :param io_address:
    :param rom_width_:
    :return: io address as hex string
    """
    if rom_width_ == 8:
        hex_io_address = NIBBLE_FMT % io_address
    elif rom_width_ == 12:
        hex_io_address = BYTE_FMT % io_address
    else:
        hex_io_address = NIBBLE3_FMT % io_address
    return hex_io_address


def process_srec_file(input_file):
    """
    Reads the Motorola S record file and interprets the contents
    :param input_file:
    :return: None
    """
    global rom
    global error_counter

    def validate_srec_checksum(srec_line_):
        """
        Validates the checksum of a Motorola S record line
        :param srec_line_:
        :return: True if the checksum is valid, False otherwise
        """
        calculated = srec_checksum(srec_line_[:-2])
        extracted = srec_line_[-2:]
        return calculated == extracted

    print("Motorola S record file selected.")

    with open(input_file, 'r') as handle_srec_file:
        srec_file_content = handle_srec_file.readlines()

    match rom_width:
        case 8:
            srec_file_chars_per_mem_loc = 2
        case 12:
            srec_file_chars_per_mem_loc = 3
        case _:
            srec_file_chars_per_mem_loc = 4

    address = 0
    rom_dump = ""
    line_number = 0
    for srec_line in srec_file_content:
        line_number += 1
        # interpret the S record asm file contents
        srec_line = srec_line.strip('\r\n')
        srec_line = srec_line.upper()
        if not validate_srec_checksum(srec_line):
            print("Error: invalid SREC checksum line: ", line_number)
            error_counter += 1
            break
        if srec_line.startswith('S1'):
            srec_line = srec_line[8:len(srec_line) - 2]  # remove 'S1', byte count, address and checksum byte
            rom_dump += srec_line

    for i in range(0, len(rom_dump), srec_file_chars_per_mem_loc):
        rom_entry = (address, int(rom_dump[i: i + srec_file_chars_per_mem_loc], 16))  # address and value
        rom += [rom_entry]
        address += 1

    # sort the memory and check if certain memory locations are written more than once e.g., due to conflicting orgs
    rom.sort()
    old_pc = -1  # dummy value that can not be equal to an unsigned address
    for i in range(len(rom)):
        if rom[i][0] == old_pc:
            print("Error: More than once data assigned to ROM address: %4.4x." % rom[i][0])
            error_counter += 1
        old_pc = rom[i][0]


def process_hex_file(input_file):
    """
    Reads the hex file and interprets the contents
    :param input_file:
    :return: None
    """
    global rom
    global error_counter

    print("Hex file selected")

    file_size = os.path.getsize(input_file)
    if file_size == 0 or file_size % 2 != 0:
        print("Error: invalid hex file size")
        exit(1)

    match rom_width:
        case 8:
            bytes_to_read = 2   # read 2 hex characters into 1 rom location
        case 12:
            bytes_to_read = 6   # read 6 hex characters into 2 rom locations
        case _:
            bytes_to_read = 4   # read 4 hex characters into 1 rom location

    # interpret the hex file contents
    with open(input_file, 'r') as handle_asm_file:
        data_bytes = handle_asm_file.read(file_size)
        address = 0
        for pos in range(0, file_size, bytes_to_read):
            try:
                rom_loc_value = int("".join(data_bytes[pos:pos + bytes_to_read]), 16)
                # rom_width 12 is a special case since 3 bytes are read into 2 rom locations, this is the first location
                if rom_width == 12:
                    rom_entry = (address, (rom_loc_value & 0x0FFF000) >> 12)
                    rom += [rom_entry]
                    address += 1
                    rom_loc_value &= 0x0FFF

                rom_entry = (address, rom_loc_value)
                rom += [rom_entry]
                address += 1
            except ValueError:
                print("Error: invalid hex value " + data_bytes[pos] + data_bytes[pos + 1] + " at position " + str(pos))
                error_counter += 1


def process_bin_file(input_file):
    """
    Reads the raw binary file and interprets the contents
    :param input_file:
    :return: None
    """
    global rom
    global error_counter

    print("Raw binary file selected")

    byte_count = os.path.getsize(input_file)
    match rom_width:
        case 8:
            bytes_to_read = 1   # read 1 byte into 1 rom location
        case 12:
            bytes_to_read = 3   # read 3 bytes into 2 rom locations
        case _:
            bytes_to_read = 2   # read 2 bytes into 1 rom location

    # interpret the raw binary file contents
    with open(input_file, 'rb') as handle_asm_file:
        data_bytes = handle_asm_file.read(byte_count)
        address = 0
        for pos in range(0, byte_count, bytes_to_read):
            match rom_width:
                case 8:
                    value = data_bytes[pos]
                # rom_width 12 is a special case since 3 bytes are read into 2 rom locations, this is the first location
                case 12:
                    value = data_bytes[pos] * 65536 + data_bytes[pos + 1] * 256 + data_bytes[pos + 2]
                    rom_entry = (address, value >> 12)
                    rom += [rom_entry]
                    address += 1
                    value &= 0x0FFF
                case _:
                    value = data_bytes[pos] * 256 + data_bytes[pos + 1]
            rom_entry = (address, value)
            rom += [rom_entry]
            address += 1


def write_disassembled_rom_location(inst, hex_io_address, handle_asm_file):
    """
    Converts the instruction code to the corresponding assembly mnemonic and writes it together with the io address to the
    disassembly file. If the instruction code is unknown, an error message is printed and error counter is incremented.
    :param inst:
    :param hex_io_address:
    :param handle_asm_file:
    :return: error counter
    """
    global error_counter

    inst_str = instruction.get(inst, "")
    if inst_str != "":
        handle_asm_file.write(inst_str + " " + hex_io_address + '\r\n')
    else:
        # not possible by wrong data since 4bit=16instructions, but possible by a bug in disassembler
        error_counter += 1
        print("Error: unknown instruction")

    return error_counter


def process_rom_location(addr):
    """
    Extracts the instruction and the io address information from the ROM location at address addr
    :param addr: ROM address
    :return: instruction and io address
    """
    global rom
    global rom_width
    global rom_cmd_order

    match rom_width:
        case 8:
            if rom_cmd_order == cmd_order['ins_first']:
                inst = rom[addr][1] // 16
                io_address = rom[addr][1] % 16
            else:
                inst = rom[addr][1] % 16
                io_address = rom[addr][1] // 16
        case 12:
            if rom_cmd_order == cmd_order['ins_first']:
                inst = (rom[addr][1] & 0x0F00) >> 8
                io_address = rom[addr][1] & 0x00FF
            else:
                inst = rom[addr][1] & 0x000F
                io_address = (rom[addr][1] & 0x0FF0) >> 4
        case _:
            if rom_cmd_order == cmd_order['ins_first']:
                inst = (rom[addr][1] & 0x00F000) >> 12
                io_address = rom[addr][1] & 0x0FFF
            else:
                inst = rom[addr][1] & 0x000F
                io_address = (rom[addr][1] & 0x0FFF0) >> 4

    return inst, io_address


def export_disassembly_file(input_file_name, output_file_name):
    """
    Creates and writes the disassembly file
    :param input_file_name:
    :param output_file_name:
    :return: number of encountered errors
    """
    global error_counter
    global rom
    global rom_width
    global rom_cmd_order

    with open(output_file_name, 'w') as handle_dis_file:
        handle_dis_file.write("; Code created with disassembler mc14500dis\r\n")
        handle_dis_file.write("; Input file " + input_file_name + "\r\n")
        handle_dis_file.write("; Version " + MC14500_VERSION + "\r\n")
        handle_dis_file.write("; Creation date " + time.ctime() + "\r\n")
        for i in range(len(rom)):
            if i != rom[i][0]:
                print("Error: Memory hole detected on addrss", hex(i), "expeced location", rom[i][0], ".")
                error_counter += 1
                break
            else:
                inst, io_address = process_rom_location(i)

            hex_io_address = to_hex_io_address(io_address, rom_width)
            error_counter = write_disassembled_rom_location(inst, hex_io_address, handle_dis_file)

    return error_counter


class HeaderElem(Enum):
    WIDTH = auto()
    DEPTH = auto()
    ADDRESS_RADIX = auto()
    DATA_RADIX = auto()
    CORRECT = auto()


MIF_FILE_ERROR_MSG = "Error: invalid MIF file format line:"


def mif_remove_comments(tokens):
    """
    Removes comments from the result of MIF file tokenization, but preserve the newline tokens
    evenn in comments so that the line number can be correctly reported in error messages.
    :param tokens:
    :return: list of tokens without tokens in comments
    """
    class State(Enum):
        OUTSIDE = auto()
        INSIDE_SINGLELINE_COMMENT = auto()
        INSIDE_MULTILINE_COMMENT = auto()

    state = State.OUTSIDE
    result = []

    for token in tokens:
        match token:
            case '--':
                if state == State.OUTSIDE:
                    state = State.INSIDE_SINGLELINE_COMMENT
            case '%':
                if state == State.OUTSIDE:
                    state = State.INSIDE_MULTILINE_COMMENT
                elif state == State.INSIDE_MULTILINE_COMMENT:
                    state = State.OUTSIDE
            case os.linesep:
                if state == State.INSIDE_SINGLELINE_COMMENT:
                    state = State.OUTSIDE
                result.append(token)
            case '':
                continue
            case _:
                if state == State.OUTSIDE:
                    result.append(token)

    return result


def mif_tokenize(mif_file_content):
    """
    Tokenizes the MIF file content and remove comments but preserve newline tokens even in comments
    :param mif_file_content:
    :return: list of tokens
    """
    symbols = [';', ':', '%', '[', ']', os.linesep]
    other_symbols = ['--', '..']
    keywords = ['WIDTH', 'DEPTH', 'ADDRESS_RADIX', 'DATA_RADIX', 'CONTENT', 'BEGIN', 'END', 'HEX', 'DEC', 'OCT', 'BIN', 'UNS']
    all_keywords = symbols + other_symbols + keywords
    whitespace = [' ', '\t']
    token_delimiters = ['.', '-']  # the first character of other_symbols can be a previous token delimiter

    tokens = []
    token = ''
    file_len = len(mif_file_content)

    for cur_idx, char in enumerate(mif_file_content):
        next_idx = cur_idx + 1
        next_char = mif_file_content[next_idx] if next_idx < file_len else None
        if char in token_delimiters and next_char == char:
            tokens.append(token)
            token = char + next_char
        elif char not in whitespace + token_delimiters:
            token += char
        if next_char in whitespace or next_char in all_keywords or token in all_keywords:
            if token:
                tokens.append(token)
                token = ''
    if token:
        tokens.append(token)

    tokens = mif_remove_comments(tokens)
    return tokens


def mif_consume_till_end_of_line(tokens, line_number):
    """
    Consumes the rest of the line. This is error recovery.
    :param tokens:
    :param line_number:
    :return: tokens, line number
    """
    while tokens:
        token = tokens[0]
        tokens = tokens[1:]
        if token == os.linesep:
            break

    if tokens:
        return tokens, line_number + 1
    else:
        return [], line_number


def mif_consume_multiline_comment(tokens, line_number):
    """
    Consumes a multiline comment from the MIF file
    :param tokens:
    :param line_number:
    :return: tokens, line number
    """
    while tokens:
        token = tokens[0]
        tokens = tokens[1:]
        if token == os.linesep:
            line_number += 1
        elif token == '%':
            break

    return tokens, line_number


def mif_consume_singleline_comment(param, line_number):
    """
    Consumes a single line comment from the MIF file    
    :param param: 
    :param line_number: 
    :return: tokens, line number
    """""
    return mif_consume_till_end_of_line(param, line_number)


def mif_match_begin(tokens, line_number):
    """
    Matches the BEGIN token in the MIF file
    :param tokens:
    :param line_number:
    :return:
    """
    global error_counter

    while tokens:
        token = tokens[0]
        tokens = tokens[1:]

        match token:
            case 'BEGIN':
                return True, tokens, line_number
            case os.linesep:
                line_number += 1
            case _:
                print(MIF_FILE_ERROR_MSG, line_number, "Expecting 'BEGIN' token, found", token, '.')
                error_counter += 1
                tokens, line_number = mif_consume_till_end_of_line(tokens, line_number)
                return False, tokens, line_number

    print(MIF_FILE_ERROR_MSG, line_number, "End of file reached but expecting 'BEGIN' token.")
    error_counter += 1
    return False, [], line_number


def mif_match_semicolumn(tokens, line_number):
    """
    Matches the ';' token in the MIF file
    :param tokens:
    :param line_number:
    :return: success indicator, remaining tokens, line number
    """
    global error_counter

    while tokens:
        token = tokens[0]
        tokens = tokens[1:]
        match token:
            case ';':
                return True, tokens, line_number
            case os.linesep:
                continue
            case _:
                print(MIF_FILE_ERROR_MSG, line_number, "Expecting ';' token, found", token, '.')
                error_counter += 1
                tokens, line_number = mif_consume_till_end_of_line(tokens, line_number)
                return False, tokens, line_number

    print(MIF_FILE_ERROR_MSG, line_number, "End of file reached but expecting ';' token.")
    error_counter += 1
    return False, [], line_number


def mif_match_column(tokens, line_number):
    """
    Matches the ':' token in the MIF file
    :param tokens:
    :param line_number:
    :return: success indicator, remaining tokens, line number
    """
    global error_counter

    while tokens:
        token = tokens[0]
        tokens = tokens[1:]
        match token:
            case ':':
                return True, tokens, line_number
            case os.linesep:
                continue
            case _:
                print(MIF_FILE_ERROR_MSG, line_number, "Expecting ':' token, found", token, '.')
                error_counter += 1
                tokens, line_number = mif_consume_till_end_of_line(tokens, line_number)
                return False, tokens, line_number

    print(MIF_FILE_ERROR_MSG, line_number, "End of file reached but expecting ':' token.")
    error_counter += 1
    return False, [], line_number


def mif_match_equals(tokens, line_number):
    """
    Matches the '=' token in the MIF file
    :param tokens:
    :param line_number:
    :return: success indicator, remaining tokens, line number
    """
    global error_counter

    while tokens:
        token = tokens[0]
        tokens = tokens[1:]
        match token:
            case '=':
                return True, tokens, line_number
            case os.linesep:
                continue
            case _:
                print(MIF_FILE_ERROR_MSG, line_number, "Expecting '=' token, found", token, '.')
                error_counter += 1
                tokens, line_number = mif_consume_till_end_of_line(tokens, line_number)
                return False, tokens, line_number

    print(MIF_FILE_ERROR_MSG, line_number, "End of file reached but expecting '=' token.")
    error_counter += 1
    return False, [], line_number


def mif_match_numerical_value(tokens, radix, line_number):
    """
    Matches a decimal value in the MIF file
    :param tokens:
    :param radix:
    :param line_number:
    :return: value, remaining tokens, line number
    """
    global error_counter

    while tokens:
        token = tokens[0]
        tokens = tokens[1:]
        if token == os.linesep:
            continue

        try:
            value = int(token, radix)
            return value, tokens, line_number

        except ValueError:
            match radix:
                case 16:
                    radix_str = 'HEX'
                case 10:
                    radix_str = 'DEC'
                case 8:
                    radix_str = 'OCT'
                case 2:
                    radix_str = 'BIN'
                case _:
                    radix_str = 'HEX'
            print(MIF_FILE_ERROR_MSG, line_number, "Expecting", radix_str, "value, found", token, '.')
            error_counter += 1
            tokens, line_number = mif_consume_till_end_of_line(tokens, line_number)
            break

    return None, tokens, line_number


def mif_width_value(tokens, line_number):
    """
    Parses the WIDTH value of the MIF file
    :param tokens:
    :param line_number:
    :return: width, remaining tokens, line number
    """
    global error_counter

    equals_found, tokens, line_number = mif_match_equals(tokens, line_number)
    if not equals_found:
        print(MIF_FILE_ERROR_MSG, line_number, "WIDTH value is not defined, defaulting to 8.")
        error_counter += 1
        return 8, tokens, line_number

    width, tokens, line_number = mif_match_numerical_value(tokens, 10, line_number)
    if width not in [8, 12, 16]:
        print(MIF_FILE_ERROR_MSG, line_number, "WIDTH value", width, "is not in [8, 12, 16], defaulting to 8.")
        error_counter += 1
        width = 8

    _, tokens, line_number = mif_match_semicolumn(tokens, line_number)
    return width, tokens, line_number


def mif_depth_value(tokens, line_number):
    """
    Parses the DEPTH value of the MIF file
    :param tokens:
    :param line_number:
    :return: depth, remaining tokens, line number
    """
    global error_counter

    equals_found, tokens, line_number = mif_match_equals(tokens, line_number)
    if not equals_found:
        print(MIF_FILE_ERROR_MSG, line_number, "DEPTH value is not defined, defaulting to 256.")
        error_counter += 1
        return 8, tokens, line_number

    depth, tokens, line_number = mif_match_numerical_value(tokens, 10, line_number)
    if not valid_depth(depth):
        print(MIF_FILE_ERROR_MSG, line_number, "DEPTH value", depth, "is not valid, defaulting to 256.")
        error_counter += 1
        depth = 256

    _, tokens, line_number = mif_match_semicolumn(tokens, line_number)
    return depth, tokens, line_number


def mif_radix_value(tokens, line_number):
    """
    Parses the ADDRESS_RADIX or DATA_RADIX value of the MIF file
    :param tokens:
    :param line_number:
    :return: radix, remaining tokens, line number
    """
    global error_counter

    equals_found, tokens, line_number = mif_match_equals(tokens, line_number)
    if not equals_found:
        print(MIF_FILE_ERROR_MSG, line_number, "RADIX value is not defined, defaulting to HEX.")
        error_counter += 1
        return 16, tokens, line_number

    radix = 16
    while tokens:
        token = tokens[0]
        tokens = tokens[1:]
        match token:
            case 'HEX':
                break
            case 'DEC':
                radix = 10
                break
            case 'UNS':
                radix = 10
                break
            case 'OCT':
                radix = 8
                break
            case 'BIN':
                radix = 2
                break
            case os.linesep:
                continue
            case _:
                print(MIF_FILE_ERROR_MSG, line_number, "RADIX value", token, "is not valid, defaulting to HEX.")
                error_counter += 1

    _, tokens, line_number = mif_match_semicolumn(tokens, line_number)
    return radix, tokens, line_number


def mif_header_consistency_check(header_map, line_number):
    """
    Checks the consistency of the header of the MIF file
    :param header_map:
    :param line_number:
    :return: header map
    """
    global error_counter

    header_map[HeaderElem.CORRECT] = True
    if HeaderElem.WIDTH not in header_map:
        print(MIF_FILE_ERROR_MSG, line_number, "WIDTH missing.")
        error_counter += 1
        header_map[HeaderElem.WIDTH] = rom_width
        header_map[HeaderElem.CORRECT] = False
    if HeaderElem.DEPTH not in header_map:
        print(MIF_FILE_ERROR_MSG, line_number, "DEPTH missing.")
        error_counter += 1
        header_map[HeaderElem.DEPTH] = max_rom_depth
        header_map[HeaderElem.CORRECT] = False
    if HeaderElem.ADDRESS_RADIX not in header_map:
        print(MIF_FILE_ERROR_MSG, line_number, "ADDRESS_RADIX missing.")
        error_counter += 1
        header_map[HeaderElem.ADDRESS_RADIX] = 16
        header_map[HeaderElem.CORRECT] = False
    if HeaderElem.DATA_RADIX not in header_map:
        print(MIF_FILE_ERROR_MSG, line_number, "DATA_RADIX missing.")
        error_counter += 1
        header_map[HeaderElem.DATA_RADIX] = 16
        header_map[HeaderElem.CORRECT] = False
    return header_map


def mif_parse_header(tokens, line_number, header_map):
    """
    Parses the header of the MIF file
    :param tokens:
    :param line_number:
    :param header_map:
    :return: header map, remaining tokens, line number
    """
    global error_counter

    if not tokens:
        return header_map, tokens, line_number

    while tokens:
        token = tokens[0]
        tokens = tokens[1:]
        match token:
            case 'WIDTH':
                width, tokens, line_number = mif_width_value(tokens, line_number)
                header_map[HeaderElem.WIDTH] = width

            case 'DEPTH':
                depth, tokens, line_number = mif_depth_value(tokens, line_number)
                header_map[HeaderElem.DEPTH] = depth
                return mif_parse_header(tokens, line_number, header_map)

            case 'ADDRESS_RADIX':
                address_radix, tokens, line_number = mif_radix_value(tokens, line_number)
                header_map[HeaderElem.ADDRESS_RADIX] = address_radix

            case 'DATA_RADIX':
                data_radix, tokens, line_number = mif_radix_value(tokens, line_number)
                header_map[HeaderElem.DATA_RADIX] = data_radix

            case 'CONTENT':
                header_map = mif_header_consistency_check(header_map, line_number)
                return header_map, tokens, line_number

            case os.linesep:
                line_number += 1

            case _:
                print(MIF_FILE_ERROR_MSG, line_number, "Unknown header element", token, '.')
                error_counter += 1
                tokens, line_number = mif_consume_till_end_of_line(tokens, line_number)
                return mif_parse_header(tokens, line_number, header_map)

    print(MIF_FILE_ERROR_MSG, line_number, "End of file reached without reaching CONTENT.")
    error_counter += 1
    return header_map, tokens, line_number


def mif_parse_end(tokens, line_number):
    """

    :param tokens:
    :param line_number:
    :return:
    """
    global error_counter

    ok, tokens, line_number = mif_match_semicolumn(tokens, line_number)
    if not ok:
        print(MIF_FILE_ERROR_MSG, line_number, "Expecting ';' token.")
        error_counter += 1

    return ok, tokens, line_number


# noinspection GrazieInspection
def mif_match_double_dots(tokens, line_number):
    """
    Matches the '..' token in the MIF file
    :param tokens:
    :param line_number:
    :return: success indicator, remaining tokens, line number
    """
    global error_counter

    while tokens:
        token = tokens[0]
        tokens = tokens[1:]
        match token:
            case '..':
                return True, tokens, line_number
            case os.linesep:
                continue
            case _:
                print(MIF_FILE_ERROR_MSG, line_number, "Expecting '..' token, found", token, '.')
                error_counter += 1
                tokens, line_number = mif_consume_till_end_of_line(tokens, line_number)
                return False, tokens, line_number

    print(MIF_FILE_ERROR_MSG, line_number, "End of file reached but expecting '..' token.")
    error_counter += 1
    return False, [], line_number


# noinspection GrazieInspection
def mif_match_closing_bracket(tokens, line_number):
    """
    Matches the ']' token in the MIF file
    :param tokens:
    :param line_number:
    :return: success indicator, remaining tokens, line number
    """
    global error_counter

    while tokens:
        token = tokens[0]
        tokens = tokens[1:]
        match token:
            case ']':
                return True, tokens, line_number
            case os.linesep:
                continue
            case _:
                print(MIF_FILE_ERROR_MSG, line_number, "Expecting ']' token, found", token, '.')
                error_counter += 1
                tokens, line_number = mif_consume_till_end_of_line(tokens, line_number)
                return False, tokens, line_number

    print(MIF_FILE_ERROR_MSG, line_number, "End of file reached but expecting ']' token.")
    error_counter += 1
    return False, [], line_number


def mif_parse_address_list(tokens, address_radix, line_number):
    """
    Parses the address list in the MIF file
    :param tokens:
    :param address_radix:
    :param line_number:
    :return: column found indicator, list of addresses, remaining tokens, line number
    """
    global error_counter
    lower_address_bound, tokens, line_number = mif_match_numerical_value(tokens, address_radix, line_number)
    if lower_address_bound is None:
        print(MIF_FILE_ERROR_MSG, line_number, "Invalid address lower bound.")
        error_counter += 1
        return False, [], tokens, line_number
    ok, tokens, line_number = mif_match_double_dots(tokens, line_number)
    if not ok:
        return False, [], tokens, line_number
    upper_address_bound, tokens, line_number = mif_match_numerical_value(tokens, address_radix, line_number)
    if upper_address_bound is None:
        print(MIF_FILE_ERROR_MSG, line_number, "Invalid address upper bound.")
        error_counter += 1
        return False, [], tokens, line_number
    ok, tokens, line_number = mif_match_closing_bracket(tokens, line_number)
    if not ok:
        return False, [], tokens, line_number
    ok, tokens, line_number = mif_match_column(tokens, line_number)
    if not ok:
        return False, [], tokens, line_number
    return True, range(lower_address_bound, upper_address_bound + 1), tokens, line_number


def mif_parse_address_content(token, tokens, address_radix, line_number):
    """
    Parses the address content in the MIF file
    :param token:
    :param tokens:
    :param address_radix:
    :param line_number:
    :return: list of addresses, remaining tokens, line number
    """
    global error_counter

    addresses = []
    column = False

    while True:
        match token:
            case os.linesep:
                line_number += 1
            case '[':
                column, addresses, tokens, line_number = mif_parse_address_list(tokens, address_radix, line_number)
                break

            case _:
                tokens.insert(0, token)
                address, tokens, line_number = mif_match_numerical_value(tokens, address_radix, line_number)
                if address is not None:
                    addresses.append(address)
                    column, tokens, line_number = mif_match_column(tokens, line_number)
                    break

                else:
                    print(MIF_FILE_ERROR_MSG, line_number, "Invalid address value", token, address)
                    error_counter += 1
                    break
        if not tokens:
            break
        else:
            token = tokens[0]
            tokens = tokens[1:]

    if not column:
        print(MIF_FILE_ERROR_MSG, line_number, "Expecting ':' token")
        error_counter += 1
        tokens, line_number = mif_consume_till_end_of_line(tokens, line_number)

    return addresses, tokens, line_number

def mif_parse_value_content(tokens, data_radix, line_number):
    """
    Parses the value content in the MIF file
    :param tokens:
    :param data_radix:
    :param line_number:
    :return: list of data values, remaining tokens, line number
    """
    global error_counter

    values = []
    while tokens:
        token = tokens[0]
        tokens = tokens[1:]
        match token:
            case os.linesep:
                continue
            case ';':
                break
            case _:
                tokens.insert(0, token)
                value, tokens, line_number = mif_match_numerical_value(tokens, data_radix, line_number)
                if value is not None:
                    values.append(value)
                else:
                    break
    return values, tokens, line_number


def mif_parse_address_value_pair(addresses, values, tokens, line_number):
    """
    Parses the address and value pair in the MIF file
    :param addresses:
    :param values:
    :param tokens:
    :param line_number:
    :return: remaining tokens, line number
    """
    global error_counter

    if len(addresses) == len(values):
        for address, value in zip(addresses, values):
            rom.append((address, value))
    elif len(addresses) == 1:
        for offset, value in enumerate(values):
            rom.append((addresses[0] + offset, value))
    elif len(values) == 1:
        value = values[0]
        for address in addresses:
            rom.append((address, value))
    else:
        print(MIF_FILE_ERROR_MSG, line_number, "Number of addresses and values do not match.")
        error_counter += 1
        tokens, line_number = mif_consume_till_end_of_line(tokens, line_number)

    return tokens, line_number


def mif_process_content(tokens, header_map, line_number):
    """
    Processes the content of the MIF file
    :param tokens:
    :param header_map:
    :param line_number:
    :return: finish indicator, remaining tokens, line number
    """
    global error_counter

    while tokens:
        token = tokens[0]
        tokens = tokens[1:]

        match token:
            case os.linesep:
                line_number += 1
            case 'END':
                ok, tokens, line_number = mif_parse_end(tokens, line_number)
                return not ok, tokens, line_number
            case _:
                # get address(es)
                addresses, tokens, line_number = mif_parse_address_content(token, tokens,
                                                                           header_map[HeaderElem.ADDRESS_RADIX],
                                                                           line_number)
                # get value(s)
                values, tokens, line_number = mif_parse_value_content(tokens,
                                                                      header_map[HeaderElem.DATA_RADIX],
                                                                      line_number)
                tokens, line_number = mif_parse_address_value_pair(addresses, values, tokens, line_number)

    print(MIF_FILE_ERROR_MSG, line_number, "End of file reached without reaching END.")
    error_counter += 1
    return False, tokens, line_number


def process_mif_file(input_file):
    """
    Reads the Memory Initialization File (MIF) and interprets the contents
    :param input_file:
    :return: error counter
    """
    global error_counter

    print("Memory Initialization File (MIF) selected.")

    # read the file
    with open(input_file, 'r') as handle_mif_file:
        mif_file_content = handle_mif_file.readlines()

    # lexical analysis of the MIF file
    tokens = mif_tokenize("".join(mif_file_content))

    # parse the MIF file using recursive descent parsing
    line_number = 1
    header_map, tokens, line_number = mif_parse_header(tokens, line_number, {})


    ok, tokens, line_number = mif_match_begin(tokens, line_number)
    if ok:
        more, tokens, line_number = mif_process_content(tokens, header_map, line_number)
        if not more:
            return error_counter

    print("Error: End of file reached without reaching END.")
    error_counter += 1
    return error_counter


# noinspection SpellCheckingInspection
def main():
    """
    The main function
    :return: None
    """
    global error_counter
    global rom
    global rom_width
    global rom_cmd_order

    parser = argparse.ArgumentParser(
        usage='%(prog)s [-v] [-h] [-w width] [-i instr_position] [-o output_file] input_file',
        description='MC14500 Disassembler',
        add_help=True)

    parser.add_argument('input_file', type=str, help='input file in srec, hex or bin format')
    parser.add_argument('-o', '--out', type=str,
                        help='output file, default is input file name with appended .dis extension')
    parser.add_argument('-v', '--version', action='version', version='%(prog)s ' + MC14500_VERSION)
    parser.add_argument('-w', '--width', type=int,
                        help='the width of the ROM in bits (8, 12 or 16), required for hex and bin input file format',
                        default=8, choices=[8, 12, 16])
    parser.add_argument('-i', '--instr-position', type=str,
                        help='position of INS field in a command: first|last, default is last',
                        default='last',
                        choices=['first', 'last'])

    args = parser.parse_args()

    input_file_name = args.input_file
    rom_width = args.width
    ins_pos_str = args.instr_position
    rom_cmd_order = cmd_order['ins_' + ins_pos_str]

    print()
    print("MC14500 Disassembler for the ICU 1-bit processor." + os.linesep +
          "Based on the original work of Urs Lindegger." + os.linesep +
          "see https://www.linurs.org/mc14500.html")
    print()
    print(f"ROM depth: {max_rom_depth} [words]")
    print(f"ROM width: {rom_width} [bits]")
    if ins_pos_str == 'first':
        print("The 4 most significant bits are the mc14500 instruction op-code.")
    else:
        print("The 4 least significant bits are the mc14500 instruction op-code")
    print("Supported input file formats: Motorola S-record in S19-style,")
    print("                              Memory Initialization File (mif),")
    print("                              HEX and raw binary.")
    print("Version " + MC14500_VERSION)
    print()

    # get the asm input file
    if not os.access(input_file_name, os.F_OK):
        print("Disassembler input file not found.")
        exit(1)

    input_file_name_words = input_file_name.split('.')
    ext = input_file_name_words[-1].lower()

    # get the disassembler input file
    if not os.access(input_file_name, os.F_OK):
        print("Input file not found")
        exit(1)

    output_file_name = args.out
    if output_file_name == '':
        output_file_name = ".".join(input_file_name_words[0:-1]) + '.dis'

    # get the disassembler input file
    if os.access(output_file_name, os.F_OK):
        print("Output file exists, overwrite? (y/n):")
        answer = input()
        if answer != 'y':
            print("Disassembler aborted.")
            exit(1)

    # process the input file according to the file extension
    match ext:
        case "srec":
            process_srec_file(input_file_name)
        case "mif":
            process_mif_file(input_file_name)
        case "hex":
            process_hex_file(input_file_name)
        case "bin":
            process_bin_file(input_file_name)
        case _:
            print("Error: Unknown file format.")
            print("Note:  File format is determined from the file extension.")
            print("       Supported file formats are: srec, hex, bin.")
            print()
            exit(1)

    if error_counter != 0:
        print("Disassembler failed with", error_counter, " error(s).")
        exit(1)

    print("Size of assembly:", len(rom), "Locations(s) of", rom_width, "bit(s).")
    error_counter = export_disassembly_file(input_file_name, output_file_name)

    if error_counter != 0:
        print("Disassembler failed with", error_counter, " error(s).")
        exit(1)

    print("Disassembler succeeded.")
    print("Asm file: ", output_file_name, " created.")


if __name__ == '__main__':
    main()
    exit(0)
