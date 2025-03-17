#if !defined(_TIMER_EMUL_H)
#define _TIMER_EMUL_H

#include "Arduino.h"
#include "memorymap.h"
#include "portmap.h"

// Timer support

#define TIMER_ADDR          (0b1111)      // default timer is on address 0b1111
#define uP_TIMER_TRIGGER    uP_OUTP_D7    // default timer activation pin is uP_OUTP_D7


////////////////////////////////////////////////////////////////////
// Timer duration is TIMER_EMUL_COUNTER / uP_CLOCK_FREQ_HZ
// Setting TIMER_EMUL_COUNTER to 0 disables the timer functionality,
// and enables uP_KEY7 to be used as a normal key.
////////////////////////////////////////////////////////////////////

#define TIMER_EMUL_COUNTER       (0)           // Disabled


#if TIMER_EMUL_COUNTER

bool timer_activation_flag = false;
unsigned timer_val = 0;

inline __attribute__((always_inline))
void update_timer_activation_state(bool flag)
{
  // timer should behave as monostabile multivibrator that activates on zero to one transition
  if (flag && !timer_activation_flag && !timer_val)
  {
    timer_val = TIMER_EMUL_COUNTER;
  }
  digitalWriteFast(uP_TIMER_TRIGGER, flag);
  timer_activation_flag = flag;
}

inline __attribute__((always_inline))
void update_timer_state()
{
  // keeping timer_activation_flag ON should not extend timer duration
  if (timer_val)
  {
    --timer_val;
  }
}

inline __attribute__((always_inline))
bool read_timer_state() { return timer_val != 0; }

#else

inline __attribute__((always_inline))
void update_timer_state() {}

inline __attribute__((always_inline))
void update_timer_activation_state(__attribute__((unused))bool flag) {}

inline __attribute__((always_inline))
bool read_timer_state() { return false; }

#endif  // TIMER_EMUL_COUNTER


#endif  // _TIMER_EMUL_H

