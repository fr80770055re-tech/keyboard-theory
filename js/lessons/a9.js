// 進階 第 9 課：伴奏型與運指
import { CH, N, as, explain, play } from './kit.js';

// Left-hand patterns, all inside the lower octave of a 25-key keyboard.
const pat = (pairs, d) => pairs.map(([n, f]) => ({ n, f, ...(d ? { d } : {}) }));
const ROOT5 = pat([[N.C3, 5], [N.G3, 1], [N.C3, 5], [N.G3, 1]]);
const BROKEN = pat([[N.C3, 5], [N.E3, 3], [N.G3, 1], [N.E3, 3]]);
const OCTAVE = pat([[N.C3, 5], [N.G3, 2], [N.C4, 1], [N.G3, 2]]); // stretch to the octave
// Alberti bass (low–high–middle–high) on I–vi–IV–V, using inversions so the
// hand barely moves: C, Am/C, F/C, G/D.
const ALB = {
  C: pat([[N.C3, 5], [N.G3, 1], [N.E3, 3], [N.G3, 1]], 0.5),
  Am: pat([[N.C3, 5], [N.A3, 1], [N.E3, 3], [N.A3, 1]], 0.5),
  F: pat([[N.C3, 5], [N.A3, 1], [N.F3, 2], [N.A3, 1]], 0.5),
  G: pat([[N.D3, 5], [N.B3, 1], [N.G3, 2], [N.B3, 1]], 0.5),
};
const ALBERTI_TUNE = [...ALB.C, ...ALB.C, ...ALB.Am, ...ALB.Am, ...ALB.F, ...ALB.F, ...ALB.G, ...ALB.G, { n: N.C3, f: 5, d: 4 }];
const timed = (notes) => notes.map(({ n, d }) => ({ n, d: d ?? 1 }));
// Left-hand root, right-hand chord: the "oom-pah" of a waltz or a ballad.
const withBass = (c, bass) => ({ ...c, voicing: [bass, ...c.voicing], fingers: ['5', ...(c.fingers || [])] });

export default {
  id: 'a9',
  track: 'advanced',
  num: 9,
  title: '伴奏型與運指',
  desc: '根音五度、分解和弦、八度擴張、Alberti 低音、左手根音＋右手和弦',
  segments: [
    {
      kind: 'warmup', minutes: 5, graded: false,
      steps: [
        explain('暖身', '同樣的和弦，不同的織體', '<p>知道和弦之後，還要決定「怎麼彈」：一次全按、拆開來彈、左右手分工……這些固定的彈法叫<b>伴奏型</b>。好的伴奏型讓旋律有節奏、有流動感，也要配上順手的<b>運指</b>。</p>'),
        { type: 'chords', progression: true, kicker: '暖身', title: 'I–vi–IV–V', hint: 'delay', concept: 'prog-145', chords: [as(CH.C, 'I'), as(CH.Am, 'vi', { voicing: [N.C4, N.E4, N.A4], fingers: ['1', '2', '5'] }), as(CH.F_C, 'IV'), as(CH.G_B, 'V')] },
      ],
    },
    {
      kind: 'concept', minutes: 14, graded: false,
      steps: [
        explain('新概念 1/5', '根音＋五度', `<p>最簡單、最穩的左手：<b>根音和五度輪流</b>。C 和弦就是 C–G–C–G，指法 <b>5-1-5-1</b>。</p>
          <p>小指彈根音要沉穩，拇指輕一點，讓低音有重心。</p>`,
        { keys: ROOT5.slice(0, 2).map((x) => [x.n, 'hint', String(x.f)]), demo: ROOT5.map((x) => x.n) }),
        explain('新概念 2/5', '分解和弦', `<p>把和弦一個一個彈出來：C–E–G–E，指法 <b>5-3-1-3</b>。比根音五度更流動，適合抒情歌。</p>`,
        { keys: BROKEN.slice(0, 3).map((x) => [x.n, 'hint', String(x.f)]), demo: BROKEN.map((x) => x.n) }),
        explain('新概念 3/5', '擴張：手張開到八度', `<p>C–G–C（八度）讓低音更寬厚。手要<b>擴張</b>：小指 C、食指 G、拇指高八度的 C，指法 <b>5-2-1</b>。</p>
          <p class="muted">手腕放鬆，不要硬撐；擴張後立刻讓手回到自然的形狀。</p>`,
        { keys: OCTAVE.slice(0, 3).map((x) => [x.n, 'hint', String(x.f)]), demo: OCTAVE.map((x) => x.n) }),
        explain('新概念 4/5', 'Alberti 低音', `<p>古典時期最有名的伴奏型：<b>低–高–中–高</b>，例如 C–G–E–G，指法 <b>5-1-3-1</b>。莫札特的奏鳴曲裡到處都是。</p>
          <p>換和弦時用轉位讓手幾乎不移動：C → Am/C → F/C → G/D，小指一直守在 C 附近。</p>`,
        { keys: ALB.C.slice(0, 3).map((x) => [x.n, 'hint', String(x.f)]), demo: timed([...ALB.C, ...ALB.Am, ...ALB.F, ...ALB.G]), bpm: 88 }),
        explain('新概念 5/5', '左手根音＋右手和弦', `<p>流行抒情與華爾滋常用：左手彈根音，右手補上和弦。這讓兩手各司其職：左手給低音和節奏，右手給和聲色彩。</p>`,
        { demo: play([withBass(as(CH.C, 'I'), N.C3), withBass(as(CH.F_C, 'IV'), N.F3), withBass(as(CH.G_B, 'V'), N.G3), withBass(as(CH.C, 'I'), N.C3)]) }),
      ],
    },
    {
      kind: 'practice', minutes: 15, graded: true,
      steps: [
        { type: 'melody', kicker: '練習 1：根音五度', title: 'C–G–C–G', hint: 'show', concept: 'accomp-patterns', instruction: '左手 5-1-5-1。', notes: [...ROOT5, ...ROOT5] },
        { type: 'melody', kicker: '練習 2：分解和弦與擴張', title: 'C–E–G–E → C–G–C–G', hint: 'show', concept: 'accomp-patterns', instruction: '先 5-3-1-3，再張開到八度 5-2-1-2。', notes: [...BROKEN, ...OCTAVE] },
        { type: 'melody', kicker: '練習 3：Alberti 換和弦', title: 'C → Am → F → G', hint: 'show', concept: 'alberti', instruction: '小指守在 C；彈 G 和弦時移到 D。', notes: [...ALB.C, ...ALB.Am, ...ALB.F, ...ALB.G] },
        { type: 'rhythm', kicker: '練習 4：Alberti 的節奏', title: '八分音符，平均流動', instruction: '每個音一樣長、一樣大聲。', pattern: timed([...ALB.C, ...ALB.C, ...ALB.G, ...ALB.G]), bpm: 66, clef: 'bass', concept: 'alberti' },
        { type: 'chords', progression: true, bass: true, kicker: '練習 5：左手根音＋右手和弦', title: 'I–IV–V–I', hint: 'show', concept: 'accomp-patterns', chords: [withBass(as(CH.C, 'I'), N.C3), withBass(as(CH.F_C, 'IV'), N.F3), withBass(as(CH.G_B, 'V'), N.G3), withBass(as(CH.C, 'I'), N.C3)] },
      ],
    },
    {
      kind: 'piece', minutes: 12, graded: true,
      celebrate: {
        title: '你彈完了一段完整的 Alberti 伴奏',
        body: '只用左手，就撐起了 I–vi–IV–V 的和聲與節奏。把旋律交給右手，這就是一首完整的鋼琴曲。',
        song: timed(ALBERTI_TUNE),
        bpm: 80,
      },
      steps: [
        explain('實際曲目', 'Alberti 伴奏曲', '<p>C → Am → F → G → C，每個和弦兩組 Alberti。先在等待模式把指法彈順，再跟著節拍器彈。</p>',
          { demo: timed(ALBERTI_TUNE), bpm: 80 }),
        { type: 'melody', kicker: '第 1 遍：等待模式', title: 'Alberti 伴奏曲', hint: 'show', concept: 'alberti', notes: ALBERTI_TUNE },
        { type: 'rhythm', kicker: '第 2 遍：跟節拍器', title: 'Alberti 伴奏曲（準時版）', pattern: timed(ALBERTI_TUNE), bpm: 72, clef: 'bass', concept: 'alberti' },
      ],
    },
    {
      kind: 'summary', minutes: 6, graded: true,
      steps: [
        explain('總結評分', '總結測驗', '<p>沒有提示。正確率達 70% 就能解鎖下一課。</p>'),
        { type: 'melody', kicker: '測驗 1：伴奏型與指法', title: '根音五度 → 分解和弦 → Alberti', hint: 'none', concept: 'accomp-patterns', notes: [...ROOT5, ...BROKEN, ...ALB.C] },
        { type: 'rhythm', kicker: '測驗 2：Alberti 節奏', title: 'C → F', pattern: timed([...ALB.C, ...ALB.C, ...ALB.F, ...ALB.F]), bpm: 66, clef: 'bass', concept: 'alberti' },
      ],
    },
  ],
};
