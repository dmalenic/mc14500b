; -----------------------------------------------------
; Test the read back possibility of the output register
; using a boolean equation.
; This require an output to be wired back to the
; corresponding input.
; -----------------------------------------------------

; Call the init program
INIT

LD  IN1
AND IN2
STO OUT1
LD  IN3
AND IN4
OR  OUT1
STO OUT0

JMP
