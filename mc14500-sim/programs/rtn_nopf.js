import {pgmInitCurrentProgram} from '../programs.js';
import {mc14500SetJsr, mc14500SetLut} from '../mc14500.js';


export function initRtnNopF(programSelector) {
    // noinspection SpellCheckingInspection
    pgmInitCurrentProgram(programSelector, `RTN Instruction Demo (NOPF as JSR)`,
        `This program illustrates how RTN instruction can be used.<br/>
        Setting only IN1 to 1 sets OUT0 blinking. Setting IN1 and IN3 to 1 and IN2 to 0 sets OUT0 on continuously.<br/>
        Setting only IN2 to 1 sets OUT1 blinking. Setting IN2 and IN3 to 1 and IN2 to 0 sets OUT1 on continuously.<br/>
        Setting both IN1 and IN2 to 1 set OUT0 and OUT1 blink interchangeably. IN3 value is not important.<br/>
        NOPF instruction is wired as JSR (jump to subroutine).`,
        rom, 0, 0, setDeluxeFunctionality);
}

function setDeluxeFunctionality() {
    mc14500SetLut(1, 0x10);
    mc14500SetLut(2, 0x14);
    // noinspection SpellCheckingInspection
    mc14500SetJsr('NOPF');
}


// noinspection SpellCheckingInspection
const rom = [
    0x06,   // 00: ORC  RR
    0x0A,   // 01: IEN  RR
    0x0B,   // 02: OEN  RR
    0x11,   // 03: LD   IN1
    0x0E,   // 04: SKZ
    0x1F,   // 05: NOPF 1
    0x21,   // 06: LD   IN2
    0x0E,   // 07: SKZ
    0x2F,   // 08: NOPF 2
    0x31,   // 09: LD   IN3
    0x0E,   // 0A: SKZ
    0x0C,   // 0B: JMP
    0x06,   // 0C: ORC  RR
    0x09,   // 0D: STOC OUT0
    0x19,   // 0E: STOC OUT1
    0x0C,   // 0F: JMP
    0x06,   // 10: ORC  RR
    0x08,   // 11: STO  OUT0
    0x19,   // 12: STOC OUT1
    0x0D,   // 13: RTN
    0x06,   // 14: ORC  RR
    0x09,   // 15: STOC OUT0
    0x18,   // 16: STO  OUT1
    0x0D,   // 17: RTN
];