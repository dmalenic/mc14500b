import {pgmInitCurrentProgram} from '../programs.js';
import {mc14500SetJsr, mc14500SetLut} from '../mc14500.js';


export function initRtnNopF(programSelector) {
    // noinspection SpellCheckingInspection
    pgmInitCurrentProgram(programSelector, `RTN Instruction Demo (NOPF as JSR)`,
        `This program illustrates how RTN instruction can be used.<br/>
        Setting only input 1 to 1 sets output 0 blinking. Setting inputs 1 and 3 to 1 and input 2 to 0 sets output 1 to 1 continuously.<br/>
        Setting only input 2 to 1 sets output 1 blinking. Setting inputs 2 and 3 to 1 and input 1 to 0 sets output 2 to 1 continuously.<br/>
        Setting both inputs 1 and 2 to 1 set outputs 0 and 1 to blink interchangeably. Input 3 value is not important.<br/>
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