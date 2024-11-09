; ------------------------------------------------------------
; RTN test program.
; This program illustrates how RTN and NOPO instructions can be used
; to enable subroutines.
; Setting only IN1 to 1 sets OUT0 blinking.
; Setting only IN2 to 1 sets OUT1 blinking.
; Setting both IN1 and IN2 to 1 set OUT0 and OUT1 blink interchangebly.
; Setting IN3 to 1 if only one of IN1 or IN2 is active makes
; the corresponding output lit without blinking. If both IN1 and IN2
; are active then both OUT0 and OUT1 are blinking interchangebly.
; NOPO instruction is used to enable subroutines.
; ------------------------------------------------------------
; This program requires additional hardware to be wired to the MC14500 ICU.
; - The small ROM acting as a LUT. Its input is the MC14500 JMP and NOPO pins
;   is logically or-ed and connected to LUT chip select input.
;   The io_address part of the instruction word from the progam ROM.
;   The output of the LUT is connected to program couter input pins.
; - In addtion, a small LIFO ram is used to store the current program counter
;   value when NOPO signal is active. When RTN signal is active it pops the
;   value from the LIFO and sets the program counter to that value.
; ------------------------------------------------------------


; ------------------------------------------
; Inputs
; ------------------------------------------
RR      EQU     0x00  Pin RR is wired to input 0
IN1     EQU     0x01
IN2     EQU     0x02
IN3     EQU     0x03

; ------------------------------------------
; Outputs
; ------------------------------------------
OUT0    EQU     0x00
OUT1    EQU     0x01

; ------------------------------------------
; Labels
; ------------------------------------------
LUT     START               0
LUT     OUT0_ON_OUT1_OFF    1
LUT     OUT1_ON_OUT0_OFF    2
LUT     TEST_IN2            3
LUT     TEST_IN3            4

; ------------------------------------------
; Initialize program
; ------------------------------------------
START:
ORC     RR          ; 1->RR
IEN     RR          ; enable inputs
OEN     RR          ; enable outputs

; ------------------------------------------
; If IN1 is active jump to code that makes OUT0 on
; ------------------------------------------
LD      IN1         ; load IN1 to RR
SKZ                 ; skip next instruction if RR is zero (IN1 was not active)
NOPO    OUT0_ON_OUT1_OFF  ; jump to a subroutine that makes OUT0 on, OUT1 off

; ------------------------------------------
; If IN2 is active jump to code that makes OUT1 on
; ------------------------------------------
TEST_IN2:
LD      IN2         ; load IN2 to RR
SKZ                 ; skip next instruction if RR is zero (IN2 was not active)
NOPO    OUT1_ON_OUT0_OFF  ; jump to a subroutine that makes OUT1 on, OUT0 off

; ------------------------------------------
; If IN3 is active skip the code that clears OUT0 and OUT1
; ------------------------------------------
TEST_IN3:
LD      IN3         ; load IN3 to RR
SKZ                 ; skip next instruction if RR is zero (IN3 was not active)
JMP     START       ; IN3 was active, go to START (skip clearing OUT0 and OUT1)

; ------------------------------------------
; Clear OUT0 and OUT1
; ------------------------------------------
ORC     RR          ; 1->RR
STOC    OUT0        ; clear OUT0
STOC    OUT1        ; clear OUT1
JMP                 ; same as JMP START

; ------------------------------------------
; Subroutine to make OUT0 on, OUT1 off
; ------------------------------------------
OUT0_ON_OUT1_OFF:
ORC     RR          ; 1->RR
STO     OUT0        ; set OUT0
STOC    OUT1        ; clear OUT1
RTN                 ; return from subroutine

; ------------------------------------------
; Subroutine to make OUT1 on, OUT0 off
; ------------------------------------------
OUT1_ON_OUT0_OFF:
ORC     RR          ; 1->RR
STOC    OUT0        ; clear OUT0
STO     OUT1        ; set OUT1
RTN                 ; return from subroutine
