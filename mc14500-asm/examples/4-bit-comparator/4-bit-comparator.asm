; ------------------------------------------------------
; 4 Bit Comparator: A1-A4 v.s. B1-B4, EQ, AGTR, BGTR
; ------------------------------------------------------
; This program simulates a '4-bit comparator' circuit.
; Usage:
; - Set IN5 to ON and IN6 to OFF to load IN1-IN4 into RAM0-RAM3
;   (the 2nd op. is B1-B3).
; - Set IN5 to OFF and IN6 to OFF to load IN1-IN4
;   (the 1st operand is A1-A4).
; - Set IN6 to ON to perform the comparison.
;   If A=B, then the output OUT0 is set (EQ).
;   If A>B, then the output OUT1 is set (AGTR).
;   If A<B, then the output OUT2 is set (BGTR).
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
EQ          EQU RAM5
AGTR        EQU RAM6
BGTR        EQU RAM7
OUT_EQ      EQU OUT0
OUT_AGTR    EQU OUT1
OUT_BGTR    EQU OUT2

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
; In RR was not set, we can return to the beginning
; to make user input in this demo more responsive.
; The following 3 instruction are not needed for
; the actual calculation.
; ------------------------------------------------------
LDC     RR
SKZ
JMP

; ------------------------------------------------------
; Start: Set EQ to 1, AGTR to 0 and BGTR to 0
; ------------------------------------------------------

ORC     RR
STO     EQ
STOC    AGTR
STOC    BGTR

; ------------------------------------------------------
; Comparet 4th bit
; ------------------------------------------------------

OEN     EQ      ; Enable if EQ = 1
LD      A4      ; Load A4
XNOR    B4      ; Compare with B4
STO     EQ      ; Store new value to EQ
OR      A4      ; BGTR = EQ OR A4
STOC    BGTR    ; Store new BGTR
LD      EQ      ; Load EQ
OR      B4      ; AGTR = EQ OR B4
STOC    AGTR    ; Store new AGTR (end of 4th bit comparison)
OEN     EQ      ; Enable output if EQ = 1 (prepare for 3rd bit comparison)

; ------------------------------------------------------
; Comparet 3rd bit
; ------------------------------------------------------

OEN     EQ      ; Enable if EQ = 1
LD      A3      ; Load A3
XNOR    B3      ; Compare with B3
STO     EQ      ; Store new value to EQ
OR      A3      ; BGTR = EQ OR A3
STOC    BGTR    ; Store new BGTR
LD      EQ      ; Load EQ
OR      B3      ; AGTR = EQ OR B3
STOC    AGTR    ; Store new AGTR (end of 3th bit comparison)
OEN     EQ      ; Enable output if EQ = 1 (prepare for 2nd bit comparison)

; ------------------------------------------------------
; Comparet 2nd bit
; ------------------------------------------------------

OEN     EQ      ; Enable if EQ = 1
LD      A2      ; Load A2
XNOR    B2      ; Compare with B2
STO     EQ      ; Store new value to EQ
OR      A2      ; BGTR = EQ OR A2
STOC    BGTR    ; Store new BGTR
LD      EQ      ; Load EQ
OR      B2      ; AGTR = EQ OR B2
STOC    AGTR    ; Store new AGTR (end of 2nd bit comparison)
OEN     EQ      ; Enable output if EQ = 1 (prepare for 1st bit comparison)

; ------------------------------------------------------
; Comparet 1st bit
; ------------------------------------------------------

OEN     EQ      ; Enable if EQ = 1
LD      A1      ; Load A1
XNOR    B1      ; Compare with B1
STO     EQ      ; Store new value to EQ
OR      A1      ; BGTR = EQ OR A1
STOC    BGTR    ; Store new BGTR
LD      EQ      ; Load EQ
OR      B1      ; AGTR = EQ OR B1
STOC    AGTR    ; Store new AGTR (end of 1st bit comparison)

ORC     RR      ; Enable output
OEN     RR      ;

; ------------------------------------------------------
; Done, display the result
; ------------------------------------------------------

LD      EQ
STO     OUT_EQ
LD      AGTR
STO     OUT_AGTR
LD      BGTR
STO     OUT_BGTR

JMP
