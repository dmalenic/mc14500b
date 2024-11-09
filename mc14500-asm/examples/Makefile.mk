MEM_WIDTH?=8
INSTR_POSITION?=last
NON_PROGRAMED_MEMORY?=0
DEPTH?=256

clean_dir:
	rm -f *.mif *.map *.lst *.srec *.hex *.ascii_hex *.bin *.dis *.gz *.zip *.pyc *~ *.bak

%.lst %.srec %.mif %.map %.hex %.ascii_hex %.bin: %.asm
	python3 ../../mc14500.py -I ../include -w $(MEM_WIDTH) -i $(INSTR_POSITION) -n $(NON_PROGRAMED_MEMORY) -d $(DEPTH) \
		-s -x -a -b $<

%.srec.dis: %.srec
	python3 ../../mc14500dis.py $< -w $(MEM_WIDTH) -i $(INSTR_POSITION) -o $@

%.mif.dis: %.mif
	python3 ../../mc14500dis.py $< -w $(MEM_WIDTH) -i $(INSTR_POSITION) -o $@

%.hex.dis: %.hex
	python3 ../../mc14500dis.py $< -w $(MEM_WIDTH) -i $(INSTR_POSITION) -o $@

%.ascii_hex.dis: %.ascii_hex
	python3 ../../mc14500dis.py $< -w $(MEM_WIDTH) -i $(INSTR_POSITION) -o $@

%.bin.dis: %.bin
	python3 ../../mc14500dis.py $< -w $(MEM_WIDTH) -i $(INSTR_POSITION) -o $@

