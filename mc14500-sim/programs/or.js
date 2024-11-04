import {pgmInitCurrentProgram} from '../programs.js';


export function initOr(programSelector) {
    pgmInitCurrentProgram(programSelector, `Logical OR Gate`,
        `This program simulates a logical OR gate.<br/>
        Use inputs IN1 and IN2 to supply the input values to the gate.<br/>
        The result of the OR logical operation is shown at OUT0 output.<br/>
        &nbsp;<br/>
        &nbsp;`,
        rom, 0);
}


// noinspection SpellCheckingInspection
const rom = [
    0x06,   // ORC RR
    0x0A,   // IEN RR
    0x0B,   // OEN RR
    // convoluted OR using De Morgan's theorem A OR B = NOT (NOT A AND NOT B)
    0x12,   // LDC  IN1
    0x24,   // ANDC IN2
    0x09,   // STOC  OUT0

    0x0C,   // JMP
];