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

export function notesOfClass(pitchClass, low, high) {
  const out = [];
  for (let n = low; n <= high; n++) if (pc(n) === pitchClass) out.push(n);
  return out;
}
