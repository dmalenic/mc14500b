#!/usr/bin/env python3

"""
One-dimensional Conway's Game of Life

 * A cell becomes alive if it has exactly one live neighbor.
 * A cell dies if it has zero or two live neighbors.

This is a simulation to help in understanding the rules of the game, and debugging MC14500B implementation
"""

def next_generation(cells_):
    """
    This function calculates the next generation of cells based on the current generation.
    :param cells_: current generation of cells
    :return: next generation of cells
    """
    new_cells = [0] * len(cells_)

    last = len(cells_) - 1
    for i_ in range(1, last):
        if cells_[i_ - 1] + cells_[i_ + 1] == 1:
            new_cells[i_] = 1
        else:
            new_cells[i_] = 0
    if (cells_[last] + cells_[1]) == 1:
        new_cells[0] = 1
    else:
        new_cells[0] = 0
    if (cells_[last-1] + cells_[0]) == 1:
        new_cells[last] = 1
    else:
        new_cells[last] = 0

    return new_cells


def print_current_generation(i_, cells_):
    """
    This function prints the current generation of cells.
    :param i_: the generation number
    :param cells_: cells of the generation
    :return: void
    """
    print(f"{i_:2d}: {''.join(map(str, cells_))}")


def int_to_bit_array(n, bit_len):
    """
    Convert an integer to a bit array of a specified length.
    :param n: The integer to convert.
    :param bit_len: The length of the bit array.
    :return: A list representing the bit array.
    """
    return [int(bit) for bit in bin(n)[2:].zfill(bit_len)]


def main():
    # Initial generation
    for n in range(128):
        bit_length = 7
        cells = int_to_bit_array(n, bit_length)
        generations = []
        i = 0
        print_current_generation(i, cells)

        # Following generations
        while cells not in generations:
            generations.append(cells)
            cells = next_generation(cells)
            i += 1
            print_current_generation(i, cells)

        print(f"Cycle detected at generation {i}.")

    return 0


if __name__ == '__main__':
    rv = main()
    exit(rv)
