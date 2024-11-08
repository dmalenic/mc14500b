/**
 * MC14500 Simulator based on previous work by urs@linurs.org <a href="https://www.linurs.org/mc14500/Mc14500Simulator.html"/>
 */

let pc = 0;
let rr = 0;
let ien = 0;
let oen = 0;
let jmp = 0;
// noinspection SpellCheckingInspection
let nopo = 0;
// noinspection SpellCheckingInspection
let nopf = 0;
let rtn = 0;
let skip = 0;
let write = 0;
let dir = 0;
let data = 0;
let outputData = 0;
let inputData = 0;
let ienInputData = 0;
let x1 = 0;

let run = false;
let clk = null;
let fast = false;
let slowSpeedDelay = 100;
let fastSpeedDelay = 0;     // fastSpeedDelay is set by the program selection;

let command = 0;
let inst = 0;
let ioAddress = 0;
let opCode = '';

let output = [0, 0, 0, 0, 0, 0, 0, 0];
let input = [0, 0, 0, 0, 0, 0, 0, 0];
let ram = [0, 0, 0, 0, 0, 0, 0, 0];

let insLsb = true;
const IO_WIDTH = 4;
const MAX_ROM = 256;
let rom = [];

let lut = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,];
let lifo = [];
let jsr = null;
let jumpExecuted = false;

// timer declarations
let tmr0 = null;
let hasTimer = false;
let tmr0CurCount = 0;
let tmr0MaxCount = 0;
let tmr0LastTime = 0;
let tmr0CurTime = 0;

// noinspection SpellCheckingInspection
const NOPO = 'NOPO';
const LD = 'LD';
const LDC = 'LDC';
// noinspection SpellCheckingInspection
const NOPF = 'NOPF';
const AND = 'AND';
// noinspection SpellCheckingInspection
const ANDC = 'ANDC';
const OR = 'OR';
const ORC = 'ORC';
const XNOR = 'XNOR';
const STO = 'STO';
// noinspection SpellCheckingInspection
const STOC = 'STOC';
const IEN = 'IEN';
const OEN = 'OEN';
const JMP = 'JMP';
const RTN = 'RTN';
const SKZ = 'SKZ';
const OPCODES = [NOPO, LD, LDC, AND, ANDC, OR, ORC, XNOR, STO, STOC, IEN, OEN, JMP, RTN, SKZ, NOPF];

const WHITE = '#ffffff';
const RED = '#ff0000';
const BLACK = '#000000';


/**
 * Initializes the MC14500 simulator for a given program, reset inputs, outputs, ram, initialize timer and trigger the
 * reset pin to reset MC14500B internal state and pc.
 * @param programFastModeDelay - the delay a clock timer uses when program is running in a fast mode
 * @param programRom - program rom content
 * @param newTimerMaxCount - maximum count for the timer, 0 means no timer functionality required
 * @param newInsLsb - true if instruction is 4 least significant bits of rom address value (default), false otherwise
 */
export function mc14500Init(programFastModeDelay, programRom, newTimerMaxCount = 0,
                            newInsLsb = true) {
    fastSpeedDelay = programFastModeDelay;
    rom = programRom;
    if (newTimerMaxCount < 0) {
        console.log(`Invalid timer max count: ${newTimerMaxCount}, must be >= 0`);
        newTimerMaxCount = 0;
    } else if (newTimerMaxCount > 100000) {
        console.log(`Invalid timer max count: ${newTimerMaxCount}, must be <= 100000`);
        newTimerMaxCount = 100000;
    }
    tmr0MaxCount = newTimerMaxCount;
    insLsb = newInsLsb;

    hasTimer = tmr0MaxCount > 0;
    tmr0CurCount = 0;
    tmr0LastTime = tmr0CurTime = 0;
    input = [0, 0, 0, 0, 0, 0, 0, 0];
    output = [0, 0, 0, 0, 0, 0, 0, 0];
    ram = [0, 0, 0, 0, 0, 0, 0, 0];
    run = false;

    lut = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,];
    lifo = [];
    jsr = null;

    makeTimerVisible(hasTimer);
    // make sure that visual representation of all inputs and the timer is correct
    const no_inputs = hasTimer ? 7 : 8;
    for (let i = 0; i < no_inputs; i++) {
        visualizeInputSignal(i);
    }
    if (hasTimer) {
        visualizeTimerState();
    }
    visualizeLifo();
    visualizeLut();

    mc14500Reset();
}


export function mc14500Resize(deluxe = false) {
    const content = document.getElementById('content');
    const svg = document.getElementById('svg-simulator-main');
    const extension = document.getElementById('deluxe-extension');
    const instrBusExt = document.getElementById('instruction-bus-ext');
    const addressBusPush = document.getElementById('address-bus-push');
    const addressBusPop = document.getElementById('address-bus-pop');
    const clear = document.getElementById('clear');
    const tClear = document.getElementById('t-clear');
    const rectBackgroundPanel = document.getElementById('rect-background-panel');
    const rectBackgroundPanelDeluxe = document.getElementById('rect-background-panel-deluxe');
    const tpcSetAddr = document.getElementById('pc-set-addr');
    tpcSetAddr.innerHTML = '';
    const setPc = document.getElementById('set-pc');
    const tSetPc = document.getElementById('t-set-pc');
    const popDeluxe = document.getElementById('pop-deluxe');
    const tPopDeluxe = document.getElementById('t-pop-deluxe');
    const pushFlagODeluxe = document.getElementById('push-flag-o-deluxe');
    const pushFlagO1Deluxe = document.getElementById('push-flag-o-1-deluxe');
    const tPushFlagODeluxe = document.getElementById('t-push-flag-o-deluxe');
    const pushFlagFDeluxe = document.getElementById('push-flag-f-deluxe');
    const pushFlagF1Deluxe = document.getElementById('push-flag-f-1-deluxe');
    const tPushFlagFDeluxe = document.getElementById('t-push-flag-f-deluxe');
    const lookupInDeluxe = document.getElementById('lookup-in-deluxe');
    const lutLookupDeluxe = document.getElementById('lut-lookup-deluxe');
    const lutLookupOrGateDeluxe = document.getElementById('lut-lookup-or-deluxe');
    const jmpDeluxe = document.getElementById('jmp-deluxe');

    if (deluxe) {
        content.className = 'content-wide';
        svg.style.width = '1000px';
        svg.style.height = '692px';
        svg.viewBox.baseVal.width = 1000;
        svg.viewBox.baseVal.height = 692;
        rectBackgroundPanel.style.height = '648px';
        rectBackgroundPanelDeluxe.style.height = '648px';
        extension.style.display = 'inherit';
        instrBusExt.style.display = 'inherit';
        addressBusPush.style.display = 'inherit';
        addressBusPop.style.display = 'inherit';
        clear.style.display = 'none';
        tClear.style.display = 'none';
        tpcSetAddr.style.display = 'inherit';
        setPc.style.display = 'inherit';
        tSetPc.style.display = 'inherit';
        popDeluxe.style.display = jsr ? 'inherit' : 'none';
        tPopDeluxe.style.display = jsr ? 'inherit' : 'none';
        pushFlagODeluxe.style.display = jsr === NOPO ? 'inherit' : 'none';
        pushFlagO1Deluxe.style.display = jsr === NOPO ? 'inherit' : 'none';
        tPushFlagODeluxe.style.display = jsr === NOPO ? 'inherit' : 'none';
        pushFlagFDeluxe.style.display = jsr === NOPF ? 'inherit' : 'none';
        pushFlagF1Deluxe.style.display = jsr === NOPF ? 'inherit' : 'none';
        tPushFlagFDeluxe.style.display = jsr === NOPF ? 'inherit' : 'none';
        lookupInDeluxe.style.display = jsr ? 'inherit' : 'none';
        lutLookupDeluxe.style.display = jsr ? 'inherit' : 'none';
        lutLookupOrGateDeluxe.style.display = jsr ? 'inherit' : 'none';
        jmpDeluxe.style.display = jsr ? 'none' : 'inherit';
    } else {
        content.className = 'content';
        svg.style.width = '640px';
        svg.style.height = '630px';
        svg.viewBox.baseVal.width = 640;
        svg.viewBox.baseVal.height = 630;
        rectBackgroundPanel.style.height = '608px';
        rectBackgroundPanelDeluxe.style.height = '608px';
        extension.style.display = 'none';
        instrBusExt.style.display = 'none';
        addressBusPush.style.display = 'none';
        addressBusPop.style.display = 'none';
        clear.style.display = 'inherit';
        tClear.style.display = 'inherit';
        setPc.style.display = 'none';
        tSetPc.style.display = 'none';
        tpcSetAddr.style.display = 'none';
        popDeluxe.style.display = 'none';
        tPopDeluxe.style.display = 'none';
        pushFlagODeluxe.style.display = 'none';
        pushFlagO1Deluxe.style.display = 'none';
        tPushFlagODeluxe.style.display = 'none';
        pushFlagFDeluxe.style.display = 'none';
        pushFlagF1Deluxe.style.display = 'none';
        tPushFlagFDeluxe.style.display = 'none';
        lookupInDeluxe.style.display = 'none';
        lutLookupDeluxe.style.display = 'none';
        lutLookupOrGateDeluxe.style.display = 'none';
        jmpDeluxe.style.display = 'none';
    }
}


/**
 * Sets the value of the lifo stack at the given address.
 * @param lutAddress
 * @param lutValue
 * @returns {boolean}
 */
export function mc14500SetLut(lutAddress, lutValue) {
    if (lutAddress < 0) {
        console.log(`Invalid lut address: ${lutAddress}`);
        return false;
    }
    if (lutAddress >= lut.length) {
        console.log(`Invalid lut address: ${lutAddress}`);
        return false;
    }
    if (lutValue < 0) {
        console.log(`Invalid lut value: ${lutValue}`);
        return false;
    }
    if (lutValue >= MAX_ROM) {
        console.log(`Invalid lut value: ${lutValue}`);
        return false;
    }
    lut[lutAddress] = lutValue;
    visualizeLut();
    return true;
}


export function mc14500SetJsr(value) {
    if (jsr) {
        console.log(`jsr already set to: ${jsr}`);
        return false;
    }
    if (value !== NOPO && value !== NOPF) {
        console.log(`Invalid jsr value: ${value}, must be either ${NOPO} or ${NOPF}.`);
        return false;
    }
    jsr = value;
    return true;
}


/**
 * A callback that reads the input signals from the html page when an input is clicked on.
 * @param i - input signal number
 */
export function mc14500ToggleInput(i) {
    // if input 7 is wired to the timer it should not react to user input
    if (hasTimer && i === 7) return;

    input[i] = inv(input[i]);

    visualizeInputSignal(i);
}


/**
 * Runs the simulator with continuous clock pulses.
 */
export function mc14500Run() {
    run = !run;
    if (run) {
        x1 = 1;
        clk = setTimeout(processClkSignal, fast ? fastSpeedDelay : slowSpeedDelay);
        updateHtml();
    }
    const stopped = !run;
    programSelectionChangeable(stopped);
    singleStepEnabled(stopped);
    updateHtml();
}


/**
 * Resets the simulator
 */
export function mc14500Reset() {
    if (clk) {
        clearTimeout(clk);
    }
    clk = null;
    resetInternalState();
    processSignals();
    updateHtml();
    // make sure that reset signal is visible for 100ms and no clock signal is generated during this time
    visualizeResetSignal(true);
}


/**
 * Handles user initiated change in the fast of simulator
 */
export function mc14500Speed() {
    fast = !fast;
    document.getElementById('btn-speed').innerHTML = fast ? 'Slow' : 'Fast';
}


/**
 * Simulates x1 clock signal transition down in single step mode
 */
export function mc14500StepDown() {
    if (!run) {
        x1Up();
    }
}


/**
 * Simulates x1 clock signal transition up in single step mode
 */
export function mc14500StepUp() {
    x1Down();
}


/**
 * Enables or disables program selection radio buttons.
 * @param changeable
 */
function programSelectionChangeable(changeable) {
    document.getElementById('program-selection')
            .querySelectorAll('input')
            .forEach(function (el) {
        el.disabled = !changeable;
    });
}


/**
 * Enables or disables single step button.
 * @param enabled
 */
function singleStepEnabled(enabled) {
    let el = document.getElementById('btn-step');
    el.disabled = !enabled;
}


/**
 * Resets the state of the MC14500B registers and pins.
 */
function resetInternalState() {
    if (clk) {
        clearTimeout(clk);
    }
    clk = null;
    pc = 0;
    rr = 0;
    ien = 0;
    oen = 0;
    jmp = 0;
    nopo = 0;
    nopf = 0;
    rtn = 0;
    skip = 0;
    write = 0;
    dir = 0;
    data = 0;
    outputData = 0;
    inputData = 0;
    ienInputData = 0;
    x1 = 1;
    lifo = [];
}


function inv(n) {
    return n === 1 ? 0 : 1;
}


function getIO() {
    if (ioAddress === 0) {
        return (rr);
    } else if (ioAddress < 8) {
        return (input[ioAddress]);
    } else return (ram[ioAddress - 8]);
}


function putIO(val) {
    if (ioAddress < 8) {
        output[ioAddress] = val;
    } else {
        ram[ioAddress - 8] = val;
    }
}


/**
 * negative clock edge, mc14500 latches instruction and processes
 */
function x1Down() {
    x1 = 0;
    nopo = 0;
    nopf = 0;
    rtn = 0;
    jmp = 0;
    jumpExecuted = false;

    if (skip === 0) {
        switch (opCode) {
            case NOPO:
                nopo = 1;
                break;
            case LD:
                rr = ienInputData;
                break;
            case LDC:
                rr = inv(ienInputData);
                break;
            case AND:
                rr = rr & ienInputData;
                break;
            case ANDC:
                rr = rr & inv(ienInputData);
                break;
            case OR:
                rr = rr | ienInputData;
                break;
            case ORC:
                rr = rr | inv(ienInputData);
                break;
            case XNOR:
                if (rr === ienInputData) rr = 1
                else rr = 0;
                break;
            case STO:
                if (oen === 1) {
                    putIO(rr);
                    // WRITE = 1; old code
                }
                outputData = rr;
                break;
            case STOC:
                if (oen === 1) {
                    putIO(inv(rr));
                    // WRITE = 1; old code
                }
                outputData = inv(rr);
                break;
            case IEN:
                ien = inputData;
                break;
            case OEN:
                oen = inputData;
                break;
            case JMP:
                jmp = 1;
                jumpExecuted = true;
                pc = lut[ioAddress];
                break;
            case RTN:
                skip = 1;
                if (lifo.length > 0) {
                    pc = lifo.pop();
                    jumpExecuted = true;
                }
                rtn = 1;
                break;
            case SKZ:
                if (rr === 0) {
                    skip = 1;
                }
                break;
            case NOPF:
                nopf = 1;
                break;
        }
        if ((opCode === STO) || (opCode === STOC)) {
            write = 1;
            dir = 1;
        } else {
            write = 0;
            dir = 0;
        }
        if (jsr === opCode) {
            lifo.push(pc);
            pc = lut[ioAddress];
            jumpExecuted = true;
        }
        processSignals();
        updateHtml();
    } else {
        processSignals();
        updateHtml();
        skip = 0;
    }
}


/**
 * positive clock edge, program counter update, mc14500 writes DATA
 */
function x1Up() {
    x1 = 1;
    if (jumpExecuted === true) {
        // do nothing
    } else {
        pc += 1;
    }
    if (pc >= MAX_ROM) {
        // rollover
        pc = 0;
    }
    write = 0; // falling edge writes

    processSignals();
    updateHtml();
}


/**
 * It does not produce any event just make sure all signals are consistent.
 */
function processSignals() {
    if (rom && pc < rom.length) {
        command = rom[pc];
    } else {
        command = 0; // NOP0 assumed
    }

    if (insLsb) {
        inst = (command % 16);
        ioAddress = ((command - inst) / 16);
        ioAddress = Math.floor(ioAddress);
    } else {
        ioAddress = (command % 16);
        inst = ((command - ioAddress) / 16);
        inst = Math.floor(inst);
    }
    const maxIoAddress = (1 << IO_WIDTH)
    if (ioAddress < 0 || ioAddress >= maxIoAddress) {
        console.log(`Invalid ioAddress: ${ioAddress} maxIoAddress:  ${maxIoAddress}`);
    }
    ioAddress = ioAddress % maxIoAddress;
    if (dir === 0) {
        data = inputData;
    } else {
        data = outputData;
    }
    opCode = OPCODES[inst % OPCODES.length];
    inputData = getIO();
    ienInputData = ien & inputData;

    if (hasTimer && output[7] !== 0 && tmr0CurCount <= 0) {
        tmr0CurCount = tmr0MaxCount;
        input[7] = 1;
        tmr0CurTime = Date.now();
        tmr0 = setTimeout(processTimerSignals, 0);
    }
}


/**
 * Clock signal for the simulator
 */
function processClkSignal() {
    if (run) {
        if (x1 === 0) {
            x1Up()
        } else {
            x1Down();
        }
        clk = setTimeout(processClkSignal, fast ? fastSpeedDelay : slowSpeedDelay);
    } else {
        clearTimeout(clk);
        clk = null;
    }
}


/**
 * Timer signal for the simulator.
 */
function processTimerSignals() {
    // if expired turn the signal off, and reset timer state to idle
    if (tmr0CurCount <= 0) {
        input[7] = 0;
        clearTimeout(tmr0);
        tmr0CurCount = tmr0LastTime = tmr0CurTime = 0;
    } else {
        tmr0 = setTimeout(processTimerSignals, 0);
        // count down the timer
        tmr0LastTime = tmr0CurTime;
        tmr0CurTime = Date.now();
        const diff = tmr0CurTime - tmr0LastTime;
        tmr0CurCount -= diff > 0 ? diff : 0;
    }
}


function visualizeInputSignal(i) {
    let s = 'input' + i.toString();
    let e = document.getElementById(s);
    let ts = 't-' + s;
    let te = document.getElementById(ts);
    let mpe = document.getElementById('mp-' + s);
    visualizeSignal(e, te, mpe, input[i] === 1);
}


function visualizeResetSignal(on) {
    {
        const e = document.getElementById('rst');
        const te = document.getElementById('t-rst');
        const mpe = document.getElementById('mp-rst');
        visualizeSignal(e, te, mpe, on);
    }
    {
        const e = document.getElementById('rst-1');
        const mpe = document.getElementById('mp-rst-1');
        visualizeSignal(e, null, mpe, on);
    }
    {
        const e = document.getElementById('rst-deluxe');
        const te = document.getElementById('t-rst-deluxe');
        visualizeSignal(e, te, null, on);
    }
    {
        const e = document.getElementById('rst-lifo-deluxe');
        visualizeSignal(e, null, null, on);
    }
    if (on) {
        setTimeout(function () {
            visualizeResetSignal(false);
        }, 200);
    } else if (run) {
        clk = setTimeout(processClkSignal, fast ? fastSpeedDelay : slowSpeedDelay);
    }
}


/**
 *  update signals visual representation based on the value
 */
function visualizeSignal(e, te, mpe, value) {
    if (value) {
        if (e) e.style.stroke = RED;
        if (te) te.style.fill = RED;
        if (mpe) {
            mpe.style.fill = RED;
            mpe.style.stroke = RED;
        }
    } else {
        if (e) e.style.stroke = BLACK;
        if (te) te.style.fill = BLACK;
        if (mpe) {
            mpe.style.fill = BLACK;
            mpe.style.stroke = BLACK;
        }
    }
}


/**
 * Visualizes the timer signal
 */
function visualizeTimerState() {
    if (hasTimer) {
        const e2 = document.getElementById('tmr0');

        if (tmr0CurCount > 0) {
            e2.style.fill = RED;
            e2.innerHTML = (tmr0CurCount % 100000).toString();
        } else {
            e2.style.fill = WHITE;
            e2.innerHTML = '0';
        }

        // update the output from tmr0 (input7) signals
        // noinspection SpellCheckingInspection
        visualizeSignal(
            document.getElementById('input7'),
            document.getElementById('t-input7'),
            document.getElementById('mp-input7'),
            input[7] === 1);
        visualizeSignal(document.getElementById('input7-1'), null, null, input[7] === 1);
    }
}


function visualizeLifo() {
    let i = 0;
    for (; i < lifo.length; i++) {
        const s = i.toString(16).toUpperCase();
        const tk = document.getElementById('t-lifo-deluxe-key' + s);
        tk.innerHTML = s;
        tk.style.fill = WHITE;
        const tv = document.getElementById('t-lifo-deluxe-val' + s);
        tv.innerHTML = '0x' + lifo[i].toString(16).toUpperCase().padStart(2, '0');
        tk.style.fill = WHITE;
    }
    for (; i < 16; i++) {
        const s = i.toString(16).toUpperCase();
        const tk = document.getElementById('t-lifo-deluxe-key' + s);
        tk.innerHTML = '';
        tk.style.fill = BLACK;
        const tv = document.getElementById('t-lifo-deluxe-val' + s);
        tv.innerHTML = '';
        tk.style.fill = BLACK;
    }
}


function visualizeLut() {
    for (let i = 0; i < 16; i++) {
        const s = i.toString(16).toUpperCase();
        const val = lut[i];
        const tk = document.getElementById('t-lut-deluxe-key' + s);
        tk.innerHTML = s;
        tk.style.fill = val === 0 ? WHITE : RED;
        const tv = document.getElementById('t-lut-deluxe-val' + s);
        tv.innerHTML = '0x' + val.toString(16).toUpperCase().padStart(2, '0');
        tv.style.fill = val === 0 ? WHITE : RED;
    }
}


/**
 * Updates the html page with the current state of the simulator.
 */
// noinspection SpellCheckingInspection
function updateHtml() {
    const pcStr = '0x' + pc.toString(16).toUpperCase().padStart(2, '0');
    const commandStr = '0x' + command.toString(16).toUpperCase().padStart(2, '0');
    const instStr = '0x' + inst.toString(16).toUpperCase();
    const ioAddressStr = '0x' + ioAddress.toString(16).toUpperCase();
    const dataStr = data === 0 ? '0' : '1';
    const lutLookup = jmp === 1 || ((jsr !== null) && (nopo === 1 || nopf === 1));
    const lifoLookup = (jsr !== null) && (rtn === 1);

    document.getElementById('pc').innerHTML = pcStr;
    document.getElementById('command').innerHTML = commandStr;
    document.getElementById('inst').innerHTML = instStr;
    document.getElementById('opcode').innerHTML = opCode;
    document.getElementById('io-address').innerHTML = ioAddressStr;
    document.getElementById('io-address-deluxe').innerHTML = ioAddressStr;
    document.getElementById('data').innerHTML = dataStr;

    {
        const te = document.getElementById('data');
        visualizeSignal(null, te, null, data === 1);
    }
    {
        const e = document.getElementById('x1');
        const te = document.getElementById('t-x1');
        const mpe = document.getElementById('mp-x1');
        visualizeSignal(e, te, mpe, x1 === 1);
    }
    {
        const e = document.getElementById('rr');
        const te = document.getElementById('t-rr');
        const mpe = document.getElementById('mp-rr');
        visualizeSignal(e, te, mpe, rr === 1);
    }
    {
        const te = document.getElementById('t-rr1');
        visualizeSignal(null, te, null, rr === 1);
    }
    {
        const e = document.getElementById('jmp');
        const te = document.getElementById('t-jmp');
        const mpe = document.getElementById('mp-jmp');
        visualizeSignal(e, te, mpe, jmp === 1);
    }
    {
        const e = document.getElementById('clear');
        const te = document.getElementById('t-clear');
        const mpe = document.getElementById('mp-clear');
        visualizeSignal(e, te, mpe, jmp === 1);
    }
    {
        const e = document.getElementById('jmp-deluxe');
        const te = document.getElementById('t-lookup-deluxe');
        visualizeSignal(e, te, null, jmp === 1);
    }
    {
        const e = document.getElementById('lookup-in-deluxe');
        visualizeSignal(e, null, null, jmp === 1);
    }
    {
        const e = document.getElementById('flag-o');
        const te = document.getElementById('t-flag-o');
        const mpe = document.getElementById('mp-flag-o');
        visualizeSignal(e, te, mpe, nopo === 1);
    }
    {
        const e = document.getElementById('push-flag-o-deluxe');
        const te = document.getElementById('t-push-flag-o-deluxe');
        visualizeSignal(e, te, null, nopo === 1 && jsr === NOPO);
    }
    {
        const e = document.getElementById('push-flag-o-1-deluxe');
        const te = document.getElementById('t-lookup-flag-o-deluxe');
        const mpe = document.getElementById('mp-push-flag-o-1');
        visualizeSignal(e, te, mpe, nopo === 1 && jsr === NOPO);
    }
    {
        // noinspection SpellCheckingInspection
        const e = document.getElementById('flag-f');
        const te = document.getElementById('t-flag-f');
        const mpe = document.getElementById('mp-flag-f');
        visualizeSignal(e, te, mpe, nopf === 1);
    }
    {
        const e = document.getElementById('push-flag-f-deluxe');
        const te = document.getElementById('t-push-flag-f-deluxe');
        visualizeSignal(e, te, null, nopf === 1 && jsr === NOPF);
    }
    {
        const e = document.getElementById('push-flag-f-1-deluxe');
        const te = document.getElementById('t-lookup-flag-f-deluxe');
        const mpe = document.getElementById('mp-push-flag-f-1');
        visualizeSignal(e, te, mpe, nopf === 1 && jsr === NOPF);
    }
    {
        const e = document.getElementById('lut-lookup-deluxe');
        const mpe = document.getElementById('mp-lut-lkp');
        visualizeSignal(e, null, mpe, lutLookup);
    }
    {
        const e = document.getElementById('lut-data-rdy-deluxe');
        // noinspection SpellCheckingInspection
        const mpe = document.getElementById('mp-lut-d-rdy');
        visualizeSignal(e, null, mpe, lutLookup);
    }
    {
        const e = document.getElementById('rtn');
        const te = document.getElementById('t-rtn');
        const mpe = document.getElementById('mp-rtn');
        visualizeSignal(e, te, mpe, rtn === 1);
    }
    {
        const e = document.getElementById('lifo-data-rdy-deluxe');
        visualizeSignal(e, null, null, lifoLookup);
    }
    {
        const e = document.getElementById('pop-deluxe');
        const te = document.getElementById('t-pop-deluxe');
        visualizeSignal(e, te, null, rtn === 1);
    }
    {
        const e = document.getElementById('addr-set-rdy-deluxe');
        const mpe = document.getElementById('mp-set');
        visualizeSignal(e, null, mpe, lutLookup || lifoLookup);
    }
    {
        const e = document.getElementById('set-pc');
        const te = document.getElementById('t-set-pc');
        const mpe = document.getElementById('mp-set');
        visualizeSignal(e, te, mpe, lutLookup || lifoLookup);
    }
    {
        const e = document.getElementById('write');
        const te = document.getElementById('t-write');
        const mpe = document.getElementById('mp-write');
        visualizeSignal(e, te, mpe, write === 1);
    }
    {
        const e = document.getElementById('write-1');
        const mpe = document.getElementById('mp-write-1');
        visualizeSignal(e, null, mpe, write === 1);
    }
    {
        const e = document.getElementById('read');
        const mpe = document.getElementById('mp-read');
        visualizeSignal(e, null, mpe, write === 0);
    }
    {
        const e = document.getElementById('read-1');
        const mpe = document.getElementById('mp-read-1');
        visualizeSignal(e, null, mpe, write === 0);
    }
    {
        // noinspection SpellCheckingInspection
        const te = document.getElementById('t-ien');
        visualizeSignal(null, te, null, ien === 1);
    }
    {
        const te = document.getElementById('t-oen');
        visualizeSignal(null, te, null, oen === 1);
    }
    {
        const te = document.getElementById('t-skip');
        visualizeSignal(null, te, null, skip === 1);
    }

    for (let i = 0; i < 8; i++) {
        const s = 't-ram' + i.toString();
        const te = document.getElementById(s);
        te.style.fill = ram[i] === 1 ? RED : WHITE;
    }
    for (let i = 0; i < 8; i++) {
        const s = 'output' + i.toString();
        const e = document.getElementById(s);
        const ts = 't-' + s;
        const te = document.getElementById(ts);
        const mpe = document.getElementById('mp-' + s);
        visualizeSignal(e, te, mpe, output[i] === 1);
    }

    if (hasTimer) {
        const e = document.getElementById('output7-1');
        visualizeSignal(e, null, null, output[7] === 1);
    }

    document.getElementById('btn-run').innerHTML = run ? 'Stop' : 'Run';

    visualizeTimerState();

    visualizeLifo();

    const pcSetAddrStr = jumpExecuted ? pcStr : '';
    document.getElementById('pc-set-addr').innerHTML = pcSetAddrStr;
    document.getElementById('pc-set-addr-deluxe').innerHTML = pcSetAddrStr;
}


/**
 * Depending on MC14500B program configuration/requirements renders timer visible or not
 * @param hasTimer - true if timer is required, false otherwise
 */
function makeTimerVisible(hasTimer) {
    const r = document.getElementById('rect-tmr0');
    const t1 = document.getElementById('text-tmr0');
    const t2 = document.getElementById('tmr0');
    const i7_1 = document.getElementById('input7-1');
    const o7 = document.getElementById('output7');
    const o7_1 = document.getElementById('output7-1');

    if (tmr0) clearTimeout(tmr0);
    tmr0 = null;

    if (hasTimer) {
        t1.style.display = 'inherit';
        t2.style.display = 'inherit';
        r.style.display = 'inherit';
        i7_1.style.display = 'inherit';
        o7.style.display = 'inherit';
        o7.style.markerEnd = 'url(#m-output7)';
        o7_1.style.markerEnd = 'none';
    } else {
        t1.style.display = 'none';
        t2.style.display = 'none';
        r.style.display = 'none';
        i7_1.style.display = 'none';
        o7.style.display = 'none';
        o7.style.markerEnd = 'none';
        o7_1.style.markerEnd = 'url(#m-output7)';
    }
}
