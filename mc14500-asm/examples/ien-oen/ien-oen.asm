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
IN1     EQU     01
IN2     EQU     02
IN3     EQU     03
IN4     EQU     04

; ------------------------------------------
; Outputs
; ------------------------------------------
OUT0    EQU     00
OUT1    EQU     01
OUT2    EQU     02
OUT3    EQU     03

IEN IN3
OEN IN4

LD   IN1
STO  OUT0
STOC OUT2
LDC  IN2
STO  OUT1
STOC OUT3

JMP
