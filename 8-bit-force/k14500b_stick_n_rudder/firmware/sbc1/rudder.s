; ===============================================================
; Rudder:
; - It rotates the stepper motor clocwise when it receives the
;   byte 0b11110000 over SPI interface.
; - It rotates the stepper motor counter-clocwise when it receives
;   the byte 0b00001111 over SPI interface.
;
; ===============================================================
; SPI: Mode 1, CPOL 0, CPHA 1
;             __                                    _
;   CS      :   |__________________________________|
;                 _   _   _   _   _   _   _   _
;  CLK      : ___|1|_|2|_|3|_|4|_|5|_|6|_|7|_|8|_____
;                  _______________
; MISO (CW) : ____|               |__________________
;                                  ________________
; MISO (CCW): ____________________|                |_
;
; ===============================================================
; Unipolar Stepper Full Drive CW
;      ___     ___     __
; A : |   |___|   |___|  
;        ___     ___     
; B : __|   |___|   |___|
;          ___     ___   
; C : |___|   |___|   |__
;     __     ___     ___ 
; D :   |___|   |___|   |
;     1 2 3 4 5 6 7 8 9 A
; ===============================================================
; Unipolar Stepper Full Drive CCW
;     __     ___     ___ 
; A :   |___|   |___|   |
;          ___     ___   
; B : |___|   |___|   |__
;        ___     ___     
; C : __|   |___|   |___|
;      ___     ___     __
; D : |   |___|   |___|  
;     1 2 3 4 5 6 7 8 9 A
; ===============================================================



.include "system.inc"


DIR_CW  = MEM0
DIR_CCW = MEM1

PIN_CS  = IN1
PIN_CLK = IN2
PIN_MOSI= IN3

PIN_A   = OUT0
PIN_B   = OUT1
PIN_C   = OUT2
PIN_D   = OUT3

LOOP_CS = 1

DELAY   = 5


.macro delay t
        .repeat t, I
        nop0
        .endrepeat
.endmacro


.macro pulse_cw
;       ___     ___     ___        
; A : _|   |___|   |___|   |_______
;         ___     ___     ___      
; B : ___|   |___|   |___|   |_____
;           ___     ___     ___    
; C : _____|   |___|   |___|   |___
;             ___     ___     ___  
; D : _______|   |___|   |___|   |_
;      1 2 3 4 5 6 7 8 9 A B C D E
        ; assume RR is 1
        ; 1
        sto     PIN_A
        delay   (DELAY+1)
        ; 2
        sto     PIN_B
        delay   DELAY
        ; 3
        stoc    PIN_A
        sto     PIN_C
        delay   DELAY
        ; 4
        stoc    PIN_B
        sto     PIN_D
        delay   DELAY
        ; 5
        stoc    PIN_C
        sto     PIN_A
        delay   DELAY
        ; 6
        stoc    PIN_D
        sto     PIN_B
        delay   DELAY
        ; 7
        stoc    PIN_A
        sto     PIN_C
        delay   DELAY
        ; 8
        stoc    PIN_B
        sto     PIN_D
        delay   DELAY
        ; 9
        stoc    PIN_C
        sto     PIN_A
        delay   DELAY
        ; A
        stoc    PIN_D
        sto     PIN_B
        delay   DELAY
        ; B
        stoc    PIN_A
        sto     PIN_C
        delay   DELAY
        ; C
        stoc    PIN_B
        sto     PIN_D
        delay   DELAY
        ; D
        stoc    PIN_C
        delay   (DELAY+1)
        ; E
        stoc    PIN_D
.endmacro


.macro pulse_ccw
;             ___     ___     ___  
; A : _______|   |___|   |___|   |_
;           ___     ___     ___    
; B : _____|   |___|   |___|   |___
;         ___     ___     ___      
; C : ___|   |___|   |___|   |_____
;       ___     ___     ___
; D : _|   |___|   |___|   |_______
;      1 2 3 4 5 6 7 8 9 A B C D E 
        ; assume RR is 1
        ; 1
        sto     PIN_D
        delay   (DELAY+1)
        ; 2
        sto     PIN_C
        delay   DELAY
        ; 3
        stoc    PIN_D
        sto     PIN_B
        delay   DELAY
        ; 4
        stoc    PIN_C
        sto     PIN_A
        delay   DELAY
        ; 5
        stoc    PIN_B
        sto     PIN_D
        delay   DELAY
        ; 6
        stoc    PIN_A
        sto     PIN_C
        delay   DELAY
        ; 7
        stoc    PIN_D
        sto     PIN_B
        delay   DELAY
        ; 8
        stoc    PIN_C
        sto     PIN_A
        delay   DELAY
        ; 9
        stoc    PIN_B
        sto     PIN_D
        delay   DELAY
        ; A
        stoc    PIN_A
        sto     PIN_C
        delay   DELAY
        ; B
        stoc    PIN_D
        sto     PIN_B
        delay   DELAY
        ; C
        stoc    PIN_C
        sto     PIN_A
        delay   DELAY
        ; D
        stoc    PIN_B
        delay   (DELAY+1)
        ; E
        stoc    PIN_A
.endmacro


.segment "CODE"

; ===============================================================
; Initialize
; ===============================================================

        orc     RR
        ien     RR
        oen     RR

; ===============================================================
; Perform the CSP read. This is not the most generic implemetation
; but it will be good enough for the purpose.
; 1. Wait for CS to get low
; 2. Wait for approx. 2 bytes to be transmitted and then read DIR_CW.
; 3. Wait for approx. 4 bytes to be transmitted and then read DIR_CCW.
; ===============================================================

        ld      PIN_CS
        skz
        jmp             ; CS is high loop again
        .repeat 12,I
        nop0
        .endrepeat
        ld      PIN_MOSI
        sto     DIR_CW
        .repeat 40,I
        nop0
        .endrepeat
        ld      PIN_MOSI
        sto     DIR_CCW
        ; ignore the remaining of SPI transmittion        

; ===============================================================
; If DIR_CW output the required Stepper Pattern
; ===============================================================

        oen     DIR_CW
        orc     RR
        pulse_cw

; ===============================================================
; If DIR_CCW output the required Stepper Pattern
; ===============================================================

        oen     DIR_CCW
        orc     RR
        pulse_ccw

; ===============================================================
; Loop to start
; ===============================================================

        jmp

