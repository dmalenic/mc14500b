; ------------------------------------------------------------------------------
; Kill the bit for mc14500.
;
; The game idea itself is from a game for the Altair by Dean McDaniel in 1975.
; Reference:
;   https://altairclone.com/downloads/killbits.pdf
;
; Original Description:
;   Object: Kill the rotating bit. If you miss the lit bit, another
;   bit turns on leaving two bits to destroy. Quickly
;   toggle the switch, don't leave the switch in the up
;   position. Before starting, make sure all the switches
;   are in the down position.
;
; The idea to implement it on the MC14500 came to me after watching demonstration
; of the original game on Altair 8800 replica:
;   https://www.youtube.com/watch?v=ZKeiQ8e18QY.
; and the following wideo by Usagi Electric:
;   https://www.youtube.com/watch?v=md_cPxVDqeM
;
; The implementaiton was losely influenced by Yaroslav Veremenko's:
;   https://github.com/veremenko-y/mc14500-programs/blob/main/sbc1/killthebit.s
; and Nicola Cimmino's:
;   https://github.com/nicolacimmino/PLC-14500/blob/master/tools/assembler/examples/killthebit.asm
; ------------------------------------------------------------------------------
; Kill the rotating bit (OUT1-OUT6). If you miss the lit bit, another bit turns on, leaving
;  two bits to destroy.
; Quickly toggle the correct switch (IN1-IN6) on and off at the right moment.
; Don't leave the switch in the on position, or the game will pause
; ------------------------------------------------------------------------------

MC14500MAP

BTN_TGL     EQU RAM0    ; A button toggle indicator
BIT_1       EQU RAM1    ; Internal bit 1
BIT_2       EQU RAM2    ; Internal bit 2
BIT_3       EQU RAM3    ; Internal bit 3
BIT_4       EQU RAM4    ; Internal bit 4
BIT_5       EQU RAM5    ; Internal bit 5
BIT_6       EQU RAM6    ; Internal bit 6
TMP         EQU RAM7    ; Temporary storage when swapping bits
LED_1       EQU OUT1    ; LED 1
LED_2       EQU OUT2    ; LED 2
LED_3       EQU OUT3    ; LED 3
LED_4       EQU OUT4    ; LED 4
LED_5       EQU OUT5    ; LED 5
LED_6       EQU OUT6    ; LED 6
BUTTON_1    EQU IN1     ; The button that user uses to interract with the game
BUTTON_2    EQU IN2     ; The button that user uses to interract with the game
BUTTON_3    EQU IN3     ; The button that user uses to interract with the game
BUTTON_4    EQU IN4     ; The button that user uses to interract with the game
BUTTON_5    EQU IN5     ; The button that user uses to interract with the game
BUTTON_6    EQU IN6     ; The button that user uses to interract with the game

TIMER_OUT   EQU IN7     ; Timer output
TIMER_TRIG  EQU IN7     ; Timer trigger

; ------------------------------------------------------
; Initialization code to enable input and output.
; Note: Reset ensures that RR is 0 when we hit this line the 1st time.
;       Program should ensure that it is 1 every other time the following line
;       is hit.
; ------------------------------------------------------
STO     TMP             ; Preserve RR (0 the 1st time, 1 all other times)
ORC     RR              ; 1 -> RR
IEN     RR              ; Enable inputs
OEN     RR              ; Enable outputs
LD      TMP             ; Restore RR

; ------------------------------------------------------
; The STO BIT_6 is executed only once because after the first loop RR=1
; (see last line of the whole program), so when the following code is executed
; againg memory initialization will be skipped.
; ------------------------------------------------------
LDC     RR              ; Set RR to 1 only in the 1st loop (reset sets RR to 0)
SKZ                     ; RR did not change in last 3 instruction so in the
                        ; the first loop
STO     BIT_6           ; initialise memory bit 6 with 1, it will be rotated
                        ; to bit 1 before visualizing initial state

; ------------------------------------------------------
; Enable reading buttons only if timer is on and a button has not been set yet.
; Liniting to only one toggle per cycle is necessary to prevent flipping the
;   same bit on and off random number of times withing the same cycle.
; ------------------------------------------------------
LD      TIMER_OUT       ; if timer is on
ANDC    BTN_TGL         ;   and button toggle indicator is off
                        ;   i.e., no button toggle detected yet
IEN     RR              ;     enable inputs
OEN     RR              ;     enable outputs

; ------------------------------------------------------
; Kill (or set) the bit on pos 1.
; The bit will be killed if the button is pressed while it's high.
; ------------------------------------------------------
LD      BUTTON_1
SKZ                     ; Skip next instruction if input is not set
STO     BTN_TGL         ; Indicate input is toggled
XNOR    BIT_1
STOC    BIT_1
STOC    LED_1           ; Reflect immediately on output for visual feedback

; ------------------------------------------------------
; Kill (or set) the bit on pos 2.
; The bit will be killed if the button is pressed while it's high.
; ------------------------------------------------------
LD      BUTTON_2
SKZ                     ; Skip next instruction if input is not set
STO     BTN_TGL         ; Indicate input is toggled
XNOR    BIT_2
STOC    BIT_2
STOC    LED_2           ; Reflect immediately on output for visual feedback

; ------------------------------------------------------
; Kill (or set) the bit on pos 3.
; The bit will be killed if the button is pressed while it's high.
; ------------------------------------------------------
LD      BUTTON_3
SKZ                     ; Skip next instruction if input is not set
STO     BTN_TGL         ; Indicate input is toggled
XNOR    BIT_3
STOC    BIT_3
STOC    LED_3           ; Reflect immediately on output for visual feedback

; ------------------------------------------------------
; Kill (or set) the bit on pos 4.
; The bit will be killed if the button is pressed while it's high.
; ------------------------------------------------------
LD      BUTTON_4
SKZ                     ; Skip next instruction if input is not set
STO     BTN_TGL         ; Indicate input is toggled
XNOR    BIT_4
STOC    BIT_4
STOC    LED_4           ; Reflect immediately on output for visual feedback

; ------------------------------------------------------
; Kill (or set) the bit on pos 5.
; The bit will be killed if the button is pressed while it's high.
; ------------------------------------------------------
LD      BUTTON_5
SKZ                     ; Skip next instruction if input is not set
STO     BTN_TGL         ; Indicate input is toggled
XNOR    BIT_5
STOC    BIT_5
STOC    LED_5           ; Reflect immediately on output for visual feedback

; ------------------------------------------------------
; Kill (or set) the bit on pos 6.
; The bit will be killed if the button is pressed while it's high.
; ------------------------------------------------------
LD      BUTTON_6
SKZ                     ; Skip next instruction if input is not set
STO     BTN_TGL         ; Indicate input is toggled
XNOR    BIT_6
STOC    BIT_6
STOC    LED_6           ; Reflect immediately on output for visual feedback

; ------------------------------------------------------
; Repeat reading buttons while timer is on
; ------------------------------------------------------
ORC     RR              ; 1 -> RR
IEN     RR              ; enable input to read the timer state
LD      TIMER_OUT       ; Is timer still on?
SKZ                     ; no -> continue with resto fo program
JMP                     ; yes, jump repeat reading buttons (Note: RR is one)

; ------------------------------------------------------
; If this point has been reached timer signal has ended
; so all buttons must be off
; Block if a button is still on
; ------------------------------------------------------
LD      TIMER_OUT       ; should be 0 at this point
OR      BUTTON_1        ; or with bit 1 (if button 1 is off result is zero)
OR      BUTTON_2        ; or with bit 2 (if button 2 is off result is zero)
OR      BUTTON_3        ; or with bit 3 (if button 3 is off result is zero)
OR      BUTTON_4        ; or with bit 4 (if button 4 is off result is zero)
OR      BUTTON_5        ; or with bit 5 (if button 5 is off result is zero)
OR      BUTTON_6        ; or with bit 6 (if button 6 is off result is zero)
SKZ                     ; Iff all buttons are off continue
JMP                     ; a button is on, do not go forward

; ------------------------------------------------------
; Rotate all bits forward (and last back to first).
; But only when TIMER_0 expires so we keep the speed
; reasonable for humans to play.
; ------------------------------------------------------
ORC     RR              ; 1 -> RR
OEN     RR              ; enable outputs (inputs are already enabled)
STOC    BTN_TGL         ; all buttons are off, reset button toggle indicator

LD      BIT_6           ; preserve bit 6 so it cam be later moved to bit 1
STO     TMP
LD      BIT_5           ; move bit 5 to bit 6
STO     BIT_6
LD      BIT_4           ; move bit 4 to bit 5
STO     BIT_5
LD      BIT_3           ; move bit 3 to bit 4
STO     BIT_4
LD      BIT_2           ; move bit 2 to bit 3
STO     BIT_3
LD      BIT_1           ; move bit 1 to bit 2
STO     BIT_2
LD      TMP             ; move tmp (ex bit 6) to bit 1
STO     BIT_1

; ------------------------------------------------------
; Display the game status by showing on the outputs the values stored in SPR.
; Note: we don't play directly on SPR as that would be confusing as some bits
;   in SPR are used to store temporary values.
; ------------------------------------------------------
LD      BIT_1           ; Display bit 1
STO     LED_1
LD      BIT_2           ; Display bit 2
STO     LED_2
LD      BIT_3           ; Display bit 3
STO     LED_3
LD      BIT_4           ; Display bit 4
STO     LED_4
LD      BIT_5           ; Display bit 5
STO     LED_5
LD      BIT_6           ; Display bit 6
STO     LED_6

; ------------------------------------------------------
; This will cause the code that initialises the game bit
;  to be skipped.
; ------------------------------------------------------
ORC     RR              ; RR=RR|!RR (always 1)

; ------------------------------------------------------
; Trigger timer to get player some time to toggle buttons
; ------------------------------------------------------
STO     TIMER_TRIG      ; Start timer trigger
STOC    TIMER_TRIG

JMP
