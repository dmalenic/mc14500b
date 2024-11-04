
include ./Makefile.mk

pack:
	cd .. && tar czf mc14500-0.5.tar.gz *.py README.md .gitignore examples/Makefile* examples/*/*.asm examples/*/Makefile*

all: clean build pack

build:
	for dir in *; do \
		$(MAKE) -C $$dir build; \
	done

clean:
	rm -f ../mc14500-0.5.tar.gz
	$(MAKE) clean_dir
	for dir in *; do \
		$(MAKE) -C $$dir clean_dir; \
	done

