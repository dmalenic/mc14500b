; ------------------------------------------------------
; Roll a Die:
;   When the STOP signal is zero, the die rolls and the
;   outputs OUT0 to OUT5 are sequentially turned on.
;   When the STOP becomes one, the die stops with outputs
;   OUT0 to OUT5 showing the number.
;   Input IN1 is the STOP signal.
; ------------------------------------------------------
; Note:
;   The main loop is written so that the number of
;   instructions implementing each die state is identical,
;   the die is not loaded ;-).
; ------------------------------------------------------
; This program demonstrates how to use JMP instruction
; and an external lookup-table (implemented in Arduino
; monitor program) to jump to arbitrary program locations
; i.e. not restricted to 4-bit address space.
; See `jmp_jsr_lut.h` for the additional information how
; to define and use lookup table.
; ------------------------------------------------------

.feature org_per_seg

.include "system.inc"

STOP  = IN1

ROLLED_1 = 1
ROLLED_2 = 2
ROLLED_3 = 3
ROLLED_4 = 4
ROLLED_5 = 5
ROLLED_6 = 6

ROLL_AGAIN = $F

.segment "CODE"
.org    0               ; required by the next .res directive later in a code

; ------------------------------------------------------
; initialization
; enable inputs and outputs
; ------------------------------------------------------

    orc     RR          ; force 1 into RR regardless whether inputs and outputs were enabled
    ien     RR          ; enable inputs
    oen     RR          ; enable outputs

; ------------------------------------------------------
; The die is rolling, side 1, is a special case
; because of rolling 6 to 1
; ------------------------------------------------------

    ld      STOP        ; load the state of STOP switch
    skz                 ; if it was not pressed skip next instruction to continue rolling a die
    jmp     ROLLED_1    ; STOP is pressed 
    stoc    OUT0        ; set output 0 to 1 to provide a rolling effect 
    sto     OUT5        ; set output 5 to 0 (the previous die side) - rolling effect
    ; 4 nop0s are needed to compensate for the code that will be implicitly added to the
    ; last die side to consider (we don't want 6 to have a higher probability)
    nop0
    nop0
    nop0
    nop0
    
; ------------------------------------------------------
; The die is rolling, sides 2, 3, 4 and 5 can be
; defined using .repeat macro.
; ------------------------------------------------------

.repeat 4,I
    ld      STOP        ; load the state of STOP switch
    skz                 ; if it was not pressed skip next instruction to continue rolling a die
    jmp     ROLLED_2+I  ; STOP is pressed 
    stoc    OUT1+I      ; set output 1+I to 1 to provide a rolling effect
    sto     OUT0+I      ; set output I to 0 (the previous die side) - rolling effect
    ; 4 nop0s are needed to compensate for the code that will be implicitly added to the
    ; last die side to consider (we don't want 6 to have a higher probability)
    nop0
    nop0
    nop0
    nop0
.endrepeat    

; ------------------------------------------------------
; The die is rolling, side 6 is another special case.
; Instead of 4 nop0 instruction it executes jump to the
; beginning of the program and uses program initialization
; instructions to compensate for the time.
; ------------------------------------------------------

    ld      STOP        ; load the state of STOP switch
    skz                 ; if it was not pressed skip next instruction to continue rolling a die
    jmp     ROLLED_6    ; STOP is pressed 
    stoc    OUT5        ; set output OUT5 to 1 to provide a rolling effect
    sto     OUT4        ; set output OUT4 to 0 (the previous die side) - rolling effect
    ; jmp is instead of the first nop0, orc RR, ien RR and oen RR will compensate for other nop0s
    jmp


; ------------------------------------------------------
; Display the result if side 1 is rolled.
; ------------------------------------------------------
.res    $80-*           ; see https://www.cc65.org/faq.php  : The .ORG directive
.org    $80             ; required for the next .res

    sto     OUT0
.repeat 7,I
    stoc    OUT1+I
.endrepeat
    jmp     ROLL_AGAIN  ; jump to code that waits for STOP to be released


; ------------------------------------------------------
; Display the result if side 2 is rolled.
; ------------------------------------------------------
.res    $90-*
.org    $90

    sto     OUT0
    sto     OUT1
.repeat 6,I
    stoc    OUT2+I
.endrepeat
    jmp     ROLL_AGAIN  ; jump to code that waits for STOP to be released


; ------------------------------------------------------
; Display the result if side 3 is rolled.
; ------------------------------------------------------
.res    $A0-*
.org    $A0

.repeat 3,I
    sto     OUT0+I
.endrepeat
.repeat 5,I
    stoc    OUT3+I
.endrepeat
    jmp     ROLL_AGAIN  ; jump to code that waits for STOP to be released


; ------------------------------------------------------
; Display the result if side 4 is rolled.
; ------------------------------------------------------
.res    $B0-*
.org    $B0

.repeat 4,I
    sto     OUT0+I
.endrepeat
.repeat 4,I
    stoc    OUT4+I
.endrepeat
    jmp     ROLL_AGAIN  ; jump to code that waits for STOP to be released


; ------------------------------------------------------
; Display the result if side 5 is rolled.
; ------------------------------------------------------
.res    $C0-*
.org    $C0

.repeat 5,I
    sto     OUT0+I
.endrepeat
.repeat 3,I
    stoc    OUT5+I
.endrepeat
    jmp     ROLL_AGAIN  ; jump to code that waits for STOP to be released


; ------------------------------------------------------
; Display the result if side 6 is rolled.
; ------------------------------------------------------
.res    $D0-*
.org    $D0

.repeat 6,I
    sto     OUT0+I
.endrepeat
.repeat 2,I
    stoc    OUT6+I
.endrepeat
    jmp     ROLL_AGAIN  ; jump to code that waits for STOP to be released


; ------------------------------------------------------
; Wait for STOP to be released to start rolling again
; ------------------------------------------------------
.res $F0-*

    ld      STOP        ; read the state of STOP input
    skz                 ; if it is zero skip the next instruction
    jmp     ROLL_AGAIN  ; it is one jump to reading the state again
    jmp                 ; if is zero, roll again

