// 入門 第 6 課：第一個三和弦與左手低音
import { CH, N, as, explain, marks, play, shuffleDraw } from './kit.js';

// I–IV–V–I in one right-hand position (C, F/C, G/B), left hand plays the roots.
const I = as(CH.C, 'I');
const IV = as(CH.F_C, 'IV');
const V = as(CH.G_B, 'V');
const VI = as(CH.Am, 'vi', { voicing: [N.C4, N.E4, N.A4], fingers: ['1', '2', '5'] });
const withBass = (c, bass) => ({ ...c, voicing: [bass, ...c.voicing], fingers: ['5', ...c.fingers] });

export default {
  id: 'b6',
  track: 'beginner',
  num: 6,
  title: '第一個三和弦與左手低音',
  desc: 'C、F、G 三和弦，和弦指法，I–IV–V–I，左手根音',
  segments: [
    {
      kind: 'warmup', minutes: 5, graded: false,
      steps: [
        explain('暖身', '從旋律到和聲', '<p>到目前為止，你一次只彈一個音。今天開始<b>同時按好幾個音</b>：這就是和弦，也是伴奏的基礎。</p><p class="muted">沒有 MIDI 鍵盤時，可以同時按電腦鍵盤上的幾個字母，或用滑鼠在 1.5 秒內依序點完。</p>'),
        { type: 'melody', kicker: '暖身', title: 'C E G E C', hint: 'show', concept: 'finger-five', instruction: '1-3-5 指：等一下的和弦就是這三個音。', notes: [[N.C4, 1], [N.E4, 3], [N.G4, 5], [N.E4, 3], [N.C4, 1]].map(([n, f]) => ({ n, f })) },
      ],
    },
    {
      kind: 'concept', minutes: 12, graded: false,
      steps: [
        explain('新概念 1/4', '三和弦：隔一個音疊一個', `<p>從一個音開始，<b>隔一個白鍵</b>再加一個，再隔一個再加一個：C–E–G。最下面的音叫<b>根音</b>，和弦就以它命名。</p>
          <p>右手指法 <b>1-3-5</b>：拇指根音、中指三音、小指五音。</p>`,
        { keys: marks(CH.C), demo: play([CH.C], 3) }),
        { type: 'chords', kicker: '動手彈', title: '彈 C 和弦', hint: 'show', concept: 'triad-CFG', chords: [CH.C] },
        explain('新概念 2/4', 'F 和 G 和弦', `<p>同樣的疊法：<b>F–A–C</b> 是 F 和弦，<b>G–B–D</b> 是 G 和弦。</p>
          <p>C、F、G 是 C 大調最重要的三個和弦，分別叫 <b>I、IV、V</b>（一級、四級、五級）。</p>`,
        { keys: marks(CH.F), demo: play([CH.C, CH.F, CH.G, CH.C]) }),
        { type: 'chords', kicker: '動手彈', title: '彈 F 和 G', hint: 'show', concept: 'triad-CFG', chords: [CH.F, CH.G] },
        explain('新概念 3/4', '轉位：手不用跳', `<p>同一個和弦的音可以換順序。把 F 和弦彈成 <b>C–F–A</b>、G 和弦彈成 <b>B–D–G</b>，右手幾乎不用移動就能 C → F → G → C。</p>
          <p>指法：C（1-3-5）、F/C（1-4-5）、G/B（1-2-5）。這叫<b>聲部進行</b>：每個音只走最短的路。</p>`,
        { keys: marks(CH.F_C), demo: play([I, IV, V, I]) }),
        explain('新概念 4/4', '左手彈根音', `<p>左手小指彈和弦的<b>根音</b>（低八度的 C、F、G），右手彈和弦。低音讓和弦更穩、更飽滿。</p>
          <p class="callout">25 鍵剛好分成兩半：左手在低八度，右手在中央 C 附近。</p>`,
        { keys: marks(withBass(I, N.C3)), demo: play([withBass(I, N.C3), withBass(IV, N.F3), withBass(V, N.G3), withBass(I, N.C3)]) }),
      ],
    },
    {
      kind: 'practice', minutes: 15, graded: true,
      steps: [
        () => ({ type: 'chords', kicker: '練習 1：認和弦', instruction: '任何轉位都算對。', hint: 'show', concept: 'triad-CFG', chords: shuffleDraw([CH.C, CH.F, CH.G], 5) }),
        () => ({ type: 'chords', kicker: '練習 2：提示變慢', instruction: '5 秒後才出現建議按法。', hint: 'delay', concept: 'triad-CFG', chords: shuffleDraw([CH.C, CH.F, CH.G, CH.Am], 5) }),
        { type: 'chords', progression: true, kicker: '練習 3：和弦進行', title: 'I–IV–V–I', hint: 'show', concept: 'prog-145', instruction: '右手用轉位，手不離開位置。', chords: [I, IV, V, I] },
        { type: 'chords', progression: true, bass: true, kicker: '練習 4：加上左手', title: 'I–IV–V–I（左手根音）', hint: 'show', concept: 'prog-145', instruction: '左手根音在最低，右手和弦。', chords: [withBass(I, N.C3), withBass(IV, N.F3), withBass(V, N.G3), withBass(I, N.C3)] },
      ],
    },
    {
      kind: 'piece', minutes: 15, graded: true,
      celebrate: {
        title: '你彈完了第一段伴奏',
        body: 'I–vi–IV–V 是幾十年來無數流行歌的骨架。換個節奏、換首旋律，同一組和弦就能伴奏很多歌。',
        song: play([withBass(I, N.C3), withBass(VI, N.A3), withBass(IV, N.F3), withBass(V, N.G3)], 4),
        bpm: 90,
      },
      steps: [
        explain('實際曲目', '流行歌的骨架：I–vi–IV–V', `<p>加入 <b>Am（vi，六級小和弦）</b>：C → Am → F → G。這組進行出現在無數首流行歌裡。</p>
          <p>Am 是 A–C–E，和 C 和弦共用 C 和 E 兩個音，所以聽起來是「C 的柔和版」。</p>`,
        { keys: marks(CH.Am), demo: play([I, VI, IV, V], 4), bpm: 90 }),
        { type: 'chords', progression: true, kicker: '第 1 遍：有提示', title: 'C → Am → F → G', hint: 'show', concept: 'prog-145', chords: [I, VI, IV, V, I] },
        { type: 'chords', progression: true, bass: true, kicker: '第 2 遍：加左手、不看提示', title: 'C → Am → F → G', hint: 'none', concept: 'prog-145', chords: [withBass(I, N.C3), withBass(VI, N.A3), withBass(IV, N.F3), withBass(V, N.G3), withBass(I, N.C3)] },
      ],
    },
    {
      kind: 'summary', minutes: 5, graded: true,
      steps: [
        explain('總結評分', '總結測驗', '<p>沒有提示。正確率達 70% 就能解鎖進階路線的和弦課程。</p>'),
        () => ({ type: 'chords', kicker: '測驗 1：和弦', hint: 'none', concept: 'triad-CFG', chords: shuffleDraw([CH.C, CH.F, CH.G, CH.Am], 5) }),
        { type: 'chords', progression: true, kicker: '測驗 2：I–IV–V–I', title: 'I–IV–V–I', hint: 'none', concept: 'prog-145', chords: [I, IV, V, I] },
      ],
    },
  ],
};
