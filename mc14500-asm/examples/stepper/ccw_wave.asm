; ------------------------------------------------------
; Unipolar Motor, Wave Drive, Counter-Clockwise
; OUT0 = stepper contact A
; OUT1 = stepper contact B
; OUT2 = stepper contact A'
; OUT3 = stepper contact B'
; ------------------------------------------------------
; Using a wave drive, this program drives a unipolar stepper motor counter-clockwise.
;
;                      +----+                  +----+
;                      |    |                  |    |
; A ++----++----++----++    ++----++----++----++    ++----++----+
;                +----+                  +----+
;                |    |                  |    |
; B ++----++----++    ++----++----++----++    ++----++----++----+
;          +----+                  +----+                  +----+
;          |    |                  |    |                  |    |
; A'++----++    ++----++----++----++    ++----++----++----++    +
;    +----+                  +----+                  +----+
;    |    |                  |    |                  |    |
; B'++    ++----++----++----++    ++----++----++----++    ++----+
;
; ------------------------------------------------------


; ------------------------------------------
; Memory and IO mapping for the MC14500 CPU
; ------------------------------------------

; ------------------------------------------
; Inputs
; ------------------------------------------
RR      EQU 00  ; Pin RR is wired to input 0

; ------------------------------------------
; Outputs
; ------------------------------------------
A       EQU 00
B       EQU 01
A_PRIME EQU 02
B_PRIME EQU 03
PiN1    EQU B_PRIME
PiN2    EQU A_PRIME
PiN3    EQU B
PiN4    EQU A

WAVE
