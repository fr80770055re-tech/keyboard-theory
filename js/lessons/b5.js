// 入門 第 5 課：C 大調音階與穿指
import { N, explain } from './kit.js';

const seq = (pairs) => pairs.map(([n, f, d]) => ({ n, f, ...(d ? { d } : {}) }));

// Right hand: 1 2 3 | thumb under | 1 2 3 4 5 — and back with 3 crossing over.
const RH_UP = seq([[N.C4, 1], [N.D4, 2], [N.E4, 3], [N.F4, 1], [N.G4, 2], [N.A4, 3], [N.B4, 4], [N.C5, 5]]);
const RH_DOWN = seq([[N.C5, 5], [N.B4, 4], [N.A4, 3], [N.G4, 2], [N.F4, 1], [N.E4, 3], [N.D4, 2], [N.C4, 1]]);
// Left hand: 5 4 3 2 1 | 3 crosses over | 2 1 — and back with the thumb under.
const LH_UP = seq([[N.C3, 5], [N.D3, 4], [N.E3, 3], [N.F3, 2], [N.G3, 1], [N.A3, 3], [N.B3, 2], [N.C4, 1]]);
const LH_DOWN = seq([[N.C4, 1], [N.B3, 2], [N.A3, 3], [N.G3, 1], [N.F3, 2], [N.E3, 3], [N.D3, 4], [N.C3, 5]]);

// 〈普世歡騰〉開頭（Joy to the World，公版）：一個完整的下行音階。
const JOY = seq([[N.C5, 5, 1.5], [N.B4, 4, 0.5], [N.A4, 3, 1], [N.G4, 2, 1.5], [N.F4, 1, 0.5], [N.E4, 3, 1], [N.D4, 2, 1], [N.C4, 1, 2]]);

export default {
  id: 'b5',
  track: 'beginner',
  num: 5,
  title: 'C 大調音階與穿指',
  desc: '八個音的音階、拇指穿越、跨指，左右手指法',
  segments: [
    {
      kind: 'warmup', minutes: 5, graded: false,
      steps: [
        explain('暖身', '五指位置不夠用了', `<p>C 位置只有五個音，但音階有八個音（C D E F G A B C）。手指不夠時，就要靠<b>穿指</b>和<b>跨指</b>把手移到新位置，而且聲音不能斷。</p>`),
        { type: 'melody', kicker: '暖身', title: '右手五指', hint: 'show', concept: 'finger-five', notes: seq([[N.C4, 1], [N.D4, 2], [N.E4, 3], [N.F4, 4], [N.G4, 5], [N.F4, 4], [N.E4, 3], [N.D4, 2], [N.C4, 1]]) },
      ],
    },
    {
      kind: 'concept', minutes: 12, graded: false,
      steps: [
        explain('新概念 1/4', '音階：全音與半音', `<p>C 大調音階是從 C 到上一個 C 的八個白鍵。相鄰兩音大多隔一個黑鍵（<b>全音</b>），只有 E–F 和 B–C 之間沒有黑鍵（<b>半音</b>）。</p>
          <p class="callout">全 全 半 全 全 全 半：這個排列決定了「大調」的明亮聲音。</p>`,
        { keys: [[N.E4, 'soft'], [N.F4, 'soft'], [N.B4, 'soft'], [N.C5, 'soft']], demo: RH_UP.map((x) => x.n), labels: 'all' }),
        explain('新概念 2/4', '右手上行：拇指穿過去', `<p>右手 1-2-3 彈 C D E，然後<b>拇指從 3 指底下穿過去</b>彈 F，接著 2-3-4-5 彈 G A B C。</p>
          <ul><li>3 指彈 E 時，拇指就要開始往裡收、移向 F。</li><li>手腕保持水平，不要往上翻。</li></ul>`,
        { keys: RH_UP.map((x) => [x.n, 'hint', String(x.f)]), demo: RH_UP.map((x) => x.n) }),
        explain('新概念 3/4', '右手下行：3 指跨過來', `<p>下行時 5-4-3-2-1 彈 C B A G F，然後<b>3 指從拇指上方跨過去</b>彈 E，再 2-1 彈 D C。</p>
          <p>穿指和跨指是同一個動作的往返：手的位置在 F 和 E 之間換班。</p>`,
        { keys: RH_DOWN.map((x) => [x.n, 'hint', String(x.f)]), demo: RH_DOWN.map((x) => x.n) }),
        explain('新概念 4/4', '左手：方向相反', `<p>左手上行 5-4-3-2-1 彈 C D E F G，接著 <b>3 指跨過拇指</b>彈 A，2-1 彈 B C。下行時拇指從底下穿過去。</p>
          <p class="muted">規則一樣：換位置的地方，永遠是拇指和 3 指（或 4 指）交接。</p>`,
        { keys: LH_UP.map((x) => [x.n, 'hint', String(x.f)]), demo: LH_UP.map((x) => x.n) }),
      ],
    },
    {
      kind: 'practice', minutes: 15, graded: true,
      steps: [
        { type: 'melody', kicker: '練習 1：穿指的關鍵三音', title: 'D E F E D', hint: 'show', concept: 'thumb-under', instruction: '2-3-拇指穿過-3-2：只練換位置的那一下。', notes: seq([[N.D4, 2], [N.E4, 3], [N.F4, 1], [N.E4, 3], [N.D4, 2]]) },
        { type: 'melody', kicker: '練習 2：右手上行', title: 'C 大調音階 ↑', hint: 'show', concept: 'thumb-under', notes: RH_UP },
        { type: 'melody', kicker: '練習 3：右手下行', title: 'C 大調音階 ↓', hint: 'show', concept: 'thumb-under', notes: RH_DOWN },
        { type: 'melody', kicker: '練習 4：左手上行', title: '左手音階 ↑', hint: 'show', concept: 'thumb-under', notes: LH_UP },
        { type: 'melody', kicker: '練習 5：左手下行', title: '左手音階 ↓', hint: 'show', concept: 'thumb-under', notes: LH_DOWN },
      ],
    },
    {
      kind: 'piece', minutes: 12, graded: true,
      celebrate: {
        title: '你彈完了〈普世歡騰〉的開頭',
        body: '這句旋律其實就是一個完整的 C 大調下行音階：從 C 一路走到 C，中間靠 3 指跨過拇指換位置。',
        song: JOY.map(({ n, d }) => ({ n, d })),
        bpm: 88,
      },
      steps: [
        explain('實際曲目', '〈普世歡騰〉（Joy to the World）', '<p>聽聽看：這首耶誕名曲的第一句就是下行音階。右手 5 指放高八度的 C，彈到 F 之後，3 指跨過拇指彈 E。</p>',
          { keys: JOY.map((x) => [x.n, 'hint', String(x.f)]), demo: JOY.map(({ n, d }) => ({ n, d })), bpm: 88 }),
        { type: 'melody', kicker: '第 1 遍：有提示', title: '普世歡騰', hint: 'show', concept: 'thumb-under', notes: JOY, bpm: 88 },
        { type: 'melody', kicker: '第 2 遍：不看提示', title: '普世歡騰', hint: 'none', concept: 'thumb-under', notes: JOY, bpm: 88 },
      ],
    },
    {
      kind: 'summary', minutes: 6, graded: true,
      steps: [
        explain('總結評分', '總結測驗', '<p>沒有提示，彈一次完整的上行與下行音階。正確率達 70% 就能解鎖下一課。</p>'),
        { type: 'melody', kicker: '測驗：右手上下行', title: 'C 大調音階 ↑↓', hint: 'none', concept: 'thumb-under', notes: [...RH_UP, ...RH_DOWN.slice(1)] },
        { type: 'melody', kicker: '測驗：左手上行', title: '左手音階 ↑', hint: 'none', concept: 'thumb-under', notes: LH_UP },
      ],
    },
  ],
};
