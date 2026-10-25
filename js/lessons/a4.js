// 進階 第 4 課：轉位與聲部進行
import { CH, INV, N, as, explain, marks, over, play, shuffleDraw } from './kit.js';
import { INVERSION_EAR, SMOOTH } from './concepts.js';

const NAME = ['原位', '第一轉位', '第二轉位'];
const named = (c, k) => as(c, NAME[k]);

// Root position everywhere: the whole hand jumps.
const JUMPY = [as(INV.C, 'I'), as(INV.F, 'IV'), as(INV.G, 'V'), as(INV.C, 'I')];
// The same chords with inversions: common tones stay, the rest move by step.
const CLOSE = [as(INV.C, 'I'), as(CH.F_C, 'IV', { low: 0, sym: 'F/C' }), as(INV.G_B, 'V'), as(INV.C, 'I')];

// 帕海貝爾〈卡農〉的和弦進行（公版）：低音一步步往下走，右手幾乎不跳。
// 左手 5 指彈低音；右手原位與第二轉位型 1-3-5，第一轉位型（上面是四度）1-2-5。
const CANON = [
  over(CH.C, 'C', 'I', [N.C4, N.E4, N.G4, N.C5], '1-2-5'),
  over(CH.G, 'G/B', 'V⁶', [N.B3, N.D4, N.G4, N.B4], '1-3-5'),
  over(CH.Am, 'Am', 'vi', [N.A3, N.C4, N.E4, N.A4], '1-2-5'),
  over(CH.Em, 'Em/G', 'iii⁶', [N.G3, N.B3, N.E4, N.G4], '1-3-5'),
  over(CH.F, 'F', 'IV', [N.F3, N.A3, N.C4, N.F4], '1-2-5'),
  over(CH.C, 'C/E', 'I⁶', [N.E3, N.G3, N.C4, N.E4], '1-3-5'),
  over(CH.Dm, 'Dm', 'ii', [N.D3, N.A3, N.D4, N.F4], '1-3-5'),
  over(CH.G7, 'G7', 'V7', [N.G3, N.B3, N.D4, N.F4], '1-3-5'),
  over(CH.C, 'C', 'I', [N.C3, N.C4, N.E4, N.G4], '1-3-5'),
];

export default {
  id: 'a4',
  track: 'advanced',
  num: 4,
  title: '轉位與聲部進行',
  desc: '原位、第一、第二轉位；共同音與平順的聲部連接',
  segments: [
    {
      kind: 'warmup', minutes: 5, graded: false,
      steps: [
        explain('暖身', '同一個和弦，換個排法', `<p>C 和弦不一定要 C–E–G 由下往上排。把音的順序換一換，和弦還是 C，但聲音的重心會變，手也可以少跳很多。</p>
          <p>先彈幾個熟悉的三和弦。</p>`),
        () => ({ type: 'chords', kicker: '暖身：三和弦', hint: 'delay', concept: 'triad-CFG', chords: shuffleDraw([CH.C, CH.F, CH.G, CH.Am], 4) }),
      ],
    },
    {
      kind: 'concept', minutes: 15, graded: false,
      steps: [
        explain('新概念 1/6', '原位與轉位', `<p>三和弦有三個音：根音、三音、五音。<b>誰在最下面</b>，決定了它的排法：</p>
          <ul><li><b>原位</b>：根音在最下面。C–E–G。</li>
          <li><b>第一轉位</b>：三音在最下面。E–G–C。</li>
          <li><b>第二轉位</b>：五音在最下面。G–C–E。</li></ul>
          <p>上面的音怎麼排都可以，只看<b>最低音</b>。</p>`,
        { keys: marks(INV.C), demo: play([INV.C, INV.C_E, INV.C_G]), staff: { notes: [INV.C, INV.C_E, INV.C_G].map((c) => ({ n: c.voicing, d: 2 })), clef: 'treble', label: 'C 和弦的原位、第一轉位、第二轉位' } }),
        explain('新概念 2/6', '斜線和弦與手型', `<p>流行樂譜用<b>斜線和弦</b>寫轉位：<b>C/E</b> 是「C 和弦、低音 E」，<b>C/G</b> 是「C 和弦、低音 G」。斜線後面就是最低音。</p>
          <p>右手手型：</p>
          <ul><li>原位 C–E–G：<b>1-3-5</b>，兩個三度疊起來。</li>
          <li>第一轉位 E–G–C：<b>1-2-5</b>，上面是四度，所以用 2 指。</li>
          <li>第二轉位 G–C–E：<b>1-3-5</b>，下面是四度，3 指往外一點。</li></ul>
          <p class="muted">例外：從 C–E–G 換到 F/C（C–F–A）時，照入門第 6 課用 <b>1-4-5</b>：拇指和小指不動，只有 3 指換成 4 指按 F。</p>`,
        { keys: marks(INV.C_E), demo: play([INV.C_E, INV.C_G]) }),
        { type: 'chords', kicker: '動手彈', title: 'C 的三種排法', hint: 'show', concept: 'inversions', instruction: '注意最低音：C、E、G 輪流在最下面。', chords: [named(INV.C, 0), named(INV.C_E, 1), named(INV.C_G, 2)] },
        explain('新概念 3/6', '為什麼要轉位：手不用跳', `<p>全部用原位彈 C → F → G → C，整隻手要一直跳。換成 <b>C → F/C → G/B → C</b>，手幾乎不動：</p>
          <ul><li>C 到 F/C：C 不動，E→F、G→A 各走一步。</li>
          <li>F/C 到 G/B：C→B、F→D、A→G，都是最近的路。</li></ul>
          <p>先聽「跳來跳去」的版本，再聽「平順」的版本。</p>`,
        { keys: marks(CH.F_C), demo: [...play(JUMPY), ...play(CLOSE)] }),
        explain('新概念 4/6', '聲部進行三原則', `<p>把和弦的每個音想成一位歌手，換和弦就是每位歌手唱下一個音。好的<b>聲部進行</b>讓每個人都好唱：</p>
          <ol><li><b>共同音留著</b>：兩個和弦都有的音，不要動。</li>
          <li><b>其他音走最近的路</b>：一步（二度）最好，三度也可以。</li>
          <li><b>低音可以跳，上面盡量不跳</b>：左手負責低音，右手負責平順。</li></ol>`,
        { keys: marks(INV.Am_C), demo: play(SMOOTH) }),
        explain('新概念 5/6', '低音線', `<p>反過來想：如果想讓<b>低音一步步往下走</b>，就用轉位來配。帕海貝爾的〈卡農〉就是這樣：低音 C、B、A、G、F、E、D…，上面的和弦是 C、G/B、Am、Em/G、F、C/E……</p>
          <p>左手彈低音，右手彈和弦。每個和弦裡，右手都只動一兩根手指。</p>`,
        { demo: play(CANON) }),
        explain('新概念 6/6', '判定方式', `<p>這一課的和弦題會檢查<b>最低音</b>：要彈 C/E，最下面一定要是 E。</p>
          <p class="muted">左手和右手一起按，或在 1.5 秒內依序按下都可以。</p>`),
      ],
    },
    {
      kind: 'practice', minutes: 15, graded: true,
      steps: [
        () => ({ type: 'chords', kicker: '練習 1：C 和 F 的轉位', hint: 'show', concept: 'inversions', chords: shuffleDraw([named(INV.C, 0), named(INV.C_E, 1), named(INV.C_G, 2), named(INV.F, 0), named(INV.F_A, 1), named(INV.F_C, 2)], 5) }),
        () => ({ type: 'chords', kicker: '練習 2：G 和 Am 的轉位，提示變慢', hint: 'delay', concept: 'inversions', chords: shuffleDraw([named(INV.G, 0), named(INV.G_B, 1), named(INV.G_D, 2), named(INV.Am, 0), named(INV.Am_C, 1), named(INV.Am_E, 2)], 5) }),
        { type: 'chords', progression: true, kicker: '練習 3：平順的 I–vi–IV–V', title: 'C → Am/C → F/C → G/B → C', hint: 'show', concept: 'voice-leading', instruction: '拇指一直守在 C 附近，只有需要動的手指才動。', chords: SMOOTH },
        () => ({ type: 'choice', kicker: '練習 4：聽出轉位', concept: 'inversion-ear', items: shuffleDraw(INVERSION_EAR, 3) }),
        { type: 'chords', progression: true, kicker: '練習 5：共同音', title: 'C → F/C → G/B → C', hint: 'delay', concept: 'voice-leading', instruction: '先找出兩個和弦共有的音，按住不動。', chords: CLOSE },
        { type: 'chords', progression: true, kicker: '練習 6：低音線', title: '卡農前半：C → G/B → Am → Em/G', hint: 'show', concept: 'voice-leading', instruction: '左手 5 指彈低音 C、B、A、G，一步步往下；右手照琴鍵上的指號小幅移動。', chords: CANON.slice(0, 4) },
      ],
    },
    {
      kind: 'piece', minutes: 12, graded: true,
      celebrate: {
        title: '你彈完了〈卡農〉的和弦進行',
        body: '低音一路往下走，右手只在附近移動：這就是轉位加上好的聲部進行。三百多年來，無數流行歌都借用了這組和弦。',
        song: play(CANON, 3),
        bpm: 72,
      },
      steps: [
        explain('實際曲目', '帕海貝爾〈卡農〉的和弦進行', `<p>C → G/B → Am → Em/G → F → C/E → Dm → G7 → C。低音 C、B、A、G、F、E、D，最後 G 回到 C。</p>
          <p>左手 5 指彈最低的那個音，右手彈上面三個：第一轉位型用 1-2-5，其他用 1-3-5。注意 Dm 到 G7：D 和 F 兩個音都不用動。</p>`,
        { demo: play(CANON, 3), bpm: 72 }),
        { type: 'chords', progression: true, kicker: '第 1 遍：有提示', title: '卡農', hint: 'show', concept: 'voice-leading', chords: CANON },
        { type: 'chords', progression: true, kicker: '第 2 遍：不看提示', title: '卡農', hint: 'none', concept: 'voice-leading', chords: CANON },
      ],
    },
    {
      kind: 'summary', minutes: 6, graded: true,
      steps: [
        explain('總結評分', '總結測驗', '<p>沒有提示。正確率達 70% 就能解鎖下一課。</p>'),
        () => ({ type: 'chords', kicker: '測驗 1：轉位', hint: 'none', concept: 'inversions', chords: shuffleDraw([named(INV.C_E, 1), named(INV.C_G, 2), named(INV.F_A, 1), named(INV.G_B, 1), named(INV.G_D, 2), named(INV.Am_C, 1)], 4) }),
        () => ({ type: 'choice', kicker: '測驗 2：聽出轉位', concept: 'inversion-ear', items: shuffleDraw(INVERSION_EAR, 2) }),
        { type: 'chords', progression: true, kicker: '測驗 3：聲部進行', title: 'C → Am/C → F/C → G/B → C', hint: 'none', concept: 'voice-leading', chords: SMOOTH },
      ],
    },
  ],
};
