; ----------------------------------------
; The program generates a square wave on the output OUT4.
; Note that the output OUT4 is kept high for exactly five instructions,
; and precisely five instructions, it is kept low.
; The exception is the first cycle when during the first 3 instructions
; the OUT4 state is undefined.
; ----------------------------------------

IN0     EQU     0
OUT4    EQU     4
RR      EQU     IN0

ORC RR          ; OUT4=0 (excpet in the 1st cycle, when it is undefined)
IEN RR          ; OUT4=0 (excpet in the 1st cycle, when it is undefined)
OEN RR          ; OUT4=0 (excpet in the 1st cycle, when it is undefined)
STO  OUT4       ; OUT4=1
NOPO            ; OUT4=1
NOPO            ; OUT4=1
NOPO            ; OUT4=1
NOPO            ; OUT4=1
STOC OUT4       ; OUT4=0
JMP             ; OUT4=0
