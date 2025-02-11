; ------------------------------------------------------
; One-dimensional Conway's Game of Life:
;  * A cell becomes alive if it has exactly one live neighbor.
;  * A cell dies if it has zero or two live neighbors.
; ------------------------------------------------------
; Operating instructions:
;  * 5 inputs define 5 bits of the initial state,
;  * 7 outputs reflects 7 bits of automaton output,
;  * Internal state is held in RAM0..RAM6, output is displayed on OUT0..OUT6
;  * As long as the input IN6 is low the inputs IN1..IN5 are copied to RAM1 to RAM5, RAM0
;    and RAM6 are assumed initially 0. Internal state is reflected on outputs OUT0..OUT6
;  * As long as the input IN6 is high the next state of the game of life is being continuously
;    calculated, and outputs are updated.
; ------------------------------------------------------

; ------------------------------------------
; Memory and IO mapping for the MC14500 CPU
; ------------------------------------------

; ------------------------------------------
; Inputs
; ------------------------------------------
RR      EQU     0x00  ; Pin RR is wired to input 0
IN1     EQU     0x01
IN2     EQU     0x02
IN3     EQU     0x03
IN4     EQU     0x04
IN5     EQU     0x05
IN6     EQU     0x06
IN7     EQU     0x07

; ------------------------------------------
; Outputs
; ------------------------------------------
OUT0    EQU     0x00
OUT1    EQU     0x01
OUT2    EQU     0x02
OUT3    EQU     0x03
OUT4    EQU     0x04
OUT5    EQU     0x05
OUT6    EQU     0x06
OUT7    EQU     0x07

; ------------------------------------------
; RAM
; ------------------------------------------
RAM0    EQU     0x08
RAM1    EQU     0x09
RAM2    EQU     0x0A
RAM3    EQU     0x0B
RAM4    EQU     0x0C
RAM5    EQU     0x0D
RAM6    EQU     0x0E
RAM7    EQU     0x0F

; ------------------------------------------------------
; Enable inputs and outputs
; ------------------------------------------------------
ORC     RR          ; force 1 into RR reqardless whether inputs and outputs were enabled
IEN     RR          ; enable inputs
OEN     RR          ; enable outputs

; ------------------------------------------------------
; If the input IN6 is LOW then the program is in the initialization mode i.e.
; a user can define the initial state by changing inputs IN1 to IN5.
; If the input IN6 is HIGH then the program is in the calculation mode and
; the next state of the cellular automaton is calculated.
; In the calculation mode inputs and outputs should be disabled in the following
; code block.
; ------------------------------------------------------
LDC     IN6
OEN     RR
IEN     RR

; ------------------------------------------------------
; To get the immediate visual feedback, the state of IN1 to IN5 is copied
; to ram RAM1 to RAM5, and to outputs OUT1 to OUT5. RAM0, RAM6, OUT0 and OUT6 are set to 0.
; ------------------------------------------------------
LD      IN1
STO     RAM1
STO     OUT1
LD      IN2
STO     RAM2
STO     OUT2
LD      IN3
STO     RAM3
STO     OUT3
LD      IN4
STO     RAM4
STO     OUT4
LD      IN5
STO     RAM5
STO     OUT5
; RAM0, RAM6 and RAM7, as well as OUT0, OUT6 and OUT7 are initially 0
ORC     RR
STOC    RAM0
STOC    OUT0
STOC    RAM6
STOC    OUT6
STOC    RAM7
STOC    OUT7

; If IN6 was HIGH the input was disabled by the previous block.
; Therefore, it is necessary to enable input and output and test IN6 again
; to determine if we are in the initialization or in the calculation mode.
ORC     RR
OEN     RR
IEN     RR
; If IN6 is LOW we are in the initialization mode, jump to the beginning
; and skip the rest of the program. This makes the initialization mode more
; responsive.
LDC     IN6
SKZ
JMP

; ------------------------------------------------------
; If this point is reached, we are in the calculation mode,
; inputs and outputs are enabled and the input IN6 is HIGH
; and we should calculate the next state of the cellular automaton.
; ------------------------------------------------------

; ------------------------------------------------------
; The cellular automaton state should be updated 3 to 4 times a second to get
; the best visual effect. This is controlled by the timer.
; If timer is on, then do not proceed with the calculation
; and jump to the beginning of the program.
; ------------------------------------------------------
LD      IN7
SKZ
JMP

; ------------------------------------------------------
; The rest of the program calculates the next state of the cellular automaton.
; ------------------------------------------------------
; 3 bits of the internal state are required to calculate the next state. As we have only 8 bits
; available, and the internal state requires 7 bits, the last two bits of the internal
; state that would normally be held in RAM5 and RAM6 are made implicit using the following
; strategy:
;  * the program is divided into 4 similar sections:
;  * depending on the state of RAM5 or RAM6 the section has inputs and output either
;    enabled or disabled. If it has inputs and outputs enabled, its code takes into the
;    account the state of RAM5 and RAM6 implicitly and is free to use those locations as
;    temporary storage while calculating the new state. At the end of the calculation,
;    RAM0 to RAM6 hold the new state, and the calculation is marked as done by setting
;    the RAM7 to 1. The following sections will have inputs and outputs disabled.
;  * section 1 calculates the next state if RAM bits 5 and 6 are both 0
;  * section 2 calculates the next state if RAM bits 5 is 0 and bit 6 is 1
;  * section 3 calculates the next state if RAM bits 5 is 1 and bit 6 is 0
;  * section 4 calculates the next state if RAM bits 5 and 6 are both 1
; The comments describing the algorithm that calculates the next state use
; the following notation:
;  * a denotes a state of bit 0, initially and finally in RAM0
;  * b denotes a state of bit 1, initially and finally in RAM1
;  * c denotes a state of bit 2, initially and finally in RAM2
;  * d denotes a state of bit 3, initially and finally in RAM3
;  * e denotes a state of bit 4, initially and finally in RAM4
;  * f denotes state of bit 5, initially and finally in RAM5
;  * g denotes a state of bit 7, initially and finally in RAM6
;  * x denotes, don't care
;  * 1 or 0 denotes the constant value in a given RAM bit
;  * the new (changed) state of a bit is denoted using a', b', etc.
;  * for example:
;     * the sequence a' b c d e b 0 x is interpreted as
;       a' in RAM0, b in RAM1, c in RAM2, d in RAM3, e in RAM4, b in RAM5, 0 in RAM6,
;       x in RAM7 is don't care
;     * the transformation a'b'c d e c b a -> a'b'c'd e c b a, c'=b^d is interpreted as
;       changing the state c in RAM2 to c', by XORing the current state of b in RAM6
;       with the new state of d in RAM3
; ------------------------------------------------------

; ------------------------------------------------------
; If this point has been reached we must initialize a next state calculation.
;  * set RAM bit 7 to 0 to indicate that the calculation has not been performed yet.
; ------------------------------------------------------
ORC     RR
STOC    RAM7

; ------------------------------------------------------
; section 1: f=0, g=0
; ------------------------------------------------------
;  * input and output are enabled
;  * keep inputs and outputs enabled only if RAM bit 5, 6 and 7 are 0
; ------------------------------------------------------
LDC     RAM7
ANDC    RAM5
ANDC    RAM6
IEN     RR
OEN     RR

; section 1, algorithm:
; a b c d e 0 0 x -> a b c d e a a a
LD      RAM0
STO     RAM5
STO     RAM6
STO     RAM7
; a b c d e a a a -> a'b c d e a a a, a'=b^g=b^0=b
LD      RAM1
STO     RAM0
; a'b c d e a a a -> a'b c d e b b a
LD      RAM1
STO     RAM5
STO     RAM6
; a'b c d e b b a -> a'b'c d e b b a, b'=a^c
LD      RAM7
XNOR    RAM2
STOC    RAM1
; a'b'c d e b b a -> a'b'c d e c b a
LD      RAM2
STO     RAM5
; a'b'c d e c b a -> a'b'c'd e c b a, c'=b^d
LD      RAM3
XNOR    RAM6
STOC    RAM2
; a'b'c'd e c b a -> a'b'c'd e c d a
LD      RAM3
STO     RAM6
; a'b'c'd e c d a -> a'b'c'd'e c d a, d'=c^e
LD      RAM4
XNOR    RAM5
STOC    RAM3
; a'b'c'd'e c d a -> a'b'c'd'e e d a
LD      RAM4
STO     RAM5
; a'b'c'd'e e d a -> a'b'c'd'e'e d a, e'=d^f=d^0=d
LD      RAM6
STO     RAM4
; a'b'c'd'e'e d a -> a'b'c'd'e'f'd a, f'=e^g=e^0=e -> NOOP
; a'b'c'd'e'f'd a -> a'b'c'd'e'f'g'a, g'=f^a=0^a=a
LD      RAM7
STO     RAM6

; mark section 1 as done
; Note: RAM7 was 0 if inputs and outputs were enabled for the section.
;       This will be set to 1 only if the input and output were enabled in this section.
LD      RAM7
ORC     RAM7
STO     RAM7

; enable inputs and outputs so we can test the next section precondition
ORC     RR
IEN     RR
OEN     RR

; ------------------------------------------------------
; section 2: f=1, g=0
; ------------------------------------------------------
;  * input and output are enabled
;  * keep inputs and outputs enabled only if RAM bit 6, and 7 are 0 and RAM bit 5 is 1
; ------------------------------------------------------
LDC     RAM7
AND     RAM5
ANDC    RAM6
IEN     RR
OEN     RR

; section 2, algorithm:
; a b c d e 1 0 x -> a b c d e a a a
LD      RAM0
STO     RAM5
STO     RAM6
STO     RAM7
; a b c d e a a a -> a'b c d e a a a, a'=b^g=b^0=b
LD      RAM1
STO     RAM0
; a'b c d e a a a -> a'b c d e b b a
LD      RAM1
STO     RAM5
STO     RAM6
; a'b c d e b b a -> a'b'c d e b b a, b'=a^c
LD      RAM7
XNOR    RAM2
STOC    RAM1
; a'b'c d e b b a -> a'b'c d e c b a
LD      RAM2
STO     RAM5
; a'b'c d e c b a -> a'b'c'd e c b a, c'=b^d
LD      RAM3
XNOR    RAM6
STOC    RAM2
; a'b'c'd e c b a -> a'b'c'd e c d a
LD      RAM3
STO     RAM6
; a'b'c'd e c d a -> a'b'c'd'e c d a, d'=c^e
LD      RAM4
XNOR    RAM5
STOC    RAM3
; a'b'c'd'e c d a -> a'b'c'd'e e d a
LD      RAM4
STO     RAM5
; a'b'c'd'e e d a -> a'b'c'd'e'e d a, e'=d^f=d^1=!d
LDC     RAM6
STO     RAM4
; a'b'c'd'e'e d a -> a'b'c'd'e'f'd a, f'=e^g=e^0=e -> NOOP
; a'b'c'd'e'f'd a -> a'b'c'd'e'f'g'a, g'=f^a=1^a=!a
LDC     RAM7
STO     RAM6

; mark section 2 as done
; Note: RAM7 was 0 if inputs and outputs were enabled for the section.
;       This will be set to 1 only if the input and output were enabled in this section.
LD      RAM7
ORC     RAM7
STO     RAM7

; enable inputs and outputs so we can test the next section precondition
ORC     RR
IEN     RR
OEN     RR

; ------------------------------------------------------
; section 3: f=0, g=1
; ------------------------------------------------------
;  * input and output are enabled
;  * keep inputs and outputs enabled only if RAM bit 6, and 7 are 0 and RAM bit 6 is 1
; ------------------------------------------------------
LDC     RAM7
ANDC    RAM5
AND     RAM6
IEN     RR
OEN     RR

; section 3, algorithm:
; a b c d e 0 1 x -> a b c d e a a a
LD      RAM0
STO     RAM5
STO     RAM6
STO     RAM7
; a b c d e a a a -> a'b c d e a a a, a'=b^g=b^1=!b
LDC     RAM1
STO     RAM0
; a'b c d e a a a -> a'b c d e b b a
LD      RAM1
STO     RAM5
STO     RAM6
; a'b c d e b b a -> a'b'c d e b b a, b'=a^c
LD      RAM7
XNOR    RAM2
STOC    RAM1
; a'b'c d e b b a -> a'b'c d e c b a
LD      RAM2
STO     RAM5
; a'b'c d e c b a -> a'b'c'd e c b a, c'=b^d
LD      RAM3
XNOR    RAM6
STOC    RAM2
; a'b'c'd e c b a -> a'b'c'd e c d a
LD      RAM3
STO     RAM6
; a'b'c'd e c d a -> a'b'c'd'e c d a, d'=c^e
LD      RAM4
XNOR    RAM5
STOC    RAM3
; a'b'c'd'e c d a -> a'b'c'd'e e d a
LD      RAM4
STO     RAM5
; a'b'c'd'e e d a -> a'b'c'd'e'e d a, e'=d^f=d^0=d
LD      RAM6
STO     RAM4
; a'b'c'd'e'e d a -> a'b'c'd'e'f'd a, f'=e^g=e^1=!e
LDC     RAM5
STO     RAM5
; a'b'c'd'e'f'd a -> a'b'c'd'e'f'g'a, g'=f^a=0^a=a
LD      RAM7
STO     RAM6

; mark section 3 as done
; Note: RAM7 was 0 if inputs and outputs were enabled for the section.
;       This will be set to 1 only if the input and output were enabled in this section.
LD      RAM7
ORC     RAM7
STO     RAM7

; enable inputs and outputs so we can test the next section precondition
ORC     RR
IEN     RR
OEN     RR

; ------------------------------------------------------
; section 4: f=1, g=1
; ------------------------------------------------------
;  * input and output are enabled
;  * keep inputs and outputs enabled only if RAM bit 7 is 0 and RAM 5 and 6 are 1
; ------------------------------------------------------
LDC     RAM7
AND     RAM5
AND     RAM6
IEN     RR
OEN     RR

; section 4, algorithm:
; a b c d e 1 1 x -> a b c d e a a a
LD      RAM0
STO     RAM5
STO     RAM6
STO     RAM7
; a b c d e a a a -> a'b c d e a a a, a'=b^g=b^1=!b
LDC     RAM1
STO     RAM0
; a'b c d e a a a -> a'b c d e b b a
LD      RAM1
STO     RAM5
STO     RAM6
; a'b c d e b b a -> a'b'c d e b b a, b'=a^c
LD      RAM7
XNOR    RAM2
STOC    RAM1
; a'b'c d e b b a -> a'b'c d e c b a
LD      RAM2
STO     RAM5
; a'b'c d e c b a -> a'b'c'd e c b a, c'=b^d
LD      RAM3
XNOR    RAM6
STOC    RAM2
; a'b'c'd e c b a -> a'b'c'd e c d a
LD      RAM3
STO     RAM6
; a'b'c'd e c d a -> a'b'c'd'e c d a, d'=c^e
LD      RAM4
XNOR    RAM5
STOC    RAM3
; a'b'c'd'e c d a -> a'b'c'd'e e d a
LD      RAM4
STO     RAM5
; a'b'c'd'e e d a -> a'b'c'd'e'e d a, e'=d^f=d^1=!d
LDC     RAM6
STO     RAM4
; a'b'c'd'e'e d a -> a'b'c'd'e'f'd a, f'=e^g=e^1=!e
LDC     RAM5
STO     RAM5
; a'b'c'd'e'f'd a -> a'b'c'd'e'f'g'a, g'=f^a=1^a=!a
LDC     RAM7
STO     RAM6

; section 4 is the last one so no need to mark it as done

; ------------------------------------------------------
; We are done, copy the internal state of the automaton to the output registers.
; At this point we don't know if inputs and outputs are enabled or not so we must
; reenable them.
; ------------------------------------------------------
ORC     RR
IEN     RR
OEN     RR

; ------------------------------------------------------
; copy the new state of the automaton from registers RAM0 to RAM6 into
; output registers OUT0 to OUT6
; ------------------------------------------------------
LD      RAM0
STO     OUT0
LD      RAM1
STO     OUT1
LD      RAM2
STO     OUT2
LD      RAM3
STO     OUT3
LD      RAM4
STO     OUT4
LD      RAM5
STO     OUT5
LD      RAM6
STO     OUT6

; ------------------------------------------------------
; Start the timer to delay the next state calculation and let a user observe the
; current of the cellular automaton
; ------------------------------------------------------
ORC     RR
OEN     RR
STO     OUT7
STOC    OUT7
JMP
