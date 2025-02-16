import {pgmInitCurrentProgram} from '../programs.js';


export function initXor(programSelector) {
    pgmInitCurrentProgram(programSelector, 'Logical XOR Gate',
        `This program simulates a logical XOR gate.<br/>
        Use inputs 1 and 2 to supply the input values to the gate.<br/>
        The result of the XOR logical operation is provided in output 0.<br/>
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
    0x27,   // XNOR IN2
    0x09,   // STOC OUT0

    0x0C,   // JMP
];