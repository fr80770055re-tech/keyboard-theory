// 入門 第 7 課：哈農：手指的基本功
import { HANON, N, explain } from './kit.js';

const keysOf = (notes) => notes.slice(0, 8).map((x) => [x.n, 'hint', String(x.f)]);
// Even eighth notes for the metronome; the closing note gets a half note.
const eighths = (notes) => notes.map(({ n, d }) => ({ n, d: d || 0.5 }));
const RH1 = [...HANON.rh1Up, ...HANON.rh1Down];
const LH1 = [...HANON.lh1Up, ...HANON.lh1Down];

export default {
  id: 'b7',
  track: 'beginner',
  num: 7,
  title: '哈農：手指的基本功',
  desc: '哈農第 1、2 號（25 鍵版）：手指獨立、平均與力量；左右手指法與節拍器練習',
  segments: [
    {
      kind: 'warmup', minutes: 5, graded: false,
      steps: [
        explain('暖身', '每天十分鐘的手指體操', `<p>彈琴的人幾乎都練過<b>哈農</b>：法國鋼琴教師 Charles-Louis Hanon 在 1873 年出版的《哈農：鋼琴練指法》，一共 60 首。每一首都是一個小小的手型，一路往上、再一路往下。</p>
          <p>它不是曲子，是<b>手指體操</b>：讓五根手指一樣有力、一樣平均，特別是比較弱的 4、5 指。先用五指位置暖手。</p>`),
        { type: 'melody', kicker: '暖身', title: '右手五指', hint: 'show', concept: 'finger-five', notes: [[N.C4, 1], [N.D4, 2], [N.E4, 3], [N.F4, 4], [N.G4, 5], [N.F4, 4], [N.E4, 3], [N.D4, 2], [N.C4, 1]].map(([n, f]) => ({ n, f })) },
      ],
    },
    {
      kind: 'concept', minutes: 14, graded: false,
      steps: [
        explain('新概念 1/5', '第 1 號：一個手型往上走', `<p>右手拇指放中央 C：<b>C E F G A G F E</b>，指法 <b>1-2-3-4-5-4-3-2</b>。注意 C 到 E 跳過了 D，所以 2 指在 E 上。</p>
          <p>彈完這八個音，<b>整隻手往右移一個白鍵</b>，從 D 開始彈同樣的形狀：D F G A B A G F。再移一次，從 E 開始。</p>
          <p class="muted">原版會一路彈兩個八度；這裡配合 25 鍵，上行三組、下行三組。</p>`,
        { keys: keysOf(HANON.rh1Up), demo: HANON.rh1Up.map((x) => ({ n: x.n, d: 0.5 })), bpm: 80 }),
        { type: 'melody', kicker: '動手彈', title: '第 1 號：第一組', hint: 'show', concept: 'hanon', instruction: '慢慢來，每個音一樣大聲。手指彎曲，用指尖彈。', notes: HANON.rh1Up.slice(0, 8) },
        explain('新概念 2/5', '下行：鏡子裡的形狀', `<p>下行時把形狀倒過來：從高八度的 C 開始，<b>C A G F E F G A</b>，指法 <b>5-4-3-2-1-2-3-4</b>。一樣每組往左移一個白鍵，最後回到中央 C。</p>
          <p>上行時 2 指跳一格，下行時換成 4 指跳一格：形狀完全對稱。</p>`,
        { keys: keysOf(HANON.rh1Down), demo: HANON.rh1Down.map((x) => ({ n: x.n, d: x.d || 0.5 })), bpm: 80 }),
        explain('新概念 3/5', '左手：同樣的音，相反的指號', `<p>左手在低八度彈一模一樣的音：上行 <b>C E F G A G F E</b>，指法 <b>5-4-3-2-1-2-3-4</b>；下行 <b>1-2-3-4-5-4-3-2</b>。</p>
          <p>左手的 4、5 指通常最弱，所以左手更值得多練。</p>`,
        { keys: keysOf(HANON.lh1Up), demo: HANON.lh1Up.map((x) => ({ n: x.n, d: 0.5 })), bpm: 80 }),
        explain('新概念 4/5', '第 2 號：伸展與 4、5 指', `<p>第 2 號：<b>C E A G F G F E</b>，指法 <b>1-2-5-4-3-4-3-2</b>。2 指到 5 指之間張開到四度，接著 5-4-3-4-3 練 3、4、5 指的獨立。</p>
          <p>同樣每組往右移一個白鍵；下行是 <b>5-4-1-2-3-2-3-4</b>。</p>`,
        { keys: keysOf(HANON.rh2Up), demo: HANON.rh2Up.map((x) => ({ n: x.n, d: 0.5 })), bpm: 80 }),
        explain('新概念 5/5', '怎麼練才有效', `<ul><li><b>先慢後快</b>：先在等待模式把指法彈對，再跟節拍器彈八分音符。</li>
          <li><b>平均</b>：每個音一樣長、一樣大聲；4、5 指不要偷懶。</li>
          <li><b>放鬆</b>：手腕和手臂不要用力，力量來自手指。手痠就停。</li>
          <li>每天練幾分鐘，穩定了再把速度調快 4 BPM。</li></ul>`),
      ],
    },
    {
      kind: 'practice', minutes: 18, graded: true,
      steps: [
        { type: 'melody', kicker: '練習 1：右手上行', title: '第 1 號 ↑', hint: 'show', concept: 'hanon', instruction: '每組八個音，彈完整隻手往右移一個白鍵。', notes: HANON.rh1Up },
        { type: 'melody', kicker: '練習 2：右手下行', title: '第 1 號 ↓', hint: 'show', concept: 'hanon', instruction: '從高八度的 C 開始，5 指先彈。', notes: HANON.rh1Down },
        { type: 'melody', kicker: '練習 3：左手上行', title: '左手第 1 號 ↑', hint: 'show', concept: 'hanon', instruction: '左手小指放低八度的 C。', notes: HANON.lh1Up },
        { type: 'melody', kicker: '練習 4：左手下行', title: '左手第 1 號 ↓', hint: 'delay', concept: 'hanon', instruction: '左手拇指放中央 C。', notes: HANON.lh1Down },
        { type: 'rhythm', kicker: '練習 5：跟節拍器', title: '第 1 號 ↑（八分音符）', instruction: '每拍兩個音，平均流動。速度可以先調慢。', pattern: eighths(HANON.rh1Up.slice(0, 16)), bpm: 60, clef: 'treble', concept: 'hanon-even' },
        { type: 'melody', kicker: '練習 6：第 2 號', title: '第 2 號 ↑', hint: 'show', concept: 'hanon', instruction: '2 指到 5 指張開；5-4-3-4-3 每個音都要清楚。', notes: HANON.rh2Up },
      ],
    },
    {
      kind: 'piece', minutes: 12, graded: true,
      celebrate: {
        title: '你彈完了一整首哈農',
        body: '上行三組、下行三組，一共 49 個音，每一根手指都輪到了。每天彈一次，手指會一天比一天平均。',
        song: eighths(RH1),
        bpm: 76,
      },
      steps: [
        explain('實際曲目', '哈農第 1 號（25 鍵版）', `<p>右手完整上行再下行。第一遍用等待模式把指法彈順，第二遍跟節拍器，每拍兩個音。</p>
          <p class="muted">節拍器那一遍可以先把速度調慢，準確比快重要。</p>`,
        { demo: eighths(RH1), bpm: 76 }),
        { type: 'melody', kicker: '第 1 遍：等待模式', title: '哈農第 1 號', hint: 'show', concept: 'hanon', notes: RH1 },
        { type: 'rhythm', kicker: '第 2 遍：跟節拍器', title: '哈農第 1 號（準時版）', pattern: eighths(RH1), bpm: 60, clef: 'treble', concept: 'hanon-even' },
      ],
    },
    {
      kind: 'summary', minutes: 6, graded: true,
      steps: [
        explain('總結評分', '總結測驗', '<p>沒有提示。正確率達 70% 就算完成這一課。</p>'),
        { type: 'melody', kicker: '測驗 1：左手', title: '左手第 1 號 ↑↓', hint: 'none', concept: 'hanon', notes: LH1 },
        { type: 'melody', kicker: '測驗 2：第 2 號', title: '第 2 號 ↓', hint: 'none', concept: 'hanon', notes: HANON.rh2Down },
        { type: 'rhythm', kicker: '測驗 3：平均', title: '第 1 號 ↓（八分音符）', pattern: eighths(HANON.rh1Down.slice(0, 16)), bpm: 60, clef: 'treble', concept: 'hanon-even' },
      ],
    },
  ],
};
