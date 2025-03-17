#!/usr/bin/env bash

# ca65 and ld65 are available on Ubuntu or other Debian Linux systems (including RaspberyPi OS)
# as part of `cc65` 6502 cross-development package. Install them using `apt` command:
# sudo apt install cc65 cc65-doc

if [ "$1+" == "+" ] ; then
	echo "No input file specified. Please specify the input assembler file withut '.s' extension"
	exit 1
fi

ca65 -g ./$1.s -o ./$1.o -l ./$1.lst --list-bytes 0
ld65 -o ./$1.o -Ln ./$1.labels -m ./$1.map -C ./system.cfg ./$1.o

xxd $1.o | sed -e 's/^.*: //' -e 's/  .*$//' -e 's/ //g' -e 's/\(.\)\(.\)/0x\1\2, /g' -e 's/^/  /' > $1.hex

