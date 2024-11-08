# ----------------------------------------------------------------------------------------------------
# Code shared between the MC14500 disassembler and the MC14500 assembler
# ----------------------------------------------------------------------------------------------------

# (c) 2010 Urs Lindegger
# (c) 2024 Damir Maleničić

BYTE_FMT = "%2.2X"      # format string for byte output
NIBBLE_FMT = "%1.1X"    # format string for nibble output
NIBBLE3_FMT = "%3.3X"   # format string for nibble output
WORD_FMT = "%4.4X"      # format string for word output

MC14500_VERSION = "0.5"

cmd_order = {
    'ins_first': 0,     # leftmost nibble represents the instruction
    'ins_last': 1,      # rightmost nibble represents the instruction
}

def srec_checksum(srec_record):
    """
    Calculates a checksum of a srec record
    :param srec_record:
    :return: checksum as 2 hex chars string
    """
    checksum = 0
    for i in range(2, len(srec_record), 2):
        checksum += int(srec_record[i:i + 2], 16)
    checksum = (~checksum) % 256
    return BYTE_FMT % checksum


def valid_depth(depth):
    """
    Check if the depth is valid
    :param depth: depth to check
    :return: True if valid, False otherwise
    """
    return 128 <= depth <= 65536 and depth % 128 == 0