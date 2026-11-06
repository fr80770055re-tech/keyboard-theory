// 吉他琶音、三和弦指形與指板推算. Every position here is worked out from the
// chord formula and standard tuning (fourths, plus a major third between G and B),
// never typed in by hand, so a shape is right in every key by construction.
import { midiAt, fretName, OPEN } from '../fretboard.js';
import { CONCEPTS } from './concepts.js';
import { CAGED, CAGED_ORDER, cagedShift } from './guitar-chords.js';

const ROOT_NAME = ['C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B'];
const mod12 = (x) => ((x % 12) + 12) % 12;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const shuffle = (arr) => arr.map((x) => [Math.random(), x]).sort((a, b) => a[0] - b[0]).map((x) => x[1]);
const where = (s, f) => `第 ${s} 弦${f ? `第 ${f} 格` : '空弦'}`;

// Chord formulas: semitones above the root, and how each degree is written.
export const ARP = {
  '': { name: '大三和弦', formula: '1–3–5', tones: [0, 4, 7] },
  m: { name: '小三和弦', formula: '1–♭3–5', tones: [0, 3, 7] },
  7: { name: '屬七和弦', formula: '1–3–5–♭7', tones: [0, 4, 7, 10] },
  maj7: { name: '大七和弦', formula: '1–3–5–7', tones: [0, 4, 7, 11] },
  m7: { name: '小七和弦', formula: '1–♭3–5–♭7', tones: [0, 3, 7, 10] },
  m7b5: { name: '半減七和弦', formula: '1–♭3–♭5–♭7', tones: [0, 3, 6, 10], sym: 'm7♭5' },
};
const sym = (q) => ARP[q].sym ?? q;
const chordName = (root, q) => `${ROOT_NAME[root]}${sym(q)}`;
export const DEGREE = { 0: 'R', 3: '♭3', 4: '3', 6: '♭5', 7: '5', 10: '♭7', 11: '7' };
const DEGREE_NAME = { R: '根音', '♭3': '小三度', 3: '大三度', '♭5': '減五度', 5: '完全五度', '♭7': '小七度', 7: '大七度' };

// Spell chord tones by letter: thirds stack on every other letter (C E G B, never C E G C♭).
const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const LETTER_PC = [0, 2, 4, 5, 7, 9, 11];
const LETTER_STEP = { 0: 0, 3: 2, 4: 2, 6: 4, 7: 4, 10: 6, 11: 6 };
const ACC = { 0: '', 1: '♯', 2: '𝄪', 11: '♭', 10: '𝄫' };
export const spell = (root, q) => {
  const li = LETTERS.indexOf(ROOT_NAME[root][0]);
  return ARP[q].tones.map((t) => {
    const l = (li + LETTER_STEP[t]) % 7;
    return LETTERS[l] + ACC[mod12(root + t - LETTER_PC[l])];
  });
};

// ---------- arpeggio positions ----------
// The five CAGED positions of an arpeggio: every chord tone in a five-fret window
// around that CAGED chord shape for this root (one fret below where the open shape's
// nut has moved to, up to three above). Works for any chord quality: the window
// comes from the major CAGED shape, the notes from the chord's formula.
export function cagedArpeggio(root, q, shape, shift = cagedShift(shape, root), tones = ARP[q].tones) {
  const lo = Math.max(0, shift - 1);
  const hi = shift + 3;
  const notes = [];
  for (let s = 6; s >= 1; s--) {
    for (let f = lo; f <= hi; f++) {
      const t = mod12(midiAt(s, f) - root);
      if (tones.includes(t)) notes.push({ s, f, n: midiAt(s, f), role: DEGREE[t] ?? String(t) });
    }
  }
  const rootString = CAGED[shape].roots[0];
  return { shape, shift, lo, hi, notes, rootString, rootFret: CAGED[shape].frets[6 - rootString] + shift };
}
// Root on string 6 = the E-shape position, root on string 5 = the A-shape position.
export function arpeggioBox(root, q, rootString, rootFret) {
  return cagedArpeggio(root, q, rootString === 6 ? 'E' : 'A', rootFret);
}
// Root fret on a string for a root pitch class, kept in the comfortable 2–9 range.
const rootFretFor = (s, root) => { const f = mod12(root - OPEN[s]); return f < 2 ? f + 12 : f; };
export const boxFigure = (box, { roles = true, hide = null } = {}) => ({
  from: Math.max(0, box.lo - 1), frets: box.hi - Math.max(0, box.lo - 1), vertical: true,
  marks: box.notes.map((x) => {
    const hidden = hide && hide.s === x.s && hide.f === x.f;
    return { s: x.s, f: x.f, kind: hidden ? 'hint' : x.role === 'R' ? 'root' : 'tone', label: hidden ? '?' : roles ? x.role : '' };
  }),
  label: '琶音把位',
});
// Played low to high, one note at a time, then the chord.
const upAndDown = (box) => {
  const ns = [...new Set(box.notes.map((x) => x.n))].sort((a, b) => a - b);
  return [...ns.map((n) => ({ n, d: 0.5 })), ...ns.slice(0, -1).reverse().map((n) => ({ n, d: 0.5 }))];
};
const randomBox = (qs) => {
  for (;;) {
    const q = pick(qs);
    const root = pick([...Array(12).keys()]);
    const rs = pick([6, 5]);
    const rf = rootFretFor(rs, root);
    if (rf <= 9) return { q, root, rs, rf, box: arpeggioBox(root, q, rs, rf) };
  }
};

// Name the tones of an arpeggio from its formula.
function formulaQuestion() {
  const q = pick(Object.keys(ARP));
  const root = pick([0, 2, 4, 5, 7, 9, 10, 3]);
  const right = spell(root, q).join('、');
  // Wrong answers: the same root with the other formulas (one tone different).
  const others = shuffle(Object.keys(ARP).filter((x) => x !== q && ARP[x].tones.length === ARP[q].tones.length)).slice(0, 3);
  const options = shuffle([right, ...others.map((x) => spell(root, x).join('、'))]);
  return {
    key: `f${root}${q}`,
    prompt: `<span class="big">${chordName(root, q)}</span> 琶音由哪些音組成？`,
    options, answer: options.indexOf(right),
    hint: `${ARP[q].name}的公式是 ${ARP[q].formula}：從 ${ROOT_NAME[root]} 往上數。`,
    explain: `${ARP[q].name}＝${ARP[q].formula}，所以 ${chordName(root, q)}＝${right}。琶音就是把這幾個音一個一個彈出來。`,
  };
}

// Tap every chord tone in one position.
function boxQuestion() {
  const { q, root, rs, rf, box } = randomBox(['', 'm', '7', 'maj7', 'm7']);
  return {
    key: `b${root}${q}${rs}`,
    prompt: `在第 ${box.lo}–${box.hi} 格之間，點出 <span class="big">${chordName(root, q)}</span> 琶音的所有音`,
    all: true,
    board: { from: Math.max(0, box.lo - 1), frets: box.hi - Math.max(0, box.lo - 1) },
    marks: [{ s: rs, f: rf, kind: 'root', label: 'R' }],
    targets: box.notes.map((x) => [x.s, x.f]),
    hint: `組成音是 ${spell(root, q).join('、')}（${ARP[q].formula}）。從標好的根音出發，用度數去找：同一條弦往上 3 或 4 格是三度，往上 7 格是五度。`,
    explain: `${chordName(root, q)}＝${spell(root, q).join('、')}。這一把位共有 ${box.notes.length} 個琶音音。彈的時候從最低的根音（第 ${rs} 弦）開始往上，再回到根音。`,
    answerLabel: `${chordName(root, q)} 琶音（第 ${box.lo}–${box.hi} 格）`,
  };
}

// One note of a position marked ?, name its degree.
function degreeQuestion() {
  const { q, root, box } = randomCaged(['', 'm', '7', 'maj7', 'm7', 'm7b5']);
  const candidates = box.notes.filter((x) => x.role !== 'R');
  const hide = pick(candidates);
  // Choices: this chord's own degrees plus one look-alike that is not in it.
  const roles = ARP[q].tones.map((t) => DEGREE[t]);
  const decoy = pick(['3', '♭3', '5', '♭5', '7', '♭7'].filter((r) => !roles.includes(r)));
  const options = shuffle([...roles, decoy]);
  return {
    key: `d${root}${q}${hide.s}${hide.f}`,
    prompt: `${chordName(root, q)} 琶音裡，標 ? 的音是第幾度？`,
    fretboard: boxFigure(box, { hide }),
    options, answer: options.indexOf(hide.role),
    play: upAndDown(box), bpm: 120,
    hint: '從最近的根音 R 往上數半音：3 格＝小三度、4 格＝大三度、7 格＝五度、10 格＝小七度、11 格＝大七度。',
    explain: `${where(hide.s, hide.f)} 是 ${fretName(hide.n)}，在 ${chordName(root, q)} 裡是 ${hide.role}（${DEGREE_NAME[hide.role]}）。`,
  };
}

// Hear an arpeggio, name its quality.
function hearQuestion() {
  const q = pick(['', 'm', '7', 'maj7', 'm7']);
  const root = pick([48, 50, 52, 53, 55, 57]);
  const notes = ARP[q].tones.map((t) => root + t);
  const seq = [...notes, root + 12, ...notes.slice().reverse()].map((n) => ({ n, d: 0.5 }));
  const opts = ['', 'm', '7', 'maj7', 'm7'];
  const options = opts.map((x) => `${ARP[x].name}（${ARP[x].formula}）`);
  return {
    key: `h${q}${root}`,
    prompt: '聽這段琶音：它是哪一種和弦？',
    play: seq, bpm: 132,
    options, answer: opts.indexOf(q),
    hint: '先聽三度：明亮是大三度，偏暗是小三度。再聽最上面有沒有第四個音，以及它離高八度的根音是一格還是兩格。',
    explain: `${ARP[q].name}（${ARP[q].formula}）。`,
  };
}

// CAGED positions for all five shapes, shift kept on the neck (0–9).
const randomCaged = (qs) => {
  for (;;) {
    const q = pick(qs);
    const root = pick([...Array(12).keys()]);
    const shape = pick(CAGED_ORDER);
    let shift = cagedShift(shape, root);
    if (shift === 0 && Math.random() < 0.5) shift = 12; // sometimes the same shape an octave up
    if (shift <= 9 || shift === 12) return { q, root, shape, box: cagedArpeggio(root, q, shape, shift > 9 ? 12 : shift) };
  }
};

// Tap every tone of one CAGED position.
function cagedBoxQuestion() {
  const { q, root, shape, box } = randomCaged(['', 'm', '7', 'maj7', 'm7']);
  if (box.hi > 15) return cagedBoxQuestion();
  return {
    key: `cb${root}${q}${shape}${box.shift}`,
    prompt: `${shape} 型位置（第 ${box.lo}–${box.hi} 格）：點出 <span class="big">${chordName(root, q)}</span> 琶音的所有音`,
    all: true,
    board: { from: Math.max(0, box.lo - 1), frets: box.hi - Math.max(0, box.lo - 1) },
    marks: [{ s: box.rootString, f: box.rootFret, kind: 'root', label: 'R' }],
    targets: box.notes.map((x) => [x.s, x.f]),
    hint: `${shape} 型的根音在第 ${CAGED[shape].roots.join('、')} 弦。先找出另一個根音，再用度數找 ${spell(root, q).slice(1).join('、')}。`,
    explain: `${chordName(root, q)}＝${spell(root, q).join('、')}。${shape} 型位置共有 ${box.notes.length} 個琶音音；它和開放的 ${shape} 和弦（${box.shift ? `往上移 ${box.shift} 格` : '在琴枕'}）是同一塊區域。`,
    answerLabel: `${chordName(root, q)} 琶音（${shape} 型）`,
  };
}

// See a position, name its CAGED shape.
function cagedArpShapeQuestion() {
  const { q, root, shape, box } = randomCaged(['', 'm', '7', 'maj7']);
  if (box.hi > 15) return cagedArpShapeQuestion();
  return {
    key: `cs${root}${q}${shape}${box.shift}`,
    prompt: `這是 ${chordName(root, q)} 琶音的一個位置。它是 CAGED 的哪一型？`,
    fretboard: boxFigure(box),
    options: CAGED_ORDER, answer: CAGED_ORDER.indexOf(shape),
    play: upAndDown(box), bpm: 120,
    hint: '看根音 R 落在哪幾條弦：C 型在第 5、2 弦；A 型在第 5、3 弦；G 型在第 6、3、1 弦；E 型在第 6、4、1 弦；D 型在第 4、2 弦。',
    explain: `${shape} 型：根音在第 ${CAGED[shape].roots.join('、')} 弦。往高把位，五個位置依 C → A → G → E → D 的順序相接。`,
  };
}

// ---------- triads on string sets ----------
export const STRING_SETS = [[6, 5, 4], [5, 4, 3], [4, 3, 2], [3, 2, 1]];
const INV = ['原位', '第一轉位', '第二轉位'];
const INV_BASS = ['根音', '三音', '五音'];
// Close-voiced triad on three adjacent strings: bass = the inversion's bass tone,
// then the next chord tones stacked upward. Returns frets (null if it will not fit
// minFret–12). Drills use 1–12 so the answer is unique; figures may use open strings.
export function triadShape(root, q, inv, set, minFret = 1) {
  return closeTriad(ARP[q].tones.slice(0, 3).map((t) => mod12(root + t)), inv, set, minFret);
}
// Any three pitch classes (root, middle, top as written), close-voiced on a string set.
export function closeTriad(tones, inv, set, minFret = 1) {
  for (let bf = minFret; bf <= 12; bf++) {
    let n = midiAt(set[0], bf);
    if (mod12(n) !== tones[inv]) continue;
    const frets = [bf];
    for (let k = 1; k < 3; k++) {
      const want = tones[(inv + k) % 3];
      n += 1;
      while (mod12(n) !== want) n++;
      frets.push(n - OPEN[set[k]]);
    }
    if (frets.every((f) => f >= minFret && f <= 12) && Math.max(...frets) - Math.min(...frets) <= 4) return frets;
  }
  return null;
}
const randomTriad = () => {
  for (;;) {
    const q = pick(['', 'm']);
    const root = pick([...Array(12).keys()]);
    const inv = pick([0, 1, 2]);
    const set = pick(STRING_SETS);
    const frets = triadShape(root, q, inv, set);
    if (frets) return { q, root, inv, set, frets };
  }
};
const triadMarks = (set, frets, root, { roles = false } = {}) => set.map((s, k) => {
  const role = DEGREE[mod12(midiAt(s, frets[k]) - root)];
  return { s, f: frets[k], kind: frets[k] === 0 ? 'open' : roles && role === 'R' ? 'root' : 'tone', label: roles ? role : '' };
});

function inversionQuestion() {
  const { q, root, inv, set, frets } = randomTriad();
  const lo = Math.min(...frets);
  return {
    key: `i${root}${q}${inv}${set[0]}`,
    prompt: `這是 <span class="big">${chordName(root, q)}</span>（第 ${set.join('-')} 弦）。它是哪一種轉位？`,
    fretboard: { from: lo - 1, frets: 5, vertical: true, marks: triadMarks(set, frets, root), label: '三和弦指形' },
    play: [{ n: set.map((s, k) => midiAt(s, frets[k])), d: 2 }], bpm: 60,
    options: INV, answer: inv,
    hint: '看最低的那個音（最粗的那條弦）是和弦的根音、三音還是五音。',
    explain: `最低音在第 ${set[0]} 弦，是 ${fretName(midiAt(set[0], frets[0]))}，也就是${INV_BASS[inv]}，所以是${INV[inv]}。`,
  };
}

function triadBuildQuestion() {
  const { q, root, inv, set, frets } = randomTriad();
  const names = spell(root, q);
  const order = [0, 1, 2].map((k) => names[(inv + k) % 3]);
  return {
    key: `t${root}${q}${inv}${set[0]}`,
    prompt: `在第 ${set.join('-')} 弦彈 <span class="big">${chordName(root, q)}</span> ${INV[inv]}`,
    all: true,
    targets: set.map((s, k) => [s, frets[k]]),
    hint: `${INV[inv]}的最低音是${INV_BASS[inv]}（${order[0]}）：先在第 ${set[0]} 弦找到它，再往上依序疊 ${order[1]}、${order[2]}，三個音要擠在 4、5 格之內。`,
    explain: `${chordName(root, q)} ${INV[inv]}：由低到高 ${order.join('、')}，在第 ${set.join('、')} 弦的第 ${frets.join('、')} 格。${set.includes(2) && set.includes(3) ? '這組弦跨過 G–B 弦，所以 B 弦上的音比四度調弦時多往上一格。' : ''}`,
    answerLabel: `${chordName(root, q)} ${INV[inv]}（第 ${set.join('-')} 弦）`,
  };
}

// ---------- working shapes out from intervals ----------
// The next thinner string sounds a fourth higher (5 semitones), except G→B (4).
export const gapToNext = (s) => (s === 3 ? 4 : 5);
const IV_TEXT = { 3: '小三度', 4: '大三度', 7: '完全五度', 10: '小七度', 11: '大七度', 12: '八度' };

// Root marked; tap the interval on the next thinner string.
function intervalQuestion() {
  for (;;) {
    const s = pick([6, 5, 4, 3]);
    const iv = pick([3, 4, 7, 10, 11, 12]);
    const f = pick([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    const tf = f + iv - gapToNext(s);
    if (tf < 0 || tf > 12) continue;
    const root = midiAt(s, f);
    return {
      key: `v${s}${f}${iv}`,
      prompt: `標好的是 ${fretName(root)}（${where(s, f)}）。在第 ${s - 1} 弦點出它上方的<b>${IV_TEXT[iv]}</b>`,
      marks: [{ s, f, kind: 'root', label: 'R' }],
      targets: [[s - 1, tf]],
      hint: `第 ${s - 1} 弦比第 ${s} 弦高 ${gapToNext(s)} 個半音${s === 3 ? '（G→B 只差大三度，是唯一的例外）' : '（完全四度）'}。${IV_TEXT[iv]}是 ${iv} 個半音，所以要往${iv - gapToNext(s) >= 0 ? '上' : '下'} ${Math.abs(iv - gapToNext(s))} 格。`,
      explain: `${IV_TEXT[iv]}＝${iv} 個半音，減去兩弦相差的 ${gapToNext(s)} 個半音，等於往${iv - gapToNext(s) >= 0 ? '上' : '下'} ${Math.abs(iv - gapToNext(s))} 格：${where(s - 1, tf)}，${fretName(midiAt(s - 1, tf))}。`,
      answerLabel: `${IV_TEXT[iv]}（第 ${s} → ${s - 1} 弦）`,
    };
  }
}

// Shell voicings: root on string 6 → 7th on string 4, 3rd on string 3;
// root on string 5 → 3rd on string 4, 7th on string 3. The 5th is left out.
export const SHELL_STRINGS = { 6: { 7: 4, 3: 3 }, 5: { 3: 4, 7: 3 } };
const SHELL_Q = { maj7: [4, 11], 7: [4, 10], m7: [3, 10] };
export function shellFrets(rootString, rootFret, q) {
  const [third, seventh] = SHELL_Q[q];
  const root = midiAt(rootString, rootFret);
  const place = (s, t) => {
    // The chord tone on string s nearest the root's fret.
    let best = null;
    // Search past fret 12 so a root at fret 12–13 keeps its 3rd and 7th beside it.
    for (let f = 0; f <= rootFret + 6; f++) {
      if (mod12(midiAt(s, f) - root) === t && (best === null || Math.abs(f - rootFret) < Math.abs(best - rootFret))) best = f;
    }
    return best;
  };
  return { third: [SHELL_STRINGS[rootString][3], place(SHELL_STRINGS[rootString][3], third)], seventh: [SHELL_STRINGS[rootString][7], place(SHELL_STRINGS[rootString][7], seventh)] };
}
function shellQuestion() {
  for (;;) {
    const q = pick(Object.keys(SHELL_Q));
    const rs = pick([6, 5]);
    const rf = pick([2, 3, 4, 5, 6, 7, 8]);
    const root = mod12(midiAt(rs, rf));
    const { third, seventh } = shellFrets(rs, rf, q);
    if (third[1] === null || seventh[1] === null) continue;
    const [t3, t7] = SHELL_Q[q];
    return {
      key: `s${rs}${rf}${q}`,
      prompt: `根音已標好（${where(rs, rf)}）。點出 <span class="big">${chordName(root, q)}</span> 殼和弦的三音和七音`,
      all: true,
      marks: [{ s: rs, f: rf, kind: 'root', label: 'R' }],
      targets: [third, seventh],
      hint: `殼和弦只彈根音、三音、七音。根音在第 ${rs} 弦時，${rs === 6 ? '七音在第 4 弦、三音在第 3 弦' : '三音在第 4 弦、七音在第 3 弦'}，五度省略。${DEGREE_NAME[DEGREE[t3]]}是 ${t3} 個半音，${DEGREE_NAME[DEGREE[t7]]}是 ${t7} 個半音。`,
      explain: `${chordName(root, q)}（${ARP[q].formula}）的殼：R 在${where(rs, rf)}，${DEGREE[t3]} 在${where(...third)}，${DEGREE[t7]} 在${where(...seventh)}。三音決定大小，七音決定種類。`,
      answerLabel: `${chordName(root, q)} 殼和弦（根音在第 ${rs} 弦）`,
    };
  }
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

export const GUITAR_ARP_DRILLS = [
  { id: 'garp-formula', group: '吉他琶音', title: '琶音公式', desc: '大、小、7、maj7、m7、m7♭5 由哪些音組成', minutes: 3, steps: [choiceRound('garp-formula', '吉他琶音：公式', formulaQuestion, 8)] },
  { id: 'garp-box', group: '吉他琶音', title: '在一個把位找出琶音', desc: '從根音出發，點出五格內所有和弦音', minutes: 5, steps: [tapRound('garp-box', '吉他琶音：把位', boxQuestion, 5, '點出框內所有屬於這個和弦的音。根音 R 已標好；同一個音名在不同弦上都要點。')] },
  { id: 'garp-caged', group: '吉他琶音', title: 'CAGED 五個琶音位置', desc: 'C、A、G、E、D 型：認位置、點出所有音', minutes: 5, steps: [choiceRound('garp-caged', '吉他琶音：認位置', cagedArpShapeQuestion, 4), tapRound('garp-caged', '吉他琶音：CAGED 位置', cagedBoxQuestion, 4, '點出框內所有屬於這個和弦的音。')] },
  { id: 'garp-degree', group: '吉他琶音', title: '琶音裡的度數', desc: '每個音是 R、3、5 還是 7', minutes: 4, steps: [choiceRound('garp-degree', '吉他琶音：度數', degreeQuestion, 8)] },
  { id: 'garp-hear', group: '吉他琶音', title: '聽琶音辨和弦', desc: '大、小、7、maj7、m7', minutes: 3, steps: [choiceRound('garp-hear', '吉他琶音：聽辨', hearQuestion, 8)] },
  { id: 'gtri-inv', group: '吉他三和弦', title: '認三和弦轉位', desc: '原位、第一、第二轉位：看最低音', minutes: 3, steps: [choiceRound('gtri-inv', '三和弦：轉位', inversionQuestion, 8)] },
  { id: 'gtri-build', group: '吉他三和弦', title: '在弦組上推算三和弦', desc: '四組相鄰的三條弦、三種轉位', minutes: 5, steps: [tapRound('gtri-build', '三和弦：推算指形', triadBuildQuestion, 6, '依題目的弦組與轉位，點出三個音。')] },
  { id: 'gder-interval', group: '吉他三和弦', title: '指板上的音程', desc: '下一條弦的三度、五度、七度、八度；G–B 例外', minutes: 4, speed: true, steps: [tapRound('gder-interval', '推算：音程位置', intervalQuestion, 8, '點指板作答。')] },
  { id: 'gder-shell', group: '吉他三和弦', title: '推算殼和弦', desc: '根音＋三音＋七音，根音在第 6 或第 5 弦', minutes: 4, steps: [tapRound('gder-shell', '推算：殼和弦', shellQuestion, 6, '點出三音和七音（兩個都要點）。')] },
];

Object.assign(CONCEPTS, {
  'garp-formula': { name: '琶音公式', review: () => [choiceRound('garp-formula', '複習：琶音公式', formulaQuestion, 3)] },
  'garp-box': { name: '把位裡的琶音', review: () => [tapRound('garp-box', '複習：琶音把位', boxQuestion, 2)] },
  'garp-caged': { name: 'CAGED 琶音位置', review: () => [choiceRound('garp-caged', '複習：CAGED 琶音', cagedArpShapeQuestion, 2), tapRound('garp-caged', '複習：CAGED 琶音', cagedBoxQuestion, 1)] },
  'garp-degree': { name: '琶音度數', review: () => [choiceRound('garp-degree', '複習：琶音度數', degreeQuestion, 3)] },
  'garp-hear': { name: '聽辨琶音', review: () => [choiceRound('garp-hear', '複習：聽琶音', hearQuestion, 3)] },
  'gtri-inv': { name: '三和弦轉位', review: () => [choiceRound('gtri-inv', '複習：三和弦轉位', inversionQuestion, 3)] },
  'gtri-build': { name: '弦組三和弦', review: () => [tapRound('gtri-build', '複習：弦組三和弦', triadBuildQuestion, 2)] },
  'gder-interval': { name: '指板音程推算', review: () => [tapRound('gder-interval', '複習：指板音程', intervalQuestion, 3)] },
  'gder-shell': { name: '殼和弦推算', review: () => [tapRound('gder-shell', '複習：殼和弦', shellQuestion, 2)] },
});

// Figures for the guide.
export const arpFigure = (root, q, rs) => boxFigure(arpeggioBox(root, q, rs, rootFretFor(rs, root)));
export const cagedArpFigure = (root, q, shape, shift) => boxFigure(cagedArpeggio(root, q, shape, shift));
export const triadFigure = (root, q, inv, set) => {
  const frets = triadShape(root, q, inv, set, 0);
  return { from: Math.max(0, Math.min(...frets) - 1), frets: Math.min(...frets) ? 5 : 4, vertical: true, marks: triadMarks(set, frets, root, { roles: true }), label: `${chordName(root, q)} ${INV[inv]}` };
};
export const shellFigure = (rs, rf, q) => {
  const { third, seventh } = shellFrets(rs, rf, q);
  const root = mod12(midiAt(rs, rf));
  const [t3, t7] = SHELL_Q[q];
  const lo = Math.min(rf, third[1], seventh[1]);
  return {
    from: Math.max(0, lo - 1), frets: 4, vertical: true, label: `${chordName(root, q)} 殼和弦`,
    marks: [{ s: rs, f: rf, kind: 'root', label: 'R' }, { s: third[0], f: third[1], kind: 'tone', label: DEGREE[t3] }, { s: seventh[0], f: seventh[1], kind: 'tone', label: DEGREE[t7] },
      ...[6, 5, 4, 3, 2, 1].filter((s) => s !== rs && s !== third[0] && s !== seventh[0]).map((s) => ({ s, f: 0, kind: 'mute', label: '×' }))],
  };
};
