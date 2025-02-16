; ------------------------------------------------------
; Tests if bit string is a palindrome
; IN7-IN1 - input bit string
; OUT0 - 1 if palindrome, 0 otherwise
; RAM0 - temporary storage
; ------------------------------------------------------

INIT

STO     RAM0    ; assume a palindrome
LDC     IN1     ; is IN1 != IN7
XNOR    IN7
SKZ             ; no - may be a palindrome - skip to test IN2-IN6
STOC    RAM0    ; not a palindrome
LDC     IN2     ; is IN2 != IN6
XNOR    IN6
SKZ             ; no - may be a palindrome - skip to test IN3-IN5
STOC    RAM0    ; not a palindrome
LDC     IN3     ; is IN3 != IN5
XNOR    IN5
SKZ             ; no - it is a palindrome
STOC    RAM0    ; not a palindrome
; write a result
LD      RAM0    ; set OUT0
STO     OUT0
JMP
