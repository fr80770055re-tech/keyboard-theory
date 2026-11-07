// Six-string voicings for the chord types the barre and CAGED shapes don't cover.
// Source: FaChords' accessible chord pages for C (https://www.fachords.com/guitar-chord/c/<type>/textual,
// fetched 2026-11), which list each position string by string. Frets are written
// string 6 → 1 (null = not played) for a C chord; a voicing with no open strings is
// movable, so it is shifted to any root. Each one is re-checked by `checkVoicing`
// (right notes, the tones that define the chord, a span the hand can reach) and only
// voicings that pass are shown.
import { midiAt } from '../fretboard.js';

const _ = null;
export const VOICINGS_C = {
  dim: [[_, 3, 4, 5, 4, _], [_, _, 10, 8, 7, 8], [8, 9, 10, 8, _, _]],
  aug: [[_, 3, 2, 1, 1, _], [4, 3, 2, 1, _, _], [_, _, 10, 9, 9, 8]],
  sus2: [[_, 3, 5, 5, 3, 3], [_, 3, _, 0, 3, 3], [_, 3, 0, 0, 3, 3]],
  sus4: [[_, 3, 3, 0, 1, _], [_, 3, 5, 5, 6, 3], [8, 8, 10, 10, 8, 8]],
  6: [[_, 3, 2, 2, 1, 0], [_, 3, 5, 5, 5, 5], [8, _, 10, 9, 10, 8], [8, _, 7, 9, 8, _], [_, _, 10, 9, 10, 8], [_, 3, 2, 2, 1, _]],
  m6: [[_, 3, 1, 2, 1, _], [_, 3, _, 5, 4, 5], [8, _, 10, 8, 10, 8], [8, _, 7, 8, 8, _]],
  dim7: [[_, 3, 4, 2, 4, _], [8, _, 7, 8, 7, _], [_, _, 10, 11, 10, 11], [_, 3, 1, 2, _, _]],
  'm7♭5': [[_, 3, 4, 3, 4, _], [8, _, 8, 8, 7, _], [8, 9, 8, 8, _, _], [_, _, 10, 11, 11, 11]],
  mMaj7: [[8, _, 9, 8, 8, _], [_, 3, 5, 4, 4, _], [_, 3, 5, 4, 4, 3]],
  '7sus4': [[_, 3, 3, 3, 1, _], [_, 3, 5, 3, 6, 3], [8, 10, 8, 10, 8, 8]],
  add9: [[_, 3, 2, 0, 3, 3], [_, 3, 2, 0, 3, 0], [_, _, 10, 9, 8, 10]],
};

const mod12 = (x) => ((x % 12) + 12) % 12;
const STRINGS = [6, 5, 4, 3, 2, 1];
// Tones a voicing must contain for the chord to read as itself (the 5th may be left out
// unless it is altered).
export const REQUIRED = {
  dim: [0, 3, 6], aug: [0, 4, 8], sus2: [0, 2, 7], sus4: [0, 5, 7], 6: [0, 4, 9], m6: [0, 3, 9],
  dim7: [0, 3, 6, 9], 'm7♭5': [0, 3, 6, 10], mMaj7: [0, 3, 11], '7sus4': [0, 5, 10], add9: [0, 4, 2],
};

// Fewest fingers that can fret a shape (strings 6 → 1, null = not played). The index
// may bar the lowest fret from some string up to string 1, as long as no string under
// the bar is played open; one other finger may lie flat across adjacent strings at one
// fret (the ring finger in an A-shape barre). Every other fretted note takes a finger.
export function fingersNeeded(frets) {
  const fretted = [0, 1, 2, 3, 4, 5].filter((k) => frets[k] !== null && frets[k] > 0);
  if (!fretted.length) return 0;
  const low = Math.min(...fretted.map((k) => frets[k]));
  let best = Infinity;
  for (const from of [null, ...fretted.filter((k) => frets[k] === low)]) {
    if (from !== null && frets.slice(from).some((f) => f === 0)) continue;
    const rest = fretted.filter((k) => from === null || k < from || frets[k] !== low);
    let flat = 0;
    for (let i = 0; i < rest.length;) {
      let j = i;
      while (j + 1 < rest.length && rest[j + 1] === rest[j] + 1 && frets[rest[j + 1]] === frets[rest[i]]) j++;
      flat = Math.max(flat, j - i);
      i = j + 1;
    }
    best = Math.min(best, (from === null ? 0 : 1) + rest.length - flat);
  }
  return best;
}

// { ok, reasons, span, fingers, bass } for a voicing of a chord (semitones above root).
export function checkVoicing(frets, root, tones, required) {
  const played = STRINGS.map((s, k) => ({ s, f: frets[k] })).filter((x) => x.f !== null);
  const rel = played.map((x) => mod12(midiAt(x.s, x.f) - root));
  const reasons = [];
  if (played.length < 3) reasons.push('少於三個音');
  if (!rel.every((t) => tones.map(mod12).includes(t))) reasons.push('含有和弦外音');
  if (!required.every((t) => rel.includes(mod12(t)))) reasons.push('缺少決定和弦性質的音');
  const fretted = played.filter((x) => x.f > 0).map((x) => x.f);
  const span = fretted.length ? Math.max(...fretted) - Math.min(...fretted) : 0;
  if (span > 4) reasons.push('跨度超過五格');
  const fingers = fingersNeeded(frets);
  if (fingers > 4) reasons.push('需要超過四根手指');
  // Muted strings between played ones are fine; the bass is the lowest played string.
  const bass = rel[0];
  return { ok: reasons.length === 0, reasons, span, fingers, bass, rootString: played.find((x, i) => rel[i] === 0)?.s };
}

// Voicings for any root: movable ones shifted, kept between frets 1 and 15 (as low as
// possible); open-string ones only for C itself.
export function voicingsFor(key, root) {
  const list = VOICINGS_C[key] || [];
  const out = [];
  for (const v of list) {
    const open = v.some((f) => f === 0);
    if (open && root !== 0) continue;
    let frets = v.map((f) => (f === null ? null : f + mod12(root)));
    const lo = () => Math.min(...frets.filter((f) => f !== null && f > 0));
    const hi = () => Math.max(...frets.filter((f) => f !== null));
    // Move an octave down when that keeps every fret at 1 or above and the shape is high up.
    if (!open && lo() - 12 >= 1 && (hi() > 12 || lo() > 9)) frets = frets.map((f) => (f === null ? null : f - 12));
    if (hi() > 15) continue;
    // Skip duplicates of a voicing already listed (the same frets after shifting).
    if (out.some((o) => o.frets.join() === frets.join())) continue;
    out.push({ frets, open });
  }
  return out;
}
