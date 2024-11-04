; ------------------------------------------
; Roll a die
; When the STOP signal is zero, the die rolls and the outputs 1 to 6 are
; sequentially turned on.
; When the STOP becomes one, the die stops with one of the outputs OUT1-OUT6
; activated.
; Input IN1 is the STOP signal.
; ------------------------------------------

; Call the init program
INIT

; Define signal names for the dice
STOP    EQU 01

LD      STOP
SKZ
JMP
STOC    OUT0
STO     OUT5
NOPO
NOPO
NOPO
NOPO

LD      STOP
SKZ
JMP
STOC    OUT1
STO     OUT0
NOPO
NOPO
NOPO
NOPO

LD      STOP
SKZ
JMP
STOC    OUT2
STO     OUT1
NOPO
NOPO
NOPO
NOPO

LD      STOP
SKZ
JMP
STOC    OUT3
STO     OUT2
NOPO
NOPO
NOPO
NOPO

LD      STOP
SKZ
JMP
STOC    OUT4
STO     OUT3
NOPO
NOPO
NOPO
NOPO

LD      STOP
SKZ
JMP
STOC    OUT5
STO     OUT4

JMP
