; ------------------------------------------------------
; Converts 7-bit number from binary code to its Gray code equivalent.
; Only 7 bits can be converted because RR is connected to IN0.
; Use inputs IN7 to IN1 to provide the 7 bit Gray code input.
; The result is shown in outputs OUT6 to OUT0. OUT7 is always 0.
; ------------------------------------------------------

; define registers and enable inputs and outputs

INIT

; after INIT completes, RR holds 1

STOC    OUT7        ; it is 7 bit conversion so OUT7 is always 0
LD      IN1         ; OUT0 = IN1 XOR IN2
XNOR    IN2
STOC    OUT0
LD      IN2         ; OUT0 = IN1 XOR IN2
XNOR    IN3
STOC    OUT1
LD      IN3         ; OUT0 = IN1 XOR IN2
XNOR    IN4
STOC    OUT2
LD      IN4         ; OUT0 = IN1 XOR IN2
XNOR    IN5
STOC    OUT3
LD      IN5         ; OUT0 = IN1 XOR IN2
XNOR    IN6
STOC    OUT4
LD      IN6         ; OUT0 = IN1 XOR IN2
XNOR    IN7
STOC    OUT5
LD      IN7         ; OUT6 = IN7
STO     OUT6

JMP
