// noinspection GrazieInspection

import {pgmInitCurrentProgram} from '../programs.js';

/**
 * Initializes the 1D Conway's Game of Life program.
 * @param programSelector
 */
export function initStepperCwWave(programSelector) {
    pgmInitCurrentProgram(programSelector, 'Unipolar Stepper, Wave Drive',
        `Using a wave drive, this program drives a unipolar stepper motor clockwise.<br/>
        Output 0 = stepper contact A<br/>
        Output 1 = stepper contact B<br/>
        Output 2 = stepper contact A'<br/>
        Output 3 = stepper contact B'`,
        rom, 20, 0);
}


// noinspection SpellCheckingInspection
/**
 * The ROM content for `Unipolar Stepper Motor, Wave Drive` program .
 * @type {number[]}
 */
const rom = [
    // ; ------------------------------------------------------
    // ;    +----+                  +----+                  +----+
    // ;    |    |                  |    |                  |    |
    // ; A ++    ++----++----++----++    ++----++----++----++    ++----+
    // ;          +----+                  +----+                  +----+
    // ;          |    |                  |    |                  |    |
    // ; B ++----++    ++----++----++----++    ++----++----++----++    +
    // ;                +----+                  +----+
    // ;                |    |                  |    |
    // ; A'++----++----++    ++----++----++----++    ++----++----++----+
    // ;                      +----+                  +----+
    // ;                      |    |                  |    |
    // ; B'++----++----++----++    ++----++----++----++    ++----++----+
    // ; ------------------------------------------------------

    0x06,   // ORC     RR
    0x0A,   // IEN     RR
    0x0B,   // OEN     RR
    0x39,   // STOC    PIN4

    // ; ------------------------------------------------------
    // ; PIN1 signal
    // ; ------------------------------------------------------

    0x08,   // STO     PIN1
    0x00,   // NOPO
    0x00,   // NOPO
    0x00,   // NOPO
    0x00,   // NOPO
    0x09,   // STOC    PIN1

    // ; ------------------------------------------------------
    // ; PIN2 signal
    // ; ------------------------------------------------------

    0x18,   // STO     PIN2
    0x00,   // NOPO
    0x00,   // NOPO
    0x00,   // NOPO
    0x00,   // NOPO
    0x19,   // STOC    PIN2

    // ; ------------------------------------------------------
    // ; PIN3 signal
    // ; ------------------------------------------------------

    0x28,   // STO     PIN3
    0x00,   // NOPO
    0x00,   // NOPO
    0x00,   // NOPO
    0x00,   // NOPO
    0x29,   // STOC    PIN3

    // ; ------------------------------------------------------
    // ; PIN4 signal
    // ; ------------------------------------------------------

    0x38,   // STO     PIN4
    0x0C,   // JMP
];
