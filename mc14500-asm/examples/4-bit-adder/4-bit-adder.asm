; ------------------------------------------------------
; 4 Bit Full Adder: A1-A4 + B1-B4 = R1-R4, OUT5 = Carry out
; ------------------------------------------------------
; This program simulates a '4-bit full-adder with carry' circuit.
; Usage:
; - Set IN5 to ON and IN6 to OFF to load IN1-IN4 into RAM0-RAM3 (the 2nd oper. B1-B3).
; - Set IN5 to OFF and IN6 to OFF to load IN1-IN4 (the 1st operand A1-A4).
; - Set IN6 to ON to calculate R1-R4 and show the result on OUT0-OUT3, OUT4 shows
;   the final Carry bit value.
;
; RAM7 is used as intermediate carry while calculating
; ------------------------------------------------------

; ------------------------------------------
; Inputs
; ------------------------------------------
RR      EQU     00  Pin RR is wired to input 0
IN1     EQU     01
IN2     EQU     02
IN3     EQU     03
IN4     EQU     04
IN5     EQU     05
IN6     EQU     06
IN7     EQU     07

; ------------------------------------------
; Outputs
; ------------------------------------------
OUT0    EQU     00
OUT1    EQU     01
OUT2    EQU     02
OUT3    EQU     03
OUT4    EQU     04
OUT5    EQU     05
OUT6    EQU     06
OUT7    EQU     07

; ------------------------------------------
; RAM
; ------------------------------------------
RAM0    EQU     08
RAM1    EQU     09
RAM2    EQU     0A
RAM3    EQU     0B
RAM4    EQU     0C
RAM5    EQU     0D
RAM6    EQU     0E
RAM7    EQU     0F

; ------------------------------------------------------
; Intermediate carry
; ------------------------------------------------------
C-TMP   EQU     RAM7

; ------------------------------------------------------
; First operand
; ------------------------------------------------------
A1      EQU     IN1
A2      EQU     IN2
A3      EQU     IN3
A4      EQU     IN4

; ------------------------------------------------------
; Second operand
; ------------------------------------------------------
B1      EQU     RAM0
B2      EQU     RAM1
B3      EQU     RAM2
B4      EQU     RAM3

; ------------------------------------------------------
; Result
; ------------------------------------------------------
R1      EQU     OUT0
R2      EQU     OUT1
R3      EQU     OUT2
R4      EQU     OUT3

; ------------------------------------------------------
; Carry-out
; ------------------------------------------------------
C-OUT   EQU     OUT4

; ------------------------------------------------------
; Control inputs
; ------------------------------------------------------
A_OR_B EQU     IN5
CALC   EQU     IN6

; ------------------------------------------------------
; Initialize
; ------------------------------------------------------
ORC     RR
IEN     RR

; ------------------------------------------------------
; Write A1-A4 to B1-B4 if IN5 is set
; ------------------------------------------------------
OEN     IN5

LD      A1
STO     B1
LD      A2
STO     B2
LD      A3
STO     B3
LD      A4
STO     B4

; ------------------------------------------------------
; At this point, if IN5 was set, the second operand is
; loaded into RAM0-RAM3; otherwise the input contains
; the first operand.
; ------------------------------------------------------

; Enable output if IN6 is set
LD      CALC
OEN     RR

; ------------------------------------------------------
; In RR was not set, the program will loop back to
; the begining so user can continue defining the inputs
; for the calculation.
; The following 3 instruction are not needed for the
; actual calculation.
; ------------------------------------------------------
LDC     RR
SKZ
JMP

; ------------------------------------------------------
; Do the calculations
; ------------------------------------------------------

; 1st bit - half adder
LD      A1
XNOR    B1
STOC    R1

LD      A1
AND     B1
STO     C-TMP

; 2nd bit - full adder
LD      A2
XNOR    B2
XNOR    C-TMP
STO     R2

LD      A2
AND     B2
IEN     C-TMP
OR      A2
OR      B2
STO     C-TMP

ORC     RR
IEN     RR

; 3rd bit - full adder
LD      A3
XNOR    B3
XNOR    C-TMP
STO     R3

LD      A3
AND     B3
IEN     C-TMP
OR      A3
OR      B3
STO     C-TMP

ORC     RR
IEN     RR

; 4th bit - full adder
LD      A4
XNOR    B4
XNOR    C-TMP
STO     R4

LD      A4
AND     B4
IEN     C-TMP
OR      A4
OR      B4
STO     C-TMP

ORC     RR
IEN     RR

; 5th bit - show carry
LD      C-TMP
STO     C-OUT

; Loop back

JMP     0
