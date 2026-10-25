// 入門 第 8 課：順階和弦：C 大調的七個和弦
import { CH, N, as, explain, marks, over, play, shuffleDraw } from './kit.js';
import { DIATONIC, DIATONIC_UP, ROMAN_QUIZ, TRIAD_EAR } from './concepts.js';

// Broken chords up the scale: each degree root–3rd–5th with 1-3-5.
const BROKEN = DIATONIC_UP.flatMap((c) => c.voicing.map((n, k) => ({ n, f: [1, 3, 5][k] })));
const DOWN = [...DIATONIC_UP].reverse();

// 順階五度循環：I–IV–vii°–iii–vi–ii–V–I，每個和弦的根音往下五度（往上四度）。
// 右手排成最近的轉位，每次只動一兩根手指；左手 5 指彈根音。
const CIRCLE_RH = [
  as(CH.C, 'I'),
  as(CH.F, 'IV', { voicing: [N.C4, N.F4, N.A4], fingers: ['1', '4', '5'] }),
  as(CH.Bdim, 'vii°', { voicing: [N.D4, N.F4, N.B4], fingers: ['1', '2', '5'] }),
  as(CH.Em, 'iii', { voicing: [N.E4, N.G4, N.B4], fingers: ['1', '3', '5'] }),
  as(CH.Am, 'vi', { voicing: [N.E4, N.A4, N.C5], fingers: ['1', '3', '5'] }),
  as(CH.Dm, 'ii', { voicing: [N.D4, N.F4, N.A4], fingers: ['1', '3', '5'] }),
  as(CH.G, 'V', { voicing: [N.D4, N.G4, N.B4], fingers: ['1', '3', '5'] }),
  as(CH.C, 'I', { voicing: [N.E4, N.G4, N.C5], fingers: ['1', '2', '5'] }),
];
const BASS = [N.C3, N.F3, N.B3, N.E3, N.A3, N.D3, N.G3, N.C3];
const CIRCLE = CIRCLE_RH.map((c, i) => over(c, c.sym, c.roman, [BASS[i], ...c.voicing], c.fingers.join('-')));
const POP = [as(CH.Am, 'vi'), as(CH.F_C, 'IV'), as(CH.C, 'I'), as(CH.G_B, 'V'), as(CH.Am, 'vi')];

export default {
  id: 'b8',
  track: 'beginner',
  num: 8,
  title: '順階和弦：C 大調的七個和弦',
  desc: '在音階的每一級疊三度；大小小大大小減；平行三和弦與分解和弦指法；通往進階和聲',
  segments: [
    {
      kind: 'warmup', minutes: 5, graded: false,
      steps: [
        explain('暖身', '你已經會四個了', `<p>第 6 課學過 C、F、G、Am。它們其實都來自同一個地方：<b>C 大調音階</b>。音階有七個音，每個音上都能疊出一個和弦，這七個和弦叫<b>順階和弦</b>。</p>
          <p>學會它們，就拿到了流行歌、古典、爵士和聲的整張地圖。</p>`),
        () => ({ type: 'chords', kicker: '暖身：學過的和弦', hint: 'delay', concept: 'triad-CFG', chords: shuffleDraw([CH.C, CH.F, CH.G, CH.Am], 4) }),
      ],
    },
    {
      kind: 'concept', minutes: 15, graded: false,
      steps: [
        explain('新概念 1/6', '在每一級疊三度', `<p>從音階的任何一個音開始，<b>隔一個音取一個</b>，取三個：</p>
          <ul><li>從 C：C–E–G</li><li>從 D：D–F–A</li><li>從 E：E–G–B</li><li>……一直到 B：B–D–F</li></ul>
          <p>全部只用白鍵。右手 <b>1-3-5</b> 的手型不變，整隻手一格一格往上移就好。</p>`,
        { keys: marks(DIATONIC_UP[0]), demo: play(DIATONIC_UP, 1) }),
        explain('新概念 2/6', '大、小、減：大小小大大小減', `<p>手型一樣，聲音卻不一樣，因為中間的半音數不同：</p>
          <table class="seg-table"><tr><th>級數</th><th>I</th><th>ii</th><th>iii</th><th>IV</th><th>V</th><th>vi</th><th>vii°</th></tr>
          <tr><td>和弦</td><td>C</td><td>Dm</td><td>Em</td><td>F</td><td>G</td><td>Am</td><td>B°</td></tr>
          <tr><td>性質</td><td>大</td><td>小</td><td>小</td><td>大</td><td>大</td><td>小</td><td>減</td></tr></table>
          <p>級數用羅馬數字：<b>大寫</b>是大三和弦，<b>小寫</b>是小三和弦，加 <b>°</b> 是減三和弦。口訣：<b>大小小大大小減</b>，任何大調都一樣。</p>`),
        explain('新概念 3/6', '用耳朵分辨', `<ul><li><b>大三和弦</b>：下面大三度、上面小三度（4＋3 個半音）。明亮。</li>
          <li><b>小三和弦</b>：下面小三度、上面大三度（3＋4）。柔和、偏暗。</li>
          <li><b>減三和弦</b>：兩個小三度（3＋3）。緊、不穩定，想往前走。</li></ul>`,
        { keys: marks(CH.Bdim), demo: play([CH.C, CH.Dm, CH.Bdim], 2) }),
        { type: 'chords', progression: true, kicker: '動手彈', title: '順階三和弦 ↑', hint: 'show', concept: 'diatonic', instruction: '右手放在低八度的 C，1-3-5 手型不變，每次整隻手往右移一個白鍵。', chords: DIATONIC_UP },
        explain('新概念 4/6', '指法：平行三和弦與分解和弦', `<ul><li><b>平行三和弦</b>：右手 1-3-5、左手 5-3-1，手型固定，整隻手平移。手腕放鬆，用手臂帶著手走，不要讓手指自己伸過去。</li>
          <li><b>分解和弦</b>：同樣的手型一個音一個音彈（1-3-5），就是第 9 課伴奏型的基礎。</li>
          <li>換和弦時若想少移動，就用轉位（進階第 4 課）：例如 C → F 用 C–F–A（1-4-5）。</li></ul>`,
        { keys: BROKEN.slice(0, 3).map((x) => [x.n, 'hint', String(x.f)]), demo: BROKEN.slice(0, 12).map((x) => ({ n: x.n, d: 0.5 })), bpm: 88 }),
        explain('新概念 5/6', '常見進行都在這張地圖上', `<ul><li><b>I–IV–V–I</b>：民謠、藍調的骨架。</li>
          <li><b>vi–IV–I–V</b>：無數流行歌的副歌。</li>
          <li><b>ii–V–I</b>：爵士最重要的進行（進階第 5 課）。</li>
          <li><b>五度循環</b>：I–IV–vii°–iii–vi–ii–V–I，每次根音往下五度，巴洛克和爵士標準曲都愛用。</li></ul>`,
        { demo: play(POP) }),
        explain('新概念 6/6', '接下來會用到哪裡', `<ul><li>每個和弦再疊一層三度，就是<b>順階七和弦</b>：Cmaj7、Dm7、Em7、Fmaj7、G7、Am7、Bø7（進階第 3 課）。</li>
          <li>這七個和弦分成<b>主、下屬、屬</b>三種功能（進階第 5 課）。</li>
          <li>不在這張地圖上的和弦（例如 Fm、D7、E♭），就是借用和弦、次屬和弦這些技巧（進階第 6、7 課）。</li>
          <li>小調也有自己的順階和弦：A 小調是 Am、B°、C、Dm、Em（常改成 E）、F、G（進階第 2 課）。</li></ul>`),
      ],
    },
    {
      kind: 'practice', minutes: 15, graded: true,
      steps: [
        { type: 'chords', progression: true, kicker: '練習 1：平行三和弦 ↑↓', title: 'C → Dm → … → C → … → C', hint: 'show', concept: 'diatonic', instruction: '上去再下來，手型不變。', chords: [...DIATONIC_UP, ...DOWN.slice(1)] },
        { type: 'melody', kicker: '練習 2：分解和弦', title: '順階分解和弦 ↑', hint: 'show', concept: 'diatonic', instruction: '每個和弦 1-3-5，彈完整隻手往右移一格。', notes: BROKEN },
        () => ({ type: 'chords', kicker: '練習 3：照級數彈', hint: 'delay', concept: 'diatonic', chords: shuffleDraw(DIATONIC, 5) }),
        () => ({ type: 'choice', kicker: '練習 4：大、小、減', concept: 'triad-quality', items: shuffleDraw(TRIAD_EAR, 4) }),
        () => ({ type: 'choice', kicker: '練習 5：級數與和弦', concept: 'diatonic-roman', items: shuffleDraw(ROMAN_QUIZ, 3) }),
        { type: 'chords', progression: true, kicker: '練習 6：流行歌進行', title: 'vi–IV–I–V', hint: 'show', concept: 'diatonic', instruction: '用轉位讓手幾乎不動：Am → F/C → C → G/B。', chords: POP },
      ],
    },
    {
      kind: 'piece', minutes: 12, graded: true,
      celebrate: {
        title: '你彈完了順階五度循環',
        body: 'C → F → B° → Em → Am → Dm → G → C：七個順階和弦全部用上，根音每次往下五度，最後回到家。這個進行從巴洛克一路用到爵士。',
        song: play(CIRCLE, 2),
        bpm: 80,
      },
      steps: [
        explain('實際曲目', '順階五度循環', `<p>C → F → B° → Em → Am → Dm → G → C。左手 5 指彈根音，右手照琴鍵上的指號，每次只動一兩根手指。</p>
          <p>第一遍只用右手，第二遍加上左手根音。</p>`,
        { demo: play(CIRCLE, 2), bpm: 80 }),
        { type: 'chords', progression: true, kicker: '第 1 遍：右手', title: '五度循環', hint: 'show', concept: 'diatonic', chords: CIRCLE_RH },
        { type: 'chords', progression: true, kicker: '第 2 遍：加上左手根音', title: '五度循環', hint: 'show', concept: 'diatonic', chords: CIRCLE },
      ],
    },
    {
      kind: 'summary', minutes: 6, graded: true,
      steps: [
        explain('總結評分', '總結測驗', '<p>沒有提示。正確率達 70% 就算完成這一課。</p>'),
        () => ({ type: 'chords', kicker: '測驗 1：照級數彈', hint: 'none', concept: 'diatonic', chords: shuffleDraw(DIATONIC, 4) }),
        () => ({ type: 'choice', kicker: '測驗 2：大、小、減', concept: 'triad-quality', items: shuffleDraw(TRIAD_EAR, 2) }),
        () => ({ type: 'choice', kicker: '測驗 3：級數與和弦', concept: 'diatonic-roman', items: shuffleDraw(ROMAN_QUIZ, 2) }),
        { type: 'chords', progression: true, kicker: '測驗 4：五度循環', title: '五度循環', hint: 'none', concept: 'diatonic', chords: CIRCLE_RH },
      ],
    },
  ],
};
