; ------------------------------------------------------
; One-dimensional Conway's Game of Life:
;  * A cell becomes alive if it has exactly one live neighbor.
;  * A cell dies if it has zero or two live neighbors.
; ------------------------------------------------------
; Operating instructions:
;  * 5 inputs define 5 bits of the initial state,
;  * 7 outputs reflects 7 bits of automaton output,
;  * Internal state is held in MEM0..MEM6, output is displayed on OUT0..OUT6
;  * As long as the input IN6 is low the inputs IN1..IN5 are copied to MEM1 to MEM5, MEM0
;    and MEM6 are assumed initially 0. Internal state is reflected on outputs OUT0..OUT6
;  * As long as the input IN6 is high the next state of the game of life is being continuously
;    calculated, and outputs are updated.
; ------------------------------------------------------


.include "system.inc"


.segment "CODE"

; ------------------------------------------------------
; Enable inputs and outputs
; ------------------------------------------------------
    orc     RR          ; force 1 into RR reqardless whether inputs and outputs were enabled
    ien     RR          ; enable inputs
    oen     RR          ; enable outputs

; ------------------------------------------------------
; If the input IN6 is LOW then the program is in the initialization mode i.e.
; a user can define the initial state by changing inputs IN1 to IN5.
; If the input IN6 is HIGH then the program is in the calculation mode and
; the next state of the cellular automaton is calculated.
; In the calculation mode inputs and outputs should be disabled in the following
; code block.
; ------------------------------------------------------
    ldc     IN6
    oen     RR
    ien     RR

; ------------------------------------------------------
; To get the immediate visual feedback, the state of IN1 to IN5 is copied
; to ram MEM1 to MEM5, and to outputs OUT1 to OUT5. MEM0, MEM6, OUT0 and OUT6 are set to 0.
; ------------------------------------------------------
    ld      IN1
    sto     MEM1
    sto     OUT1
    ld      IN2
    sto     MEM2
    sto     OUT2
    ld      IN3
    sto     MEM3
    sto     OUT3
    ld      IN4
    sto     MEM4
    sto     OUT4
    ld      IN5
    sto     MEM5
    sto     OUT5
    ; MEM0, MEM6 and MEM7, as well as OUT0, OUT6 and OUT7 are initially 0
    orc     RR
    stoc    MEM0
    stoc    OUT0
    stoc    MEM6
    stoc    OUT6
    stoc    MEM7
    stoc    OUT7

; If IN6 was HIGH the input was disabled by the previous block.
; Therefore, it is necessary to enable input and output and test IN6 again
; to determine if we are in the initialization or in the calculation mode.
    orc     RR
    oen     RR
    ien     RR
; If IN6 is LOW we are in the initialization mode, jump to the beginning
; and skip the rest of the program. This makes the initialization mode more
; responsive.
    ldc     IN6
    skz
    jmp

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
    ld      IN7
    skz
    jmp

; ------------------------------------------------------
; The rest of the program calculates the next state of the cellular automaton.
; ------------------------------------------------------
; 3 bits of the internal state are required to calculate the next state. As we have only 8 bits
; available, and the internal state requires 7 bits, the last two bits of the internal
; state that would normally be held in MEM5 and MEM6 are made implicit using the following
; strategy:
;  * the program is divided into 4 similar sections:
;  * depending on the state of MEM5 or MEM6 the section has inputs and output either
;    enabled or disabled. If it has inputs and outputs enabled, its code takes into the
;    account the state of MEM5 and MEM6 implicitly and is free to use those locations as
;    temporary storage while calculating the new state. At the end of the calculation,
;    MEM0 to MEM6 hold the new state, and the calculation is marked as done by setting
;    the MEM7 to 1. The following sections will have inputs and outputs disabled.
;  * section 1 calculates the next state if RAM bits 5 and 6 are both 0
;  * section 2 calculates the next state if RAM bits 5 is 0 and bit 6 is 1
;  * section 3 calculates the next state if RAM bits 5 is 1 and bit 6 is 0
;  * section 4 calculates the next state if RAM bits 5 and 6 are both 1
; The comments describing the algorithm that calculates the next state use
; the following notation:
;  * a denotes a state of bit 0, initially and finally in MEM0
;  * b denotes a state of bit 1, initially and finally in MEM1
;  * c denotes a state of bit 2, initially and finally in MEM2
;  * d denotes a state of bit 3, initially and finally in MEM3
;  * e denotes a state of bit 4, initially and finally in MEM4
;  * f denotes state of bit 5, initially and finally in MEM5
;  * g denotes a state of bit 7, initially and finally in MEM6
;  * x denotes, don't care
;  * 1 or 0 denotes the constant value in a given RAM bit
;  * the new (changed) state of a bit is denoted using a', b', etc.
;  * for example:
;     * the sequence a' b c d e b 0 x is interpreted as
;       a' in MEM0, b in MEM1, c in MEM2, d in MEM3, e in MEM4, b in MEM5, 0 in MEM6,
;       x in MEM7 is don't care
;     * the transformation a'b'c d e c b a -> a'b'c'd e c b a, c'=b^d is interpreted as
;       changing the state c in MEM2 to c', by XORing the current state of b in MEM6
;       with the new state of d in MEM3
; ------------------------------------------------------

; ------------------------------------------------------
; If this point has been reached we must initialize a next state calculation.
;  * set RAM bit 7 to 0 to indicate that the calculation has not been performed yet.
; ------------------------------------------------------
    orc     RR
    stoc    MEM7

; ------------------------------------------------------
; section 1: f=0, g=0
; ------------------------------------------------------
;  * input and output are enabled
;  * keep inputs and outputs enabled only if RAM bit 5, 6 and 7 are 0
; ------------------------------------------------------
    ldc     MEM7
    andc    MEM5
    andc    MEM6
    ien     RR
    oen     RR

; section 1, algorithm:
; a b c d e 0 0 x -> a b c d e a a a
    ld      MEM0
    sto     MEM5
    sto     MEM6
    sto     MEM7
; a b c d e a a a -> a'b c d e a a a, a'=b^g=b^0=b
    ld      MEM1
    sto     MEM0
; a'b c d e a a a -> a'b c d e b b a
    ld      MEM1
    sto     MEM5
    sto     MEM6
; a'b c d e b b a -> a'b'c d e b b a, b'=a^c
    ld      MEM7
    xnor    MEM2
    stoc    MEM1
; a'b'c d e b b a -> a'b'c d e c b a
    ld      MEM2
    sto     MEM5
; a'b'c d e c b a -> a'b'c'd e c b a, c'=b^d
    ld      MEM3
    xnor    MEM6
    stoc    MEM2
; a'b'c'd e c b a -> a'b'c'd e c d a
    ld      MEM3
    sto     MEM6
; a'b'c'd e c d a -> a'b'c'd'e c d a, d'=c^e
    ld      MEM4
    xnor    MEM5
    stoc    MEM3
; a'b'c'd'e c d a -> a'b'c'd'e e d a
    ld      MEM4
    sto     MEM5
; a'b'c'd'e e d a -> a'b'c'd'e'e d a, e'=d^f=d^0=d
    ld      MEM6
    sto     MEM4
; a'b'c'd'e'e d a -> a'b'c'd'e'f'd a, f'=e^g=e^0=e -> NOOP
; a'b'c'd'e'f'd a -> a'b'c'd'e'f'g'a, g'=f^a=0^a=a
    ld      MEM7
    sto     MEM6

; mark section 1 as done
; Note: MEM7 was 0 if inputs and outputs were enabled for the section.
;       This will be set to 1 only if the input and output were enabled in this section.
    ld      MEM7
    orc     MEM7
    sto     MEM7

; enable inputs and outputs so we can test the next section precondition
    orc     RR
    ien     RR
    oen     RR

; ------------------------------------------------------
; section 2: f=1, g=0
; ------------------------------------------------------
;  * input and output are enabled
;  * keep inputs and outputs enabled only if RAM bit 6, and 7 are 0 and RAM bit 5 is 1
; ------------------------------------------------------
    ldc     MEM7
    and     MEM5
    andc    MEM6
    ien     RR
    oen     RR

; section 2, algorithm:
; a b c d e 1 0 x -> a b c d e a a a
    ld      MEM0
    sto     MEM5
    sto     MEM6
    sto     MEM7
; a b c d e a a a -> a'b c d e a a a, a'=b^g=b^0=b
    ld      MEM1
    sto     MEM0
; a'b c d e a a a -> a'b c d e b b a
    ld      MEM1
    sto     MEM5
    sto     MEM6
; a'b c d e b b a -> a'b'c d e b b a, b'=a^c
    ld      MEM7
    xnor    MEM2
    stoc    MEM1
; a'b'c d e b b a -> a'b'c d e c b a
    ld      MEM2
    sto     MEM5
; a'b'c d e c b a -> a'b'c'd e c b a, c'=b^d
    ld      MEM3
    xnor    MEM6
    stoc    MEM2
; a'b'c'd e c b a -> a'b'c'd e c d a
    ld      MEM3
    sto     MEM6
; a'b'c'd e c d a -> a'b'c'd'e c d a, d'=c^e
    ld      MEM4
    xnor    MEM5
    stoc    MEM3
; a'b'c'd'e c d a -> a'b'c'd'e e d a
    ld      MEM4
    sto     MEM5
; a'b'c'd'e e d a -> a'b'c'd'e'e d a, e'=d^f=d^1=!d
    ldc     MEM6
    sto     MEM4
; a'b'c'd'e'e d a -> a'b'c'd'e'f'd a, f'=e^g=e^0=e -> NOOP
; a'b'c'd'e'f'd a -> a'b'c'd'e'f'g'a, g'=f^a=1^a=!a
    ldc     MEM7
    sto     MEM6

; mark section 2 as done
; Note: MEM7 was 0 if inputs and outputs were enabled for the section.
;       This will be set to 1 only if the input and output were enabled in this section.
    ld      MEM7
    orc     MEM7
    sto     MEM7

; enable inputs and outputs so we can test the next section precondition
    orc     RR
    ien     RR
    oen     RR

; ------------------------------------------------------
; section 3: f=0, g=1
; ------------------------------------------------------
;  * input and output are enabled
;  * keep inputs and outputs enabled only if RAM bit 6, and 7 are 0 and RAM bit 6 is 1
; ------------------------------------------------------
    ldc     MEM7
    andc    MEM5
    and     MEM6
    ien     RR
    oen     RR

; section 3, algorithm:
; a b c d e 0 1 x -> a b c d e a a a
    ld      MEM0
    sto     MEM5
    sto     MEM6
    sto     MEM7
; a b c d e a a a -> a'b c d e a a a, a'=b^g=b^1=!b
    ldc     MEM1
    sto     MEM0
; a'b c d e a a a -> a'b c d e b b a
    ld      MEM1
    sto     MEM5
    sto     MEM6
; a'b c d e b b a -> a'b'c d e b b a, b'=a^c
    ld      MEM7
    xnor    MEM2
    stoc    MEM1
; a'b'c d e b b a -> a'b'c d e c b a
    ld      MEM2
    sto     MEM5
; a'b'c d e c b a -> a'b'c'd e c b a, c'=b^d
    ld      MEM3
    xnor    MEM6
    stoc    MEM2
; a'b'c'd e c b a -> a'b'c'd e c d a
    ld      MEM3
    sto     MEM6
; a'b'c'd e c d a -> a'b'c'd'e c d a, d'=c^e
    ld      MEM4
    xnor    MEM5
    stoc    MEM3
; a'b'c'd'e c d a -> a'b'c'd'e e d a
    ld      MEM4
    sto     MEM5
; a'b'c'd'e e d a -> a'b'c'd'e'e d a, e'=d^f=d^0=d
    ld      MEM6
    sto     MEM4
; a'b'c'd'e'e d a -> a'b'c'd'e'f'd a, f'=e^g=e^1=!e
    ldc     MEM5
    sto     MEM5
; a'b'c'd'e'f'd a -> a'b'c'd'e'f'g'a, g'=f^a=0^a=a
    ld      MEM7
    sto     MEM6

; mark section 3 as done
; Note: MEM7 was 0 if inputs and outputs were enabled for the section.
;       This will be set to 1 only if the input and output were enabled in this section.
    ld      MEM7
    orc     MEM7
    sto     MEM7

; enable inputs and outputs so we can test the next section precondition
    orc     RR
    ien     RR
    oen     RR

; ------------------------------------------------------
; section 4: f=1, g=1
; ------------------------------------------------------
;  * input and output are enabled
;  * keep inputs and outputs enabled only if RAM bit 7 is 0 and RAM 5 and 6 are 1
; ------------------------------------------------------
    ldc     MEM7
    and     MEM5
    and     MEM6
    ien     RR
    oen     RR

; section 4, algorithm:
; a b c d e 1 1 x -> a b c d e a a a
    ld      MEM0
    sto     MEM5
    sto     MEM6
    sto     MEM7
; a b c d e a a a -> a'b c d e a a a, a'=b^g=b^1=!b
    ldc     MEM1
    sto     MEM0
; a'b c d e a a a -> a'b c d e b b a
    ld      MEM1
    sto     MEM5
    sto     MEM6
; a'b c d e b b a -> a'b'c d e b b a, b'=a^c
    ld      MEM7
    xnor    MEM2
    stoc    MEM1
; a'b'c d e b b a -> a'b'c d e c b a
    ld      MEM2
    sto     MEM5
; a'b'c d e c b a -> a'b'c'd e c b a, c'=b^d
    ld      MEM3
    xnor    MEM6
    stoc    MEM2
; a'b'c'd e c b a -> a'b'c'd e c d a
    ld      MEM3
    sto     MEM6
; a'b'c'd e c d a -> a'b'c'd'e c d a, d'=c^e
    ld      MEM4
    xnor    MEM5
    stoc    MEM3
; a'b'c'd'e c d a -> a'b'c'd'e e d a
    ld      MEM4
    sto     MEM5
; a'b'c'd'e e d a -> a'b'c'd'e'e d a, e'=d^f=d^1=!d
    ldc     MEM6
    sto     MEM4
; a'b'c'd'e'e d a -> a'b'c'd'e'f'd a, f'=e^g=e^1=!e
    ldc     MEM5
    sto     MEM5
; a'b'c'd'e'f'd a -> a'b'c'd'e'f'g'a, g'=f^a=1^a=!a
    ldc     MEM7
    sto     MEM6

; section 4 is the last one so no need to mark it as done

; ------------------------------------------------------
; We are done, copy the internal state of the automaton to the output registers.
; At this point we don't know if inputs and outputs are enabled or not so we must
; re-enable them.
; ------------------------------------------------------
    orc     RR
    ien     RR
    oen     RR

; ------------------------------------------------------
; copy the new state of the automaton from registers MEM0 to MEM6 into
; output registers OUT0 to OUT6
; ------------------------------------------------------
    ld      MEM0
    sto     OUT0
    ld      MEM1
    sto     OUT1
    ld      MEM2
    sto     OUT2
    ld      MEM3
    sto     OUT3
    ld      MEM4
    sto     OUT4
    ld      MEM5
    sto     OUT5
    ld      MEM6
    sto     OUT6

; ------------------------------------------------------
; Start the timer to delay the next state calculation and let a user observe the
; current of the cellular automaton
; ------------------------------------------------------
    orc     RR
    oen     RR
    sto     OUT7
    stoc    OUT7

    jmp

