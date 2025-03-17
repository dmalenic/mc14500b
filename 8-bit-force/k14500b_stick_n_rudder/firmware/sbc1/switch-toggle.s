; ------------------------------------------------------
; Switch Toggle:
; * Tests Arduino monitor program code that enables
;   to use inputs IN1 to IN7 that are physically
;   connected to push buttons to be used as
;   toggle-switches.
; * Pressing the push button toggles the state of
;   an "emulated" toggle-switch, releasing it does not
;   change the "toggle-switch" state. I.e., to turn the
;   "emulated" toggle-switch on press the push-button,
;   to turn the "emulated" toggle switch off, press
;   the push button again.
; * The Arduino test program configures inputs IN1 to
;   IN4 to emulate toggle-switch while keeping inputs
;   IN5 to IN7 act as standard push buttons. The change
;   does not affect the MC14500B code.
; ------------------------------------------------------


.include "system.inc"

START = 0


.segment "CODE"

; ------------------------------------------------------
; initialization
; enable inputs and outputs
; ------------------------------------------------------

    orc     RR          ; force 1 into RR regardless whether inputs and outputs were enabled
    ien     RR          ; enable inputs
    oen     RR          ; enable outputs

; ------------------------------------------------------
; test loop just copies input to a corresponding output
; and jumps to the start of the program
; ------------------------------------------------------

.repeat 7,I
    ld      IN1+I
    sto     OUT1+I
.endrepeat

    jmp     START

