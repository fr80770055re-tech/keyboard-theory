// 入門 第 1 課：鍵盤地理與中央 C
import { isBlack, LESSON_HIGH, LESSON_LOW } from '../notes.js';
import { shuffleDraw } from './concepts.js';

const C3 = 48, D3 = 50, E3 = 52, C4 = 60, D4 = 62, E4 = 64, C5 = 72;
const CDE_POOL = [C3, D3, E3, C4, D4, E4, C5];
const conceptOf = (n) => ['note-C', null, 'note-D', null, 'note-E'][n % 12];
const fingerOf = (n) => ({ 0: '1', 2: '2', 4: '3' })[n % 12];

const blackKeys = [];
for (let n = LESSON_LOW; n <= LESSON_HIGH; n++) if (isBlack(n)) blackKeys.push([n, 'soft']);

// Right hand seen from above, fingertips resting on keys. Numbers sit on the fingertips.
const HAND_SVG = `
<svg viewBox="0 0 280 210" width="280" role="img" aria-label="右手手指編號：拇指 1、食指 2、中指 3、無名指 4、小指 5">
  <g fill="var(--surface)" stroke="var(--ink-soft)" stroke-width="2" stroke-linejoin="round">
    <path d="M92 196c-14-24-20-48-18-70l4-30c1-7 10-8 12-1l9 34 4-74c1-9 14-9 15 0l3 66 6-80c1-9 15-9 15 0l2 80 8-70c1-9 14-8 14 1l-2 76 10-48c2-8 13-6 13 2l-6 66c-2 22-8 38-18 48z"/>
    <path d="M78 150c-12-6-26-18-36-34-5-8 3-16 11-11l30 20"/>
  </g>
  <g class="hand-num" font-weight="700" font-size="17" text-anchor="middle">
    <circle cx="52" cy="112" r="13"/><text x="52" y="118">1</text>
    <circle cx="106" cy="58" r="13"/><text x="106" y="64">2</text>
    <circle cx="137" cy="44" r="13"/><text x="137" y="50">3</text>
    <circle cx="170" cy="56" r="13"/><text x="170" y="62">4</text>
    <circle cx="198" cy="86" r="13"/><text x="198" y="92">5</text>
  </g>
</svg>`;

const HOT_CROSS_BUNS = [
  [E4, 1], [D4, 1], [C4, 2],
  [E4, 1], [D4, 1], [C4, 2],
  [C4, 0.5], [C4, 0.5], [C4, 0.5], [C4, 0.5], [D4, 0.5], [D4, 0.5], [D4, 0.5], [D4, 0.5],
  [E4, 1], [D4, 1], [C4, 2],
].map(([n, d]) => ({ n, d, f: Number(fingerOf(n)) }));

export default {
  id: 'b1',
  track: 'beginner',
  num: 1,
  title: '鍵盤地理與中央 C',
  desc: '黑鍵分組、找到 C D E、右手指號、第一首曲子',
  segments: [
    {
      kind: 'warmup', minutes: 5, graded: false,
      steps: [
        {
          type: 'explain', kicker: '歡迎', title: '先和鍵盤打個招呼',
          body: `<p>每一課都分成五段：<b>暖身複習 → 新概念 → 引導練習 → 實際曲目 → 總結評分</b>，總共約 30–60 分鐘。中途離開也沒關係，下次會從你停下的那一段繼續。</p>
            <p>彈對時琴鍵會亮<b>綠色 ✓</b>，彈錯會亮<b>紅色 ✗</b>，並標出正確的鍵。</p>`,
        },
        {
          type: 'free', title: '自由彈奏',
          body: '隨意彈彈看。仔細聽：越往<b>左</b>聲音越<b>低</b>，越往<b>右</b>越<b>高</b>。',
          seconds: 40,
        },
      ],
    },
    {
      kind: 'concept', minutes: 10, graded: false,
      steps: [
        {
          type: 'explain', kicker: '新概念 1/5', title: '黑鍵是鍵盤的地圖',
          body: `<p>白鍵長得都一樣，要靠<b>黑鍵</b>認路。看看你的鍵盤：黑鍵是<b>兩個一組</b>、<b>三個一組</b>輪流出現。</p>
            <p class="callout">看看你的鍵盤（和下方畫面上淡藍框的黑鍵）：先數出「兩個一組」，再數出「三個一組」。下一步就要用它們來找 C。</p>`,
          keys: blackKeys,
        },
        {
          type: 'explain', kicker: '新概念 2/5', title: 'C 住在「兩個黑鍵」的左邊',
          body: `<p>每一組<b>兩個黑鍵</b>的左下方那個白鍵，就是 <b>C</b>。整個鍵盤上的 C 都是這樣找的。</p>
            <p>聽聽看：所有的 C 聽起來很像，只是一個比一個高。這個距離叫做「<b>八度</b>」。</p>`,
          keys: [[C3, 'hint', 'C'], [C4, 'hint', 'C'], [C5, 'hint', 'C']],
          demo: [C3, C4, C5],
        },
        {
          type: 'find', mode: 'all', pitchClass: 0, kicker: '動手找', prompt: '找出鍵盤上所有的 C',
          instruction: '先看黑鍵，找到「兩個一組」，再按它左邊的白鍵。',
          tip: 'C 在「兩個黑鍵」左邊。', concept: 'note-C',
        },
        {
          type: 'explain', kicker: '新概念 3/5', title: '中央 C',
          body: `<p>最靠近鍵盤中間的 C 叫做<b>中央 C</b>（C4），畫面上用<b>藍點</b>標示。在 25 鍵鍵盤上，它剛好在正中間。</p>
            <p>中央 C 是讀譜和擺手位最重要的起點，之後每一課都會用到。</p>`,
          keys: [[C4, 'hint', 'C4']],
          demo: [C4],
        },
        {
          type: 'find', kicker: '動手找', targets: [C4], match: 'exact', hint: 'none',
          promptFor: () => '彈 <span class="big">中央 C</span>',
          instruction: '要找的是中間那一個，不是其他八度的 C。', concept: () => 'middle-c',
        },
        {
          type: 'explain', kicker: '新概念 4/5', title: 'D 和 E',
          body: `<p>C 往右一個白鍵是 <b>D</b>，它夾在兩個黑鍵<b>中間</b>；再往右一個白鍵是 <b>E</b>，在兩個黑鍵的<b>右邊</b>。</p>
            <p>C、D、E 正好把「兩個一組的黑鍵」包起來，很好記。</p>`,
          keys: [[C4, 'hint', 'C'], [D4, 'hint', 'D'], [E4, 'hint', 'E']],
          demo: [C4, D4, E4, D4, C4],
          labels: 'all',
        },
        { type: 'find', mode: 'all', pitchClass: 2, kicker: '動手找', prompt: '找出所有的 D', tip: 'D 夾在兩個黑鍵中間。', concept: 'note-D' },
        { type: 'find', mode: 'all', pitchClass: 4, kicker: '動手找', prompt: '找出所有的 E', tip: 'E 在兩個黑鍵右邊。', concept: 'note-E' },
        {
          type: 'explain', kicker: '新概念 5/5', title: '手指編號',
          body: `<div class="figure">${HAND_SVG}</div>
            <p>每根手指都有號碼：<b>拇指 1、食指 2、中指 3、無名指 4、小指 5</b>（左右手一樣）。</p>
            <p class="callout">把右手輕放在鍵盤上：<b>1 指放中央 C、2 指放 D、3 指放 E</b>。手指微彎，像輕握一顆球。</p>
            <p class="muted">系統只知道你按了哪個鍵，不知道用哪根手指，所以指法要靠你自己留意。照指號彈，曲子會越彈越順。</p>`,
          keys: [[C4, 'hint', '1'], [D4, 'hint', '2'], [E4, 'hint', '3']],
        },
      ],
    },
    {
      kind: 'practice', minutes: 15, graded: true,
      steps: [
        () => ({
          type: 'find', kicker: '練習 1：有提示', instruction: '任何一個八度都算對，亮起的鍵是建議位置。',
          targets: shuffleDraw(CDE_POOL, 6), hint: 'show', concept: conceptOf,
        }),
        () => ({
          type: 'find', kicker: '練習 2：提示變慢', instruction: '4 秒後才會出現提示，先試著自己找。',
          targets: shuffleDraw(CDE_POOL, 8), hint: 'delay', concept: conceptOf,
        }),
        () => ({
          type: 'listen', kicker: '練習 3：聽→彈', items: shuffleDraw([C4, D4, E4], 6),
          candidates: [C4, D4, E4], instruction: '答案在中央 C、D、E 之中（淡藍框）。先聽，再在鍵盤上找。', concept: 'ear-CDE',
        }),
        {
          type: 'melody', kicker: '練習 4：指法', title: 'C D E D C', hint: 'show', concept: 'finger-123',
          instruction: '右手 1 指放中央 C，三根手指各管一個鍵，手不要移動。',
          notes: [[C4, 1], [D4, 2], [E4, 3], [D4, 2], [C4, 1]].map(([n, f]) => ({ n, f })),
        },
        {
          type: 'melody', kicker: '練習 5：不看提示', title: 'E D C D E E E', hint: 'none', concept: 'finger-123',
          instruction: '這次琴鍵不會亮，看音名和指號自己彈。',
          notes: [[E4, 3], [D4, 2], [C4, 1], [D4, 2], [E4, 3], [E4, 3], [E4, 3]].map(([n, f]) => ({ n, f })),
        },
      ],
    },
    {
      kind: 'piece', minutes: 15, graded: true,
      celebrate: {
        title: '你彈完了第一首曲子',
        body: '〈Hot Cross Buns〉從頭到尾，而且第二遍沒有任何提示。這就是用讀音名、照指法彈奏的第一步。',
        song: HOT_CROSS_BUNS.map(({ n, d }) => ({ n, d })),
        bpm: 100,
      },
      steps: [
        {
          type: 'explain', kicker: '實際曲目', title: '〈Hot Cross Buns〉英國傳統童謠',
          body: `<p>這首曲子只用到 <b>E、D、C</b> 三個音，正好用上今天學的右手 3-2-1 指。</p>
            <p>先按「聽示範」聽兩遍，邊聽邊在腦中唱。注意中間有一段快速的 C C C C、D D D D。</p>`,
          keys: [[C4, 'hint', '1'], [D4, 'hint', '2'], [E4, 'hint', '3']],
          demo: HOT_CROSS_BUNS.map(({ n, d }) => ({ n, d })),
          bpm: 100,
        },
        {
          type: 'melody', kicker: '第 1 遍：有提示', title: 'Hot Cross Buns', hint: 'show', concept: 'finger-123',
          instruction: '琴鍵會亮起下一個音和指號。', notes: HOT_CROSS_BUNS, bpm: 100,
        },
        {
          type: 'melody', kicker: '第 2 遍：不看提示', title: 'Hot Cross Buns', hint: 'none', concept: 'finger-123',
          instruction: '只看上面的音名與指號，琴鍵不再提示。', notes: HOT_CROSS_BUNS, bpm: 100,
        },
      ],
    },
    {
      kind: 'summary', minutes: 5, graded: true,
      steps: [
        {
          type: 'explain', kicker: '總結評分', title: '小測驗',
          body: '<p>最後一段沒有任何提示。正確率達 70% 就能拿到 1 顆星，並解鎖下一課。</p>',
        },
        () => ({
          type: 'find', kicker: '測驗 1：找音', instruction: '任何八度都可以，沒有提示。',
          targets: shuffleDraw(CDE_POOL, 6), hint: 'none', concept: conceptOf,
        }),
        () => ({
          type: 'listen', kicker: '測驗 2：聽→彈', items: shuffleDraw([C4, D4, E4], 4),
          candidates: [C4, D4, E4], instruction: '答案在中央 C、D、E 之中。', concept: 'ear-CDE',
        }),
      ],
    },
  ],
};
