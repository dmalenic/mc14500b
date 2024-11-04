import {pgmInitCurrentProgram} from '../programs.js';


export function init4BitComparator(programSelector) {
    pgmInitCurrentProgram(programSelector, `4-bit Comparator`,
        `This program simulates a '4-bit comparator' circuit.<br/>
        Set inputs 5 to 1 and 6 to 0 to load inputs 1 to 4 into ram 0 to 3 <small>(the 2nd op. is B1-B3).</small><br/>
        Set inputs 5 and 6 to 0 to load IN1-IN4 <small>(the 1st operand is A1-A4).</small><br/>
        Set input 6 to 1 to perform the comparison. If A=B, then the output 0 is set.<br/>
        If A&gt;B, then the output 1 is set. If A&lt;B, then the output 2 is set.`,
        rom, 0);
}


// noinspection SpellCheckingInspection
const rom = [
    // ; ------------------------------------------------------
    // ; Initialize
    // ; ------------------------------------------------------
    0x06,    // ORC     RR
    0x0A,    // IEN     RR

    // ; ------------------------------------------------------
    // ; Write A1-A4 to B1-B4 if IN5 is set
    // ; ------------------------------------------------------
    0x5B,    // OEN     IN5

    0x11,    // LD      A1
    0x88,    // STO     B1
    0x21,    // LD      A2
    0x98,    // STO     B2
    0x31,    // LD      A3
    0xA8,    // STO     B3
    0x41,    // LD      A4
    0xB8,    // STO     B4

    // ; ------------------------------------------------------
    // ; At this point, if IN5 was set, the second operand is
    // ; loaded into RAM0-RAM3; otherwise the input contains
    // ; the first operand.
    // ; ------------------------------------------------------

    // ; Enable output if IN6 is set
    0x61,    // LD      CALC
    0x0B,    // OEN     RR

    // ; ------------------------------------------------------
    // ; In RR was not set, we can return to the beginning
    // ; to make user input in this demo more responsive.
    // ; The following 3 instruction are not needed for
    // ; the actual calculation.
    // ; ------------------------------------------------------
    0x02,    // LDC     RR
    0x0E,    // SKZ
    0x0C,    // JMP

    // ; ------------------------------------------------------
    // ; Start: Set EQ to 1, AGTR to 0 and BGTR to 0
    // ; ------------------------------------------------------

    0x06,    // ORC     RR
    0xD8,    // STO     EQ
    0xE9,    // STOC    AGTR
    0xF9,    // STOC    BGTR

    // ; ------------------------------------------------------
    // ; Compare 4th bit
    // ; ------------------------------------------------------

    0xDB,    // OEN     EQ      ; Enable if EQ = 1
    0x41,    // LD      A4      ; Load A4
    0xB7,    // XNOR    B4      ; Compare with B4
    0xD8,    // STO     EQ      ; Store new value to EQ
    0x45,    // OR      A4      ; BGTR = EQ OR A4
    0xF9,    // STOC    BGTR    ; Store new BGTR
    0xD1,    // LD      EQ      ; Load EQ
    0xB5,    // OR      B4      ; AGTR = EQ OR B4
    0xE9,    // STOC    AGTR    ; Store new AGTR (end of 4th bit comparison)
    0xDB,    // OEN     EQ      ; Enable output if EQ = 1 (prepare for 3rd bit comparison)

    // ; ------------------------------------------------------
    // ; Compare 3rd bit
    // ; ------------------------------------------------------

    0xDB,    // OEN     EQ      ; Enable if EQ = 1
    0x31,    // LD      A3      ; Load A3
    0xA7,    // XNOR    B3      ; Compare with B3
    0xD8,    // STO     EQ      ; Store new value to EQ
    0x35,    // OR      A3      ; BGTR = EQ OR A3
    0xF9,    // STOC    BGTR    ; Store new BGTR
    0xD1,    // LD      EQ      ; Load EQ
    0xA5,    // OR      B3      ; AGTR = EQ OR B3
    0xE9,    // STOC    AGTR    ; Store new AGTR (end of 3th bit comparison)
    0xDB,    // OEN     EQ      ; Enable output if EQ = 1 (prepare for 2nd bit comparison)

    // ; ------------------------------------------------------
    // ; Compare 2nd bit
    // ; ------------------------------------------------------

    0xDB,    // OEN     EQ      ; Enable if EQ = 1
    0x21,    // LD      A2      ; Load A2
    0x97,    // XNOR    B2      ; Compare with B2
    0xD8,    // STO     EQ      ; Store new value to EQ
    0x25,    // OR      A2      ; BGTR = EQ OR A2
    0xF9,    // STOC    BGTR    ; Store new BGTR
    0xD1,    // LD      EQ      ; Load EQ
    0x95,    // OR      B2      ; AGTR = EQ OR B2
    0xE9,    // STOC    AGTR    ; Store new AGTR (end of 2nd bit comparison)
    0xDB,    // OEN     EQ      ; Enable output if EQ = 1 (prepare for 1st bit comparison)

    // ; ------------------------------------------------------
    // ; Compare 1st bit
    // ; ------------------------------------------------------

    0xDB,    // OEN     EQ      ; Enable if EQ = 1
    0x11,    // LD      A1      ; Load A1
    0x87,    // XNOR    B1      ; Compare with B1
    0xD8,    // STO     EQ      ; Store new value to EQ
    0x15,    // OR      A1      ; BGTR = EQ OR A1
    0xF9,    // STOC    BGTR    ; Store new BGTR
    0xD1,    // LD      EQ      ; Load EQ
    0x85,    // OR      B1      ; AGTR = EQ OR B1
    0xE9,    // STOC    AGTR    ; Store new AGTR (end of 1st bit comparison)

    0x06,    // ORC     RR      ; Enable output
    0x0B,    // OEN     RR      ;

    // ; ------------------------------------------------------
    // ; Done, display the result
    // ; ------------------------------------------------------

    0xD1,    // LD      EQ
    0x08,    // STO     OUT_EQ
    0xE1,    // LD      AGTR
    0x18,    // STO     OUT_AGTR
    0xF1,    // LD      BGTR
    0x28,    // STO     OUT_BGTR

    0x0C,    // JMP
];
