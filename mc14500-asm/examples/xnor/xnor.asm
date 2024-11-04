; -------------------------------------------------------
; This program simulates a logical XNOR gate.
; Use inputs IN1 and IN2 to supply the input values to the gate.
; The result of the XNOR logical operation is shown at OUT0 output.
; -------------------------------------------------------

; call the init program
INIT

LD    IN1
XNOR  IN2
STO   OUT0

JMP
