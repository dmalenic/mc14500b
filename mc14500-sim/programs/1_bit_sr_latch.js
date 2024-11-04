import {pgmInitCurrentProgram} from '../programs.js';


export function initSrLatch(programSelector) {
    pgmInitCurrentProgram(programSelector, `S-R Latch`,
        `This program simulates the S-R Latch.<br/>
        Latch input S is controlled by IN1 input.<br/>
        Latch input R is controlled by IN2 input.<br/>
        Latch output Q is displayed on OUT0 output.<br/>&nbsp;`,
        rom, 0);
}


// noinspection SpellCheckingInspection
const rom = [
    0x06,   // ORC RR
    0x0A,   // IEN RR
    0x0B,   // OEN RR

    // ; ----------------------------------------
    // ; output state of the flip-flop
    // ; ----------------------------------------
    0x81,   // LD   Q
    0x08,   // STO  OUT0

    // ; ----------------------------------------
    // ; If S is 1 and R is 0, then Q is 1
    // ; ----------------------------------------
    0x11,   // LD   S
    0x24,   // ANDC R
    0x0B,   // OEN  RR
    0x88,   // STO  Q

    // ; ----------------------------------------
    // ; If S is 0 and R is 1, then Q is 0
    // ; ----------------------------------------
    0x12,   // LDC  S
    0x23,   // AND  R
    0x0B,   // OEN  RR
    0x89,   // STOC Q

    // ; the following 2 instructions are not needed for this demo
    // ; but if this code is a part of a larger program, it will
    // ; restore the OEN signal expectation for the remaining program

    0x06,   // ORC  RR    ; Produces always 1 in RR
    0x0B,   // OEN  RR

    0x0C,   // JMP
];
