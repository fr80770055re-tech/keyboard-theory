// 進階 第 2 課：大調與小調
import { N, SCALE, explain, lhUp, rhDown, rhUp, shuffleDraw } from './kit.js';
import { KEY_QUIZ, SCALE_EAR } from './concepts.js';

const C_MAJOR = [N.C4, N.D4, N.E4, N.F4, N.G4, N.A4, N.B4, N.C5];
const upDown = (up, down = up) => [...rhUp(up), ...rhDown(down).slice(1)];
const keysOf = (s) => rhUp(s).map((x) => [x.n, 'hint', String(x.f)]);
const timed = (notes) => notes.map(({ n, d }) => ({ n, d: d ?? 1 }));

// 〈綠袖子〉（Greensleeves，英國傳統曲，公版），A 小調，移低八度放進 25 鍵。
// 同一首歌裡有 G 也有 G♯、還有 F♯：自然、和聲、旋律小調全都出現。
const GREENSLEEVES = [
  [N.A3, 1], [N.C4, 2], [N.D4, 1], [N.E4, 1.5], [N.Gb4, 0.5], [N.E4, 1], [N.D4, 2], [N.B3, 1],
  [N.G3, 1.5], [N.A3, 0.5], [N.B3, 1], [N.C4, 2], [N.A3, 1], [N.A3, 1.5], [N.Ab3, 0.5], [N.A3, 1],
  [N.B3, 2], [N.Ab3, 1], [N.E3, 2], [N.A3, 1], [N.C4, 2], [N.D4, 1], [N.E4, 1.5], [N.Gb4, 0.5], [N.E4, 1],
  [N.D4, 2], [N.B3, 1], [N.G3, 1.5], [N.A3, 0.5], [N.B3, 1], [N.C4, 1.5], [N.B3, 0.5], [N.A3, 1],
  [N.Ab3, 1.5], [N.Gb3, 0.5], [N.Ab3, 1], [N.A3, 3],
].map(([n, d]) => ({ n, d }));

export default {
  id: 'a2',
  track: 'advanced',
  num: 2,
  title: '大調與小調',
  desc: '自然、和聲、旋律小調；關係與同主音大小調；音階指法',
  segments: [
    {
      kind: 'warmup', minutes: 5, graded: false,
      steps: [
        explain('暖身', '明亮與憂鬱', `<p>同一首歌用大調彈，聽起來明亮；換成小調，立刻多了一層陰影。差別不在音多高，而在<b>音階裡全音和半音的排列</b>。</p>
          <p>先用熟悉的 C 大調音階暖手。</p>`),
        { type: 'melody', kicker: '暖身', title: 'C 大調音階 ↑↓', hint: 'show', concept: 'thumb-under', notes: upDown(C_MAJOR) },
      ],
    },
    {
      kind: 'concept', minutes: 15, graded: false,
      steps: [
        explain('新概念 1/6', '同樣的白鍵，換個主音', `<p>從 A 開始只彈白鍵，A B C D E F G A，就是 <b>A 自然小調</b>。音和 C 大調完全一樣，只是「家」從 C 搬到了 A。</p>
          <p>聽聽看：同一組音，從 A 開始就是比較暗。</p>`,
        { keys: keysOf(SCALE.natural), demo: [...SCALE.natural, ...C_MAJOR.map((n) => ({ n, d: 1 }))] }),
        explain('新概念 2/6', '小調的排列', `<p>大調：<b>全 全 半 全 全 全 半</b>。自然小調：<b>全 半 全 全 半 全 全</b>。</p>
          <p>關鍵在第三個音：A 到 C 只有 3 個半音（小三度），所以聽起來暗。C 大調的 C 到 E 是 4 個半音（大三度）。</p>
          <p class="callout">小調的「小」，就是主音到第三個音的那個小三度。</p>`,
        { keys: [[N.A3, 'hint', 'A'], [N.C4, 'hint', 'C'], [N.B3, 'soft'], [N.E4, 'soft'], [N.F4, 'soft']], demo: [{ n: [N.A3, N.C4, N.E4], d: 2 }, { n: [N.C4, N.E4, N.G4], d: 2 }] }),
        explain('新概念 3/6', '和聲小調：升高第 7 音', `<p>自然小調的 G 到 A 是全音，回家的力量比較弱。把 G 升高成 <b>G♯</b>，它離 A 只差半音，就成了<b>導音</b>。這叫<b>和聲小調</b>。</p>
          <p>好處：V 級和弦從 Em 變成 <b>E 大三和弦（E–G♯–B）</b>，E → Am 有強烈的終止感。F 到 G♯ 之間跨了 3 個半音（增二度），帶點異國味。</p>`,
        { keys: keysOf(SCALE.harmonic), demo: [...SCALE.harmonic, { n: [N.E3, N.Ab3, N.B3], d: 2 }, { n: [N.A3, N.C4, N.E4], d: 3 }] }),
        explain('新概念 4/6', '旋律小調：上行與下行不同', `<p>為了讓旋律往上走得順，<b>旋律小調</b>上行時把第 6、7 音都升高：<b>F♯、G♯</b>。下行時不需要導音，傳統上還原成自然小調。</p>
          <p class="muted">爵士裡常把上行的樣子上下都用，叫「爵士小調」。這裡先學古典的做法。</p>`,
        { keys: keysOf(SCALE.melodic), demo: [...SCALE.melodic, ...[...SCALE.natural].reverse().slice(1)] }),
        explain('新概念 5/6', '關係大小調與同主音大小調', `<ul><li><b>關係大小調</b>：用<b>同一組音</b>、不同的主音。C 大調 ↔ A 小調（都是白鍵）。從大調主音往下數小三度，就是它的關係小調。</li>
          <li><b>同主音大小調</b>：<b>主音一樣</b>、音不同。A 大調 ↔ A 小調。A 大調有 C♯、F♯、G♯，A 小調沒有。</li></ul>
          <p>第 6 課的借用和弦，就是從同主音小調借來的。</p>`,
        { keys: [[N.Db4, 'hint', 'C♯'], [N.Gb4, 'hint', 'F♯'], [N.Ab4, 'hint', 'G♯']], demo: [...SCALE.major, ...SCALE.natural.map((n) => ({ n, d: 1 }))] }),
        explain('新概念 6/6', '音階指法', `<p>A 小調和 A 大調的指法，和 C 大調一模一樣：</p>
          <ul><li>右手上行 <b>1-2-3</b>（A B C），拇指穿過去彈 D，再 <b>1-2-3-4-5</b>。下行時 3 指在 C 跨過拇指。</li>
          <li>左手上行 <b>5-4-3-2-1</b>，3 指跨過拇指彈 F（或 F♯），再 2-1。</li>
          <li>A 大調的 C♯ 是黑鍵，用 3 指彈正好；手往琴鍵裡面一點。</li></ul>`,
        { keys: keysOf(SCALE.major) }),
        { type: 'melody', kicker: '動手彈', title: 'A 自然小調 ↑', hint: 'show', concept: 'minor-scales', instruction: '彈完 C（3 指），拇指穿過去彈 D。', notes: rhUp(SCALE.natural) },
      ],
    },
    {
      kind: 'practice', minutes: 18, graded: true,
      steps: [
        { type: 'melody', kicker: '練習 1：自然小調', title: 'A 自然小調 ↑↓', hint: 'show', concept: 'minor-scales', notes: upDown(SCALE.natural) },
        { type: 'melody', kicker: '練習 2：和聲小調', title: 'A 和聲小調 ↑↓', hint: 'show', concept: 'minor-scales', instruction: 'G♯ 上下都要升高；F 到 G♯ 是一個大一點的跨步。', notes: upDown(SCALE.harmonic) },
        { type: 'melody', kicker: '練習 3：旋律小調', title: 'A 旋律小調 ↑ 自然小調 ↓', hint: 'delay', concept: 'minor-scales', instruction: '上行 F♯、G♯，下行還原成 G、F。', notes: upDown(SCALE.melodic, SCALE.natural) },
        { type: 'melody', kicker: '練習 4：左手', title: '左手 A 自然小調 ↑', hint: 'show', concept: 'minor-scales', instruction: '左手小指放在中央 C 左邊的 A；3 指跨過拇指彈 F。', notes: lhUp(SCALE.natural) },
        { type: 'melody', kicker: '練習 5：同主音大調', title: 'A 大調 ↑↓', hint: 'show', concept: 'thumb-under', instruction: '和 A 小調同一個主音，多了 C♯、F♯、G♯。', notes: upDown(SCALE.major) },
        () => ({ type: 'choice', kicker: '練習 6：聽辨音階', concept: 'scale-ear', items: shuffleDraw(SCALE_EAR, 3) }),
        () => ({ type: 'choice', kicker: '練習 7：大小調的關係', concept: 'key-relations', items: shuffleDraw(KEY_QUIZ, 3) }),
      ],
    },
    {
      kind: 'piece', minutes: 12, graded: true,
      celebrate: {
        title: '你彈完了〈綠袖子〉',
        body: '四百多年前的英國旋律，同一首歌裡有 G 也有 G♯、有 F 也有 F♯：自然、和聲、旋律小調都在裡面。',
        song: timed(GREENSLEEVES),
        bpm: 104,
      },
      steps: [
        explain('實際曲目', '〈綠袖子〉（Greensleeves）', `<p>A 小調，三拍子。開頭 A→C 是小三度；樂句結尾的 <b>G♯→A</b> 是和聲小調的導音回家，中間的 <b>F♯</b> 則來自旋律小調。</p>
          <p>這首不標指法：試著自己安排。原則是一指一鍵，換位置時用拇指穿過去或 3 指跨過來。</p>`,
        { demo: timed(GREENSLEEVES), bpm: 104 }),
        { type: 'melody', kicker: '第 1 遍：有提示', title: '綠袖子', hint: 'show', concept: 'minor-scales', notes: GREENSLEEVES, bpm: 104 },
        { type: 'melody', kicker: '第 2 遍：不看提示', title: '綠袖子', hint: 'none', concept: 'minor-scales', notes: GREENSLEEVES, bpm: 104 },
      ],
    },
    {
      kind: 'summary', minutes: 6, graded: true,
      steps: [
        explain('總結評分', '總結測驗', '<p>沒有提示。正確率達 70% 就能解鎖下一課。</p>'),
        { type: 'melody', kicker: '測驗 1：和聲小調', title: 'A 和聲小調 ↑↓', hint: 'none', concept: 'minor-scales', notes: upDown(SCALE.harmonic) },
        () => ({ type: 'choice', kicker: '測驗 2：聽辨音階', concept: 'scale-ear', items: shuffleDraw(SCALE_EAR, 2) }),
        () => ({ type: 'choice', kicker: '測驗 3：大小調的關係', concept: 'key-relations', items: shuffleDraw(KEY_QUIZ, 2) }),
      ],
    },
  ],
};
