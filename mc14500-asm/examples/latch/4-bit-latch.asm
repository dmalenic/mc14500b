; ----------------------------------------
; 4-bit D-Latch
; ----------------------------------------
; This program simulates a 4-bit D-latch circuit.
; Latch inputs D0-D3 are controlled by inputs IN1-IN4.
; Input IN5 controls the CLOCK signal.
; The latch outputs Q0-Q3 are shown at outputs OUT0 to OUT3.
; ----------------------------------------

; Call the init program
INIT

; Define signal names for the latch
D0   EQU    0x01
D1   EQU    0x02
D2   EQU    0x03
D3   EQU    0x04
CLK  EQU    0x05
Q0   EQU    0x00
Q1   EQU    0x01
Q2   EQU    0x02
Q3   EQU    0x03

OEN  CLK
LD   D0
STO  Q0
LD   D1
STO  Q1
LD   D2
STO  Q2
LD   D3
STO  Q3
; the following 2 instructions are not needed for this demo
; but if this code is part of a larger program, they would
; restore the OEN signal expectation for the remaining program
ORC  RR    ; Produces always 1 in RR
OEN  RR
JMP
