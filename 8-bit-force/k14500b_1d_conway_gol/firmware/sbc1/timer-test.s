; ------------------------------------------------------
; Timer Test:
; * A running lights program paced by the timer on 2Hz.
; * It tests Arduino code that emulates a timer between 
;   the output OUT7 and the input IN7.
; * The output OUT7 transition from LOW to HIGH triggers
;   the timer.
; * The timer output is connected to the input IN7.
; * See `timer_emul.h` for an additional explanation of how
;   the timer operates and how to control the duration of
;   a timer pulse.
; ------------------------------------------------------
; The timer generates the following output pattern:
; 1......
; 11.....
; 111....
; 1111...
; 11111..
; 111111.
; 1111111
; .111111
; ..11111
; ...1111
; ....111
; .....11
; ......1
; .......
; ------------------------------------------------------


.include "system.inc"

TMP    = MEM7

TIMER_OUT  = IN7
TIMER_TRIG = OUT7

START = 0


.macro trigger_timer
    orc     RR
    sto     TIMER_TRIG
    stoc    TIMER_TRIG
.endmacro

.segment "CODE"

; ------------------------------------------------------
; initialization
; if it is the first loop set MEM0 to 1
; enable inputs and outputs
; ------------------------------------------------------

    sto     TMP         ; store RR to TMP, RR is 0 the first time, and 1 afterwards
    orc     RR          ; force 1 into RR regardless whether inputs and outputs were enabled
    ien     RR          ; enable inputs
    oen     RR          ; enable outputs
    ldc     TMP         ; restore complemented RR
    skz                 ; skip next instruction if not the first time
    sto     MEM0        ; initialize the internal representation of the first LED to 1

; ------------------------------------------------------
; if the timer ON then go to the START
; ------------------------------------------------------

    ld      TIMER_OUT   ; load timer state
    skz                 ; skip next instruction if timer is OFF
    jmp     START       ; timer is ON jump to START

; ------------------------------------------------------
; copy internal state to output
; ------------------------------------------------------
.repeat 7,I
    ld      MEM0+I      ; load the internal representation of LED I
    sto     OUT0+I      ; copy to the corresponding output
.endrepeat

; ------------------------------------------------------
; shift internal state to output
; ------------------------------------------------------

    ld      MEM6
    stoc    TMP

.repeat 6, I
    ld      MEM5-I
    sto     MEM6-I
.endrepeat

    ld      TMP
    sto     MEM0

; ------------------------------------------------------
; trigger timer and jump to the beginning of the program
; ------------------------------------------------------

    trigger_timer

    jmp     START

