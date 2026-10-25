// Unifies MIDI, computer keyboard and on-screen clicks into "noteon"/"noteoff"
// events carrying a *logical* note number (lesson space, see notes.js).
import { LESSON_LOW, LESSON_HIGH } from './notes.js';

// Two rows: Z-row = C3..B3, Q-row = C4..C5.
export const QWERTY = {
  z: 48, s: 49, x: 50, d: 51, c: 52, v: 53, g: 54, b: 55, h: 56, n: 57, j: 58, m: 59,
  q: 60, 2: 61, w: 62, 3: 63, e: 64, r: 65, 5: 66, t: 67, 6: 68, y: 69, 7: 70, u: 71, i: 72,
};

// Given a physical key range, pick the octave offset that places the lesson
// window inside it, and return the logical range to display.
export function planRange(low, high) {
  let offset = 0;
  const fits = (o) => low - o <= LESSON_LOW && high - o >= LESSON_HIGH;
  if (!fits(0)) {
    offset = Math.round((low - LESSON_LOW) / 12) * 12;
    for (let k = -4; k <= 4; k++) if (fits(k * 12)) { offset = k * 12; break; }
  }
  return { offset, low: low - offset, high: high - offset, keys: high - low + 1 };
}

export class InputHub extends EventTarget {
  constructor() {
    super();
    this.midiSupported = 'requestMIDIAccess' in navigator;
    this.devices = [];
    this.calibration = null; // { physLow, physHigh, offset }
    this.capture = null; // fn(rawNote) during calibration
    this.lastInputAt = 0;
    this.held = new Set();
    this.#bindKeys();
  }

  async initMidi() {
    if (!this.midiSupported) return;
    try {
      this.access = await navigator.requestMIDIAccess();
    } catch {
      this.midiSupported = false;
      this.#emit('devices');
      return;
    }
    const bindAll = () => {
      this.devices = [];
      for (const input of this.access.inputs.values()) {
        input.onmidimessage = (e) => this.#onMidi(e);
        if (input.state === 'connected') this.devices.push(input.name || 'MIDI 裝置');
      }
      this.#emit('devices');
    };
    this.access.onstatechange = bindAll;
    bindAll();
  }

  get deviceName() { return this.devices[0] || null; }

  setCalibration(cal) { this.calibration = cal; }

  #onMidi(e) {
    const [status, note, vel] = e.data;
    const cmd = status & 0xf0;
    const isOn = cmd === 0x90 && vel > 0;
    const isOff = cmd === 0x80 || (cmd === 0x90 && vel === 0);
    if (!isOn && !isOff) return;
    if (this.capture) {
      if (isOn) this.capture(note);
      return;
    }
    const cal = this.calibration;
    if (isOn && cal && (note < cal.physLow || note > cal.physHigh)) {
      this.#emit('outofrange', { note });
    }
    const logical = note - (cal ? cal.offset : 0);
    if (isOn) this.press(logical, vel / 127, 'midi', e.timeStamp);
    else this.release(logical, 'midi');
  }

  // time: when the key went down (performance.now() timeline), for rhythm grading.
  press(note, velocity = 0.75, source = 'pointer', time = performance.now()) {
    this.lastInputAt = Date.now();
    this.held.add(note);
    this.#emit('noteon', { note, velocity, source, time });
  }

  release(note, source = 'pointer') {
    this.held.delete(note);
    this.#emit('noteoff', { note, source });
  }

  #bindKeys() {
    const down = new Set();
    const typing = (t) => t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);
    window.addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey || typing(e.target)) return;
      const n = QWERTY[e.key.toLowerCase()];
      if (n === undefined) return;
      e.preventDefault();
      if (e.repeat) return;
      // A fresh keydown for a key we think is held means its keyup was lost.
      if (down.has(n)) this.release(n, 'qwerty');
      down.add(n);
      this.press(n, 0.75, 'qwerty', e.timeStamp);
    });
    window.addEventListener('keyup', (e) => {
      const n = QWERTY[e.key.toLowerCase()];
      if (n === undefined || !down.has(n)) return;
      down.delete(n);
      this.release(n, 'qwerty');
    });
    window.addEventListener('blur', () => {
      for (const n of down) this.release(n, 'qwerty');
      down.clear();
    });
  }

  #emit(type, detail = {}) { this.dispatchEvent(new CustomEvent(type, { detail })); }
}
