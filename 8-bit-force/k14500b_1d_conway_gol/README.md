# k14500b 1D Conway's Game of Life

`k14500b_1d_conways_gol` implements 1-dimensional Conway's Game of Life in a circular 7-cell world.

The initial state of the world is defined using input buttons IN1 to IN5.
Pressing a button switches the state of the corresponding cell between live and dead.
IN6 is used to start and stop the simulation. 

The state of the world is shown on outputs OUT0 to OUT7. 

The program extends the Arduino monitor provided by [Erturk's Killbit example](https://gitlab.com/8bitforce/retroshield-arduino/-/tree/master/k14500b/k14500b_killbit)
with a timer functionality that is implemented in `timer_emull.h`. 

The board push buttons can emulate toggle-switch functionality using code in `push_button.h`. 

The monitor's .ino file is modified according to [Motorola MC14500B Industrial Control Unit Handbook](https://gitlab.com/8bitforce/retroshield-arduino/-/blob/master/k14500b/Motorola_MC14500B_Industial_Control_Unit_Handbook.pdf)
Chapter 12 Adding Jumps, Conditional Branches, and Subroutines. 
The `JMP`, `NOP0`, and `NOPF` commands differ slightly  from the original Erturk's code. 
It also required a slight modification of Yaroslav's `system.inc` to allow NOP0 and NOPF to accept an argument.
The code for `killbit` and `serial hello` in `memorymap.h` is modified accordingly.

`firmware/cc65` contains the 