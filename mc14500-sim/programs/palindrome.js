import {pgmInitCurrentProgram} from '../programs.js';


/**
 * Initializes the running lights program.
 * @param programSelector
 */
export function initPalindrome(programSelector) {
    pgmInitCurrentProgram(programSelector, `Palindrome`,
        `&nbsp;Tests if 7-bit binary string is a palindrome.<br/>
        &nbsp;Maximum 7 bits can be tested because RR is connected to IN0.<br/>
        &nbsp;Use inputs IN7 to IN1 to provide the 7 bit binary string input.<br/>
        &nbsp;Output OUT0 is 1 if string is a palindrome otherwise it is 0.<br/>
        &nbsp;`,
        rom, 20, 0);
}


/**
 * `palindrome` program ROM content.
 * @type {number[]}
 */
// noinspection SpellCheckingInspection
const rom = [
    0x06,   // ORC     RR
    0x0A,   // IEN     RR
    0x0B,   // OEN     RR

    0x88,   // STO     RAM0    ; assume a palindrome
    0x12,   // LDC     IN1     ; is IN1 != IN7
    0x77,   // XNOR    IN7
    0x0E,   // SKZ             ; no - may be a palindrome - skip to test IN2-IN6
    0x89,   // STOC    RAM0    ; not a palindrome
    0x22,   // LDC     IN2     ; is IN2 != IN6
    0x67,   // XNOR    IN6
    0x0E,   // SKZ             ; no - may be a palindrome - skip to test IN3-IN5
    0x89,   // STOC    RAM0    ; not a palindrome
    0x32,   // LDC     IN3     ; is IN3 != IN5
    0x57,   // XNOR    IN5
    0x0E,   // SKZ             ; no - it is a palindrome
    0x89,   // STOC    RAM0    ; not a palindrome
    // ; write a result
    0x81,   // LD      RAM0    ; set OUT0
    0x08,   // STO     OUT0
    0x0C,   // JMP
];
