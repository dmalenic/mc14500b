; -------------------------------------------------
; Test the mc14500 board
; -------------------------------------------------
; call the init program
INIT

; test input first button and copy it to LED
LD   BUTTON0
STO  LED0
STO  LED4

; test input 2nd button and copy it to ram and then to LED
LD   BUTTON1
STO  LED1
STO  RAM5
LD   RAM5
STO  LED5

; test input 3rd button and copy it IO and then to LED
LD   BUTTON2
STO  LED2
STO  RAM1
LD   RAM1
STO  LED6

; test input 4th button and copy it to RAM, IO and then to LED
LD   BUTTON3
STO  RAM2
LD   RAM2
STO  RAM3
LD   RAM3
STO  LED3
STO  LED7

JMP
