..\cc65\ca65.exe -g .\%1.s -o .\%1.o -l .\%1.lst --list-bytes 0
..\cc65\ld65.exe -o .\%1.o -Ln .\%1.labels -m .\%1.map -C .\system.cfg .\%1.o