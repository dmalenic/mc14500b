import {pgmInitCurrentProgram} from '../programs.js';


export function initKillTheBit(programSelector) {
    pgmInitCurrentProgram(programSelector, `Kill the bit`,
        `The port of Kill the Bit game for Altair by Dean McDaniel, May 15, 1975.<br/>
        Kill the rotating bit (OUT1-OUT6). If you miss the lit bit, another bit turns on, leaving<br/>
        &nbsp;two bits to destroy.<br/>
        Quickly toggle the correct switch (IN1-IN6) on and off at the right moment.<br/>
        Don't leave the switch in the on position, or the game will pause.`,
        rom, 0, 350);
}


// noinspection SpellCheckingInspection
const rom = [
    //  ------------------------------------------------------------------------------
    //  Kill the bit for mc14500.
    // 
    //  The game idea itself is from a game for the Altair by Dean McDaniel in 1975.
    //  Reference:
    //    https://altairclone.com/downloads/killbits.pdf
    // 
    //  Original Description:
    //    Object: Kill the rotating bit. If you miss the lit bit, another
    //    bit turns on leaving two bits to destroy. Quickly
    //    toggle the switch, don't leave the switch in the up
    //    position. Before starting, make sure all the switches
    //    are in the down position.
    // 
    // The idea to implement it on the MC14500 came to me after watching demonstration
    // of the original game on Altair 8800 replica:
    //   https://www.youtube.com/watch?v=ZKeiQ8e18QY.
    // and the following video by Usagi Electric:
    //   https://www.youtube.com/watch?v=md_cPxVDqeM
    //
    // The implementation was somewhat influenced by Yaroslav Veremenko's:
    //   https://github.com/veremenko-y/mc14500-programs/blob/main/sbc1/killthebit.s
    // and Nicola Cimmino's:
    //   https://github.com/nicolacimmino/PLC-14500/blob/master/tools/assembler/examples/killthebit.asm
    //  ------------------------------------------------------------------------------

    // ------------------------------------------------------
    // Initialization code to enable input and output.
    // Note: Reset ensures that RR is 0 when we hit this line the 1st time.
    //       Program should ensure that it is 1 every other time the following line
    //       is hit.
    // ------------------------------------------------------
    0xF8,       // STO     TMP             ; Preserve RR (0 the 1st time, 1 all other times)
    0x06,       // ORC     RR              ; 1 -> RR
    0x0A,       // IEN     RR              ; Enable inputs
    0x0B,       // OEN     RR              ; Enable outputs
    0xF1,       // LD      TMP             ; Restore RR

    // ------------------------------------------------------
    //  The STO BIT_6 is executed only once because after the first loop RR=1
    //  (see last line of the whole program), so when the following code is executed
    //  againg memory initialization will be skipped.
    // ------------------------------------------------------
    0x02,       // LDC     RR              ; Set RR to 1 only in the 1st loop (reset sets RR to 0)
    0x0E,       // SKZ                     ; RR did not change in last 3 instruction so in
                //                         ;  the first loop
    0xE8,       // STO     BIT_6           ; initialise memory bit 6 with 1, it will be rotated
                //                         ; to bit 1 before visualizing initial state

    // ------------------------------------------------------
    //  Enable reading buttons only if timer is on and a button has not been set yet.
    //  Limiting to only one toggle per cycle is necessary to prevent flipping
    //    the same bit on and off random number of times withing the same cycle.
    // ------------------------------------------------------
    0x71,       // LD      TIMER_OUT       ; if timer is on
    0x84,       // ANDC    BTN_TGL         ;   and button toggle indicator is off
                //                         ;   i.e., no button toggle detected yet
    0x0A,       // IEN     RR              ;     enable inputs
    0x0B,       // OEN     RR              ;     enable outputs

    // ------------------------------------------------------
    //  Kill (or set) the bit on pos 1.
    //  The bit will be killed if the button is pressed while it's high.
    // ------------------------------------------------------
    0x11,       // LD      BUTTON_1
    0x0E,       // SKZ                     ; Skip next instruction if input is not set
    0x88,       // STO     BTN_TGL         ; Indicate input is toggled
    0x97,       // XNOR    BIT_1
    0x99,       // STOC    BIT_1
    0x19,       // STOC    LED_1           ; Reflect immediately on output for visual feedback

    // ------------------------------------------------------
    //  Kill (or set) the bit on pos 2.
    //  The bit will be killed if the button is pressed while it's high.
    // ------------------------------------------------------
    0x21,       // LD      BUTTON_2
    0x0E,       // SKZ                     ; Skip next instruction if input is not set
    0x88,       // STO     BTN_TGL         ; Indicate input is toggled
    0xA7,       // XNOR    BIT_2
    0xA9,       // STOC    BIT_2
    0x29,       // STOC    LED_2           ; Reflect immediately on output for visual feedback

    // ------------------------------------------------------
    //  Kill (or set) the bit on pos 3.
    //  The bit will be killed if the button is pressed while it's high.
    // ------------------------------------------------------
    0x31,       // LD      BUTTON_3
    0x0E,       // SKZ                     ; Skip next instruction if input is not set
    0x88,       // STO     BTN_TGL         ; Indicate input is toggled
    0xB7,       // XNOR    BIT_3
    0xB9,       // STOC    BIT_3
    0x39,       // STOC    LED_3           ; Reflect immediately on output for visual feedback

    // ------------------------------------------------------
    //  Kill (or set) the bit on pos 4.
    //  The bit will be killed if the button is pressed while it's high.
    // ------------------------------------------------------
    0x41,       // LD      BUTTON_4
    0x0E,       // SKZ                     ; Skip next instruction if input is not set
    0x88,       // STO     BTN_TGL         ; Indicate input is toggled
    0xC7,       // XNOR    BIT_4
    0xC9,       // STOC    BIT_4
    0x49,       // STOC    LED_4           ; Reflect immediately on output for visual feedback

    // ------------------------------------------------------
    //  Kill (or set) the bit on pos 5.
    //  The bit will be killed if the button is pressed while it's high.
    // ------------------------------------------------------
    0x51,       // LD      BUTTON_5
    0x0E,       // SKZ                     ; Skip next instruction if input is not set
    0x88,       // STO     BTN_TGL         ; Indicate input is toggled
    0xD7,       // XNOR    BIT_5
    0xD9,       // STOC    BIT_5
    0x59,       // STOC    LED_5           ; Reflect immediately on output for visual feedback

    // ------------------------------------------------------
    //  Kill (or set) the bit on pos 6.
    //  The bit will be killed if the button is pressed while it's high.
    // ------------------------------------------------------
    0x61,       // LD      BUTTON_6
    0x0E,       // SKZ                     ; Skip next instruction if input is not set
    0x88,       // STO     BTN_TGL         ; Indicate input is toggled
    0xE7,       // XNOR    BIT_6
    0xE9,       // STOC    BIT_6
    0x69,       // STOC    LED_6           ; Reflect immediately on output for visual feedback

    // ------------------------------------------------------
    //  Repeat reading buttons while timer is on
    // ------------------------------------------------------
    0x06,       // ORC     RR              ; 1 -> RR
    0x0A,       // IEN     RR              ; enable input to read the timer state
    0x71,       // LD      TIMER_OUT       ; Is timer on?
    0x0E,       // SKZ                     ; no -> continue
    0x0C,       // JMP                     ; yes, keep reading and applying buttons (note: RR is 1)

    // ------------------------------------------------------
    //  If this point has been reached timer signal has ended
    //  so all buttons must be off
    //  Block if a button is still on
    // ------------------------------------------------------
    0x71,       // LD      TIMER_OUT       ; should be 0
    0x15,       // OR      BUTTON_1
    0x25,       // OR      BUTTON_2
    0x35,       // OR      BUTTON_3
    0x45,       // OR      BUTTON_4
    0x55,       // OR      BUTTON_5
    0x65,       // OR      BUTTON_6
    0x0E,       // SKZ                     ; Iff all buttons are off continue
    0x0C,       // JMP                     ; a button is on, do not go forward

    // ------------------------------------------------------
    //  Rotate all bits forward (and last back to first).
    //  But only when TIMER_0 expires so we keep the speed
    //  reasonable for humans to play.
    // ------------------------------------------------------
    0x06,       // ORC     RR              ; 1 -> RR
    0x0B,       // OEN     RR              ; enable outputs (inputs are already enabled)
    0x89,       // STOC    BTN_TGL         ; all buttons are off, reset button toggle indicator

    0xE1,       // LD      BIT_6
    0xF8,       // STO     TMP
    0xD1,       // LD      BIT_5
    0xE8,       // STO     BIT_6
    0xC1,       // LD      BIT_4
    0xD8,       // STO     BIT_5
    0xB1,       // LD      BIT_3
    0xC8,       // STO     BIT_4
    0xA1,       // LD      BIT_2
    0xB8,       // STO     BIT_3
    0x91,       // LD      BIT_1
    0xA8,       // STO     BIT_2
    0xF1,       // LD      TMP
    0x98,       // STO     BIT_1

    // ------------------------------------------------------
    //  Display the game status by showing on the outputs the values stored in SPR.
    //  Note: we don't play directly on SPR as that would be confusing as some bits
    //    in SPR are used to store temporary values.
    // ------------------------------------------------------
    0x91,       // LD      BIT_1
    0x18,       // STO     LED_1
    0xA1,       // LD      BIT_2
    0x28,       // STO     LED_2
    0xB1,       // LD      BIT_3
    0x38,       // STO     LED_3
    0xC1,       // LD      BIT_4
    0x48,       // STO     LED_4
    0xD1,       // LD      BIT_5
    0x58,       // STO     LED_5
    0xE1,       // LD      BIT_6
    0x68,       // STO     LED_6

    // ------------------------------------------------------
    0x06,       // ORC     RR              ; RR=RR|!RR (always 1)
                //  This will cause the code that initialises the game bit
                //    be skipped.

    0x78,       // STO     TIMER_TRIG      ; Start timer trigger
    0x79,       // STOC    TIMER_TRIG

    0x0C,       // JMP
];
