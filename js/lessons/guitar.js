// 吉他指板記憶：fretboard drills in standard tuning, open strings to fret 12.
// Two kinds of question: see a position and name the note (choice), or hear a
// note name and tap where it is (fretboard step). Fresh questions every round.
import { OPEN, STRING_NAME, fretName, midiAt } from '../fretboard.js';
import { CONCEPTS } from './concepts.js';

const SHARP = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
const FLAT = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B'];
const NATURAL = [0, 2, 4, 5, 7, 9, 11];
const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const FRETS = 12;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
const isNatural = (n) => NATURAL.includes(n % 12);
const strName = (s) => `第 ${s} 弦（${STRING_NAME[s]} 弦${s === 6 ? '，最粗' : s === 1 ? '，最細' : ''}）`;
const where = (s, f) => `第 ${s} 弦${f ? `第 ${f} 格` : '空弦'}`;
const positionsOf = (pitchClass) => range(1, 6).flatMap((s) => range(0, FRETS).filter((f) => midiAt(s, f) % 12 === pitchClass).map((f) => [s, f]));

// How to work a position out: count up from the open string, or back from
// fret 12 (same note as the open string) for the upper frets.
function countText(s, f) {
  const open = OPEN[s];
  if (f === 0) return `${where(s, 0)}是 ${SHARP[open % 12]}。六條空弦由粗到細是 E A D G B E。`;
  if (f === FRETS) return `第 12 格是空弦高八度：${STRING_NAME[s]}。`;
  // Fret 5 sounds like the next (thinner) open string; on the G string it is fret 4.
  if (s > 1 && f === (s === 3 ? 4 : 5)) return `${where(s, f)}和第 ${s - 1} 弦的空弦同音：${STRING_NAME[s - 1]}（調音時就是對這兩個音${s === 3 ? '；G 弦要用第 4 格' : ''}）。`;
  if (f <= 7) {
    const chain = range(0, f).map((k) => SHARP[(open + k) % 12]).join('→');
    return `${STRING_NAME[s]} 弦往上 ${f} 格：${chain}。`;
  }
  const back = FRETS - f;
  const chain = range(0, back).map((k) => FLAT[(open + FRETS - k) % 12]).join('→');
  return `第 12 格和空弦一樣是 ${STRING_NAME[s]}，往回 ${back} 格：${chain}。`;
}

const unique = (make, k) => {
  const items = [];
  for (let guard = 0; items.length < k && guard < 300; guard++) {
    const q = make();
    if (!items.some((x) => x.key === q.key) && items[items.length - 1]?.key !== q.key) items.push(q);
  }
  return items;
};

// ---------- see a position, name it ----------

function openQuestion() {
  const s = pick(range(1, 6));
  const options = ['E', 'A', 'D', 'G', 'B'];
  return {
    key: `o${s}`,
    prompt: `${strName(s)}的空弦是什麼音？`,
    fretboard: { vertical: false, marks: [{ s, f: 0, kind: 'hint', label: '?' }], label: `${where(s, 0)}` },
    options, answer: options.indexOf(STRING_NAME[s]),
    hint: '由粗到細：E A D G B E。',
    explain: countText(s, 0),
  };
}

// strings / frets: limit where questions come from (root strings, landmark frets).
function nameQuestion(naturalOnly, strings = range(1, 6), frets = range(naturalOnly ? 0 : 1, FRETS)) {
  let s; let f;
  do { s = pick(strings); f = pick(frets); } while (naturalOnly && !isNatural(midiAt(s, f)));
  const n = midiAt(s, f);
  const options = naturalOnly ? LETTERS : SHARP.map((_, i) => fretName(i + 60));
  return {
    key: `${s}:${f}`,
    prompt: `${where(s, f)}是什麼音？`,
    fretboard: { vertical: false, marks: [{ s, f, kind: 'hint', label: '?' }], label: where(s, f) },
    options, answer: naturalOnly ? LETTERS.indexOf(SHARP[n % 12]) : n % 12,
    hint: '從空弦往上數，或從第 12 格往回數。B–C、E–F 之間只差一格。',
    explain: `${countText(s, f)}所以是 ${fretName(n)}。`,
  };
}

// ---------- hear a name, tap the position ----------

function findQuestion(naturalOnly, strings = range(1, 6)) {
  const s = pick(strings);
  const pcs = naturalOnly ? NATURAL : range(0, 11);
  const pitchClass = pick(pcs);
  const targets = range(0, FRETS).filter((f) => midiAt(s, f) % 12 === pitchClass).map((f) => [s, f]);
  const name = fretName(pitchClass + 60);
  const f0 = targets[0][1];
  return {
    key: `${s}:${pitchClass}`,
    prompt: `在${strName(s)}上找出 <span class="big">${name}</span>`,
    targets,
    hint: `從 ${STRING_NAME[s]} 弦的空弦往上數。`,
    explain: `${countText(s, f0)}${targets.length > 1 ? `第 ${targets[1][1]} 格也是 ${name}（高八度）。` : ''}`,
    answerLabel: `${STRING_NAME[s]} 弦的 ${name}`,
  };
}

function allQuestion() {
  const pitchClass = pick(NATURAL);
  const name = SHARP[pitchClass];
  return {
    key: `all${pitchClass}`,
    prompt: `找出指板上所有的 <span class="big">${name}</span>`,
    all: true,
    targets: positionsOf(pitchClass),
    hint: '每條弦各找一次；空弦和第 12 格是同一個音名。',
    explain: `${name} 在每一條弦上都有，空弦到第 12 格一共 ${positionsOf(pitchClass).length} 個位置。`,
    answerLabel: `所有的 ${name}`,
  };
}

// One note name, string by string from the low E to the high E, frets 1–12 only
// (no open strings), the way many teachers drill it with a metronome.
function walkRound(pitchClass = pick(NATURAL)) {
  const name = SHARP[pitchClass];
  return [6, 5, 4, 3, 2, 1].map((s) => {
    const targets = range(1, FRETS).filter((f) => midiAt(s, f) % 12 === pitchClass).map((f) => [s, f]);
    return {
      key: `walk${s}`,
      prompt: `第 ${s} 弦（${STRING_NAME[s]} 弦）上的 <span class="big">${name}</span>`,
      targets,
      hint: '不用空弦；想想上一條弦的位置，再用八度或第 5 格的關係找過來。',
      explain: `${countText(s, targets[0][1])}`,
      answerLabel: `${STRING_NAME[s]} 弦的 ${name}`,
    };
  });
}

// Octave shapes: two strings up and two frets over; crossing the B string, three frets.
function octaveQuestion() {
  let s; let f; let targets;
  do {
    s = pick([6, 5, 4, 3]);
    f = pick(range(0, 9));
    const up = midiAt(s, f) + 12;
    targets = range(1, s - 1).flatMap((t) => range(0, FRETS).filter((g) => midiAt(t, g) === up).map((g) => [t, g]));
  } while (!targets.length);
  const n = midiAt(s, f);
  const crossB = s <= 4;
  return {
    key: `oct${s}:${f}`,
    prompt: `找出這個 ${fretName(n)} 高八度的位置`,
    marks: [{ s, f, kind: 'hint', label: SHARP[n % 12] }],
    targets,
    hint: crossB ? '隔一條弦、往上 3 格（跨過 B 弦要多一格）。' : '隔一條弦、往上 2 格。',
    explain: crossB
      ? `第 ${s} 弦到第 ${s - 2} 弦會跨過 B 弦，所以高八度在隔一條弦、往上 3 格：${where(s - 2, f + 3)}${targets.length > 1 ? '（其他同音位置也算對）' : ''}。`
      : `高八度在隔一條弦、往上 2 格：${where(s - 2, f + 2)}${targets.length > 1 ? '（其他同音位置也算對）' : ''}。`,
    answerLabel: `${fretName(n)} 的八度`,
  };
}

// ---------- drills ----------

const choiceRound = (concept, kicker, make, k) => () => ({ type: 'choice', kicker, concept, items: unique(make, k) });
const tapRound = (concept, kicker, make, k, instruction) => () => ({ type: 'fretboard', kicker, concept, instruction, items: unique(make, k) });
const TAP = '點指板上的位置作答；點了會聽到那個音。';

const ROOT_STRINGS = [6, 5];
const LANDMARK_FRETS = [0, 3, 5, 7, 9, 12];

export const GUITAR_DRILLS = [
  { id: 'gtr-open', group: '吉他指板', title: '空弦音名', desc: '六條弦的名字：E A D G B E', minutes: 2, steps: [choiceRound('fret-open', '吉他：空弦', openQuestion, 6)] },
  { id: 'gtr-root', group: '吉他指板', title: '根音弦：第 6、5 弦', desc: '和弦根音多在這兩條弦，最先背', minutes: 3, speed: true, steps: [choiceRound('fret-name', '吉他：根音弦', () => nameQuestion(true, ROOT_STRINGS), 6), tapRound('fret-find', '吉他：在根音弦上找音', () => findQuestion(true, ROOT_STRINGS), 4, TAP)] },
  { id: 'gtr-landmark', group: '吉他指板', title: '路標格', desc: '空弦、第 5、12 格與指板點的音', minutes: 3, speed: true, steps: [choiceRound('fret-name', '吉他：路標格', () => nameQuestion(true, range(1, 6), LANDMARK_FRETS), 8)] },
  { id: 'gtr-name-natural', group: '吉他指板', speed: true, title: '看位置說音名', desc: '空弦到第 12 格的自然音', minutes: 3, steps: [choiceRound('fret-name', '吉他：看位置說音名', () => nameQuestion(true), 10)] },
  { id: 'gtr-name-all', group: '吉他指板', speed: true, title: '看位置說音名（含升降）', desc: '第 1 到 12 格，所有半音', minutes: 4, steps: [choiceRound('fret-name', '吉他：含升降記號', () => nameQuestion(false), 10)] },
  { id: 'gtr-find', group: '吉他指板', speed: true, title: '在指定弦上找音', desc: '聽到音名，點出它在哪一格', minutes: 3, steps: [tapRound('fret-find', '吉他：找位置', () => findQuestion(Math.random() < 0.7), 8, TAP)] },
  { id: 'gtr-walk', group: '吉他指板', title: '一個音名走遍六弦', desc: '從第 6 弦到第 1 弦依序找同一個音', minutes: 3, speed: true, steps: [() => ({ type: 'fretboard', kicker: '吉他：走遍六弦', concept: 'fret-all', instruction: '不用空弦，第 1 到 12 格。熟了之後跟著節拍器從慢速開始，每拍一個位置。', items: walkRound() })] },
  { id: 'gtr-all', group: '吉他指板', title: '找出所有同名音', desc: '一個音名在整個指板上的位置', minutes: 4, steps: [tapRound('fret-all', '吉他：找出所有位置', allQuestion, 3, TAP)] },
  { id: 'gtr-octave', group: '吉他指板', speed: true, title: '八度位置', desc: '隔一條弦往上 2 格；跨過 B 弦 3 格', minutes: 3, steps: [tapRound('fret-octave', '吉他：八度形狀', octaveQuestion, 6, TAP)] },
];

// Register the fretboard concepts for spaced review.
Object.assign(CONCEPTS, {
  'fret-open': { name: '吉他空弦音名', review: () => [choiceRound('fret-open', '複習：吉他空弦', openQuestion, 3)] },
  'fret-name': { name: '吉他指板音名', review: () => [choiceRound('fret-name', '複習：吉他指板音名', () => nameQuestion(true), 3)] },
  'fret-find': { name: '在吉他弦上找音', review: () => [tapRound('fret-find', '複習：在弦上找音', () => findQuestion(true), 3, TAP)] },
  'fret-all': { name: '指板上所有同名音', review: () => [tapRound('fret-all', '複習：找出所有位置', allQuestion, 1, TAP)] },
  'fret-octave': { name: '吉他八度位置', review: () => [tapRound('fret-octave', '複習：八度形狀', octaveQuestion, 3, TAP)] },
});
