import {pgmInitCurrentProgram} from '../programs.js';


export function initJkFlipFlop(programSelector) {
    pgmInitCurrentProgram(programSelector, `J-K Flip-Flop`,
        `This program simulates the J-K Flip-Flop.<br/>
        Latch input J is controlled by IN1 input.<br/>
        Latch input K is controlled by IN2 input.<br/>
        Latch input CLK is controlled by IN3 input.<br/>
        Latch output Q is displayed on OUT0 output.`,
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
    0xA1,   // LD      Q
    0x08,   // STO     OUT0

    // ; ----------------------------------------
    // ; check the positive edge of the clock signal
    // ; We want 0 iff CLOCK is one and OLD_CLK is zero
    // ; i.e. OLD_CLK + !OLD_CLK == 0
    // ; ----------------------------------------
    0x91,   // LD       OLD_CLK     ; Move OLD_CLK to ...
    0x88,   // STO      TEMP        ; ... TEMP
    0x31,   // LD       CLOCK       ; Find rising edge of CLK
    0x98,   // STO      OLD_CLK     ; Store the current CLK state to OLD_CLK for the next iteration: OLD_CLK = CLOCK
    0x84,   // ANDC     TEMP        ; RR = CLK AND !OLD_CLK
    0x0B,   // OEN

    // ; ----------------------------------------
    // ; Q(n+1) = (Q(n) AND !K) OR (Q(n) AND J)
    // ; ----------------------------------------

    0xA1,   // LD      Q            ; Load Q
    0x24,   // ANDC    K            ; RR = Q AND !K
    0x88,   // STO     TEMP         ; Store temporary result
    0xA2,   // LDC     Q            ; Load !Q
    0x13,   // AND     J            ; RR = Q AND J
    0x85,   // OR      TEMP         ; RR = (Q AND !K) OR (!Q AND J)
    0xA8,   // STO     Q            ; Store Q

    0x0C,   // JMP
];
