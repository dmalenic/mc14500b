# MC14500 Projects

This project modernizes an old [MC 14500B assembler, disassembler, and web-based simulator](https://www.linurs.org/mc14500.html) initially written by [Urs Lindegger](https://www.linurs.org/).

The project is available on [GitHub](https://github.com/dmalenic/mc14500b/).

## MC14500 Assembler and Disassembler

For more information and detailed documentation, please visit [mc14500b-asm](https://github.com/dmalenic/mc14500b/tree/main/mc14500-asm).

## MC14500 Simulator

For more information and detailed documentation, please visit [mc14500b-sim](https://github.com/dmalenic/mc14500b/tree/main/mc14500-sim).

Try the simulator in a [browser](mc14500-sim/index.html).

## MC14500 Example Programs

The documentation for the example programs can be found in [README](https://github.com/dmalenic/mc14500b/tree/main/README.md#mc14500-demo-programs).

## MC14500 Resources

The following related resources were available on 2025-02-00:

- [MC14500B Datasheet](https://bitsavers.org/components/motorola/14500/MC14500B_Rev3.pdf),

- [MC14500B Industrial Control Unit Handbook](https://bitsavers.org/components/motorola/14500/MC14500B_Industrial_Control_Unit_Handbook_1977.pdf), the alternative download location [archive.org](https://web.archive.org/web/20220220062727/http://bitsavers.org/components/motorola/14500/MC14500B_Industrial_Control_Unit_Handbook_1977.pdf),

- 1978 [Motorola CMOS Integrated Circuits](https://bitsavers.org/components/motorola/_dataBooks/1978_Motorola_CMOS_Data_Book.pdf) Data Book page 358,

- [US Patent 4,153,942](https://patentimages.storage.googleapis.com/4e/ea/42/0ecdf6ebef6592/US4153942.pdf) is Motorola's
  patent for an industrial control processor that describes MC14500 B's internal working,

- [MC14500B Wikipedia Article](https://en.wikipedia.org/wiki/Motorola_MC14500B),

- Urs Lindegger's [MC14500B Simulator](https://www.linurs.org/index.html),

- Yaroslav Veremenko's GitHub page [mc14500-programs](https://github.com/veremenko-y/mc14500-programs),

- Nicola Cimmino's [PLC-14500](https://github.com/nicolacimmino/PLC-14500) GitHub page. The board is available on
  [tindie](https://www.tindie.com/products/nicola_cimmino/plc14500-nano-1-bit-single-board-computer-revc/).

- [Erturk Kocalar's](https://8bitforce.com/) `RetroShield 14500 for Arduino Mega`, see Erturk's [GitLab pages](https://gitlab.com/8bitforce) for:

  - [hardware](https://gitlab.com/8bitforce/retroshield-hw/-/tree/master/hardware/k14500b) and.
  - [software](https://gitlab.com/8bitforce/retroshield-arduino/-/tree/master/k14500b).

  The board is available on [tindie](https://www.tindie.com/products/8bitforce/retroshield-14500-for-arduino-mega/)


## My Programs for Erturk Kocalar's RetroShield 14500

I have [ported](https://github.com/dmalenic/mc14500b/tree/main/8-bit-force/) a few demo programs to Erturk's RetroShield.

- [1D Conway's Game of Life](https://github.com/dmalenic/mc14500b/tree/main/8-bit-force/k14500b_1d_conway_gol) is the port of [One Dimension Conway's Game of Life](https://github.com/dmalenic/mc14500b/#one-dimension-conways-game-of-life).

- [Roll a Die](https://github.com/dmalenic/mc14500b/tree/main/8-bit-force/k14500b_roll_a_die) is another port of a [demo program](https://github.com/dmalenic/mc14500b/#other-demo-programs).

- [Stick 'n Rudder](https://github.com/dmalenic/mc14500b/tree/main/8-bit-force/k14500b_stick_n_rudder) is example how to control the actual hardware using MC14500B.

See [Erturk's GitLab page](https://gitlab.com/8bitforce/retroshield-arduino/-/tree/master/k14500b) for more programs.
