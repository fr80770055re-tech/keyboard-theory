// Note naming helpers. Notes are MIDI numbers; 60 = middle C (C4).

const LETTERS = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
const SOLFEGE = ['Do', 'Do♯', 'Re', 'Re♯', 'Mi', 'Fa', 'Fa♯', 'Sol', 'Sol♯', 'La', 'La♯', 'Si'];
const BLACK = new Set([1, 3, 6, 8, 10]);

export const MIDDLE_C = 60;
// Lessons are written for this two-octave window (a 25-key keyboard).
export const LESSON_LOW = 48;
export const LESSON_HIGH = 72;

export const pc = (n) => ((n % 12) + 12) % 12;
export const octave = (n) => Math.floor(n / 12) - 1;
export const isBlack = (n) => BLACK.has(pc(n));
export const letter = (n) => LETTERS[pc(n)];
export const solfege = (n) => SOLFEGE[pc(n)];
export const sci = (n) => `${letter(n)}${octave(n)}`;

let showSolfege = false;
export function setSolfege(on) { showSolfege = on; }

// Display name used in prompts: "D" or "D（Re）".
export function noteName(n) {
  return showSolfege ? `${letter(n)}（${solfege(n)}）` : letter(n);
}

// How octaves are named. 'friendly' uses only what lesson 1 teaches — 中央 C and
// "八度" — so the middle octave is plain letters and others say 低八度/高八度.
// 'sci' (C3, E4…) is for lessons that have taught octave numbers.
let notation = 'friendly';
export function setNotation(mode) { notation = mode; }

function friendly(n) {
  if (n === MIDDLE_C) return '中央 C';
  const where = n < MIDDLE_C ? '低八度的 ' : n >= MIDDLE_C + 12 ? '高八度的 ' : '';
  return `${where}${letter(n)}${isBlack(n) ? '（黑鍵）' : ''}`;
}

// Name with its octave, in the current notation: "E", "中央 C", "低八度的 D" or "E4".
export function fullName(n) {
  const base = notation === 'sci' ? sci(n) : friendly(n);
  return showSolfege ? `${base}（${solfege(n)}）` : base;
}

export const usesOctaveNumbers = () => notation === 'sci';

// When the learner played the right letter in the wrong octave, say so directly
// instead of "這是 E，應該彈 E".
export function octaveMiss(n, t) {
  if (pc(n) !== pc(t) || n === t) return null;
  const dir = n < t ? '低' : '高';
  const gap = Math.round(Math.abs(n - t) / 12);
  if (notation === 'sci') return `這是 ${sci(n)}，${dir}了 ${gap} 個八度。要找的是 ${sci(t)}`;
  const where = t === MIDDLE_C ? '中央 C' : t >= MIDDLE_C && t < MIDDLE_C + 12 ? `中央 C 右邊那組的 ${letter(t)}` : fullName(t);
  return `這個 ${letter(n)} ${dir}了${gap > 1 ? ` ${gap} 個` : '一個'}八度，要彈的是${where}`;
}

export function notesOfClass(pitchClass, low, high) {
  const out = [];
  for (let n = low; n <= high; n++) if (pc(n) === pitchClass) out.push(n);
  return out;
}
