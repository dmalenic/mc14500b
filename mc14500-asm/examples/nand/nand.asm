; -------------------------------------------------------
; This program simulates a logical NAND gate.
; Use inputs IN1 and IN2 to supply the input values to the gate.
; The result of the NAND logical operation is shown at OUT0 output.
; -------------------------------------------------------

; call the init program
INIT

LD   IN1
AND  IN2
STOC OUT0

JMP
