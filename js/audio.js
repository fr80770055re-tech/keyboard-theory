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
      // iPhone Safari 17+: play like a music app, so the ring/silent switch doesn't mute lessons.
      try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch { /* unsupported */ }
      this.ctx = new AudioContext();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.8;
      this.master.connect(this.ctx.destination);
      this.loading = this.#load();
    }
    // 'interrupted' (iOS, after a call or switching apps) needs a resume too.
    if (this.ctx.state !== 'running') this.ctx.resume().catch(() => {});
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

  // --- scheduled playback for rhythm exercises (times are AudioContext seconds) ---

  // Metronome tick; accent marks the first beat of a bar.
  click(when, accent = false) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.frequency.value = accent ? 1760 : 1180;
    gain.gain.setValueAtTime(0.0001, when);
    gain.gain.exponentialRampToValueAtTime(accent ? 0.35 : 0.2, when + 0.002);
    gain.gain.exponentialRampToValueAtTime(0.0001, when + 0.06);
    osc.connect(gain);
    gain.connect(this.master);
    osc.start(when);
    osc.stop(when + 0.07);
  }

  // A piano note at an exact future time, for demos in time.
  noteAt(note, when, dur = 0.5, velocity = 0.7) {
    if (!this.ctx) return;
    const gain = this.ctx.createGain();
    gain.connect(this.master);
    const nearest = this.#nearest(note);
    let src;
    if (nearest !== null) {
      src = this.ctx.createBufferSource();
      src.buffer = this.buffers.get(nearest);
      src.playbackRate.value = 2 ** ((note - nearest) / 12);
    } else {
      src = this.ctx.createOscillator();
      src.type = 'triangle';
      src.frequency.value = 440 * 2 ** ((note - 69) / 12);
    }
    const level = 0.25 + velocity * 0.75;
    gain.gain.setValueAtTime(level * (nearest === null ? 0.35 : 1), when);
    gain.gain.setValueAtTime(level * (nearest === null ? 0.35 : 1), when + dur);
    gain.gain.exponentialRampToValueAtTime(0.001, when + dur + 0.25);
    src.connect(gain);
    src.start(when);
    src.stop(when + dur + 0.3);
  }

  // How late the speakers are behind the scheduled time.
  get outputDelay() {
    return this.ctx ? (this.ctx.outputLatency || 0) + (this.ctx.baseLatency || 0) : 0;
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
  // show: false keeps the on-screen keys still (ear-only exercises).
  async playSequence(notes, { bpm = 90, signal, show = true } = {}) {
    const beat = 60 / bpm;
    for (const item of notes) {
      if (signal?.aborted) return;
      const { n, d = 1 } = typeof item === 'number' ? { n: item } : item;
      const group = Array.isArray(n) ? n : [n];
      group.forEach((x) => this.noteOn(x, 0.7));
      if (show) this.onDemoNote?.(group, true);
      await wait(d * beat * 1000 * 0.9, signal);
      group.forEach((x) => this.noteOff(x, 0.15));
      if (show) this.onDemoNote?.(group, false);
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
