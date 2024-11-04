; ----------------------------------------
; This program illustrates how to use RAM to evaluate a boolean equation:
; Z = (A & B) | (C & D)
; A: IN1, B: IN2, C: IN3, D: IN4 and Z: OUT0
; ----------------------------------------

; Call the init program
INIT

RAM00   EQU RAM0

LD      IN1
AND     IN2
STO     RAM00
LD      IN3
AND     IN4
OR      RAM00
STO     OUT0

JMP
