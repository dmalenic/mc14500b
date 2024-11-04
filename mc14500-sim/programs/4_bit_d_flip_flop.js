import {pgmInitCurrentProgram} from '../programs.js';


export function init4BitDFlipFlopRegister(programSelector) {
    pgmInitCurrentProgram(programSelector, `4-bit D-flip-flop`,
        `This program simulates a 4-bit D-flip-flop circuit.<br/>
        Flip-flop inputs D0-D3 are controlled by inputs IN1-IN4.<br/>
        Input IN5 controls the CLOCK signal.<br/>
        The flip-flop outputs Q0-Q3 are shown at outputs OUT0 to OUT3.<br/>&nbsp;`,
        rom, 0);
}


// noinspection SpellCheckingInspection
const rom = [
    0x06,   // ORC RR
    0x0A,   // IEN RR
    0x0B,   // OEN RR

    0x91,   // LD      OLD_CLK ; Move OLD_CLK to ...
    0x88,   // STO     TEMP    ; ... TEMP
    0x51,   // LD      CLK     ; Find rising edge of CLK
    0x98,   // STO     OLD_CLK
    0x84,   // ANDC    TEMP    ; RR = CLK AND !OLD_CLK
    0x0B,   // OEN     RR      ; Enable store if rising edge is found
    0x11,   // LD      D0
    0x08,   // STO     Q0
    0x21,   // LD      D1
    0x18,   // STO     Q1
    0x31,   // LD      D2
    0x28,   // STO     Q2
    0x41,   // LD      D3
    0x38,   // STO     Q3

    // ; the following 2 instructions are not needed for this demo
    // ; but if this code is a part of a larger program, it will
    // ; restore the OEN signal expectation for the remaining program

    0x06,   // ORC  RR    ; Produces always 1 in RR
    0x0B,   // OEN  RR
    0x0C,   // JMP
];
