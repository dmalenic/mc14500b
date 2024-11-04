import {pgmInitCurrentProgram} from '../programs.js';


export function initIonOen(programSelector) {
    // noinspection SpellCheckingInspection
    pgmInitCurrentProgram(programSelector, `IEN and OEN`,
        `Demonstrates the effect of IEN and OEN commands on LD, LDC, STO, STOC.<br/>
        IN1 is read using LD command, IN2 is read with LDC command.<br/>
        IN3 and IN4 control IEN and OEN flags, respectively.<br/>
        OUT0, OUT1 show the result of STO command on IN1 and IN2.<br/>
        OUT2, OUT3 show the consequence of STOC command on IN1 and IN2.`,
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
