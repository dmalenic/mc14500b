; ----------------------------------------
; 1-bit S-R latch
; ----------------------------------------
; This program simulates the S-R Latch.
; Latch input S is controlled by IN1 input.
; Latch input R is controlled by IN2 input.
; Latch output Q is displayed on OUT0 output.
; ----------------------------------------

; Call the init program
INIT

; Define signal names for the latch
S       EQU 0x01
R       EQU 0x02
Q       EQU 0x08

; output state of the flip-flop
LD      Q
STO     OUT0

; If S is 1 and R is 0, then Q is 1
LD      S
ANDC    R       ; RR = S AND !R
OEN     RR      ; Enable store if S is 1 and R is 0
STO     Q       ; Set Q to 1 if output is enabled

; If S is 0 and R is 1, then Q is 0
LDC     S
AND     R       ; RR = !S AND R
OEN     RR      ; Enable store if S is 0 and R is 1
STOC    Q       ; Set Q to 0 if output is enabled

; the following 2 instructions are not needed for this demo
; but if this code is part of a larger program, they would
; restore the OEN signal expectation for the remaining program

ORC  RR    ; Produces always 1 in RR
OEN  RR

JMP
