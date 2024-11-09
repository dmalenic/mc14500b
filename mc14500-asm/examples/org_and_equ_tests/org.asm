; ------------------------------------------------------
; This program tests if the assembler processes ORG directive correctly.
; The gaps introduced by ORG directive should be filled the value defined
; for uninitialized memory (NOPO or NOPF, depending on assembler settings).
; ------------------------------------------------------

ORG     10      ; Skip 10 memory locations and set the origin to 10
INIT            ; enable inputs and outputs (macro introduces 3 instructions)
ORG     #$10    ; Skip next 3 instructions and set the origin to 10H = 16
JMP
