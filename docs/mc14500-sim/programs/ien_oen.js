import {pgmInitCurrentProgram} from '../programs.js';


export function initIonOen(programSelector) {
    // noinspection SpellCheckingInspection
    pgmInitCurrentProgram(programSelector, `IEN and OEN`,
        `Demonstrates the effect of IEN and OEN commands on LD, LDC, STO, STOC.<br/>
        Input 1 is read using LD command, input 2 is read with LDC command.<br/>
        Inputs 3 and 4 control IEN and OEN flags, respectively.<br/>
        Outputs 0 and 1 show the result of STO command on inputs 1 and 2.<br/>
        Outputs 2 and 3 show the consequence of STOC command on inputs 1 and 2.`,
        rom, 0);
}


// noinspection SpellCheckingInspection
const rom = [
    0x3A,   // IEN IN3
    0x4B,   // OEN IN4

    0x11,   // LD   IN1
    0x08,   // STO  OUT0
    0x29,   // STOC OUT2
    0x22,   // LDC  IN2
    0x18,   // STO  OUT1
    0x39,   // STOC OUT3

    0x0C,   // JMP
];
