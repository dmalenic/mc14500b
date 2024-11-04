import {pgmInitCurrentProgram} from '../programs.js';


export function initRamTest(programSelector) {
    pgmInitCurrentProgram(programSelector, `Example of RAM usage`,
        `This program illustrates how to use RAM to evaluate a boolean equation:
        <pre>Z = (A &amp; B) | (C &amp; D)</pre>
        <pre>A: IN1, B: IN2, C: IN3, D: IN4 and Z: OUT0</pre><br/>
        &nbsp;`,
        rom, 0);
}


const rom = [
    0x06,   // ORC RR
    0x0A,   // IEN RR
    0x0B,   // OEN RR

    0x11,   // LD      IN1
    0x23,   // AND     IN2
    0x88,   // STO     RAM00
    0x31,   // LD      IN3
    0x43,   // AND     IN4
    0x85,   // OR      RAM00
    0x08,   // STO     OUT0

    0x0C,   // JMP
];