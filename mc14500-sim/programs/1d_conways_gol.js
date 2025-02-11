// noinspection GrazieInspection

import {pgmInitCurrentProgram} from '../programs.js';

/**
 * Initializes the 1D Conway's Game of Life program.
 * @param programSelector
 */
export function init1dConwaysGameOfLife(programSelector) {
    pgmInitCurrentProgram(programSelector,
        `1D Conway's Game of Life`,
        `The one-dimensional version of Conway's Game of Life.<br/>
        A cell becomes alive if it has precisely one live neighbor and dies otherwise.<br>
        Use inputs 1 to 5 to define the initial state of the cellular automaton.<br/>
        Turn input 6 on to start the simulation and off to stop it.<br/>
        The state of the cellular automaton is displayed on outputs 0 to 6.`,
        rom, 0, 250);
}


/**
 * 1D Conway's Game of Life program ROM content
 * @type {number[]}
 */
const rom = [
    // ; ------------------------------------------------------
    // ; One-dimensional Conway's Game of Life:
    // ;  * A cell becomes alive if it has exactly one live neighbor.
    // ;  * A cell dies if it has zero or two live neighbors.
    // ; ------------------------------------------------------
    // ; Operating instructions:
    // ;  * 5 inputs define 5 bits of the initial state,
    // ;  * 7 outputs reflects 7 bits of automaton output,
    // ;  * Internal state is held in RAM0..RAM6, output is displayed on OUT0..OUT6
    // ;  * As long as the input IN6 is low the inputs IN1..IN5 are copied to RAM1 to RAM5, RAM0
    // ;    and RAM6 are assumed initially 0. Internal state is reflected on outputs OUT0..OUT6
    // ;  * As long as the input IN6 is high the next state of the game of life is being continuously
    // ;    calculated, and outputs are updated.
    // ; ------------------------------------------------------

    // ; ------------------------------------------------------
    // ; Enable inputs and outputs
    // ; ------------------------------------------------------
    0x06,   // ORC RR
    0x0A,   // IEN RR
    0x0B,   // OEN RR

    // ; ------------------------------------------------------
    // ; If the input IN6 is LOW then the program is in the initialization mode i.e.
    // ; a user can define the initial state by changing inputs IN1 to IN5.
    // ; If the input IN6 is HIGH then the program is in the calculation mode and
    // ; the next state of the cellular automaton is calculated.
    // ; In the calculation mode inputs and outputs should be disabled in the follwing
    // ; code block.
    // ; ------------------------------------------------------
    0x62,   // LDC   IN6
    0x0B,   // OEN   RR
    0x0A,   // IEN   RR

    // ; ------------------------------------------------------
    // ; To get the immediate visual feedback, the state of IN1 to IN5 is copied
    // ; to ram RAM1 to RAM5, and to outputs OUT1 to OUT5. RAM0, RAM6, OUT0 and OUT6 are set to 0.
    // ; ------------------------------------------------------
    0x11,   // LD    IN1
    0x98,   // STO   RAM1
    0x18,   // STO   OUT1
    0x21,   // LD    IN2
    0xA8,   // STO   RAM2
    0x28,   // STO   OUT2
    0x31,   // LD    IN3
    0xB8,   // STO   RAM3
    0x38,   // STO   OUT3
    0x41,   // LD    IN4
    0xC8,   // STO   RAM4
    0x48,   // STO   OUT4
    0x51,   // LD    IN5
    0xD8,   // STO   RAM5
    0x58,   // STO   OUT5
    // ; RAM0, RAM6 and RAM7, as well as OUT0, OUT6 and OUT7 are initially 0
    0x06,   // ORC   RR
    0x89,   // STOC  RAM0
    0x09,   // STOC  OUT0
    0xE9,   // STOC  RAM6
    0x69,   // STOC  OUT6
    0xF9,   // STOC  RAM7
    0x79,   // STOC  OUT7

    // ; If IN6 was HIGH the input was disabled by the previous block.
    // ; Therefore, it is necessary to enable input and output and test IN6 again
    // ; to determine if we are in the initialization or in the calculation mode.
    0x06,   // ORC   RR
    0x0B,   // OEN   RR
    0x0A,   // IEN   RR
    // ; If IN6 is LOW we are in the initialization mode, jump to the beginning
    // ; and skip the rest of the program. This makes the initialization mode more
    // ; responsive.
    0x62,   // LDC   IN6
    0x0E,   // SKZ   x
    0x0C,   // JMP   x

    // ; ------------------------------------------------------
    // ; If this point is reached, we are in the calcualtion mode,
    // ; inputs and outputs are enabled and the input IN6 is HIGH
    // ; and we should calculate the next state of the cellular automaton.
    // ; ------------------------------------------------------

    // ; ------------------------------------------------------
    // ; The cellular atomaton state should be updated 3 to 4 times a second to get
    // ; the best visual effect. This is controlled by the timer.
    // ; If timer is on, then do not proceed with the calculation
    // ; and jump to the beginning of the program.
    // ; ------------------------------------------------------
    0x71,   // LD    IN7
    0x0E,   // SKZ   x
    0x0C,   // JMP   x

    // ; ------------------------------------------------------
    // ; The rest of the program calculates the next state of the cellular automaton.
    // ; ------------------------------------------------------
    // ; 3 bits of the internal state are required to calculate the next state. As we have only 8 bits
    // ; available, and the internal state requires 7 bits, the last two bits of the internal
    // ; state that would normally be held in RAM5 and RAM6 are made implicite using the following
    // ; strategy:
    // ;  * the program is divided into 4 similar sections:
    // ;  * depending on the state of RAM5 or RAM6 the section has inputs and outptu eeither
    // ;    enabled or disabled. If it has inputs and outputs enabled, its code takes into the
    // ;    account the state of RAM5 and RAM6 implictely and is free to use those locations as
    // ;    temporary storage while calculating the new state. At the end of the calculation,
    // ;    RAM0 to RAM6 hold the new state, and the calculation is marked as done by setting
    // ;    the RAM7 to 1. The following sections will have inputs and outptu disabled.
    // ;  * section 1 calculates the next state if RAM bits 5 and 6 are both 0
    // ;  * section 2 calculates the next state if RAM bits 5 is 0 and bit 6 is 1
    // ;  * section 3 calculates the next state if RAM bits 5 is 1 and bit 6 is 0
    // ;  * section 4 calculates the next state if RAM bits 5 and 6 are both 1
    // ; The comments describint the algorithm that calculates the next state use
    // ; the following notation:
    // ;  * a denotes a state of bit 0, initally and finally in RAM0
    // ;  * b denotes a state of bit 1, initally and finally in RAM1
    // ;  * c denotes a state of bit 2, initally and finally in RAM2
    // ;  * d denotes a state of bit 3, initally and finally in RAM3
    // ;  * e denotes a state of bit 4, initally and finally in RAM4
    // ;  * f denotes state of bit 5, initally and finally in RAM5
    // ;  * g denotes a state of bit 7, initally and finally in RAM6
    // ;  * x denotes, don't care
    // ;  * 1 or 0 denotes the constant value in a given RAM bit
    // ;  * the new (changed) state of a bit is denoted using a', b', etc.
    // ;  * for example:
    // ;     * the sequnce a' b c d e b 0 x is interpreted as
    // ;       a' in RAM0, b in RAM1, c in RAM2, d in RAM3, e in RAM4, b in RAM5, 0 in RAM6,
    // ;       x in RAM7 is don't care
    // ;     * the transformation a'b'c d e c b a -> a'b'c'd e c b a, c'=b^d is interpreted as
    // ;       changing the state c in RAM2 to c', by exoring the current state of b in RAM6
    // ;       with the new state of d in RAM3
    // ; ------------------------------------------------------

    // ; ------------------------------------------------------
    // ; If this point has been reached we must initialize a next state calculation.
    // ;  * set RAM bit 7 to 0 to indicate that the calcualtion has not been performed yet.
    // ; ------------------------------------------------------
    0x06,   // ORC   RR
    0xF9,   // STOC  RAM7

    // ; ------------------------------------------------------
    // ; section 1: f=0, g=0
    // ; ------------------------------------------------------
    // ; - input and output are enabled
    // ; - keep inputs and outputs enabled only if RAM bit 5, 6 and 7 are 0
    // ; ------------------------------------------------------
    0xF2,   // LDC   RAM7
    0xD4,   // ANDC  RAM5
    0xE4,   // ANDC  RAM6
    0x0A,   // IEN   RR
    0x0B,   // OEN   RR

    // ; ; section 1, algorithm:
    // ; ; a b c d e 0 0 x -> a b c d e a a a
    0x81,   // LD    RAM0
    0xD8,   // STO   RAM5
    0xE8,   // STO   RAM6
    0xF8,   // STO   RAM7
    // ; ; a b c d e a a a -> a'b c d e a a a, a'=b^g=b^0=b
    0x91,   // LD    RAM1
    0x88,   // STO   RAM0
    // ; ; a'b c d e a a a -> a'b c d e b b a
    0x91,   // LD    RAM1
    0xD8,   // STO   RAM5
    0xE8,   // STO   RAM6
    // ; ; a'b c d e b b a -> a'b'c d e b b a, b'=a^c
    0xF1,   // LD    RAM7
    0xA7,   // XNOR  RAM2
    0x99,   // STOC  RAM1
    // ; ; a'b'c d e b b a -> a'b'c d e c b a
    0xA1,   // LD    RAM2
    0xD8,   // STO   RAM5
    // ; ; a'b'c d e c b a -> a'b'c'd e c b a, c'=b^d
    0xB1,   // LD    RAM3
    0xE7,   // XNOR  RAM6
    0xA9,   // STOC  RAM2
    // ; ; a'b'c'd e c b a -> a'b'c'd e c d a
    0xB1,   // LD    RAM3
    0xE8,   // STO   RAM6
    // ; ; a'b'c'd e c d a -> a'b'c'd'e c d a, d'=c^e
    0xC1,   // LD    RAM4
    0xD7,   // XNOR  RAM5
    0xB9,   // STOC  RAM3
    // ; ; a'b'c'd'e c d a -> a'b'c'd'e e d a
    0xC1,   // LD    RAM4
    0xD8,   // STO   RAM5
    // ; ; a'b'c'd'e e d a -> a'b'c'd'e'e d a, e'=d^f=d^0=d
    0xE1,   // LD    RAM6
    0xC8,   // STO   RAM4
    // ; ; a'b'c'd'e'e d a -> a'b'c'd'e'f'd a, f'=e^g=e^0=e -> NOOP
    // ; ; a'b'c'd'e'f'd a -> a'b'c'd'e'f'g'a, g'=f^a=0^a=a
    0xF1,   // LD    RAM7
    0xE8,   // STO   RAM6

    // ; mark section 1 as done
    // ; Note: RAM7 was 0 if inputs and outputs were enabled for the section.
    // ;       This will be set to 1 only if the input and output were enabled in this section.
    0xF1,   // LD    RAM7
    0xF6,   // ORC   RAM7
    0xF8,   // STO   RAM7

    // ; enable inputs and outputs so we can test the next section precondition
    0x06,   // ORC   RR
    0x0A,   // IEN   RR
    0x0B,   // OEN   RR

    // ; ------------------------------------------------------
    // ; section 2: f=1, g=0
    // ; ------------------------------------------------------
    // ; - input and output are enabled
    // ; - keep inputs and outputs enabled only if RAM bit 6, and 7 are 0 and RAM bit 5 is 1
    // ; ------------------------------------------------------
    0xF2,   // LDC   RAM7
    0xD3,   // AND   RAM5
    0xE4,   // ANDC  RAM6
    0x0A,   // IEN   RR
    0x0B,   // OEN   RR

    // ; section 2, algorithm:
    // ; a b c d e 1 0 x -> a b c d e a a a
    0x81,   // LD    RAM0
    0xD8,   // STO   RAM5
    0xE8,   // STO   RAM6
    0xF8,   // STO   RAM7
    // ; a b c d e a a a -> a'b c d e a a a, a'=b^g=b^0=b
    0x91,   // LD    RAM1
    0x88,   // STO   RAM0
    // ; a'b c d e a a a -> a'b c d e b b a
    0x91,   // LD    RAM1
    0xD8,   // STO   RAM5
    0xE8,   // STO   RAM6
    // ; a'b c d e b b a -> a'b'c d e b b a, b'=a^c
    0xF1,   // LD    RAM7
    0xA7,   // XNOR  RAM2
    0x99,   // STOC  RAM1
    // ; a'b'c d e b b a -> a'b'c d e c b a
    0xA1,   // LD    RAM2
    0xD8,   // STO   RAM5
    // ; a'b'c d e c b a -> a'b'c'd e c b a, c'=b^d
    0xB1,   // LD    RAM3
    0xE7,   // XNOR  RAM6
    0xA9,   // STOC  RAM2
    // ; a'b'c'd e c b a -> a'b'c'd e c d a
    0xB1,   // LD    RAM3
    0xE8,   // STO   RAM6
    // ; a'b'c'd e c d a -> a'b'c'd'e c d a, d'=c^e
    0xC1,   // LD    RAM4
    0xD7,   // XNOR  RAM5
    0xB9,   // STOC  RAM3
    // ; a'b'c'd'e c d a -> a'b'c'd'e e d a
    0xC1,   // LD    RAM4
    0xD8,   // STO   RAM5
    // ; a'b'c'd'e e d a -> a'b'c'd'e'e d a, e'=d^f=d^1=!d
    0xE2,   // LDC   RAM6
    0xC8,   // STO   RAM4
    // ; a'b'c'd'e'e d a -> a'b'c'd'e'f'd a, f'=e^g=e^0=e -> NOOP
    // ; a'b'c'd'e'f'd a -> a'b'c'd'e'f'g'a, g'=f^a=1^a=!a
    0xF2,   // LDC   RAM7
    0xE8,   // STO   RAM6

    // ; mark section 2 as done
    // ; Note: RAM7 was 0 if inputs and outputs were enabled for the section.
    // ;       This will be set to 1 only if the input and output were enabled in this section.
    0xF1,   // LD    RAM7
    0xF6,   // ORC   RAM7
    0xF8,   // STO   RAM7

    // ; enable inputs and outputs so we can test the next section precondition
    0x06,   // ORC   RR
    0x0A,   // IEN   RR
    0x0B,   // OEN   RR

    // ; ------------------------------------------------------
    // ; section 3: f=0, g=1
    // ; ------------------------------------------------------
    // ; - input and output are enabled
    // ; - keep inputs and outputs enabled only if RAM bit 6, and 7 are 0 and RAM bit 6 is 1
    // ; ------------------------------------------------------
    0xF2,   // LDC   RAM7
    0xD4,   // ANDC  RAM5
    0xE3,   // AND   RAM6
    0x0A,   // IEN   RR
    0x0B,   // OEN   RR

    // ; section 3, algorithm:
    // ; a b c d e 0 1 x -> a b c d e a a a
    0x81,   // LD    RAM0
    0xD8,   // STO   RAM5
    0xE8,   // STO   RAM6
    0xF8,   // STO   RAM7
    // ; a b c d e a a a -> a'b c d e a a a, a'=b^g=b^1=!b
    0x92,   // LDC   RAM1
    0x88,   // STO   RAM0
    // ; a'b c d e a a a -> a'b c d e b b a
    0x91,   // LD    RAM1
    0xD8,   // STO   RAM5
    0xE8,   // STO   RAM6
    // ; a'b c d e b b a -> a'b'c d e b b a, b'=a^c
    0xF1,   // LD    RAM7
    0xA7,   // XNOR  RAM2
    0x99,   // STOC  RAM1
    // ; a'b'c d e b b a -> a'b'c d e c b a
    0xA1,   // LD    RAM2
    0xD8,   // STO   RAM5
    // ; a'b'c d e c b a -> a'b'c'd e c b a, c'=b^d
    0xB1,   // LD    RAM3
    0xE7,   // XNOR  RAM6
    0xA9,   // STOC  RAM2
    // ; a'b'c'd e c b a -> a'b'c'd e c d a
    0xB1,   // LD    RAM3
    0xE8,   // STO   RAM6
    // ; a'b'c'd e c d a -> a'b'c'd'e c d a, d'=c^e
    0xC1,   // LD    RAM4
    0xD7,   // XNOR  RAM5
    0xB9,   // STOC  RAM3
    // ; a'b'c'd'e c d a -> a'b'c'd'e e d a
    0xC1,   // LD    RAM4
    0xD8,   // STO   RAM5
    // ; a'b'c'd'e e d a -> a'b'c'd'e'e d a, e'=d^f=d^0=d
    0xE1,   // LD    RAM6
    0xC8,   // STO   RAM4
    // ; a'b'c'd'e'e d a -> a'b'c'd'e'f'd a, f'=e^g=e^1=!e
    0xD2,   // LDC   RAM5
    0xD8,   // STO   RAM5
    // ; a'b'c'd'e'f'd a -> a'b'c'd'e'f'g'a, g'=f^a=0^a=a
    0xF1,   // LD    RAM7
    0xE8,   // STO   RAM6

    // ; mark section 3 as done
    // ; Note: RAM7 was 0 if inputs and outputs were enabled for the section.
    // ;       This will be set to 1 only if the input and output were enabled in this section.
    0xF1,   // LD    RAM7
    0xF6,   // ORC   RAM7
    0xF8,   // STO   RAM7

    // ; enable inputs and outputs so we can test the next section precondition
    0x06,   // ORC   RR
    0x0A,   // IEN   RR
    0x0B,   // OEN   RR

    // ; ------------------------------------------------------
    // ; section 4: f=1, g=1
    // ; ------------------------------------------------------
    // ; - input and output are enabled
    // ; - keep inputs and outputs enabled only if RAM bit 7 is 0 and RAM 5 and 6 are 1
    // ; ------------------------------------------------------
    0xF2,   // LDC   RAM7
    0xD3,   // AND   RAM5
    0xE3,   // AND   RAM6
    0x0A,   // IEN   RR
    0x0B,   // OEN   RR

    // ; section 4, algorithm:
    // ; a b c d e 1 1 x -> a b c d e a a a
    0x81,   // LD    RAM0
    0xD8,   // STO   RAM5
    0xE8,   // STO   RAM6
    0xF8,   // STO   RAM7
    // ; a b c d e a a a -> a'b c d e a a a, a'=b^g=b^1=!b
    0x92,   // LDC   RAM1
    0x88,   // STO   RAM0
    // ; a'b c d e a a a -> a'b c d e b b a
    0x91,   // LD    RAM1
    0xD8,   // STO   RAM5
    0xE8,   // STO   RAM6
    // ; a'b c d e b b a -> a'b'c d e b b a, b'=a^c
    0xF1,   // LD    RAM7
    0xA7,   // XNOR  RAM2
    0x99,   // STOC  RAM1
    // ; a'b'c d e b b a -> a'b'c d e c b a
    0xA1,   // LD    RAM2
    0xD8,   // STO   RAM5
    // ; a'b'c d e c b a -> a'b'c'd e c b a, c'=b^d
    0xB1,   // LD    RAM3
    0xE7,   // XNOR  RAM6
    0xA9,   // STOC  RAM2
    // ; a'b'c'd e c b a -> a'b'c'd e c d a
    0xB1,   // LD    RAM3
    0xE8,   // STO   RAM6
    // ; a'b'c'd e c d a -> a'b'c'd'e c d a, d'=c^e
    0xC1,   // LD    RAM4
    0xD7,   // XNOR  RAM5
    0xB9,   // STOC  RAM3
    // ; a'b'c'd'e c d a -> a'b'c'd'e e d a
    0xC1,   // LD    RAM4
    0xD8,   // STO   RAM5
    // ; a'b'c'd'e e d a -> a'b'c'd'e'e d a, e'=d^f=d^1=!d
    0xE2,   // LDC   RAM6
    0xC8,   // STO   RAM4
    // ; a'b'c'd'e'e d a -> a'b'c'd'e'f'd a, f'=e^g=e^1=!e
    0xD2,   // LDC   RAM5
    0xD8,   // STO   RAM5
    // ; a'b'c'd'e'f'd a -> a'b'c'd'e'f'g'a, g'=f^a=1^a=!a
    0xF2,   // LDC   RAM7
    0xE8,   // STO   RAM6

    // ; section 4 is the last one so no need to mark it as done

    // ; ------------------------------------------------------
    // ; We are done, copy the internal state of the automaton to the output registers.
    // ; At this point we don't know if inputs and outputs are enabled or not so we must
    // ; re-enable them.
    // ; ------------------------------------------------------
    0x06,   // ORC   RR
    0x0A,   // IEN   RR
    0x0B,   // OEN   RR

    // ; ------------------------------------------------------
    // ; copy the new state of the automaton from registers RAM0 to RAM6 into
    // ; output registers OUT0 to OUT6
    // ; ------------------------------------------------------
    0x81,   // LD    RAM0
    0x08,   // STO   OUT0
    0x91,   // LD    RAM1
    0x18,   // STO   OUT1
    0xA1,   // LD    RAM2
    0x28,   // STO   OUT2
    0xB1,   // LD    RAM3
    0x38,   // STO   OUT3
    0xC1,   // LD    RAM4
    0x48,   // STO   OUT4
    0xD1,   // LD    RAM5
    0x58,   // STO   OUT5
    0xE1,   // LD    RAM6
    0x68,   // STO   OUT6

    // ; ------------------------------------------------------
    // ; Start the timer to delay the next state calculation and let the user observe the
    // ; current of the cellular automaton
    // ; ------------------------------------------------------
    0x06,   // ORC   RR
    0x0B,   // OEN   RR
    0x78,   // STO   OUT7
    0x79,   // STOC  OUT7
    0x0C,   // JMP
];
