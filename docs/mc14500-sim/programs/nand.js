import {pgmInitCurrentProgram} from '../programs.js';


export function initNand(programSelector) {
    pgmInitCurrentProgram(programSelector, `Logical NAND Gate`,
        `This program simulates a logical NAND gate.<br/>
        Use inputs 1 and 2 to supply the input values to the gate.<br/>
        The result of the NAND logical operation is shown at output 0.<br/>
        &nbsp;<br/>
        &nbsp;`,
        rom, 0);
}


// noinspection SpellCheckingInspection
const rom = [
    0x06,   // ORC RR
    0x0A,   // IEN RR
    0x0B,   // OEN RR

    0x11,   // LD   IN1
    0x23,   // AND  IN2
    0x09,   // STOC OUT0

    0x0C,   // JMP
];