; ----------------------------------------
; 4-bit D flip-flop register
; ----------------------------------------
; This program simulates a 4-bit D-flip-flop circuit.
; Flip-flop inputs D0-D3 are controlled by inputs IN1-IN4.
; Input IN5 controls the CLOCK signal.
; The flip-flop outputs Q0-Q3 are shown at outputs OUT0 to OUT3.
; ----------------------------------------

; Call the init program
INIT

; Define signal names for the latch
D0      EQU 01
D1      EQU 02
D2      EQU 03
D3      EQU 04
CLK     EQU 05
Q0      EQU 00
Q1      EQU 01
Q2      EQU 02
Q3      EQU 03
TEMP    EQU 08
OLD_CLK EQU 09


LD      OLD_CLK ; Move OLD_CLK to ...
STO     TEMP    ; ... TEMP
LD      CLK     ; Find rising edge of CLK
STO     OLD_CLK
ANDC    TEMP    ; RR = CLK AND !OLD_CLK
OEN     RR      ; Enable store if rising edge is found
LD      D0
STO     Q0
LD      D1
STO     Q1
LD      D2
STO     Q2
LD      D3
STO     Q3

; the following 2 instructions are not needed for this demo
; but if this code is part of a larger program, they would
; restore the OEN signal expectation for the remaining program

ORC  RR    ; Produces always 1 in RR
OEN  RR
JMP
