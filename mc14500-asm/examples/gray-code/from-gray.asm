; ------------------------------------------------------
; Convert 7-bit number from Gray code representation to its binary equivalent.
; Only 7 bits can be converted because RR is connected to IN0.
; Use inputs IN7 to IN1 to provide the 7 bit binary input.
; The result is shown in outputs OUT6 to OUT0. OUT7 is always 0.
; ------------------------------------------------------

; define registers and enable inputs and outputs

INIT

; after INIT completes, RR holds 1

STOC    OUT7        ; it is 7 bit conversion so OUT7 is always 0
LD      IN7         ; OUT6 = IN7
STO     OUT6
XNOR    IN6         ; OUT5 = OUT6 XOR IN6, RR has OUT6
STOC    OUT5
XNOR    IN5         ; OUT4 = OUT5 XOR IN5, RR has complement of OUT5
STO     OUT4
XNOR    IN4         ; OUT3 = OUT4 XOR IN4, RR has OUT4
STOC    OUT3
XNOR    IN3         ; OUT2 = OUT3 XOR INR, RR has complement of OUT3
STO     OUT2
XNOR    IN2         ; OUT1 = OUT2 XOR IN2, RR has OUT2
STOC    OUT1
XNOR    IN1         ; OUT0 = OUT1 XOR IN1, RR has complement of OUT1
STO     OUT0

JMP
