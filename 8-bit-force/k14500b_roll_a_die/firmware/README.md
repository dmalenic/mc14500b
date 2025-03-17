Erturk's Note:

https://github.com/veremenko-y/mc14500-programs

These files are from Yaroslav Veremenko's repo, included for completeness. I didn't  know enough to modify powershell scripts so I created bat files to compile: ".\sbc1\mybuild.bat %filename%"


Note from Yaroslov's repo:

https://github.com/veremenko-y/mc14500-programs
================================================
README.MD

# Collection of programs for MC14500

## Build

Building requires ca65.exe and ld65.exe placed in `cc65/` folder.
Run PowerShell script `./build.ps1`.


## Build on Linux

Damir's Note:

Using your distribution packet manager, add `cc65` and `cc65-doc` packages.
`ca65` and `ld65` programs are included in `cc65` package.

Run `mybuild.sh` providing the program file without `.s` extension as the argument.
