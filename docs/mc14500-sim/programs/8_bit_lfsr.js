import {pgmInitCurrentProgram} from '../programs.js';


export function init8BitLfsr(programSelector) {
    pgmInitCurrentProgram(programSelector, `8-bit LFSR`,
        `Set inputs 5 to 1, 6 to 0 to load inputs 1 to 4 into ram 0 to 3 <small>(initial condition x1..x4).</small><br/>
        Set inputs 5 and 6 to 0 to load inputs 1 to 4 into ram 4 to 7 <small>(initial condition x5..x8).</small><br/>
        Set input 6 to 1 to start generating pseudorandom sequence on output 0.<br/>
        Output 1 is the clock signal. It switches from 0 to 1 when the output 0 value is<br/>
        &nbsp;updated and back from 1 to 0 at the beginning of a program cycle.`,
        rom, 0);
}


// noinspection SpellCheckingInspection
const rom = [
    // ; ------------------------------------------------------------------------------
    // ; 8-bit Linear Feedback Shift Register with maximum length feedback polynomial
    // ; x^8 + x^6 + x^5 + x^4 + 1 that generates 2^8-1 = 255 pseudorandom outputs.
    // ; See https://digitalxplore.org/up_proc/pdf/91-1406198475105-107.pdf
    // ; ------------------------------------------------------------------------------
    // ; Rules for Selecting Feedback Polynomial:
    // ; - The ‘one’ in the polynomial correspond to input to the first bit.
    // ; - The powers of polynomial term represent tapped bits, counting from left,
    // ;   e.g., for the 8-bit shift register, the power 8 represents the MSB,
    // ;   the power 1 represents the LSB.
    // ; - The first and last bits are always connected as an input and output tap
    // ;   respectively.
    // ; - The maximum length can only be possible if the number of taps is even and
    // ;   there must be no common divisor to all taps.
    // ; ------------------------------------------------------------------------------
    // ; Usage:
    // ; - Set IN5 ON, IN6 OFF to load IN1-IN4 into RAM0-RAM3
    // ;   (the initial values X0-X3)
    // ; - Set IN5 OFF, IN6 OFF to load IN1-IN4 into RAM4-RAM7
    // ;   (the initial values X4-X7)
    // ; - Set IN6 ON to start generating pseudorandom sequence on output OUT0.
    // ; - OUT1 is the write signal. It switches from 0 to 1 when the OUT0 value is updated,
    // ;   and back from 1 to 0 at the beginning of a program cycle.
    // ; ------------------------------------------------------------------------------

    // ; ------------------------------------------------------
    // ; Initialize
    // ; ------------------------------------------------------
    0x06,       // ORC     RR
    0x0B,       // OEN     RR
    0x0A,       // IEN     RR
    0x19,       // STOC    CLK     ; CLK = !RR = 0

    // ; ------------------------------------------------------
    // ; If IN5 is set and IN6 is not set write IN1-IN4 to X1-X4
    // ; ------------------------------------------------------
    0x62,       // LDC     START
    0x53,       // AND     L_OR_H
    0x0B,       // OEN     RR

    0x11,       // LD      IN1
    0x88,       // STO     X1
    0x21,       // LD      IN2
    0x98,       // STO     X2
    0x31,       // LD      IN3
    0xA8,       // STO     X3
    0x41,       // LD      IN4
    0xB8,       // STO     X4

    // ; ------------------------------------------------------
    // ; If both IN5 and IN6 are clear write IN1-IN4 to X5-X8
    // ; ------------------------------------------------------
    0x62,       // LDC     START
    0x54,       // ANDC    L_OR_H
    0x0B,       // OEN     RR

    0x11,       // LD      IN1
    0xC8,       // STO     X5
    0x21,       // LD      IN2
    0xD8,       // STO     X6
    0x31,       // LD      IN3
    0xE8,       // STO     X7
    0x41,       // LD      IN4
    0xF8,       // STO     X8

    // ; ------------------------------------------------------
    // ; If IN6 is set calculate the next LFSR value
    // ; ------------------------------------------------------
    0x62,       // LDC     START   ; load the complement of IN6 to RR
    0x0E,       // SKZ             ; if IN6 is set then start the LFSR
    0x0C,       // JMP             ; if IN6 is not set jump to the beginning

    // ; ------------------------------------------------------
    // ; Output X8, the current LFSR output value.
    // ; From this point on, with some caution (see below) X8
    // ; can be used as a temporary register.
    // ; ------------------------------------------------------
    0x06,       // ORC     RR      ; 1->RR
    0x0B,       // OEN     RR      ; Enable output, input should aready be enabled
    0xF1,       // LD      X8      ; RR = X8
    0x08,       // STO     D_OUT   ; D_OUT = RR = X8
    0x06,       // ORC     RR      ; 1->RR
    0x18,       // STO     CLK     ; CLK = 1, shows that data is valid

    // ; ------------------------------------------------------
    // ; Calculate the next LFSR value and put it in X8
    // ; (the rotation that follows will move it to X1).
    // ; X8 = X8 = X4 XOR (X5 XOR (X6 XOR X8))
    // ; ------------------------------------------------------
    0xF1,       // LD      X8      ; RR = X8
    0xD7,       // XNOR    X6      ; RR = X6 XNOR RR = X6 XNOR X8
    0xF9,       // STOC    X8      ; X8 = !RR = X6 XOR X8

    0xF1,       // LD      X8      ; Load X8
    0xC7,       // XNOR    X5      ; RR = X5 XNOR RR = X5 XNOR X8 = X5 XNOR (X6 XOR X8)
    0xF9,       // STOC    X8      ; X8 = !RR = X5 XOR (X6 XOR X8)

    0xF1,       // LD      X8      ; Load X8
    0xB7,       // XNOR    X4      ; RR = X4 XNOR RR = X4 XNOR X8 =
    0xF9,       // STOC    X8      ; X8 = !RR = X4 XOR (X5 XOR (X6 XOR X8))

    // ; ------------------------------------------------------
    // ; Right rotate X1..X8
    // ; as we are missing a register we need to separately handle
    // ; 2 cases:
    // ; - X8 = 0
    // ; - X8 = 1
    // ; Note: this is the constant time implementation, both
    // ;       cases are executed but only one is allowed to change
    // ;       the state and output the result.
    // ;       So, there is no side-channel information leakage ;-)
    // ;       as it really matter for a toy 8 bit LFSR like this one.
    // ; ------------------------------------------------------

    // ; ------------------------------------------------------
    // ; First handle the case if X8 = 1.
    // ; ------------------------------------------------------

    0xFB,       // OEN     X8      ; Enable output if X8 = 1
    0xFA,       // IEN     X8      ; Enable input if X8 = 1
    0xE1,       // LD      X7      ; RR = X7
    0xF8,       // STO     X8      ; X8 = X7
    0xD1,       // LD      X6      ; RR = X6
    0xE8,       // STO     X7      ; X7 = X6
    0xC1,       // LD      X5      ; RR = X5
    0xD8,       // STO     X6      ; X6 = X5
    0xB1,       // LD      X4      ; RR = X4
    0xC8,       // STO     X5      ; X5 = X4
    0xA1,       // LD      X3      ; RR = X3
    0xB8,       // STO     X4      ; X4 = X3
    0x91,       // LD      X2      ; RR = X2
    0xA8,       // STO     X3      ; X3 = X2
    0x81,       // LD      X1      ; RR = X1
    0x98,       // STO     X2      ; X2 = X1
    0x06,       // ORC     RR      ; RR = 1
    0x88,       // STO     X1      ; X1 = RR = 1

    // ; ------------------------------------------------------
    // ; If this point is reached then handle the case if X8 = 0
    // ; As we are in simulation mode START is always 1 so it can be
    // ; used to test if input is enabled i.e. if X8 = 1.
    // ; ------------------------------------------------------

    0x62,       // LDC     START   ; RR = START (0 if input was enabled, 1 otherwise)
    0x6A,       // IEN     START   ; Enable input
    0x63,       // AND     START   ; RR = RR AND START
    0x0B,       // OEN     RR      ; Enable output if RR = 1
    0x0A,       // IEN     RR      ; Enable input  if RR = 1
    0xE1,       // LD      X7      ; RR = X7
    0xF8,       // STO     X8      ; X8 = X7
    0xD1,       // LD      X6      ; RR = X6
    0xE8,       // STO     X7      ; X7 = X6
    0xC1,       // LD      X5      ; RR = X5
    0xD8,       // STO     X6      ; X6 = X5
    0xB1,       // LD      X4      ; RR = X4
    0xC8,       // STO     X5      ; X5 = X4
    0xA1,       // LD      X3      ; RR = X3
    0xB8,       // STO     X4      ; X4 = X3
    0x91,       // LD      X2      ; RR = X2
    0xA8,       // STO     X3      ; X3 = X2
    0x81,       // LD      X1      ; RR = X1
    0x98,       // STO     X2      ; X2 = X1
    0x06,       // ORC     RR      ; 1->RR
    0x89,       // STOC    X1      ; X1 = !RR = 0

    0x0C,       // JMP
];
