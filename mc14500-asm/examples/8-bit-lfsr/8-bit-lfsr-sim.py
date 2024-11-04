#!/usr/bin/env python3

"""
8-bit Linear Feedback Shift Register with maximum length feedback polynomial
x^8 + x^6 + x^5 + x^4 + 1 that generates 2^8-1 = 255 pseudorandom outputs.
See https://digitalxplore.org/up_proc/pdf/91-1406198475105-107.pdf

Rules for Selecting Feedback Polynomial:
- The ‘one’ in the polynomial correspond to input to the first bit,
e.g., for the 8-bit shift-register, the power 8 represents the MSB,
the power 1 represents the LSB.
- The powers of polynomial term represent tapped bits, counting from left.
- The first and last bits are always connected as an input and output tap
respectively.
- The maximum length can only be possible if the number of taps is even and
there must be no common divisor to all taps.

This is a simulation to help in understanding the rules of the game, and debuging MC14500B implementation
"""


def lsfr_next_state(state, out):
    """
    This function calculates the next state of the LSFR.
    :param state: current state of the LSFR
    :param out: accumulated output of the LSFR
    :return: next state of the LSFR and accumulated output
    """
    new_state = [0] * 8
    out.append(state[-1])
    x0 = ((state[7] ^ state[5]) ^ state[4]) ^ state[3]
    for i in range(1, 8):
        new_state[i] = state[i-1]
    new_state[0] = x0
    return new_state, out


def int_to_bit_array(n, bit_len):
    """
    Convert an integer to a bit array of a specified length.
    :param n: The integer to convert.
    :param bit_len: The length of the bit array.
    :return: A list representing the bit array in LSB order.
    """
    bs = [int(bit) for bit in bin(n)[2:].zfill(bit_len)]
    bs.reverse()
    return bs


def main():
    """
    This function runs the simulation for LSFR with the polinomial x^8 + x^6 + x^5 + x^4 + 1
    for all possible initial states of the LSFR.
    :return: none
    """
    for n in range(1, 256):
        # Convert the integer to an 8-bit array
        initial_state = int_to_bit_array(n, 8)
        out = []

        new_state, out = lsfr_next_state(initial_state, out)
        while new_state != initial_state:
            new_state, out = lsfr_next_state(new_state, out)

        print(f"Initial State: {initial_state}, {new_state == initial_state}, {len(out) == 255},output: {out}")
    return 0


if __name__ == "__main__":
    rv = main()
    exit(rv)
