import {pgmInitCurrentProgram} from '../programs.js';


export function initSelfTest(programSelector) {
    pgmInitCurrentProgram(programSelector, `Self Test`,
        `A simple program to exercise different parts of the emulator.<br/>
        The state of inputs IN1 to IN6 is mirrored to outputs OUT0 to OUT6.<br/>
        The output OUT0 is ON if input RAM0 is ON and OFF otherwise.<br/>
        Timer controls running light in ROM0 to ROM8<br/>
        &nbsp;`,
        rom, 0, 250);
}


// noinspection SpellCheckingInspection
const rom = [
    // ; Prepare: Enable input and output
    0x06,   // ORC RR
    0x0A,   // IEN RR
    0x0B,   // OEN RR

    // ; Test: Copy IN0 - IN6 to OUT0 - OUT6
    // ; The user can test all inputs and outputs using the switches and buttons
    // ; Note: OUT0 is not directly the copy of IN0 because IN0 is RR, and it will always be the same, therefore
    // ;       OUT0 is tested by equation RR == IN2, where RR because of program sequence holds the same value as IN1
    // ;       IN7 and OUT7 are lined to the timer and will be tested in the next block
    0x61,   // LD   IN6
    0x68,   // STO  OUT6

    0x51,   // LD   IN5
    0x58,   // STO  OUT5

    0x41,   // LD   IN4
    0x48,   // STO  OUT4

    0x31,   // LD   IN3
    0x38,   // STO  OUT3

    0x21,   // LD   IN2
    0x28,   // STO  OUT2

    0x11,   // LD   IN1
    0x18,   // STO  OUT1

    0x81,   // LD   RAM0
    0x08,   // STO  OUT0  this is RR == IN2 or effectively IN0 == IN2

    // ; Test: Start timer TMR0 when elapsed (set 0 -> 1)
    0x71,   // LD   IN7
    0x79,   // STOC OUT7

    // ; Loop if timer TMR0 hasn't elapsed
    0x0E,   // SKZ
    0x0C,   // JMP  0

    // Timer has elapsed -> move running ROM light

    // ; Move ROM 6 -> 7
    // ; If ROM 6 is 1 -> set to 0 and jump back
    0xE1,   // LD   RAM6
    0xF8,   // STO  RAM7
    0x0E,   // SKZ
    0xE9,   // STOC RAM6
    0x0E,   // SKZ
    0x0C,   // JMP  0

    // ; Move ROM 5 -> 6
    // ; If ROM 5 is 1 -> set to 0 and jump back
    0xD1,   // LD   RAM5
    0xE8,   // STO  RAM6
    0x0E,   // SKZ
    0xD9,   // STOC RAM5
    0x0E,   // SKZ
    0x0C,   // JMP  0

    // ; Move ROM 4 -> 5
    // ; If ROM 4 is 1 -> set to 0 and jump back
    0xC1,   // LD   RAM4
    0xD8,   // STO  RAM4
    0x0E,   // SKZ
    0xC9,   // STOC RAM4
    0x0E,   // SKZ
    0x0C,   // JMP  0

    // ; Move ROM 3 -> 4
    // ; If ROM 3 is 1 -> set to 0 and jump back
    0xB1,   // LD   RAM3
    0xC8,   // STO  RAM4
    0x0E,   // SKZ
    0xB9,   // STOC RAM3
    0x0E,   // SKZ
    0x0C,   // JMP  0

    // ; Move ROM 2 -> 3
    // ; If ROM 2 is 1 -> set to 0 and jump back
    0xA1,   // LD   RAM2
    0xB8,   // STO  RAM3
    0x0E,   // SKZ
    0xA9,   // STOC RAM2
    0x0E,   // SKZ
    0x0C,   // JMP  0

    // ; Move ROM 1 -> 2
    // ; If ROM 1 is 1 -> set to 0 and jump back
    0x91,   // LD   RAM1
    0xA8,   // STO  RAM2
    0x0E,   // SKZ
    0x99,   // STOC RAM1
    0x0E,   // SKZ
    0x0C,   // JMP  0

    // ; Move ROM 0 -> 1
    // ; If ROM 0 is 1 -> set to 0 and jump back
    0x81,   // LD   RAM0
    0x98,   // STO  RAM1
    0x0E,   // SKZ
    0x89,   // STOC RAM0
    0x0E,   // SKZ
    0x0C,   // JMP  0

    // ; If this point is reached SPR0 - 7 are all 0
    // ; -> The running light needs to be initialized

    0x06,   // ORC  RR
    0x88,   // STO  RAM0

    // ; Following is a convenient place to introduce
    // ; a code that is just testing if RTN, FlagO and
    // ; FlagF signal outputs are working.
    0x0D,   // RTN      ; This should activate RTN pin, but as RTN 'skips' the next instrction...
    0x0F,   // NOPF     ; ...FlagF pin should not be activated here
    0x00,   // NOPO     ; This should activate FlagO pin
    0x0F,   // NOPF     ; This should activate FlagF pin

    0x0C,   // JMP  0
];
