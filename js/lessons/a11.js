// 進階 第 11 課：延伸和弦（9、11、13）
import { CH, SHELL, as, explain, marks, play, shuffleDraw } from './kit.js';
import { EXT_251, EXT_EAR } from './concepts.js';

const NINTHS = [CH.Cmaj9, CH.Am9, CH.Dm9, CH.G9];
const UPPER = [CH.Dm11, CH.Fmaj7s11, CH.G9sus, CH.G13];
// 城市夜色：I–vi–ii–V 全部換成延伸和弦，右手每次只動一兩根手指。
const NIGHT = [as(CH.Cmaj9, 'Imaj9'), as(CH.Am9, 'vi9'), as(CH.Dm9, 'ii9'), as(CH.G13, 'V13'), as(CH.Cmaj9, 'Imaj9')];

export default {
  id: 'a11',
  track: 'advanced',
  num: 11,
  title: '延伸和弦：9、11、13',
  desc: '在七和弦上繼續疊三度；哪些音可以省略、25 鍵上怎麼排',
  segments: [
    {
      kind: 'warmup', minutes: 5, graded: false,
      steps: [
        explain('暖身', '再往上疊', `<p>三和弦疊三層，七和弦疊四層。繼續往上疊三度，就會得到 <b>9、11、13</b>：這些叫<b>延伸音</b>，是爵士、靈魂樂、城市流行那種「透明、有光暈」的聲音來源。</p>
          <p>先用殼式和聲彈一次 ii–V–I，等一下在它上面加顏色。</p>`),
        { type: 'chords', progression: true, bass: true, kicker: '暖身：殼式和聲', title: 'Dm7 → G7 → Cmaj7', hint: 'delay', concept: 'prog-251', chords: [SHELL.Dm7, SHELL.G7, SHELL.Cmaj7] },
      ],
    },
    {
      kind: 'concept', minutes: 15, graded: false,
      steps: [
        explain('新概念 1/6', '延伸音是哪幾個音', `<p>從 C 往上疊三度：C、E、G、B，再來是 <b>D、F、A</b>。它們比八度還高，所以叫 <b>9 度、11 度、13 度</b>。</p>
          <ul><li>9 度 = 2 度高八度（C 的 9 度是 D）</li><li>11 度 = 4 度高八度（F）</li><li>13 度 = 6 度高八度（A）</li></ul>
          <p class="muted">在鍵盤上不一定要真的彈到那麼高：音名對了，耳朵就聽得出顏色。</p>`),
        explain('新概念 2/6', '九和弦', `<p>在七和弦上加 9 度，是最常用、最安全的延伸：</p>
          <ul><li><b>Cmaj9</b> = Cmaj7 + D</li><li><b>Dm9</b> = Dm7 + E</li><li><b>G9</b> = G7 + A</li></ul>
          <p>排法：左手根音，右手 <b>7-9-3-5</b>（例如 Cmaj9 右手 B–D–E–G）或 <b>3-5-7-9</b>（Am9 右手 C–E–G–B）。</p>`,
        { keys: marks(CH.Cmaj9), demo: play([CH.Cmaj7, CH.Cmaj9], 3) }),
        explain('新概念 3/6', '十一：小和弦好用，大和弦要小心', `<p><b>Dm11</b> 的 G 和三音 F 相差一個全音，聲音開闊，很好用。</p>
          <p>但在大和弦和屬和弦上，11 度（F）和三音（E）只差半音，會打架。常見的兩種解法：</p>
          <ul><li>升高半音成 <b>♯11</b>：Fmaj7♯11 的 B，帶點飄浮感。</li>
          <li>乾脆不要三音，做成 <b>sus</b>：G9sus4（左手 G、右手 F–A–C，也就是 F/G）。</li></ul>`,
        { keys: marks(CH.Dm11), demo: play([CH.Dm11, CH.Fmaj7s11, CH.G9sus], 3) }),
        explain('新概念 4/6', '十三：屬和弦的溫暖', `<p><b>G13</b> 最重要的音是根音、三音 B、七音 F 和 13 度 E。E 放在 F 旁邊，屬和弦立刻變得溫暖。</p>
          <p>13 和弦通常省略 11 度（會和三音打架），5 度也常省略。</p>`,
        { keys: marks(CH.G13), demo: play([CH.G7, CH.G13], 3) }),
        explain('新概念 5/6', '哪些音可以省', `<p>延伸和弦有五到七個音，兩隻手也按不完。省略的順序：</p>
          <ol><li><b>5 度</b>最先省：它不影響和弦性質。</li><li>有貝斯或左手彈根音時，右手不必再彈根音。</li><li><b>3 度和 7 度一定要留</b>：它們決定和弦是大、小還是屬。</li></ol>
          <p class="muted">系統判定也是這樣：只要根音、三音、七音和該延伸音都在，就算對；5 度可有可無。</p>`),
        { type: 'chords', kicker: '動手彈', title: '九和弦', hint: 'show', concept: 'ext-chords', instruction: '左手 5 指彈根音，右手照標示的手型。', chords: NINTHS },
        explain('新概念 6/6', '換和弦只動一根手指', `<p>延伸和弦排得好，換和弦反而更省力。<b>Dm9 → G13 → Cmaj9</b>：</p>
          <ul><li>Dm9 到 G13：右手只有 C 往下移到 B。</li><li>G13 到 Cmaj9：E→D、F→E、A→G，三根手指一起往下一步。</li></ul>`,
        { demo: play(EXT_251, 3) }),
      ],
    },
    {
      kind: 'practice', minutes: 15, graded: true,
      steps: [
        () => ({ type: 'chords', kicker: '練習 1：九和弦', hint: 'show', concept: 'ext-chords', chords: shuffleDraw(NINTHS, 4) }),
        () => ({ type: 'chords', kicker: '練習 2：11 與 13', hint: 'show', concept: 'ext-chords', chords: shuffleDraw(UPPER, 4) }),
        { type: 'chords', progression: true, kicker: '練習 3：延伸的 ii–V–I', title: 'Dm9 → G13 → Cmaj9', hint: 'show', concept: 'ext-chords', instruction: '注意哪些手指不用動。', chords: EXT_251 },
        () => ({ type: 'choice', kicker: '練習 4：聽出延伸音', concept: 'ext-ear', items: shuffleDraw(EXT_EAR, 4) }),
        () => ({ type: 'chords', kicker: '練習 5：提示變慢', hint: 'delay', concept: 'ext-chords', chords: shuffleDraw([...NINTHS, ...UPPER], 5) }),
      ],
    },
    {
      kind: 'piece', minutes: 12, graded: true,
      celebrate: {
        title: '你彈完了「城市夜色」',
        body: 'Cmaj9 → Am9 → Dm9 → G13 → Cmaj9：和第 3 課的 I–vi–ii–V 是同一組和弦，只是每個都加了延伸音，整段就亮了起來。',
        song: play(NIGHT, 4),
        bpm: 76,
      },
      steps: [
        explain('實際曲目', '城市夜色', `<p>Cmaj9 → Am9 → Dm9 → G13 → Cmaj9。這是第 3 課那段 I–vi–ii–V 的延伸版。</p>
          <p>Am9 到 Dm9：右手 G→F、B→A；Dm9 到 G13：只有 C→B。慢慢彈，讓每個和弦響滿。</p>`,
        { demo: play(NIGHT, 4), bpm: 76 }),
        { type: 'chords', progression: true, kicker: '第 1 遍：有提示', title: '城市夜色', hint: 'show', concept: 'ext-chords', chords: NIGHT },
        { type: 'chords', progression: true, kicker: '第 2 遍：不看提示', title: '城市夜色', hint: 'none', concept: 'ext-chords', chords: NIGHT },
      ],
    },
    {
      kind: 'summary', minutes: 6, graded: true,
      steps: [
        explain('總結評分', '總結測驗', '<p>沒有提示。正確率達 70% 就算完成這一課。</p>'),
        () => ({ type: 'chords', kicker: '測驗 1：延伸和弦', hint: 'none', concept: 'ext-chords', chords: shuffleDraw([...NINTHS, ...UPPER], 4) }),
        () => ({ type: 'choice', kicker: '測驗 2：聽出延伸音', concept: 'ext-ear', items: shuffleDraw(EXT_EAR, 2) }),
        { type: 'chords', progression: true, kicker: '測驗 3：延伸的 ii–V–I', title: 'Dm9 → G13 → Cmaj9', hint: 'none', concept: 'ext-chords', chords: EXT_251 },
      ],
    },
  ],
};
