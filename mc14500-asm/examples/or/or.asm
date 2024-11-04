; -------------------------------------------------------
; This program simulates a logical OR gate.
; Use inputs IN1 and IN2 to supply the input values to the gate.
; The result of the OR logical operation is shown at OUT0 output.
; -------------------------------------------------------

; call the init program
INIT

; OR function implemented using De Morgan's law
; A OR B = NOT (NOT A AND NOT B)
; Ironically it takes the same number of instructions as if it was implemented using OR instruction
LDC  IN1
ANDC IN2
STOC  OUT0

; a straightforward implementation using OR instruction
; LD    IN1
; OR    IN2
; STO   OUT0

JMP
