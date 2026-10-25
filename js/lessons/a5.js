// 進階 第 5 課：和聲功能與 ii–V–I
import { CH, SHELL, as, explain, marks, play, shuffleDraw } from './kit.js';

const T = (c, r) => as(c, r);

export default {
  id: 'a5',
  track: 'advanced',
  num: 5,
  title: '和聲功能與 ii–V–I',
  desc: '主、下屬、屬功能；I–IV–V–I；ii–V–I 與導音聲部進行',
  segments: [
    {
      kind: 'warmup', minutes: 5, graded: false,
      steps: [
        explain('暖身', '和弦有「角色」', '<p>同一調裡的和弦各有角色：有的讓人安定，有的製造期待，有的推你回家。認得角色，就能理解為什麼某些進行好聽，也能自己替旋律配和弦。</p>'),
        () => ({ type: 'chords', kicker: '暖身：七和弦', hint: 'delay', concept: 'chord-7th', chords: shuffleDraw([CH.Cmaj7, CH.G7, CH.Dm7], 3) }),
      ],
    },
    {
      kind: 'concept', minutes: 12, graded: false,
      steps: [
        explain('新概念 1/4', '三種功能', `<ul><li><b>主（T）</b>：I、vi、iii。安定、像家。</li>
          <li><b>下屬（S）</b>：IV、ii。離開家，帶點期待。</li>
          <li><b>屬（D）</b>：V、vii°。緊張，強烈想回到 I。</li></ul>
          <p class="callout">最基本的故事線：T → S → D → T。</p>`,
        { demo: play([CH.C, CH.F, CH.G7, CH.C]) }),
        explain('新概念 2/4', 'ii–V–I', `<p>把 IV 換成功能相同的 ii，再全部用七和弦：<b>Dm7 → G7 → Cmaj7</b>。這是爵士與流行裡最重要的和弦進行。</p>
          <p>根音每次往上跳四度（D→G→C），這種「四度圈」的移動非常有方向感。</p>`,
        { keys: marks(CH.Dm7), demo: play([CH.Dm7, CH.G7, CH.Cmaj7]) }),
        explain('新概念 3/4', '導音：七音往下走成三音', `<p>用殼式和聲彈 ii–V–I，右手只動一點點：</p>
          <ul><li>Dm7 的七音 <b>C</b> 往下半音 → G7 的三音 <b>B</b></li>
          <li>Dm7 的三音 <b>F</b> 不動 → 成為 G7 的七音</li>
          <li>G7 的七音 <b>F</b> 往下半音 → Cmaj7 的三音 <b>E</b>；B 不動成為 Cmaj7 的七音</li></ul>
          <p>這兩條線叫<b>導音線（guide tones）</b>，是和聲聽起來流暢的秘密。</p>`,
        { keys: marks(SHELL.Dm7), demo: play([SHELL.Dm7, SHELL.G7, SHELL.Cmaj7]) }),
        { type: 'chords', progression: true, bass: true, kicker: '動手彈', title: 'ii–V–I（殼式和聲）', hint: 'show', concept: 'prog-251', instruction: '左手根音，右手三音與七音；注意右手每次只動一根手指。', chords: [SHELL.Dm7, SHELL.G7, SHELL.Cmaj7] },
        explain('新概念 4/4', '用耳朵聽功能', '<p>接下來的練習會讓你在鍵盤上走過這些進行。彈的時候留意：屬和弦出現時的「想解決」，以及回到 I 的那一刻。</p>'),
      ],
    },
    {
      kind: 'practice', minutes: 15, graded: true,
      steps: [
        { type: 'chords', progression: true, kicker: '練習 1：T–S–D–T', title: 'I–IV–V7–I', hint: 'show', concept: 'prog-145', chords: [T(CH.C, 'I'), T(CH.F_C, 'IV'), T(CH.G7, 'V7'), T(CH.C, 'I')] },
        { type: 'chords', progression: true, kicker: '練習 2：換成 ii', title: 'I–ii–V7–I', hint: 'show', concept: 'prog-251', chords: [T(CH.Cmaj7, 'Imaj7'), T(CH.Dm7, 'ii7'), T(CH.G7, 'V7'), T(CH.Cmaj7, 'Imaj7')] },
        { type: 'chords', progression: true, bass: true, kicker: '練習 3：導音線', title: 'ii–V–I ×2', hint: 'delay', concept: 'prog-251', chords: [SHELL.Dm7, SHELL.G7, SHELL.Cmaj7, SHELL.Dm7, SHELL.G7, SHELL.Cmaj7] },
        {
          type: 'choice', kicker: '練習 4：聽功能', concept: 'prog-251',
          items: [
            { prompt: '這個和弦聽起來是安定（主）還是想解決（屬）？', play: play([CH.G7], 3), options: ['安定：主功能', '想解決：屬功能'], answer: 1, explain: 'G7 裡的三全音（B–F）製造了解決的需要。' },
            { prompt: '這個和弦聽起來是安定（主）還是想解決（屬）？', play: play([CH.Cmaj7], 3), options: ['安定：主功能', '想解決：屬功能'], answer: 0, explain: 'Cmaj7 是 I 級，就是「家」。' },
          ],
        },
      ],
    },
    {
      kind: 'piece', minutes: 12, graded: true,
      celebrate: {
        title: '你彈完了一段爵士式的 ii–V–I 練習曲',
        body: '在 C 和 F 兩個調各走一次 ii–V–I：同樣的手型平移，就是爵士樂手練習的方法。',
        song: play([SHELL.Dm7, SHELL.G7, SHELL.Cmaj7, SHELL.Fmaj7], 4),
        bpm: 84,
      },
      steps: [
        explain('實際曲目', '小小的 ii–V–I 練習曲', '<p>Dm7 → G7 → Cmaj7 → Fmaj7：解決到 Cmaj7 之後，再往四度走到 Fmaj7，製造「繼續往前」的感覺。</p>',
          { demo: play([SHELL.Dm7, SHELL.G7, SHELL.Cmaj7, SHELL.Fmaj7], 4), bpm: 84 }),
        { type: 'chords', progression: true, bass: true, kicker: '第 1 遍：有提示', title: 'Dm7 → G7 → Cmaj7 → Fmaj7', hint: 'show', concept: 'prog-251', chords: [SHELL.Dm7, SHELL.G7, SHELL.Cmaj7, SHELL.Fmaj7] },
        { type: 'chords', progression: true, bass: true, kicker: '第 2 遍：不看提示', title: 'Dm7 → G7 → Cmaj7 → Fmaj7', hint: 'none', concept: 'prog-251', chords: [SHELL.Dm7, SHELL.G7, SHELL.Cmaj7, SHELL.Fmaj7] },
      ],
    },
    {
      kind: 'summary', minutes: 6, graded: true,
      steps: [
        explain('總結評分', '總結測驗', '<p>沒有提示。正確率達 70% 就能解鎖下一課。</p>'),
        { type: 'chords', progression: true, bass: true, kicker: '測驗 1：ii–V–I', title: 'Dm7 → G7 → Cmaj7', hint: 'none', concept: 'prog-251', chords: [SHELL.Dm7, SHELL.G7, SHELL.Cmaj7] },
        { type: 'chords', progression: true, kicker: '測驗 2：I–IV–V7–I', title: 'I–IV–V7–I', hint: 'none', concept: 'prog-145', chords: [T(CH.C, 'I'), T(CH.F_C, 'IV'), T(CH.G7, 'V7'), T(CH.C, 'I')] },
      ],
    },
  ],
};
