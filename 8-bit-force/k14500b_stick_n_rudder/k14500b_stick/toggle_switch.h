#if !defined(_TOGGLE_SWITHC_H)
#define _TOGGLE_SWITHC_H

#include "Arduino.h"
#include "memorymap.h"
#include "portmap.h"

byte port_read(word addr);

////////////////////////////////////////////////////////////////////
// Define which push-button is to emaulate a toggle switch.
////////////////////////////////////////////////////////////////////

// IN0 is not used
// the default configuration, all switches act as push-buttons
const bool TOGGLE_IN1 = false;
const bool TOGGLE_IN2 = false;
const bool TOGGLE_IN3 = false;
const bool TOGGLE_IN4 = false;
const bool TOGGLE_IN5 = false;
const bool TOGGLE_IN6 = false;
const bool TOGGLE_IN7 = false;

static bool state[8] = { 0 };
static bool value[8] = { 0 };

inline __attribute__((always_inline))
bool is_toggle_switch(word addr)
{

#if defined(_TIMER_EMUL_H)
# if (TIMER_EMUL_COUNTER) && (TIMER_ADDR != 0b1111)
#error "Modify the code below to match the timer configuration"
# endif
#endif

  switch(addr)
  {
    /* SCRATCH MEMORY, 8x1 bits */
    case 0b0000:  
    case 0b0001:
    case 0b0010:
    case 0b0011:
    case 0b0100:
    case 0b0101:
    case 0b0110:  
    case 0b0111:  return false;             // Catch all for memory
    /* INPUT Ports, 1-bit */
    case 0b1000:  return false;             // !!! Read back RR bit
    case 0b1001:  return TOGGLE_IN1;
    case 0b1010:  return TOGGLE_IN2;
    case 0b1011:  return TOGGLE_IN3;
    case 0b1100:  return TOGGLE_IN4;
    case 0b1101:  return TOGGLE_IN5;
    case 0b1110:  return TOGGLE_IN6;
#if defined(_TIMER_EMUL_H) && (TIMER_EMUL_COUNTER)
    // only if timer is defined and enabled
    case 0b1111:  return false;
# else
    case 0b1111:  return TOGGLE_IN7;
# endif
    default:
      Serial.println("ERR: port read address out of range");
      return false;
  }
}

inline __attribute__((always_inline))
uint8_t toggle_switch_read(uint8_t addr, uint8_t offset)
{
  // pressing a push-button toggles switch value, releasing it does not change the value
  byte data = !digitalReadFast(addr);
  if (!state[offset] && data)
  {
    value[offset] = !value[offset];
  }
  state[offset] = data;
  return value[offset];
}

inline __attribute__((always_inline))
uint8_t toggle_switch_read(uint8_t addr)
{
  byte data;

#if defined(_TIMER_EMUL_H)
# if ((TIMER_EMUL_COUNTER) && TIMER_ADDR != 0b1111)
#error "Modify the code below to match the timer configuration"
# endif
#endif

  switch(addr)
  {
    /* INPUT Ports, 1-bit */
    case 0b1001:  data = toggle_switch_read(uP_KEY1, 1); break;
    case 0b1010:  data = toggle_switch_read(uP_KEY2, 2); break;
    case 0b1011:  data = toggle_switch_read(uP_KEY3, 3); break;
    case 0b1100:  data = toggle_switch_read(uP_KEY4, 4); break;
    case 0b1101:  data = toggle_switch_read(uP_KEY5, 5); break;
    case 0b1110:  data = toggle_switch_read(uP_KEY6, 6); break;
    case 0b1111:
#if defined(_TIMER_EMUL_H) && (TIMER_EMUL_COUNTER)
    // only if timer is defined and enabled
      data = 0x00;
      Serial.println("ERR: timer port read address out of range for a toggle_switche");
#else
      data = toggle_switch_read(uP_KEY7, 7);
#endif
      break;
    default:
      data = 0x00;
      Serial.println("ERR: port read address out of range for a toggle_switche");
  }

  return data;      
}

#endif    // _TOGGLE_SWITCH_H
