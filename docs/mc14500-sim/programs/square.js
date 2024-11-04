import {pgmInitCurrentProgram} from '../programs.js';


export function initSquare(programSelector) {
    pgmInitCurrentProgram(programSelector, `Square Wave`,
        `The program generates a square wave on the output 4.<br/>
        Note that the output 4 is kept high for exactly five instructions,<br/>
        &nbsp;and precisely five instructions, it is kept low.<br/>
        &nbsp;<br/>
        &nbsp;`,
        rom, 0);
}


// noinspection SpellCheckingInspection
const rom = [
    // Note that the output OUT4 is kept high for exactly five instructions,
    // and precisely five instructions, it is kept low.
    // The exception is the first cycle when during the first 3 instructions the OUT4 state is undefined.
    0x06,   // ORC RR          ; OUT4=0 (excpet in the 1st cycle, when it is undefined)
    0x0A,   // IEN RR          ; OUT4=0 (excpet in the 1st cycle, when it is undefined)
    0x0B,   // OEN RR          ; OUT4=0 (excpet in the 1st cycle, when it is undefined)
    0x48,   // STO  OUT4       ; OUT4=1
    0x00,   // NOPO            ; OUT4=1
    0x00,   // NOPO            ; OUT4=1
    0x00,   // NOPO            ; OUT4=1
    0x00,   // NOPO            ; OUT4=1
    0x49,   // STOC OUT4       ; OUT4=0
    0x0C,   // JMP             ; OUT4=0
];