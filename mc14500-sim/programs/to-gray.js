import {pgmInitCurrentProgram} from '../programs.js';


/**
 * Initializes the running lights program.
 * @param programSelector
 */
export function initToGray(programSelector) {
    pgmInitCurrentProgram(programSelector, `Convert binary to Gray code`,
        `&nbsp;Converts 7-bit binary to Gray code.<br/>
        &nbsp;Only 7 bits can be converted because RR is connected to IN0.<br/>
        &nbsp;Use inputs IN7 to IN1 to provide the 7 bit binary input.<br/>
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

    //; after INIT completes, RR holds 1

    0x79,   // STOC    OUT7        ; it is 7 bit conversion so OUT7 is always 0
    0x11,   // LD      IN1         ; OUT0 = IN1 XOR IN2
    0x27,   // XNOR    IN2
    0x09,   // STOC    OUT0
    0x21,   // LD      IN2         ; OUT0 = IN1 XOR IN2
    0x37,   // XNOR    IN3
    0x19,   // STOC    OUT1
    0x31,   // LD      IN3         ; OUT0 = IN1 XOR IN2
    0x47,   // XNOR    IN4
    0x29,   // STOC    OUT2
    0x41,   // LD      IN4         ; OUT0 = IN1 XOR IN2
    0x57,   // XNOR    IN5
    0x39,   // STOC    OUT3
    0x51,   // LD      IN5         ; OUT0 = IN1 XOR IN2
    0x67,   // XNOR    IN6
    0x49,   // STOC    OUT4
    0x61,   // LD      IN6         ; OUT0 = IN1 XOR IN2
    0x77,   // XNOR    IN7
    0x59,   // STOC    OUT5
    0x71,   // LD      IN7         ; OUT6 = IN7
    0x68,   // STO     OUT6

    0x0C,   // JMP
];
