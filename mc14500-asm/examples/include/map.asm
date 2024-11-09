; ------------------------------------------
; Memory and IO mapping for the MC14500 CPU
; ------------------------------------------

; ------------------------------------------
; Inputs
; ------------------------------------------
RR      EQU     0x000  Pin RR is wired to input 0
IN1     EQU     0x001
IN2     EQU     0x002
IN3     EQU     0x003
IN4     EQU     0x004
IN5     EQU     0x005
IN6     EQU     0x006
IN7     EQU     0x007
IN8     EQU     0x008
IN9     EQU     0x009
IN10    EQU     0x00A
IN11    EQU     0x00B
IN12    EQU     0x00C
IN13    EQU     0x00D
IN14    EQU     0x00E
IN15    EQU     0x00F

; ------------------------------------------
; Outputs
; ------------------------------------------
OUT0    EQU     0x400
OUT1    EQU     0x401
OUT2    EQU     0x402
OUT3    EQU     0x403
OUT4    EQU     0x404
OUT5    EQU     0x405
OUT6    EQU     0x406
OUT7    EQU     0x407
OUT8    EQU     0x408
OUT9    EQU     0x409
OUT10   EQU     0x40A
OUT11   EQU     0x40B
OUT12   EQU     0x40C
OUT13   EQU     0x40D
OUT14   EQU     0x40E
OUT15   EQU     0x40F

; ------------------------------------------
; RAM just the first
; ------------------------------------------
RAM00   EQU     0x800
RAM01   EQU     0x801
RAM02   EQU     0x802
RAM03   EQU     0x803
RAM04   EQU     0x804
RAM05   EQU     0x805
RAM06   EQU     0x806
RAM07   EQU     0x807
RAM08   EQU     0x808
RAM09   EQU     0x809
RAM0A   EQU     0x80A
RAM0B   EQU     0x80B
RAM0C   EQU     0x80C
RAM0D   EQU     0x80D
RAM0E   EQU     0x80E
RAM0F   EQU     0x80F
RAM10   EQU     0x810
RAM11   EQU     0x811
RAM12   EQU     0x812
RAM13   EQU     0x813
RAM14   EQU     0x814
RAM15   EQU     0x815
RAM16   EQU     0x816
RAM17   EQU     0x817
RAM18   EQU     0x818
RAM19   EQU     0x819
RAM1A   EQU     0x81A
RAM1B   EQU     0x81B
RAM1C   EQU     0x81C
RAM1D   EQU     0x81D
RAM1E   EQU     0x81E
RAM1F   EQU     0x81F
