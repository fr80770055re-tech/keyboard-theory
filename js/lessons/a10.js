// 進階 第 10 課：減七和弦與經過減和弦
import { CH, N, as, explain, marks, over, play, shuffleDraw } from './kit.js';
import { DIM_EAR, PASSING } from './concepts.js';

const DIM7 = [CH.Bdim7, CH.Csdim7, CH.Dsdim7, CH.Fsdim7, CH.Gsdim7];
const RESOLVE = [as(CH.Bdim7, 'vii°7'), as(CH.C, 'I'), as(CH.Gsdim7, 'vii°7/vi'), as(CH.Am, 'vi')];
const IV_PASS = [as(CH.F, 'IV'), as(CH.Fsdim7, '♯iv°7'), over(CH.C, 'C/G', 'I⁶₄', [N.G3, N.C4, N.E4], '1-3'), as(CH.G7, 'V7'), as(CH.C, 'I')];

// 爬升的低音：左手 C、C♯、D、D♯、E、F、F♯、G 一路半音往上，
// 每個「黑鍵」上都是一個經過減七和弦。右手幾乎不動：拇指守在 G 或 A，
// 換和弦多半只動一根手指。
const RISE = [
  over(CH.C, 'C', 'I', [N.C3, N.G3, N.C4, N.E4], '1-3-5'),
  over(CH.Csdim7, 'C♯°7', '♯i°7', [N.Db3, N.G3, N.Bb3, N.E4], '1-2-5'),
  over(CH.Dm7, 'Dm7', 'ii7', [N.D3, N.A3, N.C4, N.F4], '1-2-5'),
  over(CH.Dsdim7, 'D♯°7', '♯ii°7', [N.Eb3, N.A3, N.C4, N.Gb4], '1-2-5'),
  over(CH.C, 'C/E', 'I⁶', [N.E3, N.G3, N.C4, N.G4], '1-2-5'),
  over(CH.F, 'F', 'IV', [N.F3, N.A3, N.C4, N.F4], '1-2-5'),
  over(CH.Fsdim7, 'F♯°7', '♯iv°7', [N.Gb3, N.A3, N.C4, N.Eb4], '1-2-4'),
  over(CH.C, 'C/G', 'I⁶₄', [N.G3, N.C4, N.E4, N.G4], '1-3-5'),
  over(CH.G7, 'G7', 'V7', [N.G3, N.B3, N.D4, N.F4], '1-3-5'),
  over(CH.C, 'C', 'I', [N.C3, N.G3, N.C4, N.E4], '1-3-5'),
];

export default {
  id: 'a10',
  track: 'advanced',
  num: 10,
  title: '減七和弦與經過減和弦',
  desc: '減三和弦、減七和弦的對稱結構；vii°7 解決與半音爬升的經過減和弦',
  segments: [
    {
      kind: 'warmup', minutes: 5, graded: false,
      steps: [
        explain('暖身', '最緊張的和弦', `<p>默片裡壞人登場、老電影的懸疑時刻，常會聽到一個「嗡——」的緊張和弦，那就是<b>減七和弦</b>。它在古典、爵士、福音和拉格泰姆裡都很常見，最好用的地方是當作兩個和弦之間的<b>經過和弦</b>。</p>
          <p>先複習兩個你學過的七和弦。</p>`),
        { type: 'chords', kicker: '暖身：七和弦', hint: 'delay', concept: 'chord-7th', chords: [CH.G7, CH.Bm7b5, CH.Dm7] },
      ],
    },
    {
      kind: 'concept', minutes: 14, graded: false,
      steps: [
        explain('新概念 1/6', '減三和弦', `<p>兩個<b>小三度</b>疊起來就是<b>減三和弦</b>：B–D–F。根音到五音只有 6 個半音（三全音），所以不穩定。</p>
          <p>在 C 大調裡，它是 vii 級：<b>B°</b>。半減七和弦 Bø7 就是 B° 再加一個 A。</p>`,
        { keys: marks(CH.Bdim), demo: play([CH.Bdim, CH.C], 2) }),
        explain('新概念 2/6', '減七和弦：全是小三度', `<p>把 Bø7 的 A 再降半音成 <b>A♭</b>，就得到 <b>B°7 = B–D–F–A♭</b>。四個音之間<b>全是小三度</b>（3 個半音），連 A♭ 回到 B 也是。</p>
          <p class="callout">因為完全對稱，減七和弦只有三種：B°7、D°7、F°7、A♭°7 其實是同一組音。</p>`,
        { keys: marks(CH.Bdim7), demo: play([CH.Bm7b5, CH.Bdim7], 3) }),
        explain('新概念 3/6', '減七和弦往哪裡走', `<p>B°7 的每個音都離 C 和弦很近：<b>B→C、D→C（或 E）、F→E、A♭→G</b>。所以它像 G7 一樣想回到 C，而且更急。</p>
          <p>其實 B°7 就是 G7♭9（G–B–D–F–A♭）省略根音 G。把它當成「沒有根音的屬和弦」，就知道它要去哪裡：<b>減七和弦的根音往上半音</b>，就是目標和弦。</p>`,
        { keys: marks(CH.Bdim7), demo: play([CH.Bdim7, CH.C, CH.Gsdim7, CH.Am], 2) }),
        { type: 'chords', progression: true, kicker: '動手彈', title: 'B°7 → C、G♯°7 → Am', hint: 'show', concept: 'dim7', instruction: '右手 1-2-3-5；減七和弦的根音往上半音，就是下一個和弦的根音。', chords: RESOLVE },
        explain('新概念 4/6', '經過減和弦', `<p>兩個和弦的根音相差一個全音時（例如 C 和 Dm），可以在中間的半音上放一個減七和弦：<b>C → C♯°7 → Dm</b>。</p>
          <p>低音 C、C♯、D 一路半音往上，像在兩個和弦之間鋪了一級台階。右手的 C 往上推到 C♯，再加一個 B♭，其他音都不動。</p>`,
        { keys: marks(CH.Csdim7), demo: play(PASSING) }),
        explain('新概念 5/6', '常見的三個位置', `<ul><li><b>♯i°7</b>：C → C♯°7 → Dm（I 到 ii）</li>
          <li><b>♯ii°7</b>：Dm → D♯°7 → C/E（ii 到 I⁶）</li>
          <li><b>♯iv°7</b>：F → F♯°7 → C/G（IV 到 I⁶₄），福音和藍調裡特別常見。</li></ul>
          <p>規則都一樣：低音半音往上，減七和弦夾在中間。</p>`,
        { keys: marks(CH.Fsdim7), demo: play(IV_PASS) }),
        explain('新概念 6/6', '指法', `<ul><li>減七和弦四個音間距相同，右手用 <b>1-2-3-5</b>（手小的話可用 1-2-4-5）。</li>
          <li>從大三和弦變成經過減和弦，常常只動一兩根手指：先找出不用動的音。</li>
          <li>左手負責半音爬升的低音，用 5 指或 4 指，一步一個鍵。</li></ul>`),
      ],
    },
    {
      kind: 'practice', minutes: 15, graded: true,
      steps: [
        () => ({ type: 'chords', kicker: '練習 1：減七和弦', hint: 'show', concept: 'dim7', chords: shuffleDraw(DIM7, 4) }),
        { type: 'chords', progression: true, kicker: '練習 2：解決', title: 'B°7 → C、G♯°7 → Am', hint: 'delay', concept: 'dim7', chords: RESOLVE },
        { type: 'chords', progression: true, kicker: '練習 3：經過減和弦', title: 'C → C♯°7 → Dm → G7 → C', hint: 'show', concept: 'passing-dim', instruction: '從 C 到 C♯°7：C 推高到 C♯，再加上 B♭；E、G 不動。', chords: PASSING },
        () => ({ type: 'choice', kicker: '練習 4：聽出減七和弦', concept: 'dim-ear', items: shuffleDraw(DIM_EAR, 3) }),
        { type: 'chords', progression: true, kicker: '練習 5：♯iv°7', title: 'F → F♯°7 → C/G → G7 → C', hint: 'delay', concept: 'passing-dim', chords: IV_PASS },
      ],
    },
    {
      kind: 'piece', minutes: 12, graded: true,
      celebrate: {
        title: '你彈完了「爬升的低音」',
        body: '左手從 C 半音一路爬到 G，每個黑鍵上都是一個經過減七和弦。這就是拉格泰姆、福音和老爵士裡那種「往上推」的味道。',
        song: play(RISE, 2),
        bpm: 88,
      },
      steps: [
        explain('實際曲目', '爬升的低音', `<p>C → C♯°7 → Dm7 → D♯°7 → C/E → F → F♯°7 → C/G → G7 → C。</p>
          <p>左手 5 指彈最低的音：C、C♯、D、D♯、E、F、F♯、G，一步一個鍵往上。右手在中央 C 附近，拇指大多守在 G 或 A，每次只動一兩根手指（例如 Dm7 → D♯°7 只有 5 指從 F 移到 F♯）。</p>`,
        { demo: play(RISE, 2), bpm: 88 }),
        { type: 'chords', progression: true, kicker: '第 1 遍：有提示', title: '爬升的低音', hint: 'show', concept: 'passing-dim', chords: RISE },
        { type: 'chords', progression: true, kicker: '第 2 遍：不看提示', title: '爬升的低音', hint: 'none', concept: 'passing-dim', chords: RISE },
      ],
    },
    {
      kind: 'summary', minutes: 6, graded: true,
      steps: [
        explain('總結評分', '總結測驗', '<p>沒有提示。正確率達 70% 就能解鎖下一課。</p>'),
        () => ({ type: 'chords', kicker: '測驗 1：減七和弦', hint: 'none', concept: 'dim7', chords: shuffleDraw(DIM7, 3) }),
        () => ({ type: 'choice', kicker: '測驗 2：聽出減七和弦', concept: 'dim-ear', items: shuffleDraw(DIM_EAR, 2) }),
        { type: 'chords', progression: true, kicker: '測驗 3：經過減和弦', title: 'C → C♯°7 → Dm → G7 → C', hint: 'none', concept: 'passing-dim', chords: PASSING },
      ],
    },
  ],
};
