; ----------------------------------------
; Counts how often the CLOCK input has switched from zero to one.
; The CLOCK input is controlled by IN1 input.
; The RESET signal resets the counter value to zero. Its active level is HIGH,
; and it is controlled by IN2 input.
; The counter output is shown on outputs OUT0-OUT3, OUT3 being MSB.
; ----------------------------------------

; Call the init program
INIT

; ----------------------------------------
; Define signal names for the clock
; ----------------------------------------
CLK     EQU     IN1
RESET   EQU     IN2
Q0      EQU     OUT0    ; output of the flip-flop D0
Q1      EQU     OUT1    ; output of the flip-flop D1
Q2      EQU     OUT2    ; output of the flip-flop D2
Q3      EQU     OUT3    ; output of the flip-flop D3

D0      EQU     RAM0    ; the current state of the flip-flop D0
D1      EQU     RAM1    ; the current state of the flip-flop D1
D2      EQU     RAM2    ; the current state of the flip-flop D2
D3      EQU     RAM3    ; the current state of the flip-flop D3

TEMP    EQU     RAM6    ; the previous state of the previous flip-flop or clock
OLD_CLK EQU     RAM7    ; the previous state of the clock

; ----------------------------------------
; check the reset, reset is active high like on the original MC14500
; if reset is high then reset the internal state counter, 
; otherwise STOC instrucitons will have no effect
; ----------------------------------------
OEN     RESET
LDC     RESET
STO     D0
STO     D1
STO     D2
STO     D3

; ----------------------------------------
; enable inputs and outputs
; ----------------------------------------
ORC     RR
OEN     RR
IEN     RR

; ----------------------------------------
; copy internal state to the output
; ----------------------------------------
LD      D0
STO     Q0
LD      D1
STO     Q1
LD      D2
STO     Q2
LD      D3
STO     Q3

; ----------------------------------------
; The counter implementation:
; - complement the first flip-flop if clock has switched from 0 to 1
; - for all other flip-flops:
;   if the state of the prevous D flip-flop has switched from 1 to 0 complement the current flip-flop
; ----------------------------------------

; ----------------------------------------
; check the positive edge of the clock signal
; ----------------------------------------
LD      OLD_CLK     ; Move OLD_CLK to ...
STO     TEMP        ; ... TEMP
LD      CLK         ; Find rising edge of CLK.
STO     OLD_CLK     ; Store the current CLK state to OLD_CLK for the next iteration.
ANDC    TEMP        ; RR = CLK AND !OLD_CLK
STO     TEMP        ; If output is to be disabled TEMP must be predictable i.e. 0 in the remaining program.
OEN     RR          ; Enable store if rising edge is found.

; ----------------------------------------
; process D0 flip-flop:
; ----------------------------------------
LD      D0          ; Load D0
STO     TEMP        ; Preserve D0 so we can check if it has changed from 1 to 0 (only if output is enabled).
STOC    D0          ; Complement D0 (only if output is enabled).
LDC     D0          ; Check if Q0 has changed from 1 to 0.
AND     TEMP        ; RR = TEMP AND D0. Note: if output is disabled, the value of TEMP is 0.
OEN     RR          ; Enable output only if Q1 has changed from 1 to 0.

; ----------------------------------------
; process D1 flip-flop:
; ----------------------------------------
LD      D1          ; Load D1
STO     TEMP        ; Preserve D1 so we can check if it has changed from 1 to 0 (only if output is enabled).
STOC    D1          ; Complement D1 (only if output is enabled).
LDC     D1          ; Check if Q1 has changed from 1 to 0.
AND     TEMP        ; RR = TEMP AND D1. Note: if output is disabled, the value of TEMP is 0.
OEN     RR          ; Enable output only if Q1 has changed from 1 to 0.

; ----------------------------------------
; process D2 flip-flop:
; ----------------------------------------
LD      D2          ; Load D2
STO     TEMP        ; Preserve D2 so we can check if it has changed from 1 to 0 (only if output is enabled).
STOC    D2          ; Complement D2 (only if output is enabled).
LDC     D2          ; Check if Q2 has changed from 1 to 0.
AND     TEMP        ; RR = TEMP AND D2. Note: if output is disabled, the value of TEMP is 0.
OEN     RR          ; Enable output only if Q2 has changed from 1 to 0.

; ----------------------------------------
; process D3 flip-flop:
; ----------------------------------------
LDC     D3          ; Load D3
STO     D3          ; Complement D3 (only if output is enabled).

; the following 2 instructions are not needed for this demo
; but if this code is part of a larger program, they would
; restore the OEN signal expectation for the remaining program

ORC  RR    ; Produces always 1 in RR
OEN  RR

JMP
