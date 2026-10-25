// Concept bank: every graded item belongs to a concept. Spaced review pulls due
// concepts into the next warm-up (and the daily review) using each concept's
// review() steps.
import { CH, HANON, INV, N, SCALE, SHELL, as, play, posFinger, rhUp, shuffleDraw } from './kit.js';

export { shuffleDraw };

const findNote = (pitchClass, label) => () => ({
  type: 'find', finger: posFinger,
  kicker: `複習：找 ${label}`,
  instruction: '任何一個八度都可以。',
  targets: shuffleDraw([48, 60, 72].map((c) => c + pitchClass).filter((n) => n <= 72), 3),
  hint: 'delay',
  concept: () => `note-${label}`,
});

const melody = (kicker, title, pairs, concept, instruction = '') => ({
  type: 'melody', kicker, title, hint: 'show', concept, instruction,
  notes: pairs.map(([n, f]) => ({ n, f })),
});

// Ear questions that compare two short progressions.
const pickOne = (concept, kicker, bank) => () => ({
  type: 'choice', kicker, concept, items: shuffleDraw(bank, 2).map((q) => ({ ...q })),
});

export const QUALITY_EAR = [
  { prompt: '這是哪一種七和弦？', play: play([CH.Cmaj7], 3), options: ['大七和弦（maj7）', '屬七和弦（7）', '小七和弦（m7）'], answer: 0, explain: '大七和弦明亮、柔和，最上面的 7 度只差半音就回到根音。' },
  { prompt: '這是哪一種七和弦？', play: play([CH.G7], 3), options: ['大七和弦（maj7）', '屬七和弦（7）', '小七和弦（m7）'], answer: 1, explain: '屬七和弦裡有三全音，聽起來「想往前走」。' },
  { prompt: '這是哪一種七和弦？', play: play([CH.Dm7], 3), options: ['大七和弦（maj7）', '屬七和弦（7）', '小七和弦（m7）'], answer: 2, explain: '小七和弦柔和偏暗，沒有急著解決的感覺。' },
];

export const BORROWED_EAR = [
  { prompt: '聽這段：C → F → ? → C。第三個和弦是？', play: play([CH.C, CH.F_C, CH.Fm, CH.C]), options: ['F（原本的 IV）', 'Fm（借來的 iv）'], answer: 1, explain: 'A 降成 A♭，大和弦變成小和弦，這就是借自 C 小調的 iv。' },
  { prompt: '聽這段：C → ? → ? → C。中間兩個和弦是？', play: play([CH.C, CH.Ab, CH.Bb, CH.C]), options: ['Am → G（調內和弦）', 'A♭ → B♭（借來的 ♭VI → ♭VII）'], answer: 1, explain: '♭VI → ♭VII → I 帶著明亮又意外的色彩，流行與電玩配樂很常用。' },
  { prompt: '聽這段：C → F → ? → C。第三個和弦是？', play: play([CH.C, CH.F_C, CH.F_C, CH.C]), options: ['F（原本的 IV）', 'Fm（借來的 iv）'], answer: 0, explain: '這次沒有借用，四個和弦都在 C 大調裡。' },
];

export const TRITONE_EAR = [
  { prompt: '這段 ii–V–I 的第二個和弦是？注意低音的走向。', play: play([SHELL.Dm7, SHELL.Db7, SHELL.Cmaj7]), options: ['G7（低音 D→G→C，跳進）', 'D♭7（低音 D→D♭→C，半音下行）'], answer: 1, explain: '低音一路半音往下：D、D♭、C。這就是三全音代理。' },
  { prompt: '這段 ii–V–I 的第二個和弦是？注意低音的走向。', play: play([SHELL.Dm7, SHELL.G7, SHELL.Cmaj7]), options: ['G7（低音 D→G→C，跳進）', 'D♭7（低音 D→D♭→C，半音下行）'], answer: 0, explain: '低音從 D 跳到 G 再到 C，是原本的屬七和弦。' },
];


// Intervals: build one up from a given note. Every answer is a white key, so
// note names on screen always match the interval's spelling.
export const INTERVALS = [
  { root: N.E4, name: '小二度', t: N.F4 }, { root: N.B4, name: '小二度', t: N.C5 },
  { root: N.C4, name: '大二度', t: N.D4 }, { root: N.G4, name: '大二度', t: N.A4 },
  { root: N.A4, name: '小三度', t: N.C5 }, { root: N.D4, name: '小三度', t: N.F4 }, { root: N.E4, name: '小三度', t: N.G4 },
  { root: N.C4, name: '大三度', t: N.E4 }, { root: N.F4, name: '大三度', t: N.A4 }, { root: N.G4, name: '大三度', t: N.B4 },
  { root: N.C4, name: '純四度', t: N.F4 }, { root: N.D4, name: '純四度', t: N.G4 },
  { root: N.F4, name: '三全音', t: N.B4 },
  { root: N.C4, name: '純五度', t: N.G4 }, { root: N.D4, name: '純五度', t: N.A4 },
  { root: N.E4, name: '小六度', t: N.C5 }, { root: N.C4, name: '大六度', t: N.A4 },
  { root: N.D4, name: '小七度', t: N.C5 }, { root: N.C4, name: '大七度', t: N.B4 },
  { root: N.C4, name: '純八度', t: N.C5 },
];
const LETTER = ['C', '', 'D', '', 'E', 'F', '', 'G', '', 'A', '', 'B'];
// Thumb on the lower note; the upper note takes the finger that reaches it in
// one hand position (2nd → 2, 3rd → 3, 4th/tritone → 4, 5th and wider → 5, stretching).
export const intervalFinger = (semis) => (semis <= 2 ? '2' : semis <= 4 ? '3' : semis <= 6 ? '4' : '5');

// k questions with different answers (a find step looks its prompt up by answer).
export function intervalFind({ kicker, title, hint, k = 5, names = null }) {
  const pool = INTERVALS.filter((q) => !names || names.includes(q.name));
  const picks = [];
  for (const q of shuffleDraw(pool, pool.length * 4)) {
    if (picks.length === k) break;
    if (!picks.some((p) => p.t % 12 === q.t % 12)) picks.push(q);
  }
  const byTarget = new Map(picks.map((q) => [q.t, q]));
  return {
    type: 'find', kicker, title, hint,
    instruction: '拇指放在出發的音上，往上數；琴鍵上的數字是建議用哪一指。答案彈在哪個八度都可以。',
    finger: (t) => intervalFinger(t - byTarget.get(t).root),
    targets: picks.map((q) => q.t),
    promptFor: (t) => `從 <b>${LETTER[byTarget.get(t).root % 12]}</b> 往上一個 <span class="big">${byTarget.get(t).name}</span>`,
    concept: () => 'interval-build',
  };
}

const iv = (lo, hi, options, answer, explain, harmonic = false) => ({
  prompt: harmonic ? '兩個音一起響。這是哪一種音程？' : '先低後高。這是哪一種音程？',
  play: harmonic ? [{ n: [lo, hi], d: 3 }] : [{ n: lo, d: 1 }, { n: hi, d: 2 }],
  options, answer, explain,
});
const THIRDS = ['大三度', '小三度'];
const SECONDS = ['小二度', '大二度'];
export const INTERVAL_EAR = [
  iv(N.C4, N.E4, THIRDS, 0, '大三度明亮，像〈聖者進行曲〉開頭的 C→E。'),
  iv(N.A3, N.C4, THIRDS, 1, '小三度偏暗，像〈綠袖子〉開頭的 A→C。'),
  iv(N.C4, N.D4, SECONDS, 1, '大二度就是音階裡普通的一步。'),
  iv(N.E4, N.F4, SECONDS, 0, '小二度很緊，像電影《大白鯊》那兩個逼近的音。'),
  iv(N.C4, N.F4, ['純四度', '純五度', '大六度'], 0, '純四度像華格納〈婚禮合唱〉的開頭。'),
  iv(N.C4, N.G4, ['純四度', '純五度', '大六度'], 1, '純五度空曠而穩，〈小星星〉第二個音就是往上跳五度。'),
  iv(N.C4, N.A4, ['純五度', '大六度', '小七度'], 1, '大六度寬而溫暖，像〈我的邦尼〉（My Bonnie）的開頭。'),
  iv(N.D4, N.C5, ['小七度', '大七度', '純八度'], 0, '小七度比八度少一個全音，有一點「還沒到」的感覺。'),
  iv(N.C4, N.C5, ['大七度', '純八度'], 1, '八度是同一個音名，只是高了一層，兩個音幾乎融在一起。'),
];
export const INTERVAL_HARM = [
  iv(N.C4, N.E4, THIRDS, 0, '同時響的大三度：甜、亮。', true),
  iv(N.D4, N.F4, THIRDS, 1, '同時響的小三度：柔、暗。', true),
  iv(N.C4, N.G4, ['大三度', '純五度', '大七度'], 1, '純五度很「空」，像號角，也像吉他的強力和弦。', true),
  iv(N.C4, N.B4, ['大三度', '純五度', '大七度'], 2, '大七度很刺，但放進和弦裡就是 maj7 的夢幻色彩。', true),
  iv(N.F4, N.B4, ['純四度', '三全音', '純五度'], 1, '三全音正好把八度切成兩半，是最不穩定的音程。', true),
  iv(N.E4, N.F4, SECONDS, 0, '同時響的小二度幾乎在摩擦。', true),
];
// Hear C then a second note; play the second note.
export const INTERVAL_LISTEN = [N.D4, N.E4, N.F4, N.G4, N.A4, N.C5].map((n) => ({ root: N.C4, n }));

const SCALE_OPTS = ['A 大調', 'A 自然小調', 'A 和聲小調', 'A 旋律小調'];
const sq = (s, answer, explain) => ({
  prompt: '從 A 開始往上彈。這是哪一種音階？', play: s.map((n) => ({ n, d: 1 })), bpm: 132, options: SCALE_OPTS, answer, explain,
});
export const SCALE_EAR = [
  sq(SCALE.major, 0, '有 C♯：第三個音是大三度，聽起來明亮。'),
  sq(SCALE.natural, 1, '全是白鍵，最後 G→A 是全音，結尾比較「鬆」。'),
  sq(SCALE.harmonic, 2, 'F→G♯ 跨了一個增二度，有一點異國的味道。'),
  sq(SCALE.melodic, 3, '後半段 F♯、G♯ 讓上行很順，像大調；但第三個音仍是小三度的 C。'),
];

export const KEY_QUIZ = [
  { prompt: 'C 大調的關係小調是？', options: ['A 小調', 'C 小調', 'E 小調'], answer: 0, explain: '關係大小調用同一組音：C 大調和 A 小調都只用白鍵。' },
  { prompt: 'A 小調的同主音大調是？', options: ['C 大調', 'A 大調', 'E 大調'], answer: 1, explain: '同主音：主音都是 A，但 A 大調有 C♯、F♯、G♯。' },
  { prompt: '和聲小調把自然小調的哪一個音升高半音？', options: ['第 3 音', '第 6 音', '第 7 音'], answer: 2, explain: '升高第 7 音，讓它離主音只差半音（導音），V 級也變成大三和弦。' },
  { prompt: '旋律小調下行時，傳統上怎麼彈？', options: ['和上行一樣', '還原成自然小調', '再升高第 3 音'], answer: 1, explain: '上行升高第 6、7 音，下行還原成自然小調。' },
  { prompt: '自然小調的全音、半音排列是？', options: ['全全半全全全半', '全半全全半全全', '全全全半全全半'], answer: 1, explain: '從 A 走白鍵：A–B 全、B–C 半、C–D 全、D–E 全、E–F 半、F–G 全、G–A 全。' },
  { prompt: 'G 大調的關係小調是？', options: ['E 小調', 'G 小調', 'D 小調'], answer: 0, explain: '從大調主音往下一個小三度，就是關係小調的主音：G → E。' },
];

const iq = (c, answer) => ({
  prompt: `這是 ${c.tones[0]} 和弦。最低音是哪一個？`,
  play: [...c.voicing.map((n) => ({ n, d: 0.5 })), { n: c.voicing, d: 2 }],
  options: [`根音 ${c.tones[0]}（原位）`, `三音 ${c.tones[1]}（第一轉位）`, `五音 ${c.tones[2]}（第二轉位）`],
  answer,
  explain: `最低的 ${c.tones[answer]} 決定了它是${['原位', '第一轉位', '第二轉位'][answer]}。`,
});
export const INVERSION_EAR = [
  iq(INV.C, 0), iq(INV.C_E, 1), iq(INV.C_G, 2), iq(INV.F, 0), iq(INV.F_A, 1), iq(INV.F_C, 2), iq(INV.G_B, 1), iq(INV.G_D, 2),
];
// Smooth I–vi–IV–V–I: each chord keeps the common tones and moves the rest by step.
export const SMOOTH = [as(INV.C, 'I'), as(INV.Am_C, 'vi'), as(INV.F_C, 'IV'), as(INV.G_B, 'V'), as(INV.C, 'I')];

// Passing diminished: I – ♯i°7 – ii – V7 – I. Only C moves up to C♯ (plus B♭).
export const PASSING = [as(CH.C, 'I'), as(CH.Csdim7, '♯i°7'), as(CH.Dm, 'ii'), as(CH.G7, 'V7'), as(CH.C, 'I')];
const QUAL = ['屬七和弦', '減七和弦', '小七和弦'];
export const DIM_EAR = [
  { prompt: '這是哪一種和弦？', play: play([CH.Bdim7], 3), options: QUAL, answer: 1, explain: '全部由小三度疊成，緊張、懸疑，像默片裡反派登場的和弦。' },
  { prompt: '這是哪一種和弦？', play: play([CH.G7], 3), options: QUAL, answer: 0, explain: '屬七和弦有大三度，比減七和弦「亮」，但一樣想往前走。' },
  { prompt: '聽這段：C → ? → Dm。中間的和弦是？', play: play([CH.C, CH.Csdim7, CH.Dm]), options: ['A7（次屬和弦）', 'C♯°7（經過減和弦）'], answer: 1, explain: 'C♯°7 沒有 A，聽起來更懸、更像在兩個和弦之間鋪了一級台階。' },
  { prompt: '聽這段：C → ? → Dm。中間的和弦是？', play: play([CH.C, CH.A7, CH.Dm]), options: ['A7（次屬和弦）', 'C♯°7（經過減和弦）'], answer: 0, explain: 'A7 有根音 A 撐著，比較穩。兩者只差一個音，所以常可以互換。' },
  { prompt: '聽這段：B°7 → ?。減七和弦解決到哪裡？', play: play([CH.Bdim7, CH.C]), options: ['C（I）', 'Am（vi）'], answer: 0, explain: 'B→C、F→E、A♭→G：每個音都只走半音或全音就到家。' },
];

const MAJ7_WIDE = as(CH.Cmaj7, '', { voicing: [N.C3, N.B3, N.E4, N.G4] });
const G7_WIDE = as(CH.G7, '', { voicing: [N.G3, N.B3, N.F4] });
const DM7_WIDE = as(CH.Dm7, '', { voicing: [N.D3, N.C4, N.F4, N.A4] });
export const EXT_EAR = [
  { prompt: '這是 Cmaj7 還是 Cmaj9？', play: play([CH.Cmaj9], 3), options: ['Cmaj7', 'Cmaj9'], answer: 1, explain: '多了 D（9 度），聲音更透明、更像城市夜景。' },
  { prompt: '這是 Cmaj7 還是 Cmaj9？', play: play([MAJ7_WIDE], 3), options: ['Cmaj7', 'Cmaj9'], answer: 0, explain: '只有 C、E、G、B，沒有 9 度的那一點「光暈」。' },
  { prompt: '這是 G7 還是 G13？', play: play([CH.G13], 3), options: ['G7', 'G13'], answer: 1, explain: 'E（13 度）放在 F 旁邊，屬和弦一下子變得溫暖、有爵士味。' },
  { prompt: '這是 G7 還是 G13？', play: play([G7_WIDE], 3), options: ['G7', 'G13'], answer: 0, explain: '只有根音、三音和七音：乾淨的屬七和弦。' },
  { prompt: '這是 Dm7 還是 Dm9？', play: play([CH.Dm9], 3), options: ['Dm7', 'Dm9'], answer: 1, explain: 'E 夾在 C 和 F 中間，小七和弦變得柔軟。' },
  { prompt: '這是 Dm7 還是 Dm9？', play: play([DM7_WIDE], 3), options: ['Dm7', 'Dm9'], answer: 0, explain: 'D、F、A、C：沒有延伸音的小七和弦。' },
];
// ii9 – V13 – Imaj9: the right hand moves one finger at a time.
export const EXT_251 = [as(CH.Dm9, 'ii9'), as(CH.G13, 'V13'), as(CH.Cmaj9, 'Imaj9')];

export const CONCEPTS = {
  'note-C': { name: '找 C', review: () => [findNote(0, 'C')] },
  'note-D': { name: '找 D', review: () => [findNote(2, 'D')] },
  'note-E': { name: '找 E', review: () => [findNote(4, 'E')] },
  'note-F': { name: '找 F', review: () => [findNote(5, 'F')] },
  'note-G': { name: '找 G', review: () => [findNote(7, 'G')] },
  'middle-c': {
    name: '中央 C',
    review: () => [{
      type: 'find', finger: posFinger, kicker: '複習：中央 C', targets: [60], match: 'exact', hint: 'delay',
      promptFor: () => '彈 <span class="big">中央 C</span>', concept: () => 'middle-c',
    }],
  },
  'ear-CDE': {
    name: '聽辨 C D E',
    review: () => [() => ({
      type: 'listen', finger: posFinger, kicker: '複習：聽→彈', items: shuffleDraw([60, 62, 64], 3),
      candidates: [60, 62, 64], instruction: '答案在中央 C、D、E 之中（淡藍框）。', concept: 'ear-CDE',
    })],
  },
  'ear-CG': {
    name: '聽辨 C 到 G',
    review: () => [() => ({
      type: 'listen', finger: posFinger, kicker: '複習：聽→彈', items: shuffleDraw([60, 62, 64, 65, 67], 3),
      candidates: [60, 62, 64, 65, 67], instruction: '答案在中央 C 到 G 之間（淡藍框）。', concept: 'ear-CG',
    })],
  },
  'finger-123': {
    name: '右手 1-2-3 指',
    review: () => [melody('複習：指法', 'C D E D C', [[60, 1], [62, 2], [64, 3], [62, 2], [60, 1]], 'finger-123', '拇指放中央 C，照指號彈。')],
  },
  'finger-five': {
    name: '右手五指位置',
    review: () => [melody('複習：五指位置', 'C D E F G F E D C', [[60, 1], [62, 2], [64, 3], [65, 4], [67, 5], [65, 4], [64, 3], [62, 2], [60, 1]], 'finger-five', '一指一鍵，手不移動。')],
  },
  'finger-lh': {
    name: '左手五指位置',
    review: () => [melody('複習：左手', 'C D E F G（左手）', [[48, 5], [50, 4], [52, 3], [53, 2], [55, 1], [53, 2], [52, 3], [50, 4], [48, 5]], 'finger-lh', '左手小指放低八度的 C。')],
  },
  'thumb-under': {
    name: '穿指（C 大調音階）',
    review: () => [melody('複習：穿指', 'C 大調音階（上行）', [[60, 1], [62, 2], [64, 3], [65, 1], [67, 2], [69, 3], [71, 4], [72, 5]], 'thumb-under', '彈完 E（3 指）後，拇指從下面穿過去彈 F。')],
  },
  'rhythm-basic': {
    name: '四分、二分與休止符',
    review: () => [{ type: 'rhythm', kicker: '複習：節奏', title: '長短與休止', pattern: [{ d: 1 }, { d: 1 }, { d: 2 }, { d: 1, n: null }, { d: 1 }, { d: 2 }], bpm: 66, concept: 'rhythm-basic' }],
  },
  'rhythm-eighth': {
    name: '八分音符與附點',
    review: () => [{ type: 'rhythm', kicker: '複習：節奏', title: '八分與附點', pattern: [{ d: 0.5 }, { d: 0.5 }, { d: 1 }, { d: 1.5 }, { d: 0.5 }, { d: 4 }], bpm: 62, concept: 'rhythm-eighth' }],
  },
  'read-treble': {
    name: '讀高音譜號',
    review: () => [() => ({ type: 'find', finger: posFinger, staff: true, clef: 'treble', match: 'exact', kicker: '複習：讀譜', targets: shuffleDraw([60, 62, 64, 65, 67, 69, 71, 72], 4), hint: 'delay', concept: () => 'read-treble' })],
  },
  'read-bass': {
    name: '讀低音譜號',
    review: () => [() => ({ type: 'find', finger: posFinger, staff: true, clef: 'bass', match: 'exact', kicker: '複習：讀低音譜號', targets: shuffleDraw([48, 50, 52, 53, 55, 57, 59], 4), hint: 'delay', concept: () => 'read-bass' })],
  },
  'accomp-patterns': {
    name: '伴奏型指法',
    review: () => [melody('複習：伴奏型', '根音五度 → 分解和弦', [[48, 5], [55, 1], [48, 5], [55, 1], [48, 5], [52, 3], [55, 1], [52, 3]], 'accomp-patterns', '左手 5-1-5-1，再 5-3-1-3。')],
  },
  alberti: {
    name: 'Alberti 低音',
    review: () => [{ type: 'rhythm', kicker: '複習：Alberti', title: 'C–G–E–G', clef: 'bass', bpm: 66, concept: 'alberti', pattern: [48, 55, 52, 55, 48, 55, 52, 55].map((n) => ({ n, d: 0.5 })).concat([{ n: 48, d: 4 }]) }],
  },
  'triad-CFG': {
    name: 'C、F、G 三和弦',
    review: () => [() => ({ type: 'chords', kicker: '複習：三和弦', hint: 'delay', concept: 'triad-CFG', chords: shuffleDraw([CH.C, CH.F, CH.G], 3) })],
  },
  'prog-145': {
    name: 'I–IV–V–I',
    review: () => [{ type: 'chords', progression: true, kicker: '複習：和弦進行', title: 'I–IV–V–I', hint: 'show', concept: 'prog-145', chords: [as(CH.C, 'I'), as(CH.F_C, 'IV'), as(CH.G_B, 'V'), as(CH.C, 'I')] }],
  },
  'chord-7th': {
    name: '七和弦',
    review: () => [() => ({ type: 'chords', kicker: '複習：七和弦', hint: 'delay', concept: 'chord-7th', chords: shuffleDraw([CH.Cmaj7, CH.G7, CH.Dm7, CH.Am7], 3) })],
  },
  'quality-ear': { name: '聽辨七和弦', review: () => [pickOne('quality-ear', '複習：聽辨七和弦', QUALITY_EAR)] },
  'prog-251': {
    name: 'ii–V–I',
    review: () => [{ type: 'chords', progression: true, bass: true, kicker: '複習：ii–V–I', title: 'Dm7 → G7 → Cmaj7', hint: 'show', concept: 'prog-251', chords: [SHELL.Dm7, SHELL.G7, SHELL.Cmaj7] }],
  },
  borrowed: {
    name: '借用和弦',
    review: () => [{ type: 'chords', progression: true, kicker: '複習：借用和弦', title: 'I–♭VI–♭VII–I', hint: 'delay', concept: 'borrowed', chords: [as(CH.C, 'I'), as(CH.Ab, '♭VI'), as(CH.Bb, '♭VII'), as(CH.C, 'I')] }],
  },
  'borrowed-ear': { name: '聽出借用和弦', review: () => [pickOne('borrowed-ear', '複習：聽出借用和弦', BORROWED_EAR)] },
  secdom: {
    name: '次屬和弦',
    review: () => [() => ({ type: 'chords', kicker: '複習：次屬和弦', hint: 'delay', concept: 'secdom', chords: shuffleDraw([as(CH.D7, 'V7/V'), as(CH.E7, 'V7/vi'), as(CH.A7, 'V7/ii')], 3) })],
  },
  'tritone-sub': {
    name: '三全音代理',
    review: () => [{ type: 'chords', progression: true, bass: true, kicker: '複習：三全音代理', title: 'Dm7 → D♭7 → Cmaj7', hint: 'delay', concept: 'tritone-sub', chords: [SHELL.Dm7, SHELL.Db7, SHELL.Cmaj7] }],
  },
  'tritone-ear': { name: '聽出三全音代理', review: () => [pickOne('tritone-ear', '複習：聽出三全音代理', TRITONE_EAR)] },
  'interval-build': {
    name: '彈出音程',
    review: () => [() => intervalFind({ kicker: '複習：彈出音程', hint: 'delay', k: 3 })],
  },
  'interval-ear': { name: '聽辨音程', review: () => [pickOne('interval-ear', '複習：聽辨音程', [...INTERVAL_EAR, ...INTERVAL_HARM])] },
  'minor-scales': {
    name: '小調音階',
    review: () => [melody('複習：小調音階', 'A 和聲小調（上行）', rhUp(SCALE.harmonic).map((x) => [x.n, x.f]), 'minor-scales', '第 7 音升高成 G♯；彈完 C 之後拇指穿過去彈 D。')],
  },
  'scale-ear': { name: '聽辨大小調音階', review: () => [pickOne('scale-ear', '複習：聽辨音階', SCALE_EAR)] },
  'key-relations': { name: '關係與同主音大小調', review: () => [pickOne('key-relations', '複習：大小調的關係', KEY_QUIZ)] },
  inversions: {
    name: '三和弦轉位',
    review: () => [() => ({ type: 'chords', kicker: '複習：轉位', hint: 'delay', concept: 'inversions', chords: shuffleDraw([INV.C_E, INV.C_G, INV.F_A, INV.G_B, INV.G_D, INV.Am_C], 3) })],
  },
  'inversion-ear': { name: '聽出轉位', review: () => [pickOne('inversion-ear', '複習：聽出轉位', INVERSION_EAR)] },
  'voice-leading': {
    name: '平順的聲部進行',
    review: () => [{ type: 'chords', progression: true, kicker: '複習：聲部進行', title: 'C → Am/C → F/C → G/B → C', hint: 'delay', concept: 'voice-leading', chords: SMOOTH }],
  },
  dim7: {
    name: '減七和弦',
    review: () => [() => ({ type: 'chords', kicker: '複習：減七和弦', hint: 'delay', concept: 'dim7', chords: shuffleDraw([CH.Bdim7, CH.Csdim7, CH.Dsdim7, CH.Fsdim7, CH.Gsdim7], 3) })],
  },
  'passing-dim': {
    name: '經過減和弦',
    review: () => [{ type: 'chords', progression: true, kicker: '複習：經過減和弦', title: 'C → C♯°7 → Dm → G7 → C', hint: 'delay', concept: 'passing-dim', chords: PASSING }],
  },
  'dim-ear': { name: '聽出減七和弦', review: () => [pickOne('dim-ear', '複習：聽出減七和弦', DIM_EAR)] },
  'ext-chords': {
    name: '延伸和弦（9、11、13）',
    review: () => [{ type: 'chords', progression: true, kicker: '複習：延伸和弦', title: 'Dm9 → G13 → Cmaj9', hint: 'delay', concept: 'ext-chords', chords: EXT_251 }],
  },
  'ext-ear': { name: '聽出延伸音', review: () => [pickOne('ext-ear', '複習：聽出延伸音', EXT_EAR)] },
  hanon: {
    name: '哈農指法',
    review: () => [melody('複習：哈農', '第 1 號 ↑（前兩組）', HANON.rh1Up.slice(0, 16).map((x) => [x.n, x.f]), 'hanon', '1-2-3-4-5-4-3-2，彈完一組整隻手往右移一個白鍵。')],
  },
  'hanon-even': {
    name: '哈農：平均的八分音符',
    review: () => [{ type: 'rhythm', kicker: '複習：哈農', title: '第 1 號（八分音符）', pattern: HANON.rh1Up.slice(0, 16).map(({ n }) => ({ n, d: 0.5 })), bpm: 60, clef: 'treble', concept: 'hanon-even' }],
  },
};

export function reviewSteps(id) {
  return CONCEPTS[id]?.review() ?? [];
}

