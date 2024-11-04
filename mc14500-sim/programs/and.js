import {pgmInitCurrentProgram} from '../programs.js';


export function initAnd(programSelector) {
    pgmInitCurrentProgram(programSelector, `Logical AND Gate`,
        `This program simulates a logical AND gate.<br/>
        Use inputs IN1 and IN2 to supply the input values to the gate.<br/>
        The result of the AND logical operation is shown at OUT0 output.<br/>
        &nbsp;<br/>
        &nbsp;`,
        rom, 0);
}


const rom = [
    0x06,   // ORC RR
    0x0A,   // IEN RR
    0x0B,   // OEN RR

    0x11,   // LD   IN1
    0x23,   // AND  IN2
    0x08,   // STO  OUT0

    0x0C,   // JMP
];
