import {pgmInitCurrentProgram} from '../programs.js';


/**
 * Initializes the running lights program.
 * @param programSelector
 */
export function initFromGray(programSelector) {
    pgmInitCurrentProgram(programSelector, `Convert Gray code to binary`,
        `&nbsp;Converts 7-bit Gray code to binary.<br/>
        &nbsp;Only 7 bits can be converted because RR is connected to IN0.<br/>
        &nbsp;Use inputs IN7 to IN1 to provide the 7 bit Gray code input.<br/>
        &nbsp;The result is shown in outputs OUT6 to OUT0. OUT7 is always 0.<br/>
        &nbsp;`,
        rom, 20, 0);
}


/**
 * Running lights program ROM content
 * @type {number[]}
 */
// noinspection SpellCheckingInspection
const rom = [
    0x06,   // ORC     RR
    0x0A,   // IEN     RR
    0x0B,   // OEN     RR

    // ; after INIT completes, RR holds 1

    0x79,   // STOC    OUT7        ; it is 7 bit conversion so OUT7 is always 0
    0x71,   // LD      IN7         ; OUT6 = IN7
    0x68,   // STO     OUT6
    0x67,   // XNOR    IN6         ; OUT5 = OUT6 XOR IN6, RR has OUT6
    0x59,   // STOC    OUT5
    0x57,   // XNOR    IN5         ; OUT4 = OUT5 XOR IN5, RR has complement of OUT5
    0x48,   // STO     OUT4
    0x47,   // XNOR    IN4         ; OUT3 = OUT4 XOR IN4, RR has OUT4
    0x39,   // STOC    OUT3
    0x37,   // XNOR    IN3         ; OUT2 = OUT3 XOR INR, RR has complement of OUT3
    0x28,   // STO     OUT2
    0x27,   // XNOR    IN2         ; OUT1 = OUT2 XOR IN2, RR has OUT2
    0x19,   // STOC    OUT1
    0x17,   // XNOR    IN1         ; OUT0 = OUT1 XOR IN1, RR has complement of OUT1
    0x08,   // STO     OUT0

    0x0C,   // JMP
];
