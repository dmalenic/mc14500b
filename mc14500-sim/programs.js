import {mc14500Init, mc14500Resize} from './mc14500.js';
import {initRunningLights} from './programs/running_lights.js';
import {init1dConwaysGameOfLife} from './programs/1d_conways_gol.js';
import {initKillTheBit} from './programs/kill_the_bit.js';
import {initSelfTest} from './programs/self_test.js';
import {initJmp} from './programs/jmp.js';
import {initRtnNopO} from './programs/rtn_nopo.js';
import {initRtnNopF} from './programs/rtn_nopf.js';
import {initIonOen} from './programs/ien_oen.js';
import {initSquare} from './programs/square.js';
import {initDieRoll} from './programs/roll_a_die.js';
import {initStepperCwWave} from './programs/stepper_cw_wave.js';
import {initStepperCwFullStep} from './programs/stepper_cw_full_step.js';
import {initStepperCwHalfStep} from './programs/stepper_cw_half_step.js';
import {initAnd} from './programs/and.js';
import {initOr} from './programs/or.js';
import {initNot} from './programs/not.js';
import {initXor} from './programs/xor.js';
import {initNand} from './programs/nand.js';
import {initNor} from './programs/nor.js';
import {initXnor} from './programs/xnor.js';
import {initSrLatch} from './programs/1_bit_sr_latch.js';
import {initJkFlipFlop} from './programs/1_bit_jk_flip_flop.js';
import {init4BitCounter} from './programs/4_bit_counter.js';
import {init4BitDFlipFlopRegister} from './programs/4_bit_d_flip_flop.js';
import {init4BitDLatchRegister} from './programs/4_bit_d_latch.js';
import {init4BitFullAdder} from './programs/4_bit_adder.js';
import {init4BitComparator} from './programs/4_bit_comparator.js';
import {init8BitLfsr} from './programs/8_bit_lfsr.js';
import {initFromGray} from "./programs/from-gray.js";
import {initToGray} from "./programs/to-gray.js";


/**
 * Initializes a program selection radio button. This method is called from the program-specific init_XXX() methods
 * defined in program specific modules.
 * It will create a radio button with the program name and description, and attach a click event listener to it,
 * that will configure the simulator to run the selected program..
 * @param parentElement HTML element to which the radio buttons will be appended
 * @param programName visible program name
 * @param programDesc program description
 * @param programRomContent program ROM content
 * @param programNominalSpeed the delay that program clock timer uses when program is running in a fast mode
 * @param timerMs timer output signal duration in milliseconds
 * @param deluxeFunctionality a function to initialize a deluxe functionality program, null if
 *                            a standard functionality program is selected (default)
 */
export function pgmInitCurrentProgram(parentElement,
                                      programName,
                                      programDesc,
                                      programRomContent,
                                      programNominalSpeed,
                                      timerMs = 0,
                                      deluxeFunctionality = null) {
    let inputEl = document.createElement('input');
    inputEl.setAttribute('type', 'radio');
    inputEl.setAttribute('name', 'program');
    inputEl.addEventListener('click', function () {
        selectProgram(programName, programRomContent, programDesc, programNominalSpeed, timerMs, true,
            deluxeFunctionality || null);
    }, false);
    parentElement.appendChild(inputEl);
    let labelEl = document.createElement('label');
    labelEl.innerHTML = programName;
    parentElement.appendChild(labelEl);
    let brEl = document.createElement('br');
    parentElement.appendChild(brEl);
}


/**
 * Injects program selection radio buttons into the HTML elements with ids 'program_list_left' and 'program_list_right'.
 * The program selection radio buttons are created by calling the pgm_initCurrentProgram() method through the
 * module-specific initXYZ() methods defined in the program-specific modules.
 * At the end, the first radio button is clicked to select the first program in the list to make a default selection.
 */
export function pgmInjectProgramSelection() {
    let programListLeft = document.getElementById('program-list-left');
    let programListRight = document.getElementById('program-list-right');

    init1dConwaysGameOfLife(programListLeft);
    initKillTheBit(programListLeft);
    init8BitLfsr(programListLeft);
    initDieRoll(programListLeft);
    initRunningLights(programListLeft);
    initSelfTest(programListLeft);
    initJmp(programListLeft);
    initRtnNopO(programListLeft);
    initRtnNopF(programListLeft);
    initIonOen(programListLeft);
    initSquare(programListLeft);
    initStepperCwWave(programListLeft);
    initStepperCwFullStep(programListLeft);
    initStepperCwHalfStep(programListLeft);
    initToGray(programListLeft);
    initFromGray(programListLeft);

    initNot(programListRight);
    initAnd(programListRight);
    initOr(programListRight);
    initXor(programListRight);
    initNand(programListRight);
    initNor(programListRight);
    initXnor(programListRight);
    initSrLatch(programListRight);
    initJkFlipFlop(programListRight);
    init4BitFullAdder(programListRight);
    init4BitComparator(programListRight);
    init4BitCounter(programListRight);
    init4BitDFlipFlopRegister(programListRight);
    init4BitDLatchRegister(programListRight);

    programListLeft.getElementsByTagName('input')[0].click();
}


/**
 * This method is called when a program is selected from the program list.
 * @param program program name
 * @param rom program ROM content
 * @param description a short description of the program
 * @param nominalSpeed nominalSpeed value for the program
 * @param timerMs the value to be set to the timerMs variable in the simulator, 0 if selected program does not use a timer
 * @param iLsb true if instruction is 4 least significant bits of rom address value (default), false otherwise
 * @param deluxeFunctionality a function to initialize a deluxe functionality program, null if
 *                            a standard functionality program is selected (default)
 */
function selectProgram(program, rom, description, nominalSpeed, timerMs, iLsb, deluxeFunctionality) {
    document.getElementById('program-name').innerHTML = program;
    document.getElementById('cur-pgm-desc').innerHTML = description;
    mc14500Init(nominalSpeed, rom, timerMs, iLsb);
    if (deluxeFunctionality) {
        deluxeFunctionality();
    }
    mc14500Resize(deluxeFunctionality !== null);
}
