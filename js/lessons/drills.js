// 樂理練習：tap-to-answer theory drills that need no keyboard, for phones in
// portrait (and anyone without a keyboard at hand). Each drill builds a fresh
// round of choice questions; notation questions draw the staff above the answers.
import {
  CONCEPTS, INTERVAL_EAR, INTERVAL_HARM, KEY_QUIZ, QUALITY_EAR, ROMAN_QUIZ, SCALE_EAR, TRIAD_EAR,
} from './concepts.js';
import { GUITAR_DRILLS } from './guitar.js';
import { GUITAR_CHORD_DRILLS } from './guitar-chords.js';
import { shuffleDraw } from './kit.js';

const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const SEMIS = [0, 2, 4, 5, 7, 9, 11];
// Diatonic step number → MIDI note (white keys only). Middle C (C4) is step 28.
export const midiOf = (d) => 12 * Math.floor(d / 7) + SEMIS[d % 7] + 12;
const letterOf = (d) => LETTERS[d % 7];
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
// k distinct items, none repeated back to back within a round.
const draw = (pool, k) => shuffleDraw(pool, k);
// The answer plus wrong options, shuffled; returns { options, answer }.
function optionsWith(answer, pool, n) {
  const wrong = pool.filter((x) => x !== answer).sort(() => Math.random() - 0.5).slice(0, n - 1);
  const options = [answer, ...wrong].sort(() => Math.random() - 0.5);
  return { options, answer: options.indexOf(answer) };
}

// ---------- reading notes ----------

const CLEF = {
  treble: { name: '高音譜號', bottom: 30, lines: 'E G B D F', spaces: 'F A C E', low: 28, high: 40 }, // E4 bottom line; C4–A5
  bass: { name: '低音譜號', bottom: 18, lines: 'G B D F A', spaces: 'A C E G', low: 16, high: 28 }, // G2 bottom line; E2–C4
};
const NUM = ['一', '二', '三', '四', '五'];
// Where a note sits on the staff, in words: 第三線, 第二間, 下加一線…
function placeOf(d, clef) {
  const pos = d - CLEF[clef].bottom; // 0 = bottom line, 8 = top line
  if (pos >= 0 && pos <= 8) return pos % 2 === 0 ? `第${NUM[pos / 2]}線` : `第${NUM[(pos - 1) / 2]}間`;
  if (pos < 0) return pos % 2 === 0 ? `下加${NUM[-pos / 2 - 1]}線` : `下加${NUM[(-pos - 1) / 2]}間`;
  const up = pos - 8;
  return up % 2 === 0 ? `上加${NUM[up / 2 - 1]}線` : `上加${NUM[(up - 1) / 2]}間`;
}

function readQuestion(clef) {
  const c = CLEF[clef];
  const d = pick(range(c.low, c.high));
  const n = midiOf(d);
  return {
    prompt: `${c.name}：這個音是？`,
    staff: { notes: [{ n, d: 4 }], clef, scale: 1.7, label: `${c.name}上的一個音` },
    options: LETTERS, answer: d % 7,
    hint: `從最近的線往上或往下數。${c.name}的線由下往上是 ${c.lines}。`,
    explain: `${placeOf(d, clef)}是 ${letterOf(d)}${n === 60 ? '（中央 C）' : ''}。${c.name}的線由下往上是 ${c.lines}，間是 ${c.spaces}。`,
  };
}

// ---------- intervals and chords on the staff ----------

const DEGREE = ['一度', '二度', '三度', '四度', '五度', '六度', '七度', '八度'];
function intervalQuestion() {
  const k = pick(range(1, 7));
  const d1 = pick(range(28, 40 - k));
  const d2 = d1 + k;
  const together = Math.random() < 0.4;
  const notes = together ? [{ n: [midiOf(d1), midiOf(d2)], d: 4 }] : [{ n: midiOf(d1), d: 2 }, { n: midiOf(d2), d: 2 }];
  const names = range(d1, d2).map(letterOf).join('、');
  return {
    prompt: together ? '兩個音疊在一起。這是幾度？' : '從第一個音到第二個音，是幾度？',
    staff: { notes, clef: 'treble', scale: 1.7, label: '譜上的兩個音' },
    options: DEGREE.slice(1), answer: k - 1,
    hint: '從下面的音數到上面的音，頭尾都算。',
    explain: `${letterOf(d1)} 到 ${letterOf(d2)}：${names}，共 ${k + 1} 個音名，是${DEGREE[k]}。譜上看：${k % 2 === 0 ? '奇數度（三、五、七度）是線到線或間到間' : '偶數度（二、四、六、八度）是線到間或間到線'}。`,
  };
}

const TRIADS = ['C', 'Dm', 'Em', 'F', 'G', 'Am', 'B°']; // by root letter
const INV = ['原位', '第一轉位', '第二轉位'];
function chordQuestion() {
  const inv = Math.random() < 0.5 ? 0 : pick([1, 2]);
  const root = pick(inv ? range(28, 31) : range(28, 34)); // C4–F4 (or A4 in root position)
  const tones = [root, root + 2, root + 4];
  const stacked = inv === 0 ? tones : inv === 1 ? [tones[1], tones[2], tones[0] + 7] : [tones[2], tones[0] + 7, tones[1] + 7];
  const name = TRIADS[root % 7];
  const staff = { notes: [{ n: stacked.map(midiOf), d: 4 }], clef: 'treble', scale: 1.7, label: '譜上的一個和弦' };
  const spelled = tones.map(letterOf).join('–');
  if (Math.random() < 0.6) {
    return {
      prompt: '這是哪個和弦？', staff, ...optionsWith(name, TRIADS, 4),
      hint: '先把音排成「隔一個疊一個」，最下面的就是根音。',
      explain: `由下往上是 ${stacked.map(letterOf).join('–')}${inv ? `，排成三度堆疊是 ${spelled}，根音是 ${letterOf(root)}` : `，三個音疊成三度，根音是 ${letterOf(root)}`}：${name}。`,
    };
  }
  return {
    prompt: `這個 ${name} 和弦是原位還是轉位？`, staff, options: INV, answer: inv,
    hint: '看最低的音是根音、三音還是五音。',
    explain: `最低音是 ${letterOf(stacked[0])}，${['根音', '三音', '五音'][inv]}在最下面：${INV[inv]}。`,
  };
}

// ---------- note values ----------

const VALUES = [
  { d: 4, note: '全音符', rest: '全休止符' },
  { d: 3, note: '附點二分音符' },
  { d: 2, note: '二分音符', rest: '二分休止符' },
  { d: 1.5, note: '附點四分音符' },
  { d: 1, note: '四分音符', rest: '四分休止符' },
  { d: 0.5, note: '八分音符', rest: '八分休止符' },
];
const BEATS = ['4 拍', '3 拍', '2 拍', '1 拍半', '1 拍', '半拍'];
function valueQuestion() {
  const v = pick(VALUES);
  const rest = v.rest && Math.random() < 0.35;
  const i = VALUES.indexOf(v);
  return {
    prompt: rest ? '這個休止符停幾拍？（四分音符＝1 拍）' : '這個音符有幾拍？（四分音符＝1 拍）',
    staff: { notes: [{ n: rest ? null : 71, d: v.d }], clef: 'treble', scale: 1.7, label: rest ? '一個休止符' : '一個音符' },
    options: BEATS, answer: i,
    hint: '空心或實心、有沒有符桿、符尾、附點，各代表不同長度。',
    explain: `這是${rest ? v.rest : v.note}：${BEATS[i]}。${v.d === 3 || v.d === 1.5 ? '附點會讓長度多一半。' : ''}`,
  };
}

// ---------- key signatures ----------

const KEYS = [
  { key: 'C', name: 'C 大調', minor: 'A 小調', sig: '沒有升降記號' },
  { key: 'G', name: 'G 大調', minor: 'E 小調', sig: '一個升記號 F♯' },
  { key: 'D', name: 'D 大調', minor: 'B 小調', sig: '兩個升記號 F♯、C♯' },
  { key: 'A', name: 'A 大調', minor: 'F♯ 小調', sig: '三個升記號 F♯、C♯、G♯' },
  { key: 'F', name: 'F 大調', minor: 'D 小調', sig: '一個降記號 B♭' },
  { key: 'Bb', name: 'B♭ 大調', minor: 'G 小調', sig: '兩個降記號 B♭、E♭' },
  { key: 'Eb', name: 'E♭ 大調', minor: 'C 小調', sig: '三個降記號 B♭、E♭、A♭' },
];
function keyQuestion() {
  const k = pick(KEYS);
  const rule = k.key === 'C' ? '' : k.sig.includes('升')
    ? '升記號調：最後一個升記號往上半音，就是大調的主音。'
    : k.key === 'F' ? '一個降記號的 F 大調要直接記住。' : '降記號調：倒數第二個降記號，就是大調的主音。';
  const staff = { notes: [], clef: Math.random() < 0.7 ? 'treble' : 'bass', key: k.key, scale: 1.7, label: `調號：${k.sig}` };
  if (Math.random() < 0.7) {
    return {
      prompt: '這個調號是哪個大調？', staff, ...optionsWith(k.name, KEYS.map((x) => x.name), 4),
      hint: '數一數有幾個升記號或降記號。',
      explain: `${k.sig}：${k.name}。${rule}`,
    };
  }
  return {
    prompt: '這個調號的關係小調是？', staff, ...optionsWith(k.minor, KEYS.map((x) => x.minor), 4),
    hint: '先認出大調，再從大調主音往下數小三度。',
    explain: `${k.sig}是 ${k.name}，往下小三度就是關係小調：${k.minor}。`,
  };
}

// ---------- drills ----------

const round = (concept, kicker, make, k) => () => {
  const items = [];
  let guard = 0;
  while (items.length < k && guard++ < 200) {
    const q = make();
    if (!items.some((x) => x.prompt === q.prompt && JSON.stringify(x.staff) === JSON.stringify(q.staff))) items.push(q);
  }
  return { type: 'choice', kicker, concept, items };
};
const bank = (concept, kicker, items, k) => () => ({ type: 'choice', kicker, concept, items: draw(items, Math.min(k, items.length)) });

export const DRILLS = [
  { id: 'read-treble', group: '讀譜', title: '高音譜號', desc: '看譜上的位置，說出音名', minutes: 3, steps: [round('read-treble', '讀譜：高音譜號', () => readQuestion('treble'), 10)] },
  { id: 'read-bass', group: '讀譜', title: '低音譜號', desc: '左手的譜：線是 G B D F A', minutes: 3, steps: [round('read-bass', '讀譜：低音譜號', () => readQuestion('bass'), 10)] },
  { id: 'read-mixed', group: '讀譜', title: '兩種譜號混合', desc: '高音、低音譜號輪流出現', minutes: 4, steps: [round('read-treble', '讀譜：高音譜號', () => readQuestion('treble'), 6), round('read-bass', '讀譜：低音譜號', () => readQuestion('bass'), 6)] },
  { id: 'note-values', group: '符號', title: '音符與休止符', desc: '全音符到八分音符、附點、休止符', minutes: 3, steps: [round('note-values', '符號：時值', valueQuestion, 8)] },
  { id: 'key-sig', group: '符號', title: '調號', desc: '三個升降記號以內的大調與關係小調', minutes: 3, steps: [round('key-sig', '符號：調號', keyQuestion, 8)] },
  { id: 'interval-read', group: '看譜分析', title: '音程（看譜）', desc: '數出兩個音是幾度', minutes: 3, steps: [round('interval-read', '看譜：音程', intervalQuestion, 8)] },
  { id: 'chord-read', group: '看譜分析', title: '三和弦（看譜）', desc: '認出和弦名稱與轉位', minutes: 4, steps: [round('chord-read', '看譜：三和弦', chordQuestion, 8)] },
  { id: 'ear-interval', group: '聽力', title: '聽音程', desc: '先後響與同時響的音程', minutes: 4, ear: true, steps: [bank('interval-ear', '聽力：先後響', INTERVAL_EAR, 5), bank('interval-ear', '聽力：同時響', INTERVAL_HARM, 4)] },
  { id: 'ear-chord', group: '聽力', title: '聽和弦性質', desc: '大、小、減三和弦與三種七和弦', minutes: 4, ear: true, steps: [bank('triad-quality', '聽力：三和弦', TRIAD_EAR, 5), bank('quality-ear', '聽力：七和弦', QUALITY_EAR, 3)] },
  { id: 'ear-scale', group: '聽力', title: '聽大小調音階', desc: '大調與三種小調', minutes: 3, ear: true, steps: [bank('scale-ear', '聽力：音階', SCALE_EAR, 4)] },
  { id: 'concepts', group: '觀念', title: '調性與級數', desc: '關係大小調、和聲小調、順階和弦級數', minutes: 3, steps: [bank('key-relations', '觀念：大小調', KEY_QUIZ, 4), bank('diatonic-roman', '觀念：級數', ROMAN_QUIZ, 4)] },
  ...GUITAR_DRILLS,
  ...GUITAR_CHORD_DRILLS,
];

export const findDrill = (id) => DRILLS.find((x) => x.id === id);

// The notation concepts live here with their question builders; register them in
// the shared concept bank so missed answers come back in the daily review.
Object.assign(CONCEPTS, {
  'interval-read': { name: '看譜數音程', review: () => [round('interval-read', '複習：看譜數音程', intervalQuestion, 3)] },
  'chord-read': { name: '看譜認和弦', review: () => [round('chord-read', '複習：看譜認和弦', chordQuestion, 3)] },
  'note-values': { name: '音符與休止符', review: () => [round('note-values', '複習：音符時值', valueQuestion, 3)] },
  'key-sig': { name: '調號', review: () => [round('key-sig', '複習：調號', keyQuestion, 3)] },
});
