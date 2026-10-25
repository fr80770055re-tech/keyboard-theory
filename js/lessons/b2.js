// 入門 第 2 課：五指位置與運指基礎
import { N, explain, posFinger, shuffleDraw } from './kit.js';

const RH = { [N.C4]: 1, [N.D4]: 2, [N.E4]: 3, [N.F4]: 4, [N.G4]: 5 };
const LH = { [N.C3]: 5, [N.D3]: 4, [N.E3]: 3, [N.F3]: 2, [N.G3]: 1 };
const rh = (...ns) => ns.map((n) => ({ n, f: RH[n] }));
const lh = (...ns) => ns.map((n) => ({ n, f: LH[n] }));
const conceptOf = (n) => ({ 5: 'note-F', 7: 'note-G', 0: 'note-C', 2: 'note-D', 4: 'note-E' })[n % 12];

// 〈歡樂頌〉主題（貝多芬，公版），全部在右手 C 位置：E E F G G F E D C C D E E D D
const ODE_1 = [
  [N.E4, 1], [N.E4, 1], [N.F4, 1], [N.G4, 1], [N.G4, 1], [N.F4, 1], [N.E4, 1], [N.D4, 1],
  [N.C4, 1], [N.C4, 1], [N.D4, 1], [N.E4, 1], [N.E4, 1.5], [N.D4, 0.5], [N.D4, 2],
].map(([n, d]) => ({ n, d, f: RH[n] }));
const ODE_2 = [
  [N.E4, 1], [N.E4, 1], [N.F4, 1], [N.G4, 1], [N.G4, 1], [N.F4, 1], [N.E4, 1], [N.D4, 1],
  [N.C4, 1], [N.C4, 1], [N.D4, 1], [N.E4, 1], [N.D4, 1.5], [N.C4, 0.5], [N.C4, 2],
].map(([n, d]) => ({ n, d, f: RH[n] }));

const handMarks = (map, kind = 'hint') => Object.entries(map).map(([n, f]) => [Number(n), kind, String(f)]);

export default {
  id: 'b2',
  track: 'beginner',
  num: 2,
  title: '五指位置與運指基礎',
  desc: 'C 位置五指、F 和 G、手指獨立、〈歡樂頌〉',
  segments: [
    {
      kind: 'warmup', minutes: 5, graded: false,
      steps: [
        explain('暖身', '先把手放鬆', `<p>甩一甩手腕，肩膀放下。手指微彎，像輕輕握著一顆橘子，指尖立起來觸鍵。</p>
          <p>今天要學的是<b>運指</b>：哪根手指彈哪個鍵。好的運指讓你彈得穩、彈得快，也比較不累。</p>`),
        { type: 'melody', kicker: '暖身', title: 'C D E D C', hint: 'show', concept: 'finger-123', instruction: '先用上一課的 1-2-3 指暖暖手。', notes: rh(N.C4, N.D4, N.E4, N.D4, N.C4) },
      ],
    },
    {
      kind: 'concept', minutes: 12, graded: false,
      steps: [
        explain('新概念 1/4', 'F 和 G', `<p>E 右邊是 <b>F</b>，它在「三個一組」黑鍵的左邊；F 右邊是 <b>G</b>。</p>
          <p>到這裡，C D E F G 五個白鍵，正好一隻手五根手指。</p>`,
        { keys: [[N.F4, 'hint', 'F'], [N.G4, 'hint', 'G']], demo: [N.C4, N.D4, N.E4, N.F4, N.G4], labels: 'all' }),
        { type: 'find', mode: 'all', pitchClass: 5, kicker: '動手找', prompt: '找出所有的 F', tip: 'F 在三個黑鍵那組的左邊。', concept: 'note-F' },
        { type: 'find', mode: 'all', pitchClass: 7, kicker: '動手找', prompt: '找出所有的 G', tip: 'G 在 F 的右邊，三個黑鍵的第一、二個之間。', concept: 'note-G' },
        explain('新概念 2/4', '右手 C 位置', `<p>右手 <b>1 指（拇指）放中央 C</b>，2、3、4、5 指依序放在 D、E、F、G。這叫 <b>C 位置</b>。</p>
          <ul><li>一根手指只負責一個鍵，手不需要移動。</li><li>拇指用側邊觸鍵，其他手指用指尖。</li><li>沒在彈的手指輕放在鍵上，不要翹起來。</li></ul>`,
        { keys: handMarks(RH), demo: [N.C4, N.D4, N.E4, N.F4, N.G4, N.F4, N.E4, N.D4, N.C4] }),
        explain('新概念 3/4', '左手 C 位置', `<p>左手是鏡像：<b>5 指（小指）放低八度的 C</b>，4、3、2、1 指放在 D、E、F、G。</p>
          <p class="callout">左右手的手指編號相同：拇指都是 1。所以左手往右彈時，指號是 5→4→3→2→1。</p>`,
        { keys: handMarks(LH), demo: [N.C3, N.D3, N.E3, N.F3, N.G3] }),
        explain('新概念 4/4', '手指獨立', `<p>4 指和 5 指天生比較弱，也容易「黏」在一起。跳著彈（1-3、2-4、3-5）能練習每根手指獨立出力。</p>
          <p class="muted">慢慢來：每個音都要清楚、音量平均，比快更重要。</p>`),
      ],
    },
    {
      kind: 'practice', minutes: 15, graded: true,
      steps: [
        () => ({ type: 'find', finger: posFinger, kicker: '練習 1：找 F 和 G', instruction: '任何八度都可以。', targets: shuffleDraw([N.F3, N.G3, N.F4, N.G4, N.C4, N.E4], 6), hint: 'delay', concept: conceptOf }),
        { type: 'melody', kicker: '練習 2：右手五指', title: '上行、下行', hint: 'show', concept: 'finger-five', instruction: '1-2-3-4-5-4-3-2-1，一指一鍵。', notes: rh(N.C4, N.D4, N.E4, N.F4, N.G4, N.F4, N.E4, N.D4, N.C4) },
        { type: 'melody', kicker: '練習 3：手指獨立', title: '三度跳進', hint: 'show', concept: 'finger-five', instruction: '1-3、2-4、3-5，再走回來。', notes: rh(N.C4, N.E4, N.D4, N.F4, N.E4, N.G4, N.F4, N.D4, N.E4, N.C4) },
        { type: 'melody', kicker: '練習 4：左手五指', title: '左手上行、下行', hint: 'show', concept: 'finger-lh', instruction: '左手小指放低八度的 C：5-4-3-2-1-2-3-4-5。', notes: lh(N.C3, N.D3, N.E3, N.F3, N.G3, N.F3, N.E3, N.D3, N.C3) },
        () => ({ type: 'listen', finger: posFinger, kicker: '練習 5：聽→彈', items: shuffleDraw([N.C4, N.D4, N.E4, N.F4, N.G4], 5), candidates: [N.C4, N.D4, N.E4, N.F4, N.G4], instruction: '答案在右手 C 位置的五個音之中。', concept: 'ear-CG' }),
      ],
    },
    {
      kind: 'piece', minutes: 15, graded: true,
      celebrate: {
        title: '你彈完了〈歡樂頌〉',
        body: '貝多芬第九號交響曲裡最有名的旋律，整首都在右手 C 位置，一個音都不用移手。',
        song: [...ODE_1, ...ODE_2].map(({ n, d }) => ({ n, d })),
        bpm: 100,
      },
      steps: [
        explain('實際曲目', '〈歡樂頌〉主題（貝多芬）', `<p>全曲只用 C 到 G 五個音。注意每一句的最後：「E. D D」和「D. C C」有一個附點節奏。</p>
          <p>先聽兩遍示範，再照指號彈。</p>`,
        { keys: handMarks(RH), demo: [...ODE_1, ...ODE_2].map(({ n, d }) => ({ n, d })), bpm: 100 }),
        { type: 'melody', kicker: '第 1 句：有提示', title: '歡樂頌（上）', hint: 'show', concept: 'finger-five', notes: ODE_1, bpm: 100 },
        { type: 'melody', kicker: '第 2 句：有提示', title: '歡樂頌（下）', hint: 'show', concept: 'finger-five', notes: ODE_2, bpm: 100 },
        { type: 'melody', kicker: '整首：不看提示', title: '歡樂頌', hint: 'none', concept: 'finger-five', notes: [...ODE_1, ...ODE_2], bpm: 100 },
      ],
    },
    {
      kind: 'summary', minutes: 5, graded: true,
      steps: [
        explain('總結評分', '總結測驗', '<p>沒有提示。正確率達 70% 就能解鎖下一課；這一課的星等會綜合引導練習、曲目和這個測驗的表現。</p>'),
        () => ({ type: 'find', finger: posFinger, kicker: '測驗 1：找音', instruction: '任何八度都可以。', targets: shuffleDraw([N.F3, N.G3, N.F4, N.G4, N.D4, N.E4], 5), hint: 'none', concept: conceptOf }),
        { type: 'melody', kicker: '測驗 2：運指', title: 'C E D F E G', hint: 'none', concept: 'finger-five', instruction: '右手 C 位置，看指號彈。', notes: rh(N.C4, N.E4, N.D4, N.F4, N.E4, N.G4, N.E4, N.C4) },
      ],
    },
  ],
};
