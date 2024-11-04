import {pgmInitCurrentProgram} from '../programs.js';


/**
 * Initializes the counter program.
 * @param programSelector
 */
export function init4BitCounter(programSelector) {
    pgmInitCurrentProgram(programSelector,
        '4-bit Counter',
        `Counts how often the CLOCK input has switched from zero to one.<br/>
        The CLOCK input is controlled by input 1.<br/>
        The RESET signal resets the counter value to zero. Its active level is HIGH, <br/>
        &nbsp;and it is controlled by input 2.<br/>
        The counter output is shown on outputs 0 to 3, output 3 being the MSB.`,
        rom, 0, 0);
}


/**
 * Counter program ROM content
 * @type {number[]}
 */
// noinspection SpellCheckingInspection
const rom = [
    // ; Creates 1 in RR via RR pin wired back to input 0
    // ; and then move the 1 as output data it into
    // ; IEN and OEN to initialize the chip
    0x06,   // ORC      RR
    0x0A,   // IEN      RR
    0x0B,   // OEN      RR

    // ; ----------------------------------------
    // ; check the reset, reset is active high like on the original MC14500
    // ; ----------------------------------------
    0x2B,   // OEN      RESET
    0x22,   // LDC      RESET
    0x88,   // STO      D0
    0x98,   // STO      D1
    0xA8,   // STO      D2
    0xB8,   // STO      D3

    // ; ----------------------------------------
    // ; enable inputs and outputs
    // ; ----------------------------------------
    0x06,   // ORC      RR
    0x0B,   // OEN      RR
    0x0A,   // IEN      RR

    // ; ----------------------------------------
    // ; copy internal state to the output
    // ; ----------------------------------------
    0x81,   // LD       D0
    0x08,   // STO      Q0
    0x91,   // LD       D1
    0x18,   // STO      Q1
    0xA1,   // LD       D2
    0x28,   // STO      Q2
    0xB1,   // LD       D3
    0x38,   // STO      Q3

    // ; ----------------------------------------
    // ; The counter implementation:
    // ; - complement the first flip-flop if clock has switched from 0 to 1
    // ; - for all other flip-flops:
    // ;   if the state of the prevous D flip-flop has switched from 1 to 0 complement the current flip-flop
    // ; ----------------------------------------

    // ; ----------------------------------------
    // ; check the positive edge of the clock signal
    // ; We want 0 iff CLOCK is one and OLD_CLK is zero
    // ; i.e. OLD_CLK + !OLD_CLK == 0
    // ; ----------------------------------------
    0xF1,   // LD       OLD_CLK     ; Move OLD_CLK to ...
    0xE8,   // STO      TEMP        ; ... TEMP
    0x11,   // LD       CLOCK       ; Find rising edge of CLK
    0xF8,   // STO      OLD_CLK     ; Store the current CLK state to OLD_CLK for the next iteration: OLD_CLK = CLOCK
    0xE4,   // ANDC     TEMP        ; RR = CLK AND !OLD_CLK
    0xE8,   // STO      TEMP        ; If output is to be disabled TEMP must be predictable i.e. 0 in the remaining program
    0x0B,   // OEN

    // ; ----------------------------------------
    // ; process D0 flip-flop:
    // ; ----------------------------------------
    0x81,   // LD       D0          ; Load D0
    0xE8,   // STO      TEMP        ; Preserve D0 so we can check if it has changed from 1 to 0 (only if output is enabled)
    0x89,   // STOC     D0          ; Complement D0 (only if output is enabled)
    0x82,   // LDC      D0          ; Check if Q0 has changed from 1 to 0.
    0xE3,   // AND      TEMP        ; RR = TEMP AND D0. Note: if output is disabled, the value of TEMP is 0.
    0x0B,   // OEN      TEMP        ; Enable output only if Q1 has changed from 1 to 0

    // ; ----------------------------------------
    // ; process D1 flip-flop:
    // ; ----------------------------------------
    0x91,   // LD       D1          ; Load D1
    0xE8,   // STO      TEMP        ; Preserve D1 so we can check if it has changed from 1 to 0
    0x99,   // STOC     D1          ; Complement D1 (only if output is enabled)
    0x92,   // LDC      D1          ; Check if Q1 has changed from 1 to 0.
    0xE3,   // AND      TEMP        ; RR = TEMP AND D1. Note: if output is disabled, the value of TEMP is 0.
    0x0B,   // OEN      TEMP        ; Enable output only if Q1 has changed from 1 to 0

    // ; ----------------------------------------
    // ; process D2 flip-flop:
    // ; ----------------------------------------
    0xA1,   // LD       D2          ; Load D2
    0xE8,   // STO      TEMP        ; Preserve D2 so we can check if it has changed from 1 to 0 (only if output is enabled)
    0xA9,   // STOC     D2          ; Complement D2 (only if output is enabled)
    0xA2,   // LDC      D2          ; Check if Q2 has changed from 1 to 0.
    0xE3,   // AND      TEMP        ; RR = TEMP AND D2. Note: if output is disabled, the value of TEMP is 0.
    0x0B,   // OEN      TEMP        ; Enable output only if Q2 has changed from 1 to 0

    // ; ----------------------------------------
    // ; process D3 flip-flop:
    // ; ----------------------------------------
    0xB1,   // LD       D3          ; Load D3
    0xB9,   // STOC     D3          ; Complement D3 (only if output is enabled)

    // ; the following 2 instructions are not needed for this demo
    // ; but if this code is a part of a larger program, it will
    // ; restore the OEN signal expectation for the remaining program

    0x06,   // ORC  RR    ; Produces always 1 in RR
    0x0B,   // OEN  RR

    0x0C,   // JMP
];
