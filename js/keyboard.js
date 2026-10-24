// On-screen piano keyboard. Renders a logical note range and shows lesson marks.
import { isBlack, letter, MIDDLE_C, pc } from './notes.js';

// Black key center shift from the boundary between its two white keys,
// in white-key widths (real pianos nudge the 2- and 3-groups apart).
const BLACK_OFFSET = { 1: -0.08, 3: 0.08, 6: -0.1, 8: 0, 10: 0.1 };
const MARK_CLASSES = ['hint', 'soft', 'found', 'ok', 'bad'];

export class Keyboard {
  constructor(el, hub) {
    this.el = el;
    this.hub = hub;
    this.keys = new Map();
    this.flashTimers = new Map();
    this.labelMode = 'c'; // 'c' = label every C, 'all' = every white key, 'none'
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

  #baseLabel(n) {
    if (isBlack(n)) return '';
    if (this.labelMode === 'all') return letter(n);
    if (this.labelMode === 'c' && pc(n) === 0) return n === MIDDLE_C ? 'C4' : letter(n);
    return '';
  }

  render() {
    this.el.innerHTML = '';
    this.keys.clear();
    const whites = [];
    for (let n = this.low; n <= this.high; n++) if (!isBlack(n)) whites.push(n);
    const w = 100 / whites.length;
    let whiteIndex = -1;
    for (let n = this.low; n <= this.high; n++) {
      const k = document.createElement('div');
      k.className = `key ${isBlack(n) ? 'black' : 'white'}`;
      k.dataset.note = n;
      k.innerHTML = `<span class="kmark" hidden></span><span class="klabel">${this.#baseLabel(n)}</span>`;
      if (n === MIDDLE_C) k.insertAdjacentHTML('afterbegin', '<span class="mid-c" title="中央 C"></span>');
      if (isBlack(n)) {
        const center = (whiteIndex + 1 + BLACK_OFFSET[pc(n)]) * w;
        k.style.width = `${w * 0.62}%`;
        k.style.left = `${center - w * 0.31}%`;
      } else {
        whiteIndex++;
      }
      this.el.appendChild(k);
      this.keys.set(n, k);
    }
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

  // Persistent mark: 'hint' | 'soft' | 'found'. text = small badge (finger number, ✓…).
  mark(n, kind, text = '') {
    const k = this.keys.get(n);
    if (!k) return;
    k.classList.remove(...MARK_CLASSES);
    k.classList.add(kind);
    this.#badge(k, text);
  }

  unmark(n) {
    const k = this.keys.get(n);
    if (!k) return;
    k.classList.remove(...MARK_CLASSES);
    this.#badge(k, '');
  }

  clearMarks() {
    for (const n of this.keys.keys()) this.unmark(n);
    for (const t of this.flashTimers.values()) clearTimeout(t);
    this.flashTimers.clear();
  }

  // Short-lived right/wrong feedback. Icons accompany color for color-blind users.
  flash(n, ok) {
    const k = this.keys.get(n);
    if (!k) return;
    const prevClasses = MARK_CLASSES.filter((c) => k.classList.contains(c));
    const prevBadge = k.querySelector('.kmark');
    const prevText = prevBadge.hidden ? '' : prevBadge.textContent;
    clearTimeout(this.flashTimers.get(n));
    k.classList.remove(...MARK_CLASSES);
    k.classList.add(ok ? 'ok' : 'bad');
    this.#badge(k, ok ? '✓' : '✗');
    this.flashTimers.set(n, setTimeout(() => {
      k.classList.remove('ok', 'bad');
      if (prevClasses.some((c) => c !== 'ok' && c !== 'bad')) {
        k.classList.add(...prevClasses.filter((c) => c !== 'ok' && c !== 'bad'));
        this.#badge(k, prevText);
      } else {
        this.#badge(k, '');
      }
    }, 550));
  }

  #badge(k, text) {
    const b = k.querySelector('.kmark');
    b.textContent = text;
    b.hidden = !text;
  }
}
