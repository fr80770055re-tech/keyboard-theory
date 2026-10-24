// Piano voice: Salamander Grand samples (CC-BY 3.0, via the Tone.js audio CDN),
// pitch-shifted from the nearest sample. Falls back to a soft synth until loaded
// or if loading fails.

const SAMPLE_BASE = 'https://tonejs.github.io/audio/salamander/';
const SAMPLE_NAMES = { 0: 'C', 3: 'Ds', 6: 'Fs', 9: 'A' };

export class Piano {
  constructor() {
    this.ctx = null;
    this.buffers = new Map(); // midi -> AudioBuffer
    this.voices = new Map(); // midi -> { src, gain }
    this.loading = null;
  }

  // Must be called from a user gesture at least once.
  unlock() {
    if (!this.ctx) {
      this.ctx = new AudioContext();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.8;
      this.master.connect(this.ctx.destination);
      this.loading = this.#load();
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
  }

  async #load() {
    const jobs = [];
    for (let oct = 2; oct <= 6; oct++) {
      for (const [p, name] of Object.entries(SAMPLE_NAMES)) {
        const midi = (oct + 1) * 12 + Number(p);
        jobs.push(
          fetch(`${SAMPLE_BASE}${name}${oct}.mp3`)
            .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(r.status)))
            .then((ab) => this.ctx.decodeAudioData(ab))
            .then((buf) => this.buffers.set(midi, buf))
            .catch(() => {}),
        );
      }
    }
    await Promise.all(jobs);
  }

  noteOn(note, velocity = 0.75) {
    if (!this.ctx) return;
    this.noteOff(note, 0.05);
    const t = this.ctx.currentTime;
    const gain = this.ctx.createGain();
    gain.connect(this.master);
    const level = 0.25 + velocity * 0.75;
    let src;
    const nearest = this.#nearest(note);
    if (nearest !== null) {
      src = this.ctx.createBufferSource();
      src.buffer = this.buffers.get(nearest);
      src.playbackRate.value = 2 ** ((note - nearest) / 12);
      gain.gain.setValueAtTime(level, t);
    } else {
      src = this.ctx.createOscillator();
      src.type = 'triangle';
      src.frequency.value = 440 * 2 ** ((note - 69) / 12);
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(level * 0.35, t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 1.6);
    }
    src.connect(gain);
    src.start(t);
    if (nearest === null) src.stop(t + 1.7);
    this.voices.set(note, { src, gain });
    src.onended = () => {
      if (this.voices.get(note)?.src === src) this.voices.delete(note);
    };
  }

  noteOff(note, release = 0.35) {
    const v = this.voices.get(note);
    if (!v || !this.ctx) return;
    const t = this.ctx.currentTime;
    v.gain.gain.cancelScheduledValues(t);
    v.gain.gain.setValueAtTime(v.gain.gain.value, t);
    v.gain.gain.exponentialRampToValueAtTime(0.001, t + release);
    try { v.src.stop(t + release + 0.05); } catch { /* already stopped */ }
    this.voices.delete(note);
  }

  // Play notes for demos: [{ n, d }] with d in beats, or plain numbers (1 beat each).
  async playSequence(notes, { bpm = 90, signal } = {}) {
    const beat = 60 / bpm;
    for (const item of notes) {
      if (signal?.aborted) return;
      const { n, d = 1 } = typeof item === 'number' ? { n: item } : item;
      const group = Array.isArray(n) ? n : [n];
      group.forEach((x) => this.noteOn(x, 0.7));
      this.onDemoNote?.(group, true);
      await wait(d * beat * 1000 * 0.9, signal);
      group.forEach((x) => this.noteOff(x, 0.15));
      this.onDemoNote?.(group, false);
      await wait(d * beat * 1000 * 0.1, signal);
    }
  }

  #nearest(note) {
    let best = null;
    for (const m of this.buffers.keys()) {
      if (best === null || Math.abs(m - note) < Math.abs(best - note)) best = m;
    }
    return best;
  }
}

export function wait(ms, signal) {
  return new Promise((resolve) => {
    const t = setTimeout(resolve, ms);
    signal?.addEventListener('abort', () => { clearTimeout(t); resolve(); }, { once: true });
  });
}
