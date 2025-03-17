#if !defined(_JMP_JSR_LUT_H)
#define _JMP_JSR_LUT_H

#include <Arduino.h>

#include "memorymap.h"

////////////////////////////////////////////////////////////////////
// defines mapping between uP_IODDR and uP_ADDR to extend destination
// range for 
////////////////////////////////////////////////////////////////////

// the default mapping for backward compatibility with
// `k14500b_killbit` and `k14500b_serial_hello`
word lut[] = { 
  ROM_START+0x00, ROM_START+0x01, ROM_START+0x02, ROM_START+0x03,
  ROM_START+0x04, ROM_START+0x05, ROM_START+0x06, ROM_START+0x07,
  ROM_START+0x08, ROM_START+0x09, ROM_START+0x0A, ROM_START+0x0B,
  ROM_START+0x0C, ROM_START+0x0D, ROM_START+0x0E, ROM_START+0x0F,
};

// update individaul LUT table entry
void define_lut_entry(byte io_address, byte rom_address)
{
  if (io_address > 0x0F) {
    Serial.println("Invalid IO address for LUT entry");
    return;
  }

  lut[io_address] = ROM_START+rom_address;
}

////////////////////////////////////////////////////////////////////
// define LUT entries here...
////////////////////////////////////////////////////////////////////
void add_lut_entries()
{
  // following entries match roll a die program defined in memorymap.h
  define_lut_entry(1, 0x80);        // location of a code that displays 1
  define_lut_entry(2, 0x90);        // location of a code that displays 2
  define_lut_entry(3, 0xA0);        // location of a code that displays 3
  define_lut_entry(4, 0xB0);        // location of a code that displays 4
  define_lut_entry(5, 0xC0);        // location of a code that displays 5
  define_lut_entry(6, 0xD0);        // location of a code that displays 6
  define_lut_entry(0x0F, 0xF0);     // location of a code that waits for IN1 to be released
}

#endif      // _JMP_JSR_LUT_H
