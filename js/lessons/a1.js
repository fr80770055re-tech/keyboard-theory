// 進階 第 1 課：音程：從聽到彈
import { N, explain, shuffleDraw } from './kit.js';
import { INTERVAL_EAR, INTERVAL_HARM, INTERVAL_LISTEN, intervalFind, intervalFinger } from './concepts.js';

const listenFinger = (t, root = N.C4) => intervalFinger(t - root);

const seq = (triples) => triples.map(([n, f, d]) => ({ n, f, ...(d ? { d } : {}) }));
const fig = (pairs, label) => ({ notes: pairs.flatMap(([a, b]) => [{ n: a, d: 1 }, { n: b, d: 1 }]), clef: 'treble', label });

// Every interval up from middle C, each one starting again from C.
const FROM_C = seq([
  [N.C4, 1], [N.D4, 2], [N.C4, 1], [N.E4, 3], [N.C4, 1], [N.F4, 4], [N.C4, 1], [N.G4, 5],
  [N.C4, 1], [N.A4, 5], [N.C4, 1], [N.B4, 5], [N.C4, 1], [N.C5, 5],
]);

// 〈聖者進行曲〉（When the Saints Go Marching In，公版）：右手 C 位置就彈得完，
// 開頭 C→E→F→G 就是大三度、小二度、大二度。
const SAINTS = seq([
  [N.C4, 1, 1], [N.E4, 3, 1], [N.F4, 4, 1], [N.G4, 5, 1],
  [N.C4, 1, 1], [N.E4, 3, 1], [N.F4, 4, 1], [N.G4, 5, 1],
  [N.C4, 1, 1], [N.E4, 3, 1], [N.F4, 4, 1], [N.G4, 5, 1], [N.E4, 3, 2], [N.C4, 1, 2], [N.E4, 3, 2], [N.D4, 2, 2],
  [N.E4, 3, 1], [N.E4, 3, 1], [N.D4, 2, 1], [N.C4, 1, 1], [N.C4, 1, 1], [N.E4, 3, 1], [N.G4, 5, 1], [N.G4, 5, 1], [N.F4, 4, 4],
  [N.E4, 3, 1], [N.F4, 4, 1], [N.G4, 5, 1], [N.E4, 3, 1], [N.C4, 1, 2], [N.D4, 2, 2], [N.C4, 1, 4],
]);
const timed = (notes) => notes.map(({ n, d }) => ({ n, d: d ?? 1 }));

export default {
  id: 'a1',
  track: 'advanced',
  num: 1,
  title: '音程：從聽到彈',
  desc: '二度到八度、大小與純音程；聽出來，也彈得出來',
  segments: [
    {
      kind: 'warmup', minutes: 5, graded: false,
      steps: [
        explain('暖身', '兩個音之間的距離', `<p>旋律是一個音接一個音，和弦是幾個音疊在一起。不管哪一種，耳朵聽到的其實是<b>音和音之間的距離</b>，這個距離就叫<b>音程</b>。</p>
          <p>學會音程，你就能看到一個和弦馬上知道怎麼按，聽到一段旋律也比較容易彈出來。</p>`),
        { type: 'melody', kicker: '暖身', title: '右手五指', hint: 'show', concept: 'finger-five', notes: seq([[N.C4, 1], [N.D4, 2], [N.E4, 3], [N.F4, 4], [N.G4, 5], [N.F4, 4], [N.E4, 3], [N.D4, 2], [N.C4, 1]]) },
      ],
    },
    {
      kind: 'concept', minutes: 15, graded: false,
      steps: [
        explain('新概念 1/5', '度數：數字母', `<p>音程先看<b>度數</b>：從第一個音數到第二個音，<b>頭尾都算</b>。</p>
          <p>C 到 E：C、D、E，三個字母，所以是<b>三度</b>。C 到 G：C、D、E、F、G，是<b>五度</b>。同一個音是一度，C 到上面的 C 是<b>八度</b>。</p>
          <p class="callout">在譜上更好認：三度是「線到線」或「間到間」，二度是線和間相鄰。</p>`,
        { keys: [[N.C4, 'hint', 'C'], [N.E4, 'hint', 'E']], demo: [N.C4, N.E4, N.C4, N.G4], staff: fig([[N.C4, N.D4], [N.C4, N.E4], [N.C4, N.G4], [N.C4, N.C5]], '二度、三度、五度、八度') }),
        explain('新概念 2/5', '大與小：數半音', `<p>同樣是三度，C–E 和 D–F 聽起來不一樣，因為中間的<b>半音</b>數不同。相鄰兩個鍵（黑白都算）就是一個半音。</p>
          <table class="seg-table"><tr><th>音程</th><th>小</th><th>大</th></tr>
          <tr><td>二度</td><td>1 個半音（E–F）</td><td>2 個（C–D）</td></tr>
          <tr><td>三度</td><td>3 個（D–F）</td><td>4 個（C–E）</td></tr>
          <tr><td>六度</td><td>8 個（E–C）</td><td>9 個（C–A）</td></tr>
          <tr><td>七度</td><td>10 個（D–C）</td><td>11 個（C–B）</td></tr></table>
          <p>大音程比較明亮，小音程比較暗、比較緊。</p>`,
        { keys: [[N.C4, 'hint', 'C'], [N.E4, 'hint', 'E'], [N.D4, 'soft'], [N.F4, 'soft']], demo: [{ n: [N.C4, N.E4], d: 2 }, { n: [N.D4, N.F4], d: 2 }] }),
        explain('新概念 3/5', '純音程與三全音', `<p>四度、五度、八度沒有大小之分，叫<b>純音程</b>：聲音最穩、最「空」。</p>
          <ul><li><b>純四度</b>：5 個半音（C–F）</li><li><b>純五度</b>：7 個半音（C–G）</li><li><b>純八度</b>：12 個半音（C–C）</li></ul>
          <p>正好 6 個半音的 F–B，把八度切成兩半，叫<b>三全音</b>。它很不穩定，屬七和弦想「回家」的力量就從這裡來。</p>`,
        { keys: [[N.F4, 'hint', 'F'], [N.B4, 'hint', 'B']], demo: [{ n: [N.C4, N.G4], d: 2 }, { n: [N.F4, N.B4], d: 2 }] }),
        { type: 'melody', kicker: '動手彈', title: '從 C 往上的每一種音程', hint: 'show', concept: 'interval-build', instruction: '每次都回到中央 C，聽距離一步步變大。後面三個要把手張開。', notes: FROM_C },
        explain('新概念 4/5', '用歌記音程', `<p>聽音程最快的方法，是把它連到一首熟悉的歌的開頭：</p>
          <table class="seg-table"><tr><th>音程</th><th>像這首歌的開頭</th></tr>
          <tr><td>小二度</td><td>電影《大白鯊》的配樂</td></tr>
          <tr><td>大二度</td><td>〈生日快樂〉的「祝你」</td></tr>
          <tr><td>小三度</td><td>〈綠袖子〉</td></tr>
          <tr><td>大三度</td><td>〈聖者進行曲〉</td></tr>
          <tr><td>純四度</td><td>華格納〈婚禮合唱〉</td></tr>
          <tr><td>純五度</td><td>〈小星星〉的「一閃一閃」</td></tr>
          <tr><td>大六度</td><td>〈我的邦尼〉（My Bonnie）</td></tr>
          <tr><td>純八度</td><td>〈彩虹之上〉（Over the Rainbow）</td></tr></table>
          <p class="muted">也可以用你自己熟悉的歌，記得住最重要。</p>`),
        explain('新概念 5/5', '聽→彈：從 C 出發', `<p>接下來會先響一下中央 C，再響第二個音。先在心裡唱出那首歌，再判斷是幾度、往上找。</p>
          <p class="muted">彈錯也沒關係，系統會再播一次讓你比較高低。</p>`),
        () => ({ type: 'listen', kicker: '試試看', concept: 'interval-ear', finger: listenFinger, instruction: '右手拇指放在中央 C（標示 1 的鍵）。', items: shuffleDraw(INTERVAL_LISTEN, 3) }),
      ],
    },
    {
      kind: 'practice', minutes: 15, graded: true,
      steps: [
        () => intervalFind({ kicker: '練習 1：二度與三度', hint: 'show', k: 4, names: ['小二度', '大二度', '小三度', '大三度'] }),
        () => intervalFind({ kicker: '練習 2：所有音程，提示變慢', hint: 'delay', k: 5 }),
        () => ({ type: 'listen', kicker: '練習 3：聽→彈', concept: 'interval-ear', finger: listenFinger, instruction: '右手拇指放在中央 C，第二個音都在它上面；八度要把手張開用 5 指。', items: shuffleDraw(INTERVAL_LISTEN, 4) }),
        () => ({ type: 'choice', kicker: '練習 4：先後響的音程', concept: 'interval-ear', items: shuffleDraw(INTERVAL_EAR, 4) }),
        () => ({ type: 'choice', kicker: '練習 5：同時響的音程', concept: 'interval-ear', items: shuffleDraw(INTERVAL_HARM, 3) }),
      ],
    },
    {
      kind: 'piece', minutes: 12, graded: true,
      celebrate: {
        title: '你彈完了〈聖者進行曲〉',
        body: '整首曲子只用了 C 位置的五個音，但大三度、小二度、大二度、三度跳進全都在裡面。現在你聽得出它們了。',
        song: timed(SAINTS),
        bpm: 112,
      },
      steps: [
        explain('實際曲目', '〈聖者進行曲〉（When the Saints Go Marching In）', `<p>開頭 C→E→F→G：<b>大三度、小二度、大二度</b>。第三句 G→E→C 是兩個三度往下跳，最後 D→C 是二度回家。</p>
          <p>右手拇指放中央 C，一指一鍵就彈得完。第二遍改成看五線譜。</p>`,
        { keys: [[N.C4, 'hint', '1'], [N.E4, 'hint', '3'], [N.F4, 'hint', '4'], [N.G4, 'hint', '5']], demo: timed(SAINTS), bpm: 112 }),
        { type: 'melody', kicker: '第 1 遍：有提示', title: '聖者進行曲', hint: 'show', concept: 'interval-build', notes: SAINTS, bpm: 112 },
        { type: 'melody', kicker: '第 2 遍：看譜，不看提示', title: '聖者進行曲', hint: 'none', staff: true, hideNames: true, concept: 'interval-build', notes: SAINTS, bpm: 112 },
      ],
    },
    {
      kind: 'summary', minutes: 6, graded: true,
      steps: [
        explain('總結評分', '總結測驗', '<p>沒有提示。正確率達 70% 就能解鎖下一課。</p>'),
        () => intervalFind({ kicker: '測驗 1：彈出音程', hint: 'none', k: 5 }),
        () => ({ type: 'choice', kicker: '測驗 2：聽辨音程', concept: 'interval-ear', items: [...shuffleDraw(INTERVAL_EAR, 2), ...shuffleDraw(INTERVAL_HARM, 2)] }),
      ],
    },
  ],
};
