// On-screen piano keyboard. Renders a logical note range and shows lesson marks.
import { isBlack, letter, MIDDLE_C, pc } from './notes.js';
import { icon } from './icons.js';

// Black key center shift from the boundary between its two white keys,
// in white-key widths (real pianos nudge the 2- and 3-groups apart).
const BLACK_OFFSET = { 1: -0.08, 3: 0.08, 6: -0.1, 8: 0, 10: 0.1 };
const MARK_CLASSES = ['hint', 'soft', 'found'];

export class Keyboard {
  constructor(el, hub) {
    this.el = el;
    this.hub = hub;
    this.keys = new Map();
    this.flashTimers = new Map();
    this.labelMode = 'c'; // 'c' = label every C, 'all' = every white key
    this.keyHints = null; // note -> computer-keyboard letter
    hub.addEventListener('noteon', (e) => this.#setDown(e.detail.note, true));
    hub.addEventListener('noteoff', (e) => this.#setDown(e.detail.note, false));
    this.#bindPointer();
  }

  setRange(low, high) {
    // Always start and end on white keys.
    while (isBlack(low)) low--;
    while (isBlack(high)) high++;
    this.low = low;
    this.high = high;
    this.render();
  }

  setLabelMode(mode) {
    this.labelMode = mode;
    for (const [n, k] of this.keys) k.querySelector('.klabel').textContent = this.#baseLabel(n);
  }

  // Show which computer key plays each note (shown when no MIDI keyboard is connected).
  setKeyHints(map) {
    this.keyHints = map;
    for (const [n, k] of this.keys) k.querySelector('.kkey').textContent = map?.[n] ?? '';
  }

  #baseLabel(n) {
    if (isBlack(n)) return '';
    if (this.labelMode === 'all') return letter(n);
    if (pc(n) === 0) return n === MIDDLE_C ? 'C4' : letter(n);
    return '';
  }

  render() {
    this.el.innerHTML = '<div class="kb-lane" aria-hidden="true"></div><div class="kb-keys"></div>';
    this.lane = this.el.querySelector('.kb-lane');
    const keysEl = this.el.querySelector('.kb-keys');
    this.keys.clear();
    this.centers = new Map(); // note -> horizontal center, % of keyboard width
    const whites = [];
    for (let n = this.low; n <= this.high; n++) if (!isBlack(n)) whites.push(n);
    this.el.style.setProperty('--whites', whites.length);
    const w = 100 / whites.length;
    let whiteIndex = -1;
    for (let n = this.low; n <= this.high; n++) {
      const k = document.createElement('div');
      k.className = `key ${isBlack(n) ? 'black' : 'white'}`;
      k.dataset.note = n;
      k.innerHTML = `<span class="kkey">${this.keyHints?.[n] ?? ''}</span><span class="kmark" hidden></span><span class="kflash" hidden></span><span class="klabel">${this.#baseLabel(n)}</span>`;
      if (n === MIDDLE_C) k.insertAdjacentHTML('afterbegin', '<span class="mid-c" title="中央 C"></span>');
      if (isBlack(n)) {
        const center = (whiteIndex + 1 + BLACK_OFFSET[pc(n)]) * w;
        k.style.width = `${w * 0.62}%`;
        k.style.left = `${center - w * 0.31}%`;
        this.centers.set(n, center);
      } else {
        whiteIndex++;
        this.centers.set(n, (whiteIndex + 0.5) * w);
      }
      keysEl.appendChild(k);
      this.keys.set(n, k);
    }
  }

  // Note cues in the lane right above the keys, Synthesia-style: the note to play
  // now sits over its key; upcoming notes are ghosted. items: [{ n, label, sub, next }]
  cue(items = []) {
    if (!this.lane) return;
    this.lane.innerHTML = items
      .filter((x) => this.centers.has(x.n))
      .map((x) => `<span class="cue ${x.next ? 'cue-next' : 'cue-now'}" style="left:${this.centers.get(x.n)}%"><b>${x.label}</b>${x.sub ? `<small>${x.sub}</small>` : ''}</span>`)
      .join('');
  }

  #bindPointer() {
    const active = new Map(); // pointerId -> note
    const noteAt = (x, y) => {
      const el = document.elementFromPoint(x, y)?.closest?.('.key');
      return el && this.el.contains(el) ? Number(el.dataset.note) : null;
    };
    this.el.addEventListener('pointerdown', (e) => {
      const n = noteAt(e.clientX, e.clientY);
      if (n === null) return;
      this.el.setPointerCapture(e.pointerId);
      active.set(e.pointerId, n);
      this.hub.press(n, 0.75, 'pointer');
    });
    this.el.addEventListener('pointermove', (e) => {
      if (!active.has(e.pointerId)) return;
      const n = noteAt(e.clientX, e.clientY);
      const prev = active.get(e.pointerId);
      if (n === null || n === prev) return;
      this.hub.release(prev, 'pointer');
      active.set(e.pointerId, n);
      this.hub.press(n, 0.75, 'pointer');
    });
    const end = (e) => {
      if (!active.has(e.pointerId)) return;
      this.hub.release(active.get(e.pointerId), 'pointer');
      active.delete(e.pointerId);
    };
    this.el.addEventListener('pointerup', end);
    this.el.addEventListener('pointercancel', end);
  }

  #setDown(n, on) { this.keys.get(n)?.classList.toggle('down', on); }

  // Visual press without input, used while the piano plays a demo.
  showDown(n, on) { this.#setDown(n, on); }

  // Persistent lesson mark: 'hint' | 'soft' | 'found'. text = small badge (finger number, letter).
  mark(n, kind, text = '') {
    const k = this.keys.get(n);
    if (!k) return;
    k.classList.remove(...MARK_CLASSES);
    k.classList.add(kind);
    const b = k.querySelector('.kmark');
    b.innerHTML = kind === 'found' ? icon.check() : text;
    b.hidden = kind !== 'found' && !text;
  }

  unmark(n) {
    const k = this.keys.get(n);
    if (!k) return;
    k.classList.remove(...MARK_CLASSES);
    const b = k.querySelector('.kmark');
    b.textContent = '';
    b.hidden = true;
  }

  clearMarks() {
    this.cue([]);
    for (const n of this.keys.keys()) {
      this.unmark(n);
      this.#endFlash(n);
    }
  }

  // Short-lived right/wrong feedback, drawn as an overlay that never touches the
  // persistent marks. Icons accompany colour for colour-blind users.
  flash(n, ok) {
    const k = this.keys.get(n);
    if (!k) return;
    this.#endFlash(n);
    k.classList.add(ok ? 'ok' : 'bad');
    const f = k.querySelector('.kflash');
    f.innerHTML = ok ? icon.check() : icon.cross();
    f.hidden = false;
    this.flashTimers.set(n, setTimeout(() => this.#endFlash(n), 550));
  }

  #endFlash(n) {
    clearTimeout(this.flashTimers.get(n));
    this.flashTimers.delete(n);
    const k = this.keys.get(n);
    if (!k) return;
    k.classList.remove('ok', 'bad');
    k.querySelector('.kflash').hidden = true;
  }
}
