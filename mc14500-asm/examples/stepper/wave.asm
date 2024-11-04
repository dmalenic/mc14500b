; ------------------------------------------------------
; Macro to generate wave drive sequence for a stepper motor
; ------------------------------------------------------
; Depending on the direction of rotation, map the pins accordingly
; clockwise: A -> PIN1, B -> PIN2, C -> PIN3, D -> PIN4
; counter-clockwise: A -> PIN4, B -> PIN3, C -> PN22, D -> PIN1
; ------------------------------------------------------

; ------------------------------------------------------
; Creates 1 in RR via RR pin wired back to input 0
; and then move the 1 as output data it into
; IEN and OEN to initialize the chip
; ------------------------------------------------------
ORC     RR
IEN     RR
OEN     RR
STOC    PIN4

; ------------------------------------------------------
; PIN1 signal
; ------------------------------------------------------

STO     PIN1
NOPO
NOPO
NOPO
NOPO
STOC    PIN1

; ------------------------------------------------------
; PIN2 signal
; ------------------------------------------------------

STO     PIN2
NOPO
NOPO
NOPO
NOPO
STOC    PIN2

; ------------------------------------------------------
; PIN3 signal
; ------------------------------------------------------

STO     PIN3
NOPO
NOPO
NOPO
NOPO
STOC    PIN3


; ------------------------------------------------------
; PIN4 signal
; ------------------------------------------------------

STO     PIN4
JMP
