// 進階 第 3 課：七和弦
import { CH, SHELL, explain, marks, play, shuffleDraw } from './kit.js';
import { QUALITY_EAR } from './concepts.js';

export default {
  id: 'a3',
  track: 'advanced',
  num: 3,
  title: '七和弦',
  desc: '大七、屬七、小七、半減七和弦；殼式和聲與兩手分工',
  segments: [
    {
      kind: 'warmup', minutes: 5, graded: false,
      steps: [
        explain('暖身', '三和弦再加一層', '<p>三和弦是「隔一個音疊一個」疊三層。再往上疊一層，就是<b>七和弦</b>：根音、三音、五音、七音。爵士、流行、R&B 的和聲色彩，大多來自七和弦。</p>'),
        () => ({ type: 'chords', kicker: '暖身：三和弦', hint: 'delay', concept: 'triad-CFG', chords: shuffleDraw([CH.C, CH.F, CH.G, CH.Dm, CH.Am], 4) }),
      ],
    },
    {
      kind: 'concept', minutes: 12, graded: false,
      steps: [
        explain('新概念 1/5', '大七和弦（maj7）', `<p><b>Cmaj7 = C–E–G–B</b>。在 C 大三和弦上加一個大七度（B，比根音低半音）。聲音明亮、柔和、有點夢幻。</p>
          <p>在 C 大調裡，<b>I 級和 IV 級</b>是大七和弦：Cmaj7、Fmaj7。</p>`,
        { keys: marks(CH.Cmaj7), demo: play([CH.Cmaj7], 3) }),
        explain('新概念 2/5', '屬七和弦（7）', `<p><b>G7 = G–B–D–F</b>。大三和弦加小七度。B 和 F 之間是<b>三全音</b>（增四度），非常不穩定，強烈地想解決到 C 和弦。</p>
          <p>大調裡只有 <b>V 級</b>天生是屬七和弦，它是「回家」的推力。</p>`,
        { keys: marks(CH.G7), demo: play([CH.G7, CH.C], 3) }),
        explain('新概念 3/5', '小七和弦（m7）與半減七（ø7）', `<p><b>Dm7 = D–F–A–C</b>：小三和弦加小七度，柔和偏暗。C 大調的 ii、iii、vi 都是小七和弦（Dm7、Em7、Am7）。</p>
          <p><b>Bø7 = B–D–F–A</b>：減三和弦加小七度，又叫半減七和弦，是 vii 級。</p>`,
        { keys: marks(CH.Dm7), demo: play([CH.Dm7, CH.Bm7b5], 3) }),
        { type: 'chords', kicker: '動手彈', title: '四種七和弦', hint: 'show', concept: 'chord-7th', instruction: '四個音都要按到；轉位也可以。', chords: [CH.Cmaj7, CH.G7, CH.Dm7, CH.Bm7b5] },
        explain('新概念 4/5', '殼式和聲：兩手分工', `<p>四個音全用右手會很擠。常見的做法是<b>左手彈根音、右手只彈三音和七音</b>，五音省略。這叫<b>殼式和聲（shell voicing）</b>。</p>
          <p>三音決定大小，七音決定種類：只要這兩個音在，耳朵就聽得出是什麼和弦。</p>`,
        { keys: marks(SHELL.G7), demo: play([SHELL.Dm7, SHELL.G7, SHELL.Cmaj7]) }),
        explain('新概念 5/5', '指法提示', `<ul><li>右手封閉四音和弦常用 <b>1-2-3-5</b>；左手由下往上 <b>5-3-2-1</b>。</li>
          <li>殼式和聲：左手 5 指彈根音，右手用 1、2 或 1、3 指按三音與七音。</li>
          <li>換和弦時，先看哪些音可以不動（共同音），其餘手指就近移動。</li></ul>`),
      ],
    },
    {
      kind: 'practice', minutes: 15, graded: true,
      steps: [
        () => ({ type: 'chords', kicker: '練習 1：七和弦', hint: 'show', concept: 'chord-7th', chords: shuffleDraw([CH.Cmaj7, CH.G7, CH.Dm7, CH.Am7, CH.Fmaj7], 5) }),
        () => ({ type: 'chords', kicker: '練習 2：提示變慢', hint: 'delay', concept: 'chord-7th', chords: shuffleDraw([CH.Cmaj7, CH.G7, CH.Dm7, CH.Am7, CH.Em7, CH.Fmaj7], 5) }),
        { type: 'chords', bass: true, kicker: '練習 3：殼式和聲', title: '根音＋三音＋七音', hint: 'show', concept: 'chord-7th', instruction: '左手根音在最低，右手只按三音和七音。', chords: [SHELL.Dm7, SHELL.G7, SHELL.Cmaj7, SHELL.Fmaj7] },
        () => ({ type: 'choice', kicker: '練習 4：聽辨', concept: 'quality-ear', items: shuffleDraw(QUALITY_EAR, 3) }),
      ],
    },
    {
      kind: 'piece', minutes: 12, graded: true,
      celebrate: {
        title: '你彈完了一段七和弦進行',
        body: 'Cmaj7 → Am7 → Dm7 → G7：把 I–vi–ii–V 全換成七和弦，立刻有了爵士與城市流行的味道。',
        song: play([CH.Cmaj7, CH.Am7, CH.Dm7, CH.G7, CH.Cmaj7], 4),
        bpm: 84,
      },
      steps: [
        explain('實際曲目', 'I–vi–ii–V 的七和弦版本', '<p>Cmaj7 → Am7 → Dm7 → G7 → Cmaj7。這是爵士標準曲最常見的循環之一（turnaround）。先聽，再彈。</p>',
          { demo: play([CH.Cmaj7, CH.Am7, CH.Dm7, CH.G7, CH.Cmaj7], 4), bpm: 84 }),
        { type: 'chords', progression: true, kicker: '第 1 遍：有提示', title: 'Cmaj7 → Am7 → Dm7 → G7', hint: 'show', concept: 'chord-7th', chords: [CH.Cmaj7, CH.Am7, CH.Dm7, CH.G7, CH.Cmaj7] },
        { type: 'chords', progression: true, kicker: '第 2 遍：不看提示', title: 'Cmaj7 → Am7 → Dm7 → G7', hint: 'none', concept: 'chord-7th', chords: [CH.Cmaj7, CH.Am7, CH.Dm7, CH.G7, CH.Cmaj7] },
      ],
    },
    {
      kind: 'summary', minutes: 6, graded: true,
      steps: [
        explain('總結評分', '總結測驗', '<p>沒有提示。正確率達 70% 就能解鎖下一課。</p>'),
        () => ({ type: 'chords', kicker: '測驗 1：七和弦', hint: 'none', concept: 'chord-7th', chords: shuffleDraw([CH.Cmaj7, CH.G7, CH.Dm7, CH.Am7, CH.Bm7b5], 4) }),
        () => ({ type: 'choice', kicker: '測驗 2：聽辨', concept: 'quality-ear', items: shuffleDraw(QUALITY_EAR, 2) }),
      ],
    },
  ],
};
