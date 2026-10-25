// 進階 第 8 課：三全音代理
import { CH, N, SHELL, as, explain, marks, play, shuffleDraw } from './kit.js';
import { TRITONE_EAR } from './concepts.js';

const tritone = (a, b) => [[a, 'hint', ''], [b, 'hint', '']];

export default {
  id: 'a8',
  track: 'advanced',
  num: 8,
  title: '三全音代理',
  desc: '屬七和弦的三全音、♭II7 代替 V7、半音下行的低音線',
  segments: [
    {
      kind: 'warmup', minutes: 5, graded: false,
      steps: [
        explain('暖身', '先把 ii–V–I 彈熟', '<p>三全音代理是爵士和聲裡最常見的「換色」技巧。它建立在 ii–V–I 和殼式和聲之上，所以先熱身一次。</p>'),
        { type: 'chords', progression: true, bass: true, kicker: '暖身：ii–V–I', title: 'Dm7 → G7 → Cmaj7', hint: 'delay', concept: 'prog-251', chords: [SHELL.Dm7, SHELL.G7, SHELL.Cmaj7] },
      ],
    },
    {
      kind: 'concept', minutes: 14, graded: false,
      steps: [
        explain('新概念 1/4', 'G7 的心臟：三全音', `<p>G7 裡的 <b>B 和 F</b> 相距三個全音（增四度），這個音程叫<b>三全音</b>。它非常不穩定：B 想往上到 C，F 想往下到 E，一起解決成 C 和弦的 C 和 E。</p>
          <p>屬七和弦的「推力」幾乎全來自這兩個音。</p>`,
        { keys: tritone(N.B3, N.F4), demo: [{ n: [N.B3, N.F4], d: 2 }, { n: [N.C4, N.E4], d: 2 }] }),
        explain('新概念 2/4', '另一個擁有同樣三全音的和弦', `<p>B–F 倒過來看是 <b>F–C♭</b>（C♭ 就是 B）。哪個屬七和弦的三音是 F、七音是 C♭？答案是 <b>D♭7（D♭–F–A♭–C♭）</b>。</p>
          <p class="callout">G7 和 D♭7 共用同一組三全音，根音相距也正好是三全音（G ↔ D♭）。所以 D♭7 可以<b>代替</b> G7，這就是三全音代理。</p>`,
        { keys: marks(SHELL.Db7), demo: play([SHELL.G7, SHELL.Db7]) }),
        explain('新概念 3/4', 'ii–♭II7–I：低音半音下行', `<p>把 ii–V–I 的 G7 換成 D♭7：<b>Dm7 → D♭7 → Cmaj7</b>。</p>
          <ul><li>右手（三音與七音）<b>完全不用動</b>：G7 和 D♭7 的殼式和聲是同一組 B、F。</li>
          <li>左手低音變成 <b>D → D♭ → C</b>，一路半音往下，更滑順、更有爵士味。</li></ul>`,
        { keys: marks(SHELL.Db7), demo: play([SHELL.Dm7, SHELL.Db7, SHELL.Cmaj7]) }),
        { type: 'chords', progression: true, bass: true, kicker: '動手彈', title: 'Dm7 → D♭7 → Cmaj7', hint: 'show', concept: 'tritone-sub', instruction: '右手 B、F 不動，只有左手低音半音下行。', chords: [SHELL.Dm7, SHELL.Db7, SHELL.Cmaj7] },
        explain('新概念 4/4', '也能代替次屬和弦', `<p>任何屬七和弦都能用根音相距三全音的屬七和弦代替：</p>
          <ul><li>A7（V7/ii）→ <b>E♭7</b>：C → E♭7 → Dm，低音 E♭ 半音下行到 D。</li>
          <li>D7（V7/V）→ <b>A♭7</b>：A♭7 → G7，低音 A♭ 半音下行到 G。</li></ul>
          <p class="muted">使用時機：旋律沒有和代理和弦衝突的音（例如 G7 的 G、D 在 D♭7 上會變成刺耳的延伸音）。</p>`,
        { keys: marks(SHELL.Eb7), demo: play([as(CH.Cmaj7, 'I'), SHELL.Eb7, SHELL.Dm7, SHELL.Db7, SHELL.Cmaj7]) }),
      ],
    },
    {
      kind: 'practice', minutes: 15, graded: true,
      steps: [
        () => ({ type: 'chords', kicker: '練習 1：代理和弦', hint: 'show', concept: 'tritone-sub', chords: shuffleDraw([as(CH.Db7, 'subV7'), as(CH.Ab7, 'subV7/V'), as(CH.Eb7, 'subV7/ii')], 4) }),
        { type: 'chords', progression: true, bass: true, kicker: '練習 2：比較原版與代理', title: 'ii–V–I → ii–♭II7–I', hint: 'show', concept: 'tritone-sub', chords: [SHELL.Dm7, SHELL.G7, SHELL.Cmaj7, SHELL.Dm7, SHELL.Db7, SHELL.Cmaj7] },
        { type: 'chords', progression: true, bass: true, kicker: '練習 3：代理次屬和弦', title: 'Cmaj7 → E♭7 → Dm7 → D♭7 → Cmaj7', hint: 'delay', concept: 'tritone-sub', chords: [SHELL.Cmaj7, SHELL.Eb7, SHELL.Dm7, SHELL.Db7, SHELL.Cmaj7] },
        () => ({ type: 'choice', kicker: '練習 4：聽出代理', concept: 'tritone-ear', items: shuffleDraw(TRITONE_EAR, 3) }),
      ],
    },
    {
      kind: 'piece', minutes: 12, graded: true,
      celebrate: {
        title: '你彈完了一段帶三全音代理的爵士循環',
        body: '低音從 E♭ 一路半音走到 C：E♭7 → Dm7 → D♭7 → Cmaj7。右手幾乎沒動，色彩卻完全不同。',
        song: play([SHELL.Cmaj7, SHELL.Eb7, SHELL.Dm7, SHELL.Db7, SHELL.Cmaj7], 4),
        bpm: 80,
      },
      steps: [
        explain('實際曲目', '半音下行的爵士循環', '<p>Cmaj7 → E♭7 → Dm7 → D♭7 → Cmaj7。聽左手：E♭、D、D♭、C，一路半音下行。</p>',
          { demo: play([SHELL.Cmaj7, SHELL.Eb7, SHELL.Dm7, SHELL.Db7, SHELL.Cmaj7], 4), bpm: 80 }),
        { type: 'chords', progression: true, bass: true, kicker: '第 1 遍：有提示', title: '爵士循環', hint: 'show', concept: 'tritone-sub', chords: [SHELL.Cmaj7, SHELL.Eb7, SHELL.Dm7, SHELL.Db7, SHELL.Cmaj7] },
        { type: 'chords', progression: true, bass: true, kicker: '第 2 遍：不看提示', title: '爵士循環', hint: 'none', concept: 'tritone-sub', chords: [SHELL.Cmaj7, SHELL.Eb7, SHELL.Dm7, SHELL.Db7, SHELL.Cmaj7] },
      ],
    },
    {
      kind: 'summary', minutes: 6, graded: true,
      steps: [
        explain('總結評分', '總結測驗', '<p>沒有提示。正確率達 70% 就能解鎖下一課。</p>'),
        { type: 'chords', progression: true, bass: true, kicker: '測驗 1：ii–♭II7–I', title: 'Dm7 → D♭7 → Cmaj7', hint: 'none', concept: 'tritone-sub', chords: [SHELL.Dm7, SHELL.Db7, SHELL.Cmaj7] },
        () => ({ type: 'choice', kicker: '測驗 2：聽出代理', concept: 'tritone-ear', items: shuffleDraw(TRITONE_EAR, 2) }),
      ],
    },
  ],
};
