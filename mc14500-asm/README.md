# MC14500 Assembler and Disassembler

This project is a modernization of an old [MC 14500B Assembler and Disassembler](https://www.linurs.org/download/mc14500-0.4.tar.gz) written initially
by [Urs Lindegger](https://www.linurs.org/).

The latest version Urs published was 0.4. This project continues with version 0.5.

## What's New

The original was written in Python 2, which was the right choice for 2010 but is no longer supported. Version 0.5 is
written in Python 3. New features are added to the assembler and disassembler. More about it later. It is tested on
Linux and MacOSX but is expected to work on Windows without modifications. Python 3.10 or newer is needed.

## The Overall Project Structure

- [mc14500.py](mc14500.py) is the assembler.

- [mc14500dis.py](mc14500dis.py) is the disassembler.

- [mc14500util.py](mc14500util.py) contains declarations and functions shared between the assembler and the disassembler.

- [examples](examples) the directory with example MC14500B assembler programs.

- [examples/Makefile](examples/Makefile) invokes the assembler and the disassembler on all provided MC14500B example programs.
  Run it from the [examples](examples) directory. It supports the following targets:

  ```
  make clean
  ```

  It removes artifacts produced by the previous invocations of the assembler and the disassembler from all example
  projects.

  ```
  make build
  ```

  It recursively invokes assembler in each [examples](examples) subfolder to produce all supported assembler
  artifacts. After that, the disassembler is invoked on the appropriate assembler artifact to create the corresponding
  `*.dis` files.

  ```
  make pack
  ```

  It packages the content of the `mc14500-asm` directory and subdirectories into `mc14500-0.5.tar.gz` for redistribution.

  ```
  make all
  ```

  It is the equivalent of a `make clean build pack`.

- [examples/Makefile.mk](examples/Makefile.mk) defines sub-targets.

- Each example subdirectory contains its own `Makefile` defining the concrete build targets for that particular example.

- [examples/include](examples/include) contains assembler files with frequently needed declarations and code snippets that other
  assembler files can include. The mnemonics for inputs, outputs, and RAM locations can be found there. A chapter on
  the `mc14500.py` assembler program will describe the inclusion mechanism and mnemonics declarations.

- [examples/mif-parser-test](examples/mif-parser-test) holds files for testing the MIF format parser used
  by `mc14500dis.py`.

Makefile can be invoked with the following arguments that will be internally passed to `mc14500.py`:

- `MEM_WIDTH=<memory-width>`, where _memory-width_ is the width of MC14500 ROM word in bits. The acceptable values are
  `8`, `12`, or `16`. The default value is `8`.

- `INSTR_POSITION=<instruction-position>`, where _instruction-position_ is the position of 4 instruction op-code bits
  within the MC14500 ROM word. The acceptable values are `first` and `last`. `first` indicates that the 4 most
  significant bits are used to encode the MC14500B instruction op-code, and `last` indicates that the 4 least
  significant bits are used to encode the MC14500B instruction op-code. The default value is `last`.

- `NON_PROGRAMED_MEMORY=<non-programmed-memory-value>`, indicating the value to be written into memory locations that
  are not programmed. The allowed values are `0` or `F`. The default value is `F`.

- `DEPTH=<depth-of-rom-memory>`, indicates the maximal size of MC14500B system ROM memory measured in ROM memory words.
  The allowed value is any positive integer multiple of `128` up to and including `65536`. The default value is `256`.

`Makefile` does not allow changing other parameters of the assembler and disassembler from a command line.

## mc14500.py: The Simple Assembler for MC14500B MCU

### Synopsis

```bash
usage: mc14500.py [-h] [-v] [-w {8,12,16}] [-d DEPTH] [-i {first,last}] [-I INCLUDE] [-s] [-x] [-a] [-b] [-n {0,F}] input_file

MC14500 Assembler

positional arguments:
  input_file            the input assembler file

options:
  -h, --help            show this help message and exit
  -v, --version         show program's version number and exit
  -w {8,12,16}, --width {8,12,16}
                        the width of the ROM in bits (8, 12 or 16). The default value is 8.
  -d DEPTH, --depth DEPTH
                        the depth of the ROM in bytes. All positive integer multiples of 128 up to and including 65536 are allowed. The default value is 256.
  -i {first,last}, --instr-position {first,last}
                        the position of the INS field in a command: first|last. The default value is last.
  -I INCLUDE, --include INCLUDE
                        an additional directory to look for include files beside the current working directory
  -s, --srec            generate Motorola S-record file (extension .srec)
  -x, --hex             generate Intel I8HEX file (extension .hex)
  -a, --ascii_hex       generate ASCII HEX file (extension .ascii_hex)
  -b, --binary          generate raw binary file (extension .bin)
  -n {0,F}, --non-programmed-location-value {0,F}
                        the value that is expected to be present in ROM locations that are not part of the program
```

### Description

The `mc14500.py` is the MC14500B assembler written in Python 3. It takes an input file as the argument and, if no error
has been encountered, creates at least 3 output files. The names of created output files are derived from the name of
the input file with the extension replaced:

- The listing file shows a generated machine code for every assembler instruction from the input file. It has a `.lst`
  extension.

- The io-map file lists, for every referenced io-address space location, how many times this location was accessed by
  the instructions that read the value (`LD`, `LDC`, `AND`, `ANDC`, `OR`, `ORC`, `XNOR`, `IEN`, `OEN`), by the
  instructions that write the value (`STO`, `STOC`), or by the instructions that do neither (`NOPO`, `JMP`, `RET`,
  `SKZ`, `NOPF`). It has a `.map` extension.

- The memory initialization file (MIF) contains assembled machine code. It has a `.mif` extension. More information on
  the MIF format can be found at:

    - [Memory Initialization File](https://mil.ufl.edu/4712/docs/mif_help.pdf),

    - Intel Quartus Prime [Memory Initialization File (.mif) Definition](https://www.intel.com/content/www/us/en/programmable/quartushelp/current/index.htm#reference/glossary/def_mif.htm),

    - Linux man page for [srec_mif](https://linux.die.net/man/5/srec_mif).

The `.asm` extension for the input file is recommended but not mandatory. Any extension except the extensions reserved
for the various output files can be used. The produced output files share the same base name as the input file, but the
extension has been replaced.

If one or more errors are encountered, error messages are written to `stderr`. Only the listing file is produced,
containing the exact error messages written to `stderr`. The program exit value is 1.

### Options

- `a`, `--ascii_hex` output assembled machine code in ASCII HEX format. The output file has a `.ascii_hex` extension.

- `-b`, `--binary` output assembled machine code in a raw binary format. The output file has a `.bin` extension.

- `-d DEPTH`, `--depth DEPTH` is the depth of program ROM in words, i.e., the maximal MC14500 instructions for an
  assembled program. Allowed values are all positive multiples of 128 up to and including 65536. The default value
  is 256.

- `-h`, `--help` show the program help information, and exit.

- `-I include-file-name`, `--include include-file-name` the additional location to scan for the include-files besides
  the current working directory.

- `-i {first, last}`, `--instr-position {first, last}` defines the position of the 4 instruction op-code bits within
  the assembled machine code word. The value `first` indicates that the 4 most significant bits are used to encode the
  MC14500B instruction op-code, and the value `last` indicates that the 4 least significant bits are used to encode
  the MC14500B instruction op-code. The default value is `last`.

- `-n {0,F}`, `--non-programmed-location-value {0,F}` defines the value for the ROM memory locations that are not
  explicitly programmed. Allowed values are `0` or `F`. This parameter is combined with the `-w` parameter to produce
  the actual value. So for 8-bit wide ROM, the value is either `00` or `FF`; for 12-bit wide ROM, the value is
  either `000` or `FFF`; and finally, for 16-bit wide ROM, the value is either `0000` or `FFFF`.

- `-s`,  `--srec` output assembled machine code using Motorola S-record format. The output file will have a `.srec`
  extension.

- `-v`, `--version` shows the program version and exits.

- `-w {8, 12, 16}`, `--width {8, 12, 16}` defines the width of the program ROM word in bits. The allowed values are
  `8`, `12`, or `16`. The default value is `8`.

- `-x`, `--hex` output assembled machine code in Intel HEX format (I8HEX flavor). The output file has a `.hex` extension.

### Assembler Directives, Pseudo Instructions, and Numerical Constants

- `identifier EQU value` defines an _identifier_ that, if encountered later in the program, is replaced with the _value_
  before the line is converted to the machine code. The replacement logic is recursive. Recursion should terminate with
  a valid io-address declaration. It is typically used to define a symbolic name for an input, output, or RAM address,
  but it can also be used to specify the instruction alias, see [rtn_jsr.asm](examples/rtn/rtn_jsr.asm).

  Numerical constants can be written using `C` and `Python` notation. Motorola `6803` assembler and `DASM` immediate
  operand syntax are also supported. See examples in [equ.asm](examples/org_and_equ_tests/equ.asm). All
  the following numerical constants are valid representations of the number eleven:
  `11`, `0xB`, `013`, `0o13`, `0b1011`, `#11`, `#$B`, `#013`, and `#%1011`.

- `ORG number` sets the current value of a program counter to the _number_. An attempt to write twice to the same
  program counter location results in an error. The rules representing the _number_ are the same as those defining
  the _value_ part of the `EQU` directive.

- `LUT identifier number` defines an _identifier_ that, if encountered within one of the following instructions `NOPO`,
  `JMP`, `RET`, `NOPF`, the assembler will replace it with a provided _number_. The _name_ must be defined within a
  program as a _label_. See examples in [jmp.asm](examples/jmp/jmp.asm), [rtn_jsr.asm](examples/rtn/rtn_jsr.asm), [rtn_nopf.asm](examples/rtn/rtn_nopf.asm),
  and [rtn_nopo.asm](examples/rtn/rtn_nopo.asm).

- `identifier:` an identifier followed by a column as the first word in an assembler file line defines a label.
  Labels are matched against the _identifiers_s defined by `LUT` directives, and the _identifier_ is associated with the
  program counter value at the _label_ location.

### Lookup Table

Suppose one or more `LUT` directives are encountered within the MC14500 program. In that case, for every output file the
assembler produces, an additional output file is produced, encoding the content of the lookup table using the same
format as the original output file. The extra output file name has a `_lut` designator before the extension. The
exception is the assembler listing file `.lst`; the lookup table is instead appended to the end of the listing file.

The lookup table size is equal to the size of the io-address space. The locations that were not explicitly defined by
`LUT` directives have the value `0`.

### Include Functionality

Assembler supports an implicit include functionality. It may be used to simulate simple macros.

Suppose a _word_ is encountered on the 1st position in the non-comment line that is not an MC14500B instruction nor an
assembler pseudo instruction. The program will look for a file with the same name as the encountered _word_ (but in a
lowercase) and the extension `.asm`, first in the current directory, then in the directory specified by the `-I` or
`--include` command line argument. If such a file has been found, it is assembled, and the generated machine code is
injected into the current location.

### Examples

The following examples assume that they are executed from the [examples](examples) directory:

- The simplest usage example is

  ```bash
  ../mc14500.py -I include/ 1d-conways-gol/1d-conways-gol.asm
  ```
  It outputs the following message on the screen:
  ```bash
  
  MC14500B Assembler
  Based on the original work of Urs Lindegger.
  see https://www.linurs.org/mc14500.html
  Version 0.5
  
  ROM depth: 256 [words]
  ROM width: 8 [bits]
  The 4 least significant bits are the MC14500B instruction op-code,
  and the other bits are the IO-address. This might be different
  on your hardware since it is external to the mc14500 chip.
  
  LST file:  1d-conways-gol/1d-conways-gol.lst created
  Mif file:  1d-conways-gol/1d-conways-gol.mif created
  Map file:  1d-conways-gol/1d-conways-gol.map created
  Assembler succeeded
  ```
  And produces the following 3 files:
    - `1d-conways-gol/1d-conways-gol.lst` - the assembler listing file,
    - `1d-conways-gol/1d-conways-gol.mif` - the machine code in Memory Interchange Format,
    - `1d-conways-gol/1d-conways-gol.map` - the io-address usage mapping file.


- This example overrides default compilation arguments related to ROM size:

  ```bash
  ../mc14500.py -I include/ -n F -i first -d 512 -w 12 1d-conways-gol/1d-conways-gol.asm
  ```
  It outputs the following message on the screen:
  ```bash
  
  MC14500B Assembler
  Based on the original work of Urs Lindegger.
  see https://www.linurs.org/mc14500.html
  Version 0.5
  
  ROM depth: 512 [words]
  ROM width: 12 [bits]
  The 4 most significant bits are the MC14500B instruction op-code
  and the other bits are the IO-address. This might be different
  on your hardware since it is external to the mc14500 chip.
  
  LST file:  1d-conways-gol/1d-conways-gol.lst created
  Mif file:  1d-conways-gol/1d-conways-gol.mif created
  Map file:  1d-conways-gol/1d-conways-gol.map created
  Assembler succeeded
  ```
  Note the difference in reported ROM depth and width.

- Next is the identical example as above but using the long parameters form

  ```bash
  ../mc14500.py --include include/ --non-programmed-location-value F --instr-position first --depth 512 --width 12 1d-conways-gol/1d-conways-gol.asm
  ```
  It outputs the same message on the screen:
  ```bash
  
  MC14500B Assembler
  Based on the original work of Urs Lindegger.
  see https://www.linurs.org/mc14500.html
  Version 0.5
  
  ROM depth: 512 [words]
  ROM width: 12 [bits]
  The 4 most significant bits are the MC14500B instruction op-code
  and the other bits are the IO-address. This might be different
  on your hardware since it is external to the mc14500 chip.
  
  LST file:  1d-conways-gol/1d-conways-gol.lst created
  Mif file:  1d-conways-gol/1d-conways-gol.mif created
  Map file:  1d-conways-gol/1d-conways-gol.map created
  Assembler succeeded
  ```

- The following example requests additional `.srec`, `.hex`, and `bin` outputs

  ```bash
  ../mc14500.py -I include/ -s -x -a -b 1d-conways-gol/1d-conways-gol.asm
  ```
  It outputs the following message on the screen:
  ```bash
  
  MC14500B Assembler
  Based on the original work of Urs Lindegger.
  see https://www.linurs.org/mc14500.html
  Version 0.5
  
  ROM depth: 256 [words]
  ROM width: 8 [bits]
  The 4 least significant bits are the MC14500B instruction op-code,
  and the other bits are the IO-address. This might be different
  on your hardware since it is external to the mc14500 chip.
  
  LST file:  1d-conways-gol/1d-conways-gol.lst created
  Mif file:  1d-conways-gol/1d-conways-gol.mif created
  SREC file:  1d-conways-gol/1d-conways-gol.srec created
  Intel HEX file (I8HEX flavor):  1d-conways-gol/1d-conways-gol.hex created
  Ascii hex file:  1d-conways-gol/1d-conways-gol.ascii_hex created
  Binary file:  1d-conways-gol/1d-conways-gol.bin created
  Map file:  1d-conways-gol/1d-conways-gol.map created
  Assembler succeeded
  ```
  Note the 7 output files are produced:

    - `1d-conways-gol/1d-conways-gol.lst` - the assembler listing file,
    - `1d-conways-gol/1d-conways-gol.mif` - the machine code in Memory Interchange Format,
    - `1d-conways-gol/1d-conways-gol.srec` - the machine code in Motorola S-record format,
    - `1d-conways-gol/1d-conways-gol.hex` - the machine code in Intel's HEX format (I8HEX flavor),
    - `1d-conways-gol/1d-conways-gol.ascii_hex` - the machine code in ASCII HEX format,
    - `1d-conways-gol/1d-conways-gol.bin` - the machine code as raw bytes,
    - `1d-conways-gol/1d-conways-gol.map` - the io-address usage mapping file.

## mc14500dis.py: The Simple Disassembler for MC14500B MCU

### Synopsis

```bash
usage: mc14500dis.py [-h] [-o OUT] [-v] [-w {8,12,16}] [-i {first,last}] input_file

MC14500 Disassembler

positional arguments:
  input_file            input file name. The input file must have extension .mif, .srec, .hex, .ascii_hex or .bin

options:
  -h, --help            show this help message and exit
  -o OUT, --out OUT     OUT is the output file name. The default value is the input file name with appended .dis extension.
  -v, --version         show program's version number and exit
  -w {8,12,16}, --width {8,12,16}
                        the width of the ROM in bits (8, 12 or 16). It is ignored for MIF files. The default value is 8.
  -i {first,last}, --instr-position {first,last}
                        position of INS field in a command: first|last. The default value is last.
```

#### Description

The `mc14500dis.py` is the MC14500B disassembler written in Python 3. It takes an input file as the argument and creates
the output files containing the assembler listing if no error has been encountered. The extension of the input file
indicates the expected input file format. The following extensions are supported:

- `.mif` - the input file is a Memory Exchange Format file,

- `.srec` - the input file is Motorola SREC file,

- `.hex` - the input file is an Intel HEX file in I8HEX flavor,

- `.ascii_hex` - the input file is the ASCII HEX file,

- `.bin` - the input file is a raw binary file.

If an error is encountered, it is written to `stderr`, and no or partial output is produced.

If the output file already exists, the program will ask for confirmation before continuing to prevent accidental overwriting.

### Options

- `-h`, `--help` show the program help information, and exit.

- `-i {first, last}`, `--instr-position {first, last}` defines the position of the 4 instruction op-code bits within
  the assembled machine code word. The value `first` indicates that the 4 most significant bits are used to encode the
  MC14500B instruction op-code, and the value `last` indicates that the 4 least significant bits are used to encode
  the MC14500B instruction op-code. The default value is `last`.

- `-o OUT`, `--out OUT` where OUT defines the output file name. The default is the input file name with appended `.dis`
  extension.

- `-v`, `--version` show the program version and exit.

- `-w {8, 12, 16}`, `--width {8, 12, 16}` defines the width of the program ROM word in bits. The allowed values are
  `8`, `12`, or `16`. The default value is `8`. It is ignored for `.mif` extensions.

### Examples

The examples assume that they are executed from the [examples](examples) directory.

- The first example disassembles the `1d-conways-gol.mif` file:

  ```bash
  ../mc14500dis.py 1d-conways-gol/1d-conways-gol.mif
  ```
  It outputs the following message on the screen:
  ```bash
  
  MC14500B Disassembler
  Based on the original work of Urs Lindegger.
  see https://www.linurs.org/mc14500.html
  
  Output file exists, overwrite? (y/n):
  y
  Memory Initialization File (MIF) selected.
  ROM depth: 0 [words]
  ROM width: 8 [bits]
  The 4 least significant bits are the MC14500B instruction op-code.
  Version 0.5
  
  Disassembler succeeded.
  Asm file:  1d-conways-gol/1d-conways-gol.mif.dis  created.
  ```
  And produces the following output file:

  - `1d-conways-gol/1d-conways-gol.mif.dis` - the disassembled program listing.
  
  Please note that the file `1d-conways-gol/1d-conways-gol.mif.dis` was already present, so the disassembler asked for
  a confirmation before overwriting the output file.

- The second example disassembles the `1d-conways-gol.srec` file assembled for a device with 16-bit ROM width and 512-bit
  ROM depth that expects the INS field on the 4 most significant positions of the op-code.
  The output file with a name `1d-conways-gol/1d-conways-gol.w2.srec.asm` was requested:

  ```bash
  ../mc14500dis.py -w 16 -i first 1d-conways-gol/1d-conways-gol.srec -o 1d-conways-gol/1d-conways-gol.w2.srec.asm
  ```
  It outputs the following message on the screen:
  ```bash
  
  MC14500B Disassembler
  Based on the original work of Urs Lindegger.
  see https://www.linurs.org/mc14500.html
  
  Motorola S record file selected.
  ROM depth: 0 [words]
  ROM width: 16 [bits]
  The 4 most significant bits are the MC14500B instruction op-code.
  Version 0.5
  
  Disassembler succeeded.
  Asm file:  1d-conways-gol/1d-conways-gol.w2.srec.asm  created.
  ```
  And produces the following output file:
  - `1d-conways-gol/1d-conways-gol.w2.srec.asm` - the disassembled program listing.

- The final example attempts to disassemble an unsupported input format:

 ```bash
  ../mc14500dis.py 1d-conways-gol/1d-conways-gol.lst
  ```
  It outputs the following message on the screen:
  ```bash  
  
  MC14500B Disassembler
  Based on the original work of Urs Lindegger.
  see https://www.linurs.org/mc14500.html
  
  Error: Unsupported input file format .lst.
  Note:  The extension determines the input file format.
  Supported input file formats are:
  - Memory Initialization File (.mif),
  - Motorola S-record in S19-style (.srec),
  - Intel HEX (.hex),
  - ASCII HEX (.ascii_hex),
  - raw binary (.bin).
  
  ```
  No output file is produced.
