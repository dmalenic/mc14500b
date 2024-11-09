; ------------------------------------------------------
; This program tests if the assembler processes EQU directive correctly.
; The gaps introduced by ORG directive should be filled the value defined
; for uninitialized memory (NOPO or NOPF, depending on assembler settings).
; ------------------------------------------------------

; C style numeric constants
C1  EQU     10      ; Define a constant C1 with value 10
C2  EQU     0xE     ; Define a constant C2 with a hexadecimal value 0xE = 14
C3  EQU     010     ; Define a constant C3 with an octal value 010 = 8
; Python style numeric constants
C4  EQU     0o10    ; Define a constant C4 with an octal value 0o10 = 8
C5  EQU     0b101   ; Define a constant C5 with a binary value ob101 = 5
; DASM style numeric constants
C6  EQU     #$E     ; Define a constant C6 with a hexadecimal value #$E = 14
C7  EQU     #10     ; Define a constant C7 with a decimal value #10 = 10
C8  EQU     #010    ; Define a constant C8 with an octal value #010 = 8
C9  EQU     #%0101  ; Define a constant C9 with a binary value #%0101 = 5


NOPF    C1
NOPF    C2
NOPF    C3
NOPF    C4
NOPF    C5
NOPF    C6
NOPF    C7
NOPF    C8
NOPF    C9
JMP
