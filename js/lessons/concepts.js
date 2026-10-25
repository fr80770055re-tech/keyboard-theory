// Concept bank: every graded item belongs to a concept. Spaced review pulls due
// concepts into the next warm-up (and the daily review) using each concept's
// review() steps.
import { CH, N, SHELL, as, play, shuffleDraw } from './kit.js';

export { shuffleDraw };

const findNote = (pitchClass, label) => () => ({
  type: 'find',
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

export const CONCEPTS = {
  'note-C': { name: '找 C', review: () => [findNote(0, 'C')] },
  'note-D': { name: '找 D', review: () => [findNote(2, 'D')] },
  'note-E': { name: '找 E', review: () => [findNote(4, 'E')] },
  'note-F': { name: '找 F', review: () => [findNote(5, 'F')] },
  'note-G': { name: '找 G', review: () => [findNote(7, 'G')] },
  'middle-c': {
    name: '中央 C',
    review: () => [{
      type: 'find', kicker: '複習：中央 C', targets: [60], match: 'exact', hint: 'delay',
      promptFor: () => '彈 <span class="big">中央 C</span>', concept: () => 'middle-c',
    }],
  },
  'ear-CDE': {
    name: '聽辨 C D E',
    review: () => [() => ({
      type: 'listen', kicker: '複習：聽→彈', items: shuffleDraw([60, 62, 64], 3),
      candidates: [60, 62, 64], instruction: '答案在中央 C、D、E 之中（淡藍框）。', concept: 'ear-CDE',
    })],
  },
  'ear-CG': {
    name: '聽辨 C 到 G',
    review: () => [() => ({
      type: 'listen', kicker: '複習：聽→彈', items: shuffleDraw([60, 62, 64, 65, 67], 3),
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
    review: () => [() => ({ type: 'find', staff: true, clef: 'treble', match: 'exact', kicker: '複習：讀譜', targets: shuffleDraw([60, 62, 64, 65, 67, 69, 71, 72], 4), hint: 'delay', concept: () => 'read-treble' })],
  },
  'read-bass': {
    name: '讀低音譜號',
    review: () => [() => ({ type: 'find', staff: true, clef: 'bass', match: 'exact', kicker: '複習：讀低音譜號', targets: shuffleDraw([48, 50, 52, 53, 55, 57, 59], 4), hint: 'delay', concept: () => 'read-bass' })],
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
};

export function reviewSteps(id) {
  return CONCEPTS[id]?.review() ?? [];
}

