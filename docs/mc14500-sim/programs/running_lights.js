import {pgmInitCurrentProgram} from '../programs.js';


/**
 * Initializes the running lights program.
 * @param programSelector
 */
export function initRunningLights(programSelector) {
    pgmInitCurrentProgram(programSelector, `Running Lights`,
        `The emulation of a simple Christmas tree decoration style running lights.<br/>
        &nbsp;<br/>
        &nbsp;<br/>
        &nbsp;<br/>
        &nbsp;`,
        rom, 20, 100);
}


/**
 * Running lights program ROM content
 * @type {number[]}
 */
// noinspection SpellCheckingInspection
const rom = [
    0x06,   // ORC  RR
    0x0A,   // IEN  RR
    0x0B,   // OEN  RR
    // if timer is on then loop back to the start
    0x71,   // LD   IN7
    0x0E,   // SKZ
    0x0C,   // JMP
    // timer is off when we reached this point, set the RR to start turning the lights
    0x06,   // ORC  RR
    0x08,   // STO  OUT0
    0x18,   // STO  OUT1
    0x28,   // STO  OUT2
    0x38,   // STO  OUT3
    0x48,   // STO  OUT4
    0x58,   // STO  OUT5
    0x68,   // STO  OUT6
    0x78,   // STO  OUT7
    // start turning off the lights
    0x09,   // STOC OUT0
    0x19,   // STOC OUT1
    0x29,   // STOC OUT2
    0x39,   // STOC OUT3
    0x49,   // STOC OUT4
    0x59,   // STOC OUT5
    0x69,   // STOC OUT6
    0x79,   // STOC OUT7

    // loop back to the start

    0x0C,   //  JMP
];
