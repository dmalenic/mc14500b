; ------------------------------------------------------------------------------
; 8-bit Linear Feedback Shift Register with maximum length feedback polynomial
; x^8 + x^6 + x^5 + x^4 + 1 that generates 2^8-1 = 255 pseudorandom outputs.
; See https://digitalxplore.org/up_proc/pdf/91-1406198475105-107.pdf
; ------------------------------------------------------------------------------
; Other resources:
; - https://en.wikipedia.org/wiki/Linear-feedback_shift_register
; - https://en.wikipedia.org/wiki/Maximum_length_sequence
; - https://www.eetimes.com/tutorial-linear-feedback-shift-registers-lfsrs-part-1/
; - https://www.eetimes.com/tutorial-linear-feedback-shift-registers-lfsrs-part-2/
; - https://www.eetimes.com/tutorial-linear-feedback-shift-registers-lfsrs-part-3/
; ------------------------------------------------------------------------------
; Rules for Selecting Feedback Polynomial:
; - The ‘one’ in the polynomial correspond to input to the first bit.
; - The powers of polynomial term represent tapped bits, counting from left,
;   e.g., for the 8-bit shift register, the power 8 represents the MSB,
;   the power 1 represents the LSB.
; - The first and last bits are always connected as an input and output tap
;   respectively.
; - The maximum length can only be possible if the number of taps is even and
;   there must be no common divisor to all taps.
; ------------------------------------------------------------------------------
; Usage:
; - Set IN5 ON, IN6 OFF to load IN1-IN4 into RAM0-RAM3
;   (initial condition x1..x4).
; - Set IN5 OFF, IN6 OFF to load IN1-IN4 into RAM4-RAM7
;   (initial condition x5..x8).
; - Set IN6 ON to start generating pseudorandom sequence on output OUT0.
; - OUT1 is the write signal. It switches from 0 to 1 when the OUT0 value is updated
;   and back from 1 to 0 at the beginning of a program cycle.
; ------------------------------------------------------------------------------

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

; ------------------------------------------
; Outputs
; ------------------------------------------
OUT0    EQU     00
OUT1    EQU     01

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
; Internal state:
; Note the convention for the notation of the polynomial,
; the the numbering is 1 bases i.e., X1 is the lest
; significant bit of the LSFR, X8 is the most significant
; bit of the LSFR.
; ------------------------------------------------------
X1      EQU     RAM0
X2      EQU     RAM1
X3      EQU     RAM2
X4      EQU     RAM3
X5      EQU     RAM4
X6      EQU     RAM5
X7      EQU     RAM6
X8      EQU     RAM7

; ------------------------------------------------------
; Output
; ------------------------------------------------------
D_OUT   EQU     OUT0    ; Data output is wired to OUT0
CLK     EQU     OUT1    ; Clock is wired to OUT1, 1 indicates data is valid

; ------------------------------------------------------
; Control inputs
; ------------------------------------------------------
L_OR_H  EQU     IN5
START   EQU     IN6


; ------------------------------------------------------
; Initialize
; ------------------------------------------------------
ORC     RR
OEN     RR
IEN     RR
STOC    CLK     ; CLK = !RR = 0

; ------------------------------------------------------
; If IN5 is set and IN6 is not set write IN1-IN4 to X1-X4
; ------------------------------------------------------
LDC     START
AND     L_OR_H
OEN     RR

LD      IN1
STO     X1
LD      IN2
STO     X2
LD      IN3
STO     X3
LD      IN4
STO     X4

; ------------------------------------------------------
; If both IN5 and IN6 are clear write IN1-IN4 to X5-X8
; ------------------------------------------------------
LDC     START
ANDC    L_OR_H
OEN     RR

LD      IN1
STO     X5
LD      IN2
STO     X6
LD      IN3
STO     X7
LD      IN4
STO     X8

; ------------------------------------------------------
; If IN6 is set calculate the next LFSR value
; ------------------------------------------------------
LDC     START   ; load the complement of IN6 to RR
SKZ             ; if IN6 is set then start the LFSR
JMP             ; if IN6 is not set jump to the beginning

; ------------------------------------------------------
; Output X8, the current LFSR output value.
; From this point on, with some caution (see below) X8
; can be used as a temporary register.
; ------------------------------------------------------
ORC     RR      ; 1->RR
OEN     RR      ; Enable output, input should aready be enabled
LD      X8      ; RR = X8
STO     D_OUT   ; D_OUT = RR = X8
ORC     RR      ; 1->RR
STO     CLK     ; CLK = 1, shows that data is valid

; ------------------------------------------------------
; Calculate the next LFSR value and put it in X8
; (the rotation that follows will move it to X1).
; X8 = X8 = X4 XOR (X5 XOR (X6 XOR X8))
; ------------------------------------------------------
LD      X8      ; RR = X8
XNOR    X6      ; RR = X6 XNOR RR = X6 XOR X8
STOC    X8      ; X8 = !RR = X6 XOR X8

LD      X8      ; Load X8
XNOR    X5      ; RR = X5 XNOR RR = X5 XOR X8
STOC    X8      ; X8 = !RR = X5 XOR (X6 XOR X8)

LD      X8      ; Load X8
XNOR    X4      ; RR = X4 XNOR RR = X4 XOR X8
STOC    X8      ; X8 = !RR = X4 XOR (X5 XOR (X6 XOR X8))

; ------------------------------------------------------
; Right rotate X1..X8
; as we are missing a register we need to separately handle
; 2 cases:
; - X8 = 0
; - X8 = 1
; Note: this is the constant time implementation, both
;       cases are executed but only one is allowed to change
;       the state and output the result.
;       So, there is no side-channel information leakage ;-)
;       as it really matter for a toy 8 bit LFSR like this one.
; ------------------------------------------------------

; ------------------------------------------------------
; First handle the case X8 = 1
; ------------------------------------------------------

OEN     X8      ; Enable output if X8 = 1
IEN     X8      ; Enable input if X8 = 1
LD      X7      ; RR = X7
STO     X8      ; X8 = X7
LD      X6      ; RR = X6
STO     X7      ; X7 = X6
LD      X5      ; RR = X5
STO     X6      ; X6 = X5
LD      X4      ; RR = X4
STO     X5      ; X5 = X4
LD      X3      ; RR = X3
STO     X4      ; X4 = X3
LD      X2      ; RR = X2
STO     X3      ; X3 = X2
LD      X1      ; RR = X1
STO     X2      ; X2 = X1
ORC     RR      ; RR = 1
STO     X1      ; X1 = RR = 1

; ------------------------------------------------------
; If this point is reached then handle the case if X8 = 0
; As we are in simulation mode START is always 1 so it can be
; used to test if input is enabled i.e. if X8 = 1.
; ------------------------------------------------------

LDC     START   ; RR = START (0 if input was enabled, 1 otherwise)
IEN     START   ; Enable input
AND     START   ; RR = RR AND START
OEN     RR      ; Enable output if RR = 1
IEN     RR      ; Enable input  if RR = 1
LD      X7      ; RR = X7
STO     X8      ; X8 = X7
LD      X6      ; RR = X6
STO     X7      ; X7 = X6
LD      X5      ; RR = X5
STO     X6      ; X6 = X5
LD      X4      ; RR = X4
STO     X5      ; X5 = X4
LD      X3      ; RR = X3
STO     X4      ; X4 = X3
LD      X2      ; RR = X2
STO     X3      ; X3 = X2
LD      X1      ; RR = X1
STO     X2      ; X2 = X1
ORC     RR      ; 1->RR
STOC    X1      ; X1 = !RR = 0

JMP
