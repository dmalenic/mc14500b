#!/usr/bin/env python3

import argparse
import os
import time

from mc14500util import BYTE_FMT, NIBBLE_FMT, NIBBLE3_FMT, WORD_FMT, MC14500_VERSION, srec_checksum, cmd_order, \
    valid_depth

# ----------------------------------------------------------------------------------------------------
# Assembler for the mc14500 Industrial Control Unit (ICU) that is also considered as a 1-bit processor
# ----------------------------------------------------------------------------------------------------

# (c) 2010 Urs Lindegger
# (c) 2024 Damir Maleničić

# ----------------------------------------------------------------------------------------------------
# Hardware dependent configuration, adjust to match your hardware
# Allowed values for ROM_WIDTH are 8, 12 or 16
# Allowed values for MAX_ROM_DEPTH are positive integer multiples of 128 up to and including 65536
# Allowed values for ROM_CMD_ORDER are cmd_order['ins_first'] or cmd_order['ins_last']
# ----------------------------------------------------------------------------------------------------
rom_width = 8
max_rom_depth = 256

rom_cmd_order = cmd_order['ins_last']
non_programmed_location_value = 0x00

# ----------------------------------------------------------------------------------------------------
# Global variables
# ----------------------------------------------------------------------------------------------------
program_counter = 0
rom = {}
map_none = {}
map_read = {}
map_write = {}
error_counter = 0
equals = {}
lut = {}
labels = {}
# noinspection SpellCheckingInspection
instruction = {'NOPO': 0,
               'LD': 1,
               'LDC': 2,
               'AND': 3,
               'ANDC': 4,
               'OR': 5,
               'ORC': 6,
               'XNOR': 7,
               'STO': 8,
               'STOC': 9,
               'IEN': 10,
               'OEN': 11,
               'JMP': 12,
               'RTN': 13,
               'SKZ': 14,
               'NOPF': 15}

include_directory = ''


def map_lut_index_to_label_location(asm_file_name, key, value):
    """
    Maps the LUT index to a label location
    :param asm_file_name:
    :param key:
    :param value:
    :return: lut_index and label location
    """
    lut_dump_idx = int(value, 16)
    if labels.get(key, None) is not None:
        addr = labels[key]
    else:
        addr = 0
        print(f"Worning: Unknown label: '{key}' in file '{asm_file_name}' assumed value 0.")

    return lut_dump_idx, addr


def dump_lut_to_integer_array(asm_file_name):
    """
    Creates a LUT dump as a list of program counter values of a size of LUT table (IO address space)
    :param asm_file_name:
    :return: LUT dump
    """
    global lut
    global labels
    global rom_width

    match rom_width:
        case 8: lut_rom_depth = 16
        case 12: lut_rom_depth = 256
        case _: lut_rom_depth = 4096

    lut_dump = [0] * lut_rom_depth

    for key, value in lut.items():
        lut_dump_idx, addr = map_lut_index_to_label_location(asm_file_name, key, value)
        lut_dump[lut_dump_idx] = addr

    return lut_dump


def dump_lut_to_byte_array(asm_file_name):
    """
    Creates a LUT dump as an array of bytes of a size of LUT table times memory width divided by 8
    :param asm_file_name:
    :return: LUT dump
    """
    global lut
    global labels

    if max_rom_depth <= 256:
        lut_rom_width = 8
    elif max_rom_depth <= 4096:
        lut_rom_width = 12
    else:
        lut_rom_width = 16

    match rom_width:
        case 8: lut_rom_depth = 16
        case 12: lut_rom_depth = 256
        case _: lut_rom_depth = 4096

    lut_byte_dump = bytearray([0] * (lut_rom_depth * lut_rom_width // 8))

    for key, value in lut.items():
        lut_dump_idx, addr = map_lut_index_to_label_location(asm_file_name, key, value)

        match lut_rom_width:
            case 8:
                lut_byte_dump[lut_dump_idx] = addr & 0x00FF
            case 12:
                if lut_dump_idx % 2 == 0:
                    pos = lut_dump_idx * 3 // 2
                    lut_byte_dump[pos] = addr >> 4
                    lut_byte_dump[pos + 1] |= (addr & 0x0F) << 4
                else:
                    pos = lut_dump_idx * 3 // 2
                    lut_byte_dump[pos] |= (addr >> 8) & 0x0F
                    lut_byte_dump[pos + 1] = addr & 0x00FF
            case _:
                pos = lut_dump_idx * 2
                lut_byte_dump[pos] = addr // 256
                lut_byte_dump[pos + 1] = addr & 0x00FF

    return lut_byte_dump


def merge_cmd_io_addr(inst, io_addr):
    """
    Combines 14500 4-bit instruction code and IO addresse together
    depending on the hardware design of the ICU peripherals.
    :param inst:
    :param io_addr:
    :return: assembled rom location content
    """
    global rom_width
    global rom_cmd_order

    if rom_cmd_order == cmd_order['ins_first']:
        data = inst * 16 * (1 << (rom_width - 8)) + io_addr
    else:
        data = io_addr * 16 + inst

    match rom_width:
        case 8: data &= 0x00FF
        case 12: data &= 0x0FFF
        case _: data &= 0x00FFFF

    return data


def add_command(data, asm_file_name, line_counter, lst_file):
    """
    Puts a commands into a list (rom variable) to make it is easy to export in various formats
    :param data:
    :param asm_file_name:
    :param line_counter:
    :param lst_file:
    :return: None
    """
    global error_counter
    global program_counter
    global rom

    if rom.get(program_counter, None) is not None:
        addr_fmt, _ = get_addr_and_data_fmt_strings()
        in_string = f"Error: data assigned to ROM address: {(addr_fmt % program_counter)} more than once, in file: '{asm_file_name}' line:{line_counter}"
        print(in_string)
        lst_file.write(in_string + os.linesep)
        error_counter += 1
    else:
        rom[program_counter] = data

    program_counter += 1


def map_io(inst, io_addr):
    """
    A helper function that associates program instructions with IO operations, writes and reads.
    The result is put in the map file that can be useful for analyzing old or others code and hardware
    :param inst
    :param io_addr
    :return None
    """
    global map_none
    global map_read
    global map_write

    # check how io address is used, it can either be read, or written or accessed without effect
    # noinspection SpellCheckingInspection
    if inst in [instruction['NOPO'], instruction['JMP'], instruction['RTN'], instruction['SKZ']]:
        map_none[io_addr] = map_none.get(io_addr, 0) + 1
    elif inst in [instruction['LD'], instruction['LDC'], instruction['AND'], instruction['ANDC'], instruction['OR'],
                  instruction['ORC'], instruction['XNOR'], instruction['IEN'], instruction['OEN']]:
        map_read[io_addr] = map_read.get(io_addr, 0) + 1
    elif inst in [instruction['STO'], instruction['STOC']]:
        map_write[io_addr] = map_write.get(io_addr, 0) + 1
    else:
        map_none[io_addr] = map_none.get(io_addr, 0) + 1


def get_addr_and_data_fmt_strings(data_fmt_char='X'):
    """
    Generate the format strings for the address and data fields in the mif file
    :param data_fmt_char:
    :return:
    """
    global rom_width
    global max_rom_depth

    if max_rom_depth <= 256:
        addr_fmt = BYTE_FMT
    else:
        addr_fmt = WORD_FMT
    match rom_width:
        case 8:
            data_fmt = BYTE_FMT[0:-1]
        case 12:
            data_fmt = WORD_FMT[0:-1].replace('4', '3')
        case _:
            data_fmt = WORD_FMT[0:-1]
    return addr_fmt, data_fmt + data_fmt_char


def print_cmd(data, asm, lst_file):
    """
    Function to print a command in listing format
    :param data:
    :param asm:
    :param lst_file:
    :return: None
    """
    global program_counter

    addr_fmt, data_fmt = get_addr_and_data_fmt_strings()
    instr_string = (addr_fmt + "   " + data_fmt) % (program_counter, data)
    instr_string = instr_string.upper() + " " + asm
    lst_file.write(instr_string + os.linesep)


def is_comment(input_line_or_word):
    """
    Checks if a line is a comment line
    :param input_line_or_word:
    :return: True if it is a comment line, False otherwise
    """
    return (input_line_or_word.startswith(';') or
            input_line_or_word.startswith('//') or
            input_line_or_word.startswith('#') or
            input_line_or_word.startswith('*'))


def process_identifier(identifier, asm_file_name, line_counter, lst_file):
    """
    Process identifier, usually this goes simple by just looking into the dictionary equals
    and picking the number. However, it can happen that another identifier is found instead
    of a number, therefore the numerical representation of this identifier has to be found.
    This could happen many times so a recursive identifier resolution is needed.
    :param identifier:
    :param asm_file_name:
    :param line_counter:
    :param lst_file:
    :return: the value associated to the identifier
    """
    global equals
    global error_counter

    # Sometimes is convinient to use as an identifier a valid hex numbers (see 4-bit-latch.asm as an example,
    # where D0 is an identifier). So frist try to resolve an instruction argument as an identifier, and if it fails
    # try to resolve ia as a hex constant.
    if identifier in equals:
        io_address = equals[identifier]
        while io_address[0] in equals:
            io_address = equals[io_address[0]]
        try:  # check if a numerical value is there
            return_val = int(io_address[0], 16)  # convert hex to int
        except ValueError:
            # Identifier assigned to other identifier therefore recursive call
            return_val = process_identifier(io_address[0], asm_file_name, line_counter, lst_file)

    else:
        try:  # check if it is a hex number
            return_val = int(identifier, 16)  # convert hex to int
        except ValueError:
            in_string = f"Error: Unknown identifier: '{identifier}' in file '{asm_file_name}'  line {line_counter}."
            print(in_string)
            lst_file.write(in_string + os.linesep)
            error_counter += 1
            return_val = 0  # set it to zero not to crash the program, it is more useful to continue than to stop

    return return_val


def process_instruction(inst, io_address, asm, asm_file_name, line_counter, lst_file):
    """
    Processes the current instruction, writes the assembled line to the rom variable
    :param inst:
    :param io_address:
    :param asm:
    :param asm_file_name:
    :param line_counter:
    :param lst_file:
    :return: None
    """
    global equals
    global error_counter

    # get the numerical representation of the identifier
    int_io_address = process_identifier(io_address, asm_file_name, line_counter, lst_file)
    data = merge_cmd_io_addr(inst, int_io_address)
    print_cmd(data, asm, lst_file)
    add_command(data, asm_file_name, line_counter, lst_file)
    map_io(inst, int_io_address)


def process_include_line(include_file_name, lst_file):
    in_string = "Include file open: " + include_file_name
    print(in_string)
    lst_file.write(in_string + os.linesep)
    process_file(include_file_name, lst_file)
    in_string = "Include file closed: " + include_file_name
    print(in_string)
    lst_file.write(in_string + os.linesep)


def check_if_hex(identifier, asm_file_name, line_counter, lst_file):
    """
    Checks if the identifier is a hex number, if not it raises an error
    :param identifier:
    :param asm_file_name:
    :param line_counter:
    :param lst_file:
    :return: None
    """
    # if hex constant is used as an identifier, then write a warning. It is allowed but not recommended
    # since it can lead to confusion
    try:
        int(identifier, 16)
        in_string = f"Warning: Hex constant used as an identifier '{identifier}' in file '{asm_file_name}' line {line_counter}."
        print(in_string)
        lst_file.write(in_string + os.linesep)
    except ValueError:
        pass


def process_equals_directive(asm, asm_words, asm_file_name, line_counter, lst_file):
    """
    Processes EQU directive: <name< EQU <value>
    :param asm:
    :param asm_words:
    :param asm_file_name:
    :param line_counter:
    :param lst_file:
    :return:
    """
    global program_counter
    global error_counter
    global equals
    global include_directory

    lst_file.write(asm + os.linesep)
    left = asm_words[0]
    right = asm_words[2]

    if asm_words[1] == 'EQU':
        check_if_hex(left, asm_file_name, line_counter, lst_file)
        equals[left] = [right]
    else:
        in_string = f"Error: Unknown content in file '{asm_file_name} line {line_counter}: {asm}"
        print(in_string)
        lst_file.write(in_string + os.linesep)
        error_counter += 1


def is_label(word):
    """
    Checks if a word is a label
    :param word:
    :return: True if it is a label, False otherwise
    """
    return word.endswith(':')


def process_label(asm_line, asm_words, lst_file):
    """
    Processes a label
    :param asm_line:
    :param asm_words:
    :param lst_file:
    :return: None
    """
    global program_counter
    global labels
    global error_counter

    label = asm_words[0][0:-1]
    if label in labels:
        in_string = f"Error: Duplicate delcareation of '{label}'."
        error_counter += 1
        print(in_string)
        lst_file.write(in_string + os.linesep)
    labels[label] = program_counter
    lst_file.write(asm_line + os.linesep)


def process_lut_drective(asm, asm_words, asm_file_name, line_counter, lst_file):
    """
    Processes LUT directive: LUT <name> <value>
    :param asm:
    :param asm_words:
    :param asm_file_name:
    :param line_counter:
    :param lst_file:
    :return:
    """
    global program_counter
    global error_counter
    global lut
    global include_directory

    lst_file.write(asm + os.linesep)
    left = asm_words[1]
    right = asm_words[2]

    if asm_words[0] == 'LUT':
        if left in lut:
            in_string = f"Error: Duplicate delcareation of '{left}'."
            error_counter += 1
            print(in_string)
            lst_file.write(in_string + os.linesep)
        else:
            lut[left] = right
    else:
        in_string = f"Error: Unknown content in file '{asm_file_name} line {line_counter}: {asm}"
        print(in_string)
        lst_file.write(in_string + os.linesep)
        error_counter += 1


def process_include_file(asm_line, asm_words, lst_file, asm_file_name, line_counter):
    """
    Unknown word in the first word on an asm_line, try to open a file with this name in a lowercase (include files)
    :param asm_line:
    :param asm_words:
    :param lst_file:
    :param asm_file_name:
    :param line_counter:
    :return: None
    """
    global error_counter

    if len(asm_words) == 0:
        return

    include_file_name = asm_words[0] + ".asm"
    include_file_name = include_file_name.lower()

    if (not os.access(include_file_name, os.F_OK)) and (include_directory != ''):
        include_file_name = os.path.join(include_directory, include_file_name)
    if os.access(include_file_name, os.F_OK):
        process_include_line(include_file_name, lst_file)
    else:
        in_string = f"Error: Unknown content in file '{asm_file_name} line {line_counter}: {asm_line}"
        print(in_string)
        lst_file.write(in_string + os.linesep)
        error_counter += 1


def process_asm_file_line(asm_line, asm_words, asm_file_name, line_counter, lst_file):
    """
    Assembles one line of asm file. The output is written to the appropriate ROM location.
    :param asm_line:
    :param asm_words:
    :param asm_file_name:
    :param line_counter:
    :param lst_file:
    :return: None
    """
    global program_counter
    global error_counter
    global include_directory

    if is_label(asm_words[0]):
        process_label(asm_line, asm_words, lst_file)
    elif asm_words[0] in ['ORG']:
        lst_file.write(asm_line + os.linesep)
        location = asm_words[1]
        if location.endswith('H'):
            # motorola hex format
            program_counter = int(location[0:-1], 16)
        else:
            program_counter = int(asm_words[1])
    elif asm_words[0] in ['NOPO', 'JMP', 'RTN', 'SKZ', 'NOPF']:
        if len(asm_words) == 1 or is_comment(asm_words[1]):
            process_instruction(instruction[asm_words[0]], '0', asm_line, asm_file_name, line_counter, lst_file)
        else:
            # check if io address is in lut, if so resovle it otherwise use it as is
            asm_words[1] = lut.get(asm_words[1], asm_words[1])
            process_instruction(instruction[asm_words[0]], asm_words[1], asm_line, asm_file_name, line_counter, lst_file)
    elif asm_words[0] in ['LD', 'LDC', 'AND', 'ANDC', 'OR', 'ORC', 'XNOR', 'STO', 'STOC', 'IEN', 'OEN']:
        process_instruction(instruction[asm_words[0]], asm_words[1], asm_line, asm_file_name, line_counter, lst_file)
    # check if it holds EQU
    elif asm_line.count("EQU") > 0:
        process_equals_directive(asm_line, asm_words, asm_file_name, line_counter, lst_file)
    # check if it holds LUT
    elif asm_line.count("LUT") > 0:
        process_lut_drective(asm_line, asm_words, asm_file_name, line_counter, lst_file)
    else:
        # unknown command found in line, test if it is an include file
        process_include_file(asm_line, asm_words, lst_file, asm_file_name, line_counter)


def preprocess_asm_line(asm_line):
    """
    Split asm line and convert it to a canonical list asm words, i.e. make them upper case,
    remove comments and apply equals directives if encountered.
    :param asm_line: a line of asm file
    :return: canonical list of asm words in the provided asm line
    """
    asm_upper = asm_line.upper()
    asm_words = asm_upper.split()

    for i in range(len(asm_words)):
        if is_comment(asm_words[i]):
            asm_words = asm_words[0:i]
            break
        elif equals.get(asm_words[i], None) is not None:
            asm_words[i] = equals[asm_words[i]][0]

    return asm_words


def process_file(asm_file_name, lst_file):
    """
    Reads an asm file and assembles a program. It can be called recursively to allow projects with multiple asm
    files if a line contains no known word it will be tried to open a file with this name (include files)
    :param asm_file_name:
    :param lst_file:
    :return: None
    """
    # open asm file
    with open(asm_file_name, 'r') as handle_asm_file:
        asm_file = handle_asm_file.readlines()

    # interpret the asm file contents
    linecounter = 0
    for asm_line in  asm_file:
        linecounter += 1
        asm_line = asm_line.strip()
        asm_words = asm_line.split()
        if len(asm_words) != 0:  # it is not a blank line
            if is_comment(asm_words[0][0]):
                # it is a line containing comments
                lst_file.write(asm_line + os.linesep)
            else:
                asm_words = preprocess_asm_line(asm_line)
                process_asm_file_line(asm_line, asm_words, asm_file_name, linecounter, lst_file)
        else:
            lst_file.write(os.linesep)

    # if LUT table is not empty, print it
    if len(lut) > 0:
        lst_file.write(os.linesep)
        lst_file.write("**** LUT table: ****" + os.linesep)
        lst_file.write(os.linesep)
        for key, value in lut.items():
            lst_file.write(f"{key} {value[0]}" + os.linesep)


# noinspection SpellCheckingInspection
def print_out_file_header(asm_file_name, handle_lst_file):
    handle_lst_file.write("Version " + MC14500_VERSION + os.linesep)
    handle_lst_file.write("Input file " + asm_file_name + os.linesep)
    handle_lst_file.write("Creation date " + time.ctime() + os.linesep)


def write_map_file_section(file, data_map):
    """
    Writes a section of a map file
    :param file:
    :param data_map:
    :return: None
    """
    file.write("IO Address       Access" + os.linesep)
    if max_rom_depth <= 1000:
        acc_cnt_fmt = "%3d"
    elif max_rom_depth <= 10000:
        acc_cnt_fmt = "%4d"
    else:
        acc_cnt_fmt = "%5d"

    match rom_width:
        case 8:
            io_addr_fmt = NIBBLE_FMT
        case 12:
            io_addr_fmt = BYTE_FMT
        case _:
            io_addr_fmt = NIBBLE3_FMT

    for i in range(len(data_map)):
        out_str = io_addr_fmt % data_map[i][0] + "             " + acc_cnt_fmt % data_map[i][1]
        file.write(out_str + os.linesep)


def print_mif_file_header(handle_mif_file, depth, width):
    """
    Prints the header of the mif file
    :param handle_mif_file:
    :param depth:
    :param width:
    :return: None
    """
    handle_mif_file.write("DEPTH = " + depth + ";" + os.linesep)
    handle_mif_file.write("WIDTH = " + width + ";" + os.linesep)
    handle_mif_file.write(os.linesep)
    handle_mif_file.write("ADDRESS_RADIX = HEX;" + os.linesep)
    handle_mif_file.write("DATA_RADIX = HEX;" + os.linesep)
    handle_mif_file.write(os.linesep)
    handle_mif_file.write("CONTENT BEGIN" + os.linesep)


def get_lut_addr_and_data_fmt_strings():
    """
    Generate the format strings for the address and data fields in the mif LUT file
    :return: address and data format strings
    """
    global rom_width
    global max_rom_depth

    if max_rom_depth <= 256:
        data_fmt = BYTE_FMT
    else:
        data_fmt = WORD_FMT

    match rom_width:
        case 8: addr_fmt = NIBBLE_FMT
        case 12: addr_fmt = BYTE_FMT
        case _: addr_fmt = WORD_FMT.replace('4', '3')

    return addr_fmt, data_fmt


def export_to_mif_file(outfile, lut_outfile,  asm_file_name, err_ctr):
    """
    Exports the assembled data to a mif file
    :param outfile:
    :param lut_outfile:
    :param asm_file_name:
    :param err_ctr:
    :return: error counter
    """
    with (open(outfile, 'w') as handle_mif_file):
        handle_mif_file.write("% -----------------------------------------------------------------------------" + os.linesep)
        handle_mif_file.write("MC14500 Assembler Generated Memory Initialization File" + os.linesep)
        print_out_file_header(asm_file_name, handle_mif_file)
        handle_mif_file.write("----------------------------------------------------------------------------- %" + os.linesep)
        print_mif_file_header(handle_mif_file, str(max_rom_depth), str(rom_width))
        addr_fmt, data_fmt = get_addr_and_data_fmt_strings()

        undefied_addresses = []
        prog_end = max(rom.keys()) + 1 if len(rom.keys()) > 0 else 0
        for i in range(prog_end):
            if rom.get(i, None) is None:
                undefied_addresses.append(i)
            else:
                if len(undefied_addresses) > 0:
                    # bridge the gap with non_programmed_location_value
                    start = undefied_addresses[0]
                    end = undefied_addresses[-1]
                    out_string = "  [" + (addr_fmt % start) + ".." + (addr_fmt % end) + "]   :   " + \
                                 data_fmt % non_programmed_location_value + ";"
                    handle_mif_file.write(out_string + os.linesep)
                    undefied_addresses = []
                out_string = "  " + addr_fmt % i + "   :   " + data_fmt % rom[i] + ";"
                handle_mif_file.write(out_string + os.linesep)

        start = prog_end
        end = max_rom_depth - 1
        if start <= end:
            out_string = "  [" + (addr_fmt % start) + ".." + (addr_fmt % end) + "]   :   " + \
                         data_fmt % non_programmed_location_value + ";"
        handle_mif_file.write(out_string + os.linesep)
        handle_mif_file.write("END;" + os.linesep)

        print("Mif file: ", outfile, "created")

    # if LUT table is not empty, print it
    if len(lut) > 0:

        with (open(lut_outfile, 'w') as handle_mif_file):
            lut_dump = dump_lut_to_integer_array(asm_file_name)
            handle_mif_file.write(
                "% -----------------------------------------------------------------------------" + os.linesep)
            handle_mif_file.write("MC14500 Assembler Generated Memory Initialization File for LUT" + os.linesep)
            print_out_file_header(asm_file_name, handle_mif_file)
            handle_mif_file.write(
                "----------------------------------------------------------------------------- %" + os.linesep)
            print_mif_file_header(handle_mif_file, str(max_rom_depth), str(rom_width))
            addr_fmt, data_fmt = get_lut_addr_and_data_fmt_strings()

            for lut_key, address in enumerate(lut_dump):
                out_string = "  " + addr_fmt % lut_key + "   :   " + data_fmt % address + ";"
                handle_mif_file.write(out_string + os.linesep)

            if err_ctr == 0:
                handle_mif_file.write("END;" + os.linesep)

        print("Mif file: ", outfile, "created")

    return err_ctr


def export_map_file(outfile, map_none_, map_read_, map_write_, asm_file_name):
    """
    Exports a map file
    :param outfile:
    :param map_none_:
    :param map_read_:
    :param map_write_:
    :param asm_file_name:
    :return: None
    """
    with open(outfile, 'w') as handle_map_file:
        handle_map_file.write("MC14500 Assembler Generated Map File" + os.linesep)
        print_out_file_header(asm_file_name, handle_map_file)

        map_none_list = sorted(map_none_.items())
        handle_map_file.write(
            os.linesep + "Selected IO addresses where the mc14500 did not read from or wrote to" + os.linesep)
        write_map_file_section(handle_map_file, map_none_list)

        map_read_list = sorted(map_read_.items())
        handle_map_file.write(os.linesep + "Selected IO addresses that where the mc14500 read from" + os.linesep)
        write_map_file_section(handle_map_file, map_read_list)

        map_write_list = sorted(map_write_.items())
        handle_map_file.write(os.linesep + "Selected IO addresses where the mc14500 wrote to" + os.linesep)
        write_map_file_section(handle_map_file, map_write_list)


def dump_rom_to_byte_array():
    """
    Dumps the assembled data to a byte array
    :return: bytearray
    """
    filler = non_programmed_location_value & 0x00FF
    match rom_width:
        case 8:
            byte_array = bytearray([filler] * max_rom_depth)
        case 12:
            byte_array = bytearray([filler] * (max_rom_depth * 3 // 2))
        case _:
            byte_array = bytearray([filler] * (max_rom_depth * 2))

    for addr in rom.keys():
        value = rom[addr]
        match rom_width:
            case 8:
                byte_array[addr] = value
            case 12:
                pos = addr * 3 // 2
                if addr % 2 == 0:
                    byte_array[pos] = value >> 4
                    byte_array[pos + 1] = (value & 0xF) << 4
                else:
                    byte_array[pos] |= value >> 8
                    byte_array[pos + 1] = value & 0xFF
            case _:
                byte_array[2 * addr] = value >> 8
                byte_array[2 * addr + 1] = value & 0xFF

    return byte_array


def process_srec_s1_record(dump, start, length, handle_srec_file, srec_addr_fmt, srec_len_fmt, srec_data_fmt):
    """
    Processes a srec S1 record.
    :param dump:
    :param start:
    :param length:
    :param handle_srec_file:
    :param srec_addr_fmt:
    :param srec_len_fmt:
    :param srec_data_fmt:
    :return: None
    """
    if length == 0:
        return
    out_string = "S1" + (srec_len_fmt % (length + 3)) + (srec_addr_fmt % start)
    out_string += "".join([srec_data_fmt % dump[start + i] for i in range(length)])
    handle_srec_file.write(out_string + srec_checksum(out_string) + '\r\n')


def export_memory_dump_to_srec_file(outfile, memory_dump):
    """
    Exports the assembled data to a srec file.
    :param outfile:
    :param memory_dump:
    :return: None
    """
    srec_addr_fmt, srec_len_fmt, srec_data_fmt = WORD_FMT, BYTE_FMT, BYTE_FMT
    max_srec_data_len = 32  # historical recommendation, could be any value up to 252 for S1 records

    no_s1_lines = len(memory_dump) // max_srec_data_len
    if len(memory_dump) == 16:
        no_s1_lines = 1
        max_srec_data_len = 16
    elif len(memory_dump) % max_srec_data_len != 0:
        raise ValueError("BUG: The length of the rom dump is not a multiple of the maximum S1 record length")

    with (open(outfile, 'w') as handle_srec_file):
        # S0 record
        program_name = "MC14500:"+os.path.basename(outfile).split('.')[0]
        if len(program_name) > 20:              # convention 20 chars module name
            program_name = program_name[0:20]
        program_name += "00"                    # convention 2 chars for version and revsision number
        # add memroy width and depth information
        in_string = program_name + " W:" + str(rom_width) + " D:" + str(max_rom_depth)
        if len(in_string) > 32:
            print("Warning: S0 record content before encoding is truncated to 32 characters to fit the convention")
            in_string = in_string[0:32]
        in_str_hex = "".join([srec_data_fmt % ord(c) for c in in_string])
        out_string = "S0" + (srec_len_fmt % (len(in_str_hex) + 3)) + "0000" + in_str_hex
        out_string += srec_checksum(out_string)
        handle_srec_file.write(out_string + '\r\n')

        # S1 records
        for i in range(0, no_s1_lines):
            process_srec_s1_record(memory_dump,
                                   i * max_srec_data_len,
                                   max_srec_data_len,
                                   handle_srec_file,
                                   srec_addr_fmt,
                                   srec_len_fmt,
                                   srec_data_fmt)

        # S5 record
        out_string = "S503" + (srec_addr_fmt % no_s1_lines)
        handle_srec_file.write(out_string + srec_checksum(out_string) + '\r\n')

        # S9 record
        out_string = "S9030000"
        handle_srec_file.write(out_string + srec_checksum(out_string) + '\r\n')


def export_to_srec_file(asm_file_name):
    """
    Exports the assembled data to a srec file.
    :param asm_file_name:
    :return: None
    """
    rom_dump = dump_rom_to_byte_array()
    outfile = output_file_name(asm_file_name, ".srec")
    export_memory_dump_to_srec_file(outfile, rom_dump)
    # create srec file
    print("SREC file: ", outfile, "crated")

    if len(lut) > 0:
        lut_dump = dump_lut_to_byte_array(asm_file_name)
        lut_outfile = output_file_name(asm_file_name, "_lut.srec")
        export_memory_dump_to_srec_file(lut_outfile, lut_dump)
        # create srec file
        print("SREC file: ", lut_outfile, "crated")


def export_to_hex_file(asm_file_name):
    """
    Export the assembled data to a hex file.
    :param asm_file_name:
    :return: None
    """
    rom_dump = dump_rom_to_byte_array()
    outfile = output_file_name(asm_file_name, ".hex")

    with open(outfile, 'w') as handle_out_file:
        handle_out_file.write(rom_dump.hex().upper())
        print("Hex file: ", outfile, "crated")

    if len(lut) > 0:
        lut_dump = dump_lut_to_byte_array(asm_file_name)
        lut_outfile = output_file_name(asm_file_name, "_lut.hex")
        with open(lut_outfile, 'w') as handle_out_file:
            handle_out_file.write(lut_dump.hex().upper())
            print("Hex file: ", lut_outfile, "crated")


def export_to_raw_binary_file(asm_file_name):
    """
    Export the assembled data to a hex file.
    :param asm_file_name:
    :return: None
    """
    rom_dump = dump_rom_to_byte_array()
    outfile = output_file_name(asm_file_name, ".bin")

    with open(outfile, 'wb') as handle_out_file:
        handle_out_file.write(rom_dump)
        print("Binary file: ", outfile, "crated")

    if len(lut) > 0:
        lut_dump = dump_lut_to_byte_array(asm_file_name)
        lut_outfile = output_file_name(asm_file_name, "_lut.bin")
        with open(lut_outfile, 'wb') as handle_out_file:
            handle_out_file.write(lut_dump)
            print("Binary file: ", lut_outfile, "crated")


def output_file_name(asm_file_name, file_extension):
    """
    Creates the output file name, based on provide input assembler file name and the provided output file extension.
    :param asm_file_name:
    :param file_extension:
    :return: output file name
    """
    asm_file_name_words = asm_file_name.split('.')
    outfile = ".".join(asm_file_name_words[0:-1])
    return outfile + file_extension


def main():
    """
    The main function
    :return: None
    """
    global program_counter
    global error_counter
    global rom_width
    global max_rom_depth
    global rom_cmd_order
    global non_programmed_location_value
    global include_directory

    parser = argparse.ArgumentParser(
        usage='%(prog)s [-v] [-h] [-s] [-x] [-b] [-w width] [-d depth] [-I include_directory] [-i instr_position] '
              '[-n non_programmed_location_value] input_file',
        description='MC14500 Assembler',
        add_help=True)

    parser.add_argument('input_file', type=str, help='the input assembler file to be processed')
    parser.add_argument('-v', '--version', action='version', version='%(prog)s ' + MC14500_VERSION)
    parser.add_argument('-w', '--width', type=int,
                        help='the width of the ROM in bits (8, 12 or 16)', default=8, choices=[8, 12, 16])
    parser.add_argument('-d', '--depth', type=int,
                        help='the depth of the ROM in bytes, allowed values are positive integer multiples of 128 up to'
                             ' and including 65536',
                        default=256)
    parser.add_argument('-i', '--instr-position', type=str,
                        help='the position of INS field in a command: first|last, default is last',
                        default='last',
                        choices=['first', 'last'])
    parser.add_argument('-I', '--include', type=str,
                        help='an additonal directory to look for include files beside the current working directory')
    parser.add_argument('-s', '--srec', action='store_true', help='generate Motorola S-record file')
    parser.add_argument('-x', '--hex', action='store_true', help='generate HEX file')
    parser.add_argument('-b', '--binary', action='store_true', help='generate raw binary file')
    parser.add_argument("-n", "--non-programmed-location-value", type=str, default="0",
                        help='the value that is expected to be present in ROM locations that are not part of program',
                        choices=['0', 'F'])

    args = parser.parse_args()

    asm_file_name = args.input_file
    rom_width = args.width
    max_rom_depth = args.depth
    ins_pos_str = args.instr_position
    generate_srec_file = args.srec
    generate_hex_file = args.hex
    generate_binary_file = args.binary
    non_programmed_location_value_str = args.non_programmed_location_value
    include_directory = args.include
    if non_programmed_location_value_str == '0':
        non_programmed_location_value = 0
    else:
        non_programmed_location_value = 0xFFFF & ((1 << rom_width) - 1)

    print()
    print("MC14500 Assembler for the ICU 1-bit processor." + os.linesep +
          "Based on the original work of Urs Lindegger." + os.linesep +
          "see https://www.linurs.org/mc14500.html")
    print("Version " + MC14500_VERSION)
    print()
    print(f"ROM depth: {max_rom_depth} [words]")
    print(f"ROM width: {rom_width} [bits]")
    if ins_pos_str == 'first':
        print("The 4 most significant bits are the mc14500 instruction op-code")
    else:
        print("The 4 least significant bits are the mc14500 instruction op-code")
    print("the other bits are the io address. This might be different")
    print("on your hardware since it is external to the mc14500 chip.")
    print()

    # check self configuration and consistency
    rom_cmd_order = cmd_order['ins_' + ins_pos_str]
    if not valid_depth(max_rom_depth):
        print("Error: MAX_ROM_DEPTH is not set correctly, allowed values are positive integer multiples of 128 up to "
              "and including 65536")
        exit(1)

    # get the asm input file
    if not os.access(asm_file_name, os.F_OK):
        print("Assembler file not found")
        exit(1)

    lst_file = output_file_name(asm_file_name, ".lst")
    with open(lst_file, 'w') as handle_lst_file:
        handle_lst_file.write("MC14500 Assembler Generated List File" + os.linesep)
        print_out_file_header(asm_file_name, handle_lst_file)
        process_file(asm_file_name, handle_lst_file)  # here  all the assembly is done

    if error_counter != 0:
        print("Assembler failed with ", error_counter, " error(s)")
        exit(1)
    print("LST file: ", lst_file, "crated")

    # export to MIF file
    outfile = output_file_name(asm_file_name, ".mif")
    lut_outfile = output_file_name(asm_file_name, "_lut.mif")
    error_counter = export_to_mif_file(outfile, lut_outfile, asm_file_name, error_counter)

    if error_counter != 0:
        print("Assembler failed while creating mif file with ", error_counter, " error(s)")
        exit(1)

    if generate_srec_file:
        export_to_srec_file(asm_file_name)

    if generate_hex_file:
        export_to_hex_file(asm_file_name)

    if generate_binary_file:
        export_to_raw_binary_file(asm_file_name)

    # create MAP file
    outfile = output_file_name(asm_file_name, ".map")
    export_map_file(outfile, map_none, map_read, map_write, asm_file_name)

    print("Map file: ", outfile, "crated")
    print("Assembler succeeded")


if __name__ == '__main__':
    main()
    exit(0)
