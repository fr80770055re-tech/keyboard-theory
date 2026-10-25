// 進階 第 7 課：次屬和弦
import { CH, as, explain, marks, play, shuffleDraw } from './kit.js';

const V7V = as(CH.D7, 'V7/V');
const V7vi = as(CH.E7, 'V7/vi');
const V7ii = as(CH.A7, 'V7/ii');
const V7IV = as(CH.C7, 'V7/IV');

export default {
  id: 'a7',
  track: 'advanced',
  num: 7,
  title: '次屬和弦',
  desc: 'V7/V、V7/vi、V7/ii、V7/IV：暫時把別的和弦當成「家」',
  segments: [
    {
      kind: 'warmup', minutes: 5, graded: false,
      steps: [
        explain('暖身', '每個和弦都可以有自己的 V', '<p>G7 推向 C，因為 G7 是 C 的屬七和弦。同樣的道理，任何大或小和弦前面，都可以放一個「屬於它」的屬七和弦，讓它短暫地像家一樣。這就是<b>次屬和弦</b>。</p>'),
        { type: 'chords', progression: true, kicker: '暖身：V7–I', title: 'G7 → C', hint: 'delay', concept: 'chord-7th', chords: [as(CH.G7, 'V7'), as(CH.C, 'I')] },
      ],
    },
    {
      kind: 'concept', minutes: 12, graded: false,
      steps: [
        explain('新概念 1/3', 'V7/V：屬的屬', `<p>G 的屬七和弦是 <b>D7（D–F♯–A–C）</b>。在 C 大調裡寫成 <b>V7/V</b>，讀作「五級的五級」。</p>
          <p>F♯ 是調外音，它往上半音解決到 G，帶出強烈的方向感：D7 → G7 → C。</p>`,
        { keys: marks(V7V), demo: play([V7V, as(CH.G7, 'V7'), as(CH.C, 'I')]) }),
        explain('新概念 2/3', 'V7/vi 與 V7/ii', `<p><b>E7（E–G♯–B–D）→ Am</b>：G♯ 往上解決到 A，讓小和弦 Am 短暫成為主角，常帶出感傷的轉折。</p>
          <p><b>A7（A–C♯–E–G）→ Dm</b>：C♯ 解決到 D。爵士的「循環」常用 A7 → D7 → G7 → C 一路串下去。</p>`,
        { keys: marks(V7vi), demo: play([as(CH.C, 'I'), V7vi, as(CH.Am, 'vi')]) }),
        explain('新概念 3/3', '怎麼找：往上五度、改成屬七', `<ol><li>選一個目標和弦（例如 Dm）。</li><li>往上數五度找到它的屬音（D → A）。</li><li>在那個音上疊屬七和弦（A7）：大三和弦＋小七度。</li></ol>
          <p class="callout">辨認方法：看到調外的升記號（F♯、G♯、C♯），往上半音通常就是它要去的和弦根音。</p>`),
      ],
    },
    {
      kind: 'practice', minutes: 15, graded: true,
      steps: [
        () => ({ type: 'chords', kicker: '練習 1：次屬和弦', hint: 'show', concept: 'secdom', chords: shuffleDraw([V7V, V7vi, V7ii, V7IV], 4) }),
        { type: 'chords', progression: true, kicker: '練習 2：屬的屬', title: 'C → D7 → G7 → C', hint: 'show', concept: 'secdom', chords: [as(CH.C, 'I'), V7V, as(CH.G7, 'V7'), as(CH.C, 'I')] },
        { type: 'chords', progression: true, kicker: '練習 3：轉往小和弦', title: 'C → E7 → Am → A7 → Dm → G7 → C', hint: 'delay', concept: 'secdom', chords: [as(CH.C, 'I'), V7vi, as(CH.Am, 'vi'), V7ii, as(CH.Dm, 'ii'), as(CH.G7, 'V7'), as(CH.C, 'I')] },
        {
          type: 'choice', kicker: '練習 4：聽解決', concept: 'secdom',
          items: [
            { prompt: '這個屬七和弦想解決到哪裡？', play: play([V7vi], 3), options: ['Am（往上半音是 A）', 'F'], answer: 0, explain: 'E7 的 G♯ 想往上走到 A：它是 Am 的屬七和弦。' },
            { prompt: '這個屬七和弦想解決到哪裡？', play: play([V7V], 3), options: ['C', 'G（往上半音是 G）'], answer: 1, explain: 'D7 的 F♯ 想往上走到 G：它是 G 的屬七和弦。' },
          ],
        },
      ],
    },
    {
      kind: 'piece', minutes: 12, graded: true,
      celebrate: {
        title: '你彈完了一段循環和弦',
        body: 'C → A7 → Dm → D7 → G7 → C：每個次屬和弦都把耳朵推向下一個和弦，這就是爵士與老歌常見的「循環」。',
        song: play([as(CH.C, 'I'), V7ii, as(CH.Dm, 'ii'), V7V, as(CH.G7, 'V7'), as(CH.C, 'I')], 4),
        bpm: 84,
      },
      steps: [
        explain('實際曲目', '次屬和弦的循環', '<p>C → A7 → Dm → D7 → G7 → C。注意升記號一路往上解決：C♯→D、F♯→G、B→C。</p>',
          { demo: play([as(CH.C, 'I'), V7ii, as(CH.Dm, 'ii'), V7V, as(CH.G7, 'V7'), as(CH.C, 'I')], 4), bpm: 84 }),
        { type: 'chords', progression: true, kicker: '第 1 遍：有提示', title: '循環', hint: 'show', concept: 'secdom', chords: [as(CH.C, 'I'), V7ii, as(CH.Dm, 'ii'), V7V, as(CH.G7, 'V7'), as(CH.C, 'I')] },
        { type: 'chords', progression: true, kicker: '第 2 遍：不看提示', title: '循環', hint: 'none', concept: 'secdom', chords: [as(CH.C, 'I'), V7ii, as(CH.Dm, 'ii'), V7V, as(CH.G7, 'V7'), as(CH.C, 'I')] },
      ],
    },
    {
      kind: 'summary', minutes: 6, graded: true,
      steps: [
        explain('總結評分', '總結測驗', '<p>沒有提示。正確率達 70% 就能解鎖下一課。</p>'),
        () => ({ type: 'chords', kicker: '測驗：次屬和弦', hint: 'none', concept: 'secdom', chords: shuffleDraw([V7V, V7vi, V7ii, V7IV], 4) }),
      ],
    },
  ],
};
