# MC14500 Simulator

This project is a modernization of the [MC 14500B Simulator](https://www.linurs.org/mc14500sim/index.html) originally written by [Urs Lindegger](https://www.linurs.org/).

## What's New

- It uses a modern JavaScript module system to simplify debugging, modifying, and extending code.

- Adds timer to the simulated MC14500-based system. The timer is triggered by output 7, and its output is linked to
  input 7.

- The program counter wraps around after 256 instructions.

- It provides multiple demo programs in a form ready for the simulator to run, e.g., One Dimension Conway's Game of
  Life, Kill the Bit, etc.

- All provided demo programs are directly loadable, and the simulated program can be changed on the fly without
  reloading the page.

- An API is provided for a demo program to customize the simulator behavior:

    - A selected program can influence the simulation clock speed to make the visualization more effective.

    - The selected program can specify the timer millisecond interval from 1 to the maximum allowed timer interval of
      100s (100,000 ms).

    - The demo program can display a short description and usage instructions when the program is selected.

- A simulator can simulate optional additional external hardware like a lookup table and a LIFO RAM that can be
  combined with `JMP`, `NOPO`, `NOPF`, and `RET` instructions to implement `go-to` and `subroutine` calls. See
  `MC14500B Industrial Control Unit Handbook` Chapter 12 Adding Jumps, Conditional Branches, And Subroutines. The link
  to the _bitsavers_ version of the document is provided in the [MC14500 Resources](../README.md#mc14500-resources)
  section.

  The following example programs demonstrate those features: [jmp.js](programs/jmp.js), [rtn_nopf.js](programs/rtn_nopf.js),
  and [rtn_nopo.js](programs/rtn_nopo.js).

## Simulator Structure

- [index.html](index.html) - The HTML file that loads the simulator. The background image visualizes a minimal MC14500
  system having eight inputs, eight outputs, 8-bit internal scratch RAM, and 256-byte ROM is defined as an embedded SVG
  document. It can be accessed and manipulated using JavaScript.

- [mc14500.js](mc14500.js) - The javascript file that implements the MC14500 simulator.

- [programs.js](programs.js) - The javascript file that hooks to the MC14500 simulator with a program repository. It
  provides a list of programs that the simulator can run, handles the program selection, and loads the selected program
  into the simulator.

- [programs](programs) - This is the repository of MC14500 programs that the simulator can run.

