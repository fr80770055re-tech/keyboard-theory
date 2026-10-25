// 進階 第 6 課：借用和弦（調式互換）
import { CH, as, explain, marks, play, shuffleDraw } from './kit.js';
import { BORROWED_EAR } from './concepts.js';

const I = as(CH.C, 'I');
const IV = as(CH.F_C, 'IV');
const iv = as(CH.Fm, 'iv', { voicing: [CH.Fm.voicing[2], CH.Fm.voicing[0] + 12, CH.Fm.voicing[1] + 12], fingers: ['1', '4', '5'] }); // C–F–A♭, same hand shape as F/C
const bVI = as(CH.Ab, '♭VI');
const bVII = as(CH.Bb, '♭VII');
const bIII = as(CH.Eb, '♭III');
const V = as(CH.G_B, 'V');

export default {
  id: 'a6',
  track: 'advanced',
  num: 6,
  title: '借用和弦（調式互換）',
  desc: '從同主音小調借和弦：iv、♭VI、♭VII、♭III 的色彩與用法',
  segments: [
    {
      kind: 'warmup', minutes: 5, graded: false,
      steps: [
        explain('暖身', '大調裡的一點陰影', '<p>有些流行歌在大調裡突然出現一個「有點憂傷」或「特別壯闊」的和弦，那常常是<b>借用和弦</b>：從同一個主音的小調借來的。</p>'),
        { type: 'chords', progression: true, kicker: '暖身：I–IV–V–I', title: 'I–IV–V–I', hint: 'delay', concept: 'prog-145', chords: [I, IV, V, I] },
      ],
    },
    {
      kind: 'concept', minutes: 12, graded: false,
      steps: [
        explain('新概念 1/4', '同主音大調與小調', `<p><b>C 大調</b>和 <b>C 小調</b>共用主音 C，但 C 小調有三個降音：<b>E♭、A♭、B♭</b>。</p>
          <p>把 C 小調裡的和弦「借」到 C 大調來用，就叫<b>調式互換（modal interchange）</b>。主音不變，所以聽起來仍在 C 調，只是換了光線。</p>`),
        explain('新概念 2/4', 'iv：小四級', `<p>把 F 和弦的 A 降半音成 <b>A♭</b>，就得到 <b>Fm</b>。最經典的用法是 <b>IV → iv → I</b>：F → Fm → C。</p>
          <p>A → A♭ → G 的半音下行，帶出懷舊、溫柔的感覺。右手用 C–F–A♭，和 F/C 同一個手型，只動一根手指。</p>`,
        { keys: marks(iv), demo: play([I, IV, iv, I]) }),
        { type: 'chords', progression: true, kicker: '動手彈', title: 'I–IV–iv–I', hint: 'show', concept: 'borrowed', instruction: '從 F 到 Fm，只有 4 指從 A 移到 A♭。', chords: [I, IV, iv, I] },
        explain('新概念 3/4', '♭VI 與 ♭VII', `<p><b>A♭（♭VI）</b>和 <b>B♭（♭VII）</b>也來自 C 小調。<b>I → ♭VI → ♭VII → I</b> 有一種英雄式、明亮又意外的感覺，電影和電玩配樂很常用。</p>
          <p>♭VII → I 也是搖滾樂常見的終止，比 V → I 更「鬆」一些。</p>`,
        { keys: marks(bVI), demo: play([I, bVI, bVII, I]) }),
        explain('新概念 4/4', '♭III 與使用原則', `<p><b>E♭（♭III）</b>也能借用，常接在 I 後面製造突然的轉暗。</p>
          <ul><li>借用和弦通常短暫出現，再回到原調。</li><li>旋律若有 A、E、B 這些「大調音」，要注意和借來的 A♭、E♭、B♭ 衝突。</li><li>最安全的位置：在回到 I 之前。</li></ul>`,
        { keys: marks(bIII), demo: play([I, bIII, IV, I]) }),
      ],
    },
    {
      kind: 'practice', minutes: 15, graded: true,
      steps: [
        () => ({ type: 'chords', kicker: '練習 1：借用和弦', hint: 'show', concept: 'borrowed', chords: shuffleDraw([iv, bVI, bVII, bIII], 4) }),
        { type: 'chords', progression: true, kicker: '練習 2：英雄式終止', title: 'I–♭VI–♭VII–I', hint: 'show', concept: 'borrowed', chords: [I, bVI, bVII, I] },
        { type: 'chords', progression: true, kicker: '練習 3：小四級', title: 'I–IV–iv–I', hint: 'delay', concept: 'borrowed', chords: [I, IV, iv, I] },
        () => ({ type: 'choice', kicker: '練習 4：聽出借用', concept: 'borrowed-ear', items: shuffleDraw(BORROWED_EAR, 3) }),
      ],
    },
    {
      kind: 'piece', minutes: 12, graded: true,
      celebrate: {
        title: '你彈完了一段借用和弦的小品',
        body: 'C → E♭ → F → Fm → C → A♭ → B♭ → C：同一首曲子裡，大調的明亮和小調的陰影交替出現。',
        song: play([I, bIII, IV, iv, I, bVI, bVII, I], 4),
        bpm: 84,
      },
      steps: [
        explain('實際曲目', '光與影：借用和弦小品', '<p>C → E♭ → F → Fm → C → A♭ → B♭ → C。前半段用 ♭III 和 iv 帶出陰影，後半段用 ♭VI–♭VII 的英雄式終止回家。</p>',
          { demo: play([I, bIII, IV, iv, I, bVI, bVII, I], 4), bpm: 84 }),
        { type: 'chords', progression: true, kicker: '第 1 遍：有提示', title: '光與影', hint: 'show', concept: 'borrowed', chords: [I, bIII, IV, iv, I, bVI, bVII, I] },
        { type: 'chords', progression: true, kicker: '第 2 遍：不看提示', title: '光與影', hint: 'none', concept: 'borrowed', chords: [I, bIII, IV, iv, I, bVI, bVII, I] },
      ],
    },
    {
      kind: 'summary', minutes: 6, graded: true,
      steps: [
        explain('總結評分', '總結測驗', '<p>沒有提示。正確率達 70% 就能解鎖下一課。</p>'),
        () => ({ type: 'chords', kicker: '測驗 1：彈出借用和弦', hint: 'none', concept: 'borrowed', chords: shuffleDraw([iv, bVI, bVII, bIII], 4) }),
        () => ({ type: 'choice', kicker: '測驗 2：聽出借用', concept: 'borrowed-ear', items: shuffleDraw(BORROWED_EAR, 2) }),
      ],
    },
  ],
};
