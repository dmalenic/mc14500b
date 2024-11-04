import {pgmInitCurrentProgram} from '../programs.js';


export function initNor(programSelector) {
    pgmInitCurrentProgram(programSelector, `Logical NOR Gate`,
        `This program simulates a logical NOR gate.<br/>
        Use inputs IN1 and IN2 to supply the input values to the gate.<br/>
        The result of the NOR logical operation is shown at OUT0 output.<br/>
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
    0x25,   // OR   IN2
    0x09,   // STOC OUT0

    0x0C,   // JMP
];