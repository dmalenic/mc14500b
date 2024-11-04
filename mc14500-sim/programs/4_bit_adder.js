import {pgmInitCurrentProgram} from '../programs.js';


export function init4BitFullAdder(programSelector) {
    pgmInitCurrentProgram(programSelector, `4-bit Full-Adder with Carry`,
        `This program simulates a '4-bit full-adder with carry' circuit.<br/>
        Set IN5 to ON and IN6 to OFF to load IN1-IN4 into RAM0-RAM3 <small>(the 2nd oper. B1-B3).</small><br/>
        Set IN5 to OFF and IN6 to OFF to load IN1-IN4 <small>(the 1st operand A1-A4).</small><br/>
        Set IN6 to ON to calculate R1-R4 and show the result on OUT0-OUT3, OUT4 shows <br/>
        the final Carry bit value.`,
        rom, 0);
}


// noinspection SpellCheckingInspection
const rom = [
    // ; ------------------------------------------------------
    // ; 4 Bit Full Adder: A1-A4 + B1-B4 = R1-R4, OUT5 = Carry out
    // ; ------------------------------------------------------
    // ; Usage:
    // ; - Set IN5 ON, IN6 OFF to load IN1-IN4 into RAM1-RAM4
    // ;   (second operand is B1-B5)
    // ; - Set IN5 OFF, IN6 OFF to load IN1-IN5
    // ;   (first operand is A1-A5)
    // ; - Set IN6 ON to calculate R1-R4.
    // ; - The result is OUT0-OUT4, OUT5 is the carry
    // ;
    // ; RAM0 is used as intermediate carry while calculating
    // ; ------------------------------------------------------

    // ; ------------------------------------------------------
    // ; Prepare: Enable input
    // ; ------------------------------------------------------
    0x06,   // ORC     RR
    0x0A,   // IEN     RR

    // ; ------------------------------------------------------
    // ; Write A1-6 to B1-6 if IN5 is set
    // ; ------------------------------------------------------

    0x5B,   // OEN     IN5

    0x11,   // LD      A1
    0x88,   // STO     B1
    0x21,   // LD      A2
    0x98,   // STO     B2
    0x31,   // LD      A3
    0xA8,   // STO     B3
    0x41,   // LD      A4
    0xB8,   // STO     B4

    // ; ------------------------------------------------------
    // ; At this point, if IN5 was set, the second operand is
    // ; loaded into RAM0-RAM3; otherwise the input contains
    // ; the first operand.
    // ; ------------------------------------------------------

    // ; Enable output if IN6 is set
    0x61,   // LD      CALC
    0x0B,   // OEN     RR

    // ; ------------------------------------------------------
    // ; If RR was not set, the program will loop back to
    // ; the beginning so user can continue defining the inputs
    // ; for the calculation.
    // ; In RR was not set, we can return to the beginning
    // ; to make user input in this demo more responsive.
    // ; The following 3 instruction are not needed for
    // ; the actual calculation.
    // ; ------------------------------------------------------
    0x02,   // LDC     RR
    0x0E,   // SKZ
    0x0C,   // JMP

    // ; ------------------------------------------------------
    // ; Do the calculations
    // ; ------------------------------------------------------

    // ; 1st bit - half adder
    0x11,   // LD      A1
    0x87,   // XNOR    B1
    0x09,   // STOC    R1

    0x11,   // LD      A1
    0x83,   // AND     B1
    0xF8,   // STO     C-TMP

    // ; 2nd bit - full adder
    0x21,   // LD      A2
    0x97,   // XNOR    B2
    0xF7,   // XNOR    C-TMP
    0x18,   // STO     R2

    0x21,   // LD      A2
    0x93,   // AND     B2
    0xFA,   // IEN     C-TMP
    0x25,   // OR      A2
    0x95,   // OR      B2
    0xF8,   // STO     C-TMP

    0x06,   // ORC     RR
    0x0A,   // IEN     RR

    // ; 3rd bit - full adder
    0x31,   // LD      A3
    0xA7,   // XNOR    B3
    0xF7,   // XNOR    C-TMP
    0x28,   // STO     R3

    0x31,   // LD      A3
    0xA3,   // AND     B3
    0xFA,   // IEN     C-TMP
    0x35,   // OR      A3
    0xA5,   // OR      B3
    0xF8,   // STO     C-TMP

    0x06,   // ORC     RR
    0x0A,   // IEN     RR

    // ; 4th bit - full adder
    0x41,   // LD      A4
    0xB7,   // XNOR    B4
    0xF7,   // XNOR    C-TMP
    0x38,   // STO     R4

    0x41,   // LD      A4
    0xB3,   // AND     B4
    0xFA,   // IEN     C-TMP
    0x45,   // OR      A4
    0xB5,   // OR      B4
    0xF8,   // STO     C-TMP

    0x06,   // ORC     RR
    0x0A,   // IEN     RR

    // ; 6th bit - show carry
    0xF1,   // LD      C-TMP
    0x48,   // STO     C-OUT

    // ; Loop back

    0x0C,   // JMP     0
];
