import {pgmInitCurrentProgram} from '../programs.js';


export function initDieRoll(programSelector) {
    pgmInitCurrentProgram(programSelector, `Roll a Die`,
        `When the STOP signal is zero, the die rolls and the outputs 1 to 6 are<br/>
        &nbsp;sequentially turned on.<br/>
        When the STOP becomes one, the die stops with one of the outputs OUT1-OUT6<br/>
        &nbsp;activated.<br/>
        Input IN1 is the STOP signal.`,
        rom, 0);
}


// noinspection SpellCheckingInspection
const rom = [
    0x06,   // ORC RR
    0x0A,   // IEN RR
    0x0B,   // OEN RR

    0x11,   // LD      STOP
    0x0E,   // SKZ
    0x0C,   // JMP
    0x19,   // STOC    OUT1
    0x68,   // STO     OUT6
    0x00,   // NOPO
    0x00,   // NOPO
    0x00,   // NOPO
    0x00,   // NOPO

    0x11,   // LD      STOP
    0x0E,   // SKZ
    0x0C,   // JMP
    0x29,   // STOC    OUT2
    0x18,   // STO     OUT1
    0x00,   // NOPO
    0x00,   // NOPO
    0x00,   // NOPO
    0x00,   // NOPO

    0x11,   // LD      STOP
    0x0E,   // SKZ
    0x0C,   // JMP
    0x39,   // STOC    OUT3
    0x28,   // STO     OUT2
    0x00,   // NOPO
    0x00,   // NOPO
    0x00,   // NOPO
    0x00,   // NOPO

    0x11,   // LD      STOP
    0x0E,   // SKZ
    0x0C,   // JMP
    0x49,   // STOC    OUT4
    0x38,   // STO     OUT3
    0x00,   // NOPO
    0x00,   // NOPO
    0x00,   // NOPO
    0x00,   // NOPO

    0x11,   // LD      STOP
    0x0E,   // SKZ
    0x0C,   // JMP
    0x59,   // STOC    OUT5
    0x48,   // STO     OUT4
    0x00,   // NOPO
    0x00,   // NOPO
    0x00,   // NOPO
    0x00,   // NOPO

    0x11,   // LD      STOP
    0x0E,   // SKZ
    0x0C,   // JMP
    0x69,   // STOC    OUT6
    0x58,   // STO     OUT5

    0x0C,   // JMP
];
