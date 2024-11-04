; ----------------------------------------
; 1-bit J-K flip flop
; ----------------------------------------
; This program simulates the J-K Flip-Flop.
; Latch input J is controlled by IN1 input.
; Latch input K is controlled by IN2 input.
; Latch input CLK is controlled by IN3 input.
; Latch output Q is displayed on OUT0 output.
; ----------------------------------------

; Call the init program
INIT

; Define signal names for the latch
J       EQU 01
K       EQU 02
Q       EQU 0A
CLK     EQU 03
TEMP    EQU 08
OLD_CLK EQU 09

; output state of the flip-flop
LD      Q
STO     OUT0

LD      OLD_CLK ; Move OLD_CLK to ...
STO     TEMP    ; ... TEMP
LD      CLK     ; Find rising edge of CLK
STO     OLD_CLK
ANDC    TEMP    ; RR = CLK AND !OLD_CLK
OEN     RR      ; Enable store if rising edge is found

; Q(n+1) = (Q(n) AND !K) OR (Q(n) AND J)
LD      Q       ; Load Q
ANDC    K       ; RR = Q AND !K
STO     TEMP    ; Store temporary result
LDC     Q       ; Load !Q
AND     J       ; RR = Q AND J
OR      TEMP    ; RR = (Q AND !K) OR (!Q AND J)
STO     Q       ; Store result

; the following 2 instructions are not needed for this demo
; but if this code is part of a larger program, they would
; restore the OEN signal expectation for the remaining program

ORC  RR    ; Produces always 1 in RR
OEN  RR
JMP
