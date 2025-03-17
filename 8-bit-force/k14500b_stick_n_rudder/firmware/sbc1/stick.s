; ===============================================================
; Stick
; It monitors a rotary endocer and
; - if it detects the clockwise direction rotation it sends 11110000
;   over the SPI interface,
; - if it detects the counter-clockwise direction rotation it sends
;   00001111 over the SPI interface.
;
; ===============================================================
; Rotary encoder definition:
;
;     --CW  dir-->
;       ___     ___
; A : _|   |___|
;         ___     _
; B : ___|   |___|
;
;     <--CCW dir--
;
; CW  direction: ..->11->01->00->10->11->..
; CCW direction: ..->11->10->00->01->11->..
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


.include "system.inc"


TMP     = MEM0
PREV_A  = MEM1
PREV_B  = MEM2
NEW_A   = MEM3 
NEW_B   = MEM4
DIR_CW  = MEM5
DIR_CCW = MEM6

PIN_A   = IN1
PIN_B   = IN2

PIN_CS  = OUT1
PIN_CLK = OUT2
PIN_MOSI= OUT3


.macro spi_send_dir_bit dir_bit
        orc     RR
        sto     PIN_CLK
        ld      dir_bit
        sto     PIN_MOSI
        orc     RR
        stoc    PIN_CLK        
        nop0
        nop0
.endmacro

.macro spi_send_byte

        stoc    PIN_CLK
        stoc    PIN_MOSI

        ; set CS to low
        stoc    PIN_CS

        nop0

        ; send 8 bits
        spi_send_dir_bit DIR_CW
        spi_send_dir_bit DIR_CW
        spi_send_dir_bit DIR_CW
        spi_send_dir_bit DIR_CW
        spi_send_dir_bit DIR_CCW
        spi_send_dir_bit DIR_CCW
        spi_send_dir_bit DIR_CCW
        spi_send_dir_bit DIR_CCW

        ; set MOSI low and CS high, RR is 1
        nop0
        stoc    PIN_MOSI
        nop0
        sto     PIN_CS
.endmacro


.segment "CODE"

; ===============================================================
; Initialize
; ===============================================================

        orc     RR
        ien     RR
        oen     RR

; ===============================================================
; Make sure SPI interface is in idle state
; ===============================================================

        sto     PIN_CS

; ===============================================================
; Load new rotary encoder state 
; ===============================================================

        ; read rotary encoder state and store it for the rest of cycle
        ld      PIN_A 
        sto     NEW_A
        ld      PIN_B
        sto     NEW_B

; ===============================================================
; If no change on inputs, shorcut the cycle
; ===============================================================

        ld      PREV_A
        xnor    NEW_A   ; RR=1 if NEW_A==PREV_A
        sto     TMP
        ld      PREV_B
        xnor    NEW_B   ; RR=1 if NEW_B==PREV_B
        and     TMP     ; RR=1 if NEW_A==PREV_A and NEW_B==PREV_B
        skz             ; if RR==0 there was a rotation
        jmp
 
        sto     DIR_CW  ; assume no CW rotation
        sto     DIR_CCW ; assume no CCW rotation

; ===============================================================
; Try to prove CW direction:
; 11->01 or 01->00 or 00->10 or 10->11
; ===============================================================

        ; 11->01
        ld      PREV_A
        and     PREV_B
        andc    NEW_A
        and     NEW_B
        skz
        sto     DIR_CW

        ; 01->00
        ldc     PREV_A
        and     PREV_B
        andc    NEW_A
        andc    NEW_B
        skz
        sto     DIR_CW

        ; 00->10
        ldc     PREV_A
        andc    PREV_B
        and     NEW_A
        andc    NEW_B
        skz
        sto     DIR_CW

        ; 10->11
        ld      PREV_A
        andc    PREV_B
        and     NEW_A
        and     NEW_B
        skz
        sto     DIR_CW

; ===============================================================
; Try to prove CCW direction:
; 11->10 or 10->00 or 00->01 or 01->11
; ===============================================================

        ; 11->10
        ld      PREV_A
        and     PREV_B
        and     NEW_A
        andc    NEW_B
        skz
        sto     DIR_CCW

        ; 10->00
        ld      PREV_A
        andc    PREV_B
        andc    NEW_A
        andc    NEW_B
        skz
        sto     DIR_CCW

        ; 00->01
        ldc     PREV_A
        andc    PREV_B
        andc    NEW_A
        and     NEW_B
        skz
        sto     DIR_CCW

        ; 01->11
        ldc     PREV_A
        and     PREV_B
        and     NEW_A
        and     NEW_B
        skz
        sto     DIR_CCW

; ===============================================================
; Preserve PIN_A, PIN_B in PREV_A, PREV_B
; ===============================================================

        ld      NEW_A
        sto     PREV_A
        ld      NEW_B
        sto     PREV_B

; ===============================================================
; Send the SPI message if either CW or CCW rotation is detected
; but not if both i.e. ignore ambiguous input.
; ===============================================================

        ; check if DIR_CW == DIR_CCW, if so, it is either no rotation
        ; or an ambiguous situation so do not send a command
        ld      DIR_CW
        xnor    DIR_CCW
        skz
        jmp
        
        orc     RR
        oen     RR

        spi_send_byte

; ===============================================================
; Iddle the rest of a cycle - the rudder program is almost
; 256 instructions long and the stick program can not send
; commands faster than the rudder program can execute them.
; ===============================================================


