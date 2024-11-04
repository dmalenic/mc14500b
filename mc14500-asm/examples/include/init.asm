; ----------------------------------------
; Initialize the MC14500
; ----------------------------------------
MC14500MAP

; WIRED TO THE MC14500
BUTTON0 EQU     IN1
BUTTON1 EQU     IN2
BUTTON2 EQU     IN3
BUTTON3 EQU     IN4

LED0    EQU     OUT0
LED1    EQU     OUT1
LED2    EQU     OUT2
LED3    EQU     OUT3
LED4    EQU     OUT4
LED5    EQU     OUT5
LED6    EQU     OUT6
LED7    EQU     OUT7

; Creates 1 in RR via RR pin wired back to input 0
; and then move the 1 as output data it into
; IEN and OEN to initialize the chip
ORC     RR
IEN     RR
OEN     RR
