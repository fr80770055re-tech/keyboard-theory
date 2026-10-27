// 吉他和弦指形：how chord shapes are worked out, not just memorised. A chord is a
// root plus intervals; a shape is where those intervals land on the strings.
// Open chords first, then the movable E and A shapes (root on string 6 or 5),
// then turning one shape into another by moving a single note.
import { midiAt, fretName } from '../fretboard.js';
import { CONCEPTS } from './concepts.js';

// Chord roots spelled the way chord charts usually write them.
const ROOT_NAME = ['C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B'];
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const shuffle = (arr) => arr.map((x) => [Math.random(), x]).sort((a, b) => a[0] - b[0]).map((x) => x[1]);

// Chord qualities: intervals above the root, in semitones.
export const QUALITY = {
  '': { name: '大三和弦', tones: [0, 4, 7] },
  m: { name: '小三和弦', tones: [0, 3, 7] },
  7: { name: '屬七和弦', tones: [0, 4, 7, 10] },
  m7: { name: '小七和弦', tones: [0, 3, 7, 10] },
  maj7: { name: '大七和弦', tones: [0, 4, 7, 11] },
};
export const ROLE = { 0: 'R', 3: '♭3', 4: '3', 7: '5', 10: '♭7', 11: '7' };
const ROLE_NAME = { R: '根音', '♭3': '小三度', 3: '大三度', 5: '五度', '♭7': '小七度', 7: '大七度' };

// Shapes list frets for strings 6 → 1; null = not played.
// Open chords: [root pitch class, quality, frets].
export const OPEN_CHORDS = [
  [0, '', [null, 3, 2, 0, 1, 0]],
  [9, '', [null, 0, 2, 2, 2, 0]],
  [7, '', [3, 2, 0, 0, 0, 3]],
  [4, '', [0, 2, 2, 1, 0, 0]],
  [2, '', [null, null, 0, 2, 3, 2]],
  [9, 'm', [null, 0, 2, 2, 1, 0]],
  [4, 'm', [0, 2, 2, 0, 0, 0]],
  [2, 'm', [null, null, 0, 2, 3, 1]],
  [4, '7', [0, 2, 0, 1, 0, 0]],
  [9, '7', [null, 0, 2, 0, 2, 0]],
  [2, '7', [null, null, 0, 2, 1, 2]],
  [7, '7', [3, 2, 0, 0, 0, 1]],
  [0, '7', [null, 3, 2, 3, 1, 0]],
  [11, '7', [null, 2, 1, 2, 0, 2]],
  [9, 'm7', [null, 0, 2, 0, 1, 0]],
  [4, 'm7', [0, 2, 0, 0, 0, 0]],
  [2, 'm7', [null, null, 0, 2, 1, 1]],
  [0, 'maj7', [null, 3, 2, 0, 0, 0]],
  [9, 'maj7', [null, 0, 2, 1, 2, 0]],
  [2, 'maj7', [null, null, 0, 2, 2, 2]],
];

// Movable shapes, as fret offsets from the barre (the root's fret on its string).
export const MOVABLE = {
  E: {
    rootString: 6,
    name: 'E 型（根音在第 6 弦）',
    shapes: {
      '': [0, 2, 2, 1, 0, 0],
      m: [0, 2, 2, 0, 0, 0],
      7: [0, 2, 0, 1, 0, 0],
      m7: [0, 2, 0, 0, 0, 0],
      maj7: [0, null, 1, 1, 0, null],
    },
  },
  A: {
    rootString: 5,
    name: 'A 型（根音在第 5 弦）',
    shapes: {
      '': [null, 0, 2, 2, 2, 0],
      m: [null, 0, 2, 2, 1, 0],
      7: [null, 0, 2, 0, 2, 0],
      m7: [null, 0, 2, 0, 1, 0],
      maj7: [null, 0, 2, 1, 2, 0],
    },
  },
};

const chordName = (root, q) => `${ROOT_NAME[root]}${q}`;
const STRINGS = [6, 5, 4, 3, 2, 1];
// Sounding notes of a shape, low to high: [{ s, f, n }].
export const notesOf = (frets) => STRINGS.map((s, k) => ({ s, f: frets[k], n: frets[k] === null ? null : midiAt(s, frets[k]) })).filter((x) => x.n !== null);
const roleOf = (n, root) => ROLE[(((n - root) % 12) + 12) % 12];
const movable = (shape, q, fret) => MOVABLE[shape].shapes[q].map((o) => (o === null ? null : o + fret));
// The barre fret for a root on the shape's root string (1–9, so the shape fits the board).
const fretFor = (shape, root) => {
  const f = (((root - midiAt(MOVABLE[shape].rootString, 0)) % 12) + 12) % 12;
  return f === 0 ? 12 : f;
};

// Board figure for a shape: roots highlighted; labels are interval roles or blank;
// unplayed strings marked ×, open strings ○.
function figure(frets, root, { roles = false, ask = null } = {}) {
  const marks = [];
  STRINGS.forEach((s, k) => {
    const f = frets[k];
    if (f === null) { marks.push({ s, f: 0, kind: 'mute', label: '×' }); return; }
    const role = roleOf(midiAt(s, f), root);
    const isAsk = ask && ask[0] === s && ask[1] === f;
    const label = isAsk ? '?' : roles ? role : '';
    if (f === 0) marks.push({ s, f, kind: isAsk ? 'hint' : 'open', label: isAsk ? '?' : roles ? role : '' });
    else marks.push({ s, f, kind: isAsk ? 'hint' : role === 'R' && roles ? 'root' : 'tone', label });
  });
  return marks;
}
const sound = (frets) => [{ n: notesOf(frets).map((x) => x.n), d: 3 }];
// Chord tones spelled by letter (A, C♯, E, G♯ — not A♭ for the seventh).
const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const LETTER_PC = [0, 2, 4, 5, 7, 9, 11];
const STEPS = { 0: 0, 3: 2, 4: 2, 7: 4, 10: 6, 11: 6 };
const ACC = { 0: '', 1: '♯', 2: '𝄪', 11: '♭', 10: '𝄫' };
const spell = (root, q) => {
  const li = LETTERS.indexOf(ROOT_NAME[root][0]);
  return QUALITY[q].tones.map((t) => {
    const l = (li + STEPS[t]) % 7;
    return LETTERS[l] + ACC[(((root + t - LETTER_PC[l]) % 12) + 12) % 12];
  }).join('、');
};

// ---------- questions ----------

// See an open chord (and hear it), name it.
function openNameQuestion() {
  const [root, q, frets] = pick(OPEN_CHORDS);
  const answer = chordName(root, q);
  // Wrong answers: look-alikes first (same root or same quality), then any.
  const others = shuffle(OPEN_CHORDS.filter(([r, qq]) => chordName(r, qq) !== answer));
  const near = others.filter(([r, qq]) => r === root || qq === q);
  const options = shuffle([answer, ...[...new Set([...near, ...others].map(([r, qq]) => chordName(r, qq)))].slice(0, 3)]);
  const low = notesOf(frets)[0];
  return {
    key: answer,
    prompt: '這是哪一個開放和弦？',
    fretboard: { frets: 4, vertical: true, marks: figure(frets, root), label: '和弦指形' },
    play: sound(frets), bpm: 60,
    options, answer: options.indexOf(answer),
    hint: '先找最低的那個音（× 的弦不彈），通常就是根音；再看三度是大還是小。',
    explain: `${answer}（${QUALITY[q].name}）：${spell(root, q)}。最低音在第 ${low.s} 弦，是 ${fretName(low.n)}。`,
  };
}

// One note of a shape marked ?, name its role in the chord.
function roleQuestion() {
  const useOpen = Math.random() < 0.5;
  let root; let q; let frets; let title;
  if (useOpen) {
    [root, q, frets] = pick(OPEN_CHORDS);
    title = chordName(root, q);
  } else {
    const shape = pick(['E', 'A']);
    q = pick(Object.keys(QUALITY));
    root = pick([0, 2, 5, 7, 9, 10]);
    const fret = fretFor(shape, root);
    if (fret > 9) return roleQuestion();
    frets = movable(shape, q, fret);
    title = `${chordName(root, q)}（${MOVABLE[shape].name.slice(0, 3)}，第 ${fret} 格）`;
  }
  const played = notesOf(frets).filter((x) => roleOf(x.n, root) !== 'R' || Math.random() < 0.3);
  const t = pick(played);
  const role = roleOf(t.n, root);
  const options = ['R', '♭3', '3', '5', '♭7', '7'];
  return {
    key: `${title}:${t.s}`,
    prompt: `${title}：標「?」的音是和弦裡的第幾音？`,
    fretboard: { frets: useOpen ? 4 : 12, vertical: useOpen, marks: figure(frets, root, { roles: true, ask: [t.s, t.f] }), label: `${title} 的指形` },
    options,
    answer: options.indexOf(role),
    hint: '從根音 R 往上數半音：3 個是 ♭3、4 個是 3、7 個是 5、10 個是 ♭7、11 個是 7。',
    explain: `這個音是 ${fretName(t.n)}，${title.split('（')[0]} 的組成音是 ${spell(root, q)}，所以它是${ROLE_NAME[role]}（${role}）。`,
  };
}

// Where does the barre go? Tap the root on the shape's root string.
function barreQuestion() {
  const shape = pick(['E', 'A']);
  const q = pick(['', 'm', '7', 'm7']);
  let root; let fret;
  do { root = pick([...Array(12).keys()]); fret = fretFor(shape, root); } while (fret > 10);
  const s = MOVABLE[shape].rootString;
  const name = chordName(root, q);
  return {
    key: `${shape}${name}`,
    prompt: `用 <b>${MOVABLE[shape].name}</b> 彈 <span class="big">${name}</span>：點出根音（食指橫按的位置）`,
    targets: [[s, fret]],
    hint: `橫按和弦的名字就是第 ${s} 弦上根音的名字，先在第 ${s} 弦上找 ${ROOT_NAME[root]}。`,
    explain: `第 ${s} 弦第 ${fret} 格是 ${fretName(midiAt(s, fret))}，食指橫按第 ${fret} 格，再按 ${shape} 型的${QUALITY[q].name}指形。`,
    answerLabel: `${name}（${shape} 型）`,
  };
}

// A movable shape somewhere on the neck: name the chord.
function barreNameQuestion() {
  const shape = pick(['E', 'A']);
  const q = pick(Object.keys(QUALITY));
  let root; let fret;
  do { root = pick([...Array(12).keys()]); fret = fretFor(shape, root); } while (fret > 9);
  const frets = movable(shape, q, fret);
  const answer = chordName(root, q);
  const near = shuffle([
    ...Object.keys(QUALITY).filter((x) => x !== q).map((x) => chordName(root, x)),
    chordName((root + 1) % 12, q), chordName((root + 11) % 12, q),
    chordName((root + 5) % 12, q), chordName((root + 7) % 12, q),
  ]);
  const options = shuffle([answer, ...near.slice(0, 3)]);
  const s = MOVABLE[shape].rootString;
  return {
    key: `${shape}${answer}`,
    prompt: '這個指形是什麼和弦？',
    fretboard: { vertical: false, marks: figure(frets, root, { roles: false }), label: '和弦指形' },
    play: sound(frets), bpm: 60,
    options, answer: options.indexOf(answer),
    hint: `先認出是 E 型還是 A 型，找出第 ${s} 弦上的根音；再看是哪一種指形。`,
    explain: `${MOVABLE[shape].name}，根音在第 ${s} 弦第 ${fret} 格（${fretName(midiAt(s, fret))}），指形是${QUALITY[q].name}，所以是 ${answer}：${spell(root, q)}。`,
  };
}

// Turn one chord into another by moving one note: major → minor (3 down a
// semitone), major → 7 (one root down a whole tone), major → maj7 (root down a
// semitone), minor → m7. Shows the starting shape with roles; tap the new spot.
const DERIVE = [
  { from: '', to: 'm', role: '3', move: -1, rule: '大三度降半音成為小三度（♭3）' },
  { from: '', to: '7', role: 'R', move: -2, rule: '把一個高八度的根音降全音，成為小七度（♭7）' },
  { from: '', to: 'maj7', role: 'R', move: -1, rule: '把一個高八度的根音降半音，成為大七度（7）' },
  { from: 'm', to: 'm7', role: 'R', move: -2, rule: '把一個高八度的根音降全音，成為小七度（♭7）' },
];
function deriveQuestion() {
  const d = pick(DERIVE);
  // The E-shape maj7 also drops two strings, so it is not a one-note change.
  const shape = d.to === 'maj7' ? 'A' : pick(['E', 'A']);
  let root; let fret;
  do { root = pick([...Array(12).keys()]); fret = fretFor(shape, root); } while (fret < 2 || fret > 9);
  const frets = movable(shape, d.from, fret);
  const target = movable(shape, d.to, fret);
  // The string that changes between the two shapes.
  const k = frets.findIndex((f, i) => f !== target[i] && f !== null && target[i] !== null);
  const s = STRINGS[k];
  const name = chordName(root, d.to);
  return {
    key: `${shape}${d.from}${d.to}${root}`,
    prompt: `${chordName(root, d.from)}（${shape} 型）改成 <span class="big">${name}</span>`,
    marks: figure(frets, root, { roles: true }),
    targets: [[s, target[k]]],
    hint: `${d.rule}。其他手指都不用動。`,
    explain: `${d.rule}：第 ${s} 弦從第 ${frets[k]} 格移到第 ${target[k]} 格（${fretName(midiAt(s, target[k]))}）。${name} = ${spell(root, d.to)}。`,
    answerLabel: `${chordName(root, d.from)} → ${name}`,
  };
}

// ---------- drills ----------

const unique = (make, k) => {
  const items = [];
  for (let guard = 0; items.length < k && guard < 300; guard++) {
    const q = make();
    if (!items.some((x) => x.key === q.key)) items.push(q);
  }
  return items;
};
const choiceRound = (concept, kicker, make, k) => () => ({ type: 'choice', kicker, concept, items: unique(make, k) });
const tapRound = (concept, kicker, make, k, instruction) => () => ({ type: 'fretboard', kicker, concept, instruction, items: unique(make, k) });

export const GUITAR_CHORD_DRILLS = [
  { id: 'gch-open', group: '吉他和弦', title: '認開放和弦', desc: 'C A G E D 與常見小調、七和弦', minutes: 3, steps: [choiceRound('gchord-open', '吉他和弦：開放和弦', openNameQuestion, 8)] },
  { id: 'gch-role', group: '吉他和弦', title: '指形裡的 R、3、5', desc: '每根手指按的是和弦的第幾音', minutes: 4, steps: [choiceRound('gchord-role', '吉他和弦：組成音', roleQuestion, 8)] },
  { id: 'gch-barre', group: '吉他和弦', title: '推算橫按位置', desc: 'E 型、A 型：根音在哪一格', minutes: 3, speed: true, steps: [tapRound('gchord-barre', '吉他和弦：找橫按位置', barreQuestion, 8, '點指板作答。根音在哪一格，食指就橫按在哪一格。')] },
  { id: 'gch-name', group: '吉他和弦', title: '看指形說和弦', desc: '可移動指形在任何位置', minutes: 4, steps: [choiceRound('gchord-barre', '吉他和弦：看指形', barreNameQuestion, 8)] },
  { id: 'gch-derive', group: '吉他和弦', title: '一個音改變和弦', desc: '大→小、大→7、大→maj7、小→m7', minutes: 4, steps: [tapRound('gchord-derive', '吉他和弦：推算指形', deriveQuestion, 6, '指板上標的是原本的和弦（R 是根音）。只要移動一個音：點出它的新位置。')] },
];

Object.assign(CONCEPTS, {
  'gchord-open': { name: '吉他開放和弦', review: () => [choiceRound('gchord-open', '複習：開放和弦', openNameQuestion, 3)] },
  'gchord-role': { name: '和弦指形的組成音', review: () => [choiceRound('gchord-role', '複習：指形組成音', roleQuestion, 3)] },
  'gchord-barre': { name: '吉他橫按和弦位置', review: () => [tapRound('gchord-barre', '複習：橫按位置', barreQuestion, 3)] },
  'gchord-derive': { name: '推算和弦指形', review: () => [tapRound('gchord-derive', '複習：推算指形', deriveQuestion, 2)] },
});
