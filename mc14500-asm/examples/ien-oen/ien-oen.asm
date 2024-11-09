; ------------------------------------------------------------
; Demonstrates the effect of IEN and OEN commands on LD, LDC, STO, STOC.
; IN1 is read using LD command, IN2 is read with LDC command.
; IN3 and IN4 control IEN and OEN flags, respectively.
; OUT0, OUT1 show the result of STO commmand on IN1 and IN2.
; OUT2, OUT3 show the consequence of STOC commmand on IN1 and IN2.
; ------------------------------------------------------------

; ------------------------------------------
; Inputs
; ------------------------------------------
IN1     EQU     0x01
IN2     EQU     0x02
IN3     EQU     0x03
IN4     EQU     0x04

; ------------------------------------------
; Outputs
; ------------------------------------------
OUT0    EQU     0x00
OUT1    EQU     0x01
OUT2    EQU     0x02
OUT3    EQU     0x03

IEN IN3
OEN IN4

LD   IN1
STO  OUT0
STOC OUT2
LDC  IN2
STO  OUT1
STOC OUT3

JMP
