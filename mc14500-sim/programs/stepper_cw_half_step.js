// noinspection GrazieInspection

import {pgmInitCurrentProgram} from '../programs.js';

/**
 * Initializes the 1D Conway's Game of Life program.
 * @param programSelector
 */
export function initStepperCwHalfStep(programSelector) {
    pgmInitCurrentProgram(programSelector, `Unipolar Stepper, Half-Step Drive`,
        `Using a half-step drive, this program drives a unipolar stepper motor clockwise.<br/>
        OUT0 = stepper contact A<br/>
        OUT1 = stepper contact B<br/>
        OUT2 = stepper contact A'<br/>
        OUT3 = stepper contact B'`,
        rom, 20, 0);
}


// noinspection SpellCheckingInspection
/**
 * The ROM content for `Unipolar Stepper Motor, Half-Step Drive` program.
 * @type {number[]}
 */
const rom = [
    // ; ------------------------------------------------------
    // ;    +----++----++----+                              +----++----+
    // ;    |                |                              |
    // ; A ++                ++----++----++----++----++----++
    // ;                +----++----++----+
    // ;                |                |
    // ; B ++----++----++                ++----++----++----++----++----+
    // ;                            +----++----++----+
    // ;                            |                |
    // ; A'++----++----++----++----++                ++----++----++----+
    // ;   ++----+                              +----++----++----+
    // ;         |                              |                |
    // ; B'      ++----++----++----++----++----++                ++----+
    // ; ------------------------------------------------------

    0x06,   // ORC     RR
    0x0A,   // IEN     RR
    0x0B,   // OEN     RR

    // ; ------------------------------------------------------
    // ; PIN1 signal
    // ; ------------------------------------------------------

    0x08,   // STO     PIN1
    0x00,   // NOPO
    0x00,   // NOPO
    0x00,   // NOPO
    0x00,   // NOPO
    0x39,   // STOC    PIN4
    0x00,   // NOPO
    0x00,   // NOPO
    0x00,   // NOPO
    0x00,   // NOPO
    0x00,   // NOPO
    0x00,   // NOPO

    // ; ------------------------------------------------------
    // ; PIN2 signal
    // ; ------------------------------------------------------

    0x18,   // STO     PIN2
    0x00,   // NOPO
    0x00,   // NOPO
    0x00,   // NOPO
    0x00,   // NOPO
    0x09,   // STOC    PIN1
    0x00,   // NOPO
    0x00,   // NOPO
    0x00,   // NOPO
    0x00,   // NOPO
    0x00,   // NOPO
    0x00,   // NOPO

    // ; ------------------------------------------------------
    // ; PIN3 signal
    // ; ------------------------------------------------------

    0x28,   // STO     PIN3
    0x00,   // NOPO
    0x00,   // NOPO
    0x00,   // NOPO
    0x00,   // NOPO
    0x19,   // STOC    PIN2
    0x00,   // NOPO
    0x00,   // NOPO
    0x00,   // NOPO
    0x00,   // NOPO
    0x00,   // NOPO
    0x00,   // NOPO

    // ; ------------------------------------------------------
    // ; PIN4 signal
    // ; ------------------------------------------------------

    0x38,   // STO     PIN4
    0x00,   // NOPO
    0x00,   // NOPO
    0x00,   // NOPO
    0x00,   // NOPO
    0x29,   // STOC    PIN3
    0x00,   // NOPO
    0x00,   // NOPO
    0x0C,   // JMP
];
