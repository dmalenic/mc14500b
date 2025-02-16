import {pgmInitCurrentProgram} from '../programs.js';


export function initAnd(programSelector) {
    pgmInitCurrentProgram(programSelector, `Logical AND Gate`,
        `This program simulates a logical AND gate.<br/>
        Use inputs 1 and 2 to supply the input values to the gate.<br/>
        The result of the AND logical operation is provided in output 0.<br/>
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
