import {pgmInitCurrentProgram} from '../programs.js';


export function initNot(programSelector) {
    pgmInitCurrentProgram(programSelector, `Logical NOT Gate`,
        `This program simulates a logical NOT gate.<br/>
        Use input 1 to supply the input value to the gate.<br/>
        The result of the NOT logical operation is provided in output 0.<br/>
        &nbsp;<br/>
        &nbsp;`,
        rom, 0);
}


const rom = [
    0x06,   // ORC RR
    0x0A,   // IEN RR
    0x0B,   // OEN RR

    0x12,   // LDC  IN1
    0x08,   // STO  OUT0

    0x0C,   // JMP
];
