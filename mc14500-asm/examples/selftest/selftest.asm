; ------------------------------------------------------------------------------------------------
; Prepare: Enable input and output
; ------------------------------------------------------------------------------------------------

INIT

; ------------------------------------------------------------------------------------------------
;  Test: Copy IN0 - IN6 to OUT0 - OUT6
;  The user can test all inputs and outputs using the switches and buttons.
;  Note: OUT0 is not directly the copy of IN0 because RR is linked to IN0.
;        Therefore OUT0 follwos the state of RAM0.
;        IN7 and OUT7 are lined to the timer and will be tested in the next block
; ------------------------------------------------------------------------------------------------
LD   IN6
STO  OUT6

LD   IN5
STO  OUT5

LD   IN4
STO  OUT4

LD   IN3
STO  OUT3

LD   IN2
STO  OUT2

LD   IN1
STO  OUT1

LD   RAM0
STO  OUT0

; Test: Start timer TMR0 when elapsed (set 0 -> 1)
LD   IN7
STOC OUT7

; Loop if timer TMR0 hasn't elapsed
SKZ
JMP  0

; ------------------------------------------------------------------------------------------------
; Timer has elapsed -> move running RAM light
; ------------------------------------------------------------------------------------------------

; Move RAM 6 -> 7
;If RAM 6 is 1 -> set to 0 and jump back
LD   RAM6
STO  RAM7
SKZ
STOC RAM6
SKZ
JMP  0

; Move RAM 5 -> 6
; If RAM 5 is 1 -> set to 0 and jump back
LD   RAM5
STO  RAM6
SKZ
STOC RAM5
SKZ
JMP  0

; Move RAM 4 -> 5
; If RAM 4 is 1 -> set to 0 and jump back
LD   RAM4
STO  RAM4
SKZ
STOC RAM4
SKZ
JMP  0

; Move RAM 3 -> 4
; If RAM 3 is 1 -> set to 0 and jump back
LD   RAM3
STO  RAM4
SKZ
STOC RAM3
SKZ
JMP  0

; Move RAM 2 -> 3
; If RAM 2 is 1 -> set to 0 and jump back
LD   RAM2
STO  RAM3
SKZ
STOC RAM2
SKZ
JMP  0

; Move RAM 1 -> 2
; If RAM 1 is 1 -> set to 0 and jump back
LD   RAM1
STO  RAM2
SKZ
STOC RAM1
SKZ
JMP  0

; Move RAM 0 -> 1
; If RAM 0 is 1 -> set to 0 and jump back
LD   RAM0
STO  RAM1
SKZ
STOC RAM0
SKZ
JMP  0

; ------------------------------------------------------------------------------------------------
; If this point is reached RAM0 - 7 are all 0
; -> The running light needs to be initialized
; ------------------------------------------------------------------------------------------------

ORC  RR
STO  RAM0

; ------------------------------------------------------------------------------------------------
; Following is a convenient place to introduce a code that is just testing if RTN, FlagO and
; FlagF signal outputs are working.
; ------------------------------------------------------------------------------------------------

RTN             ; This should activate RTN pin, but as RTN "skips" the next instrction...
NOPF            ; ...FlagF pin should not be activated here
NOPO            ; This should activate FlagO pin
NOPF            ; This should activate FlagF pin

JMP  0
