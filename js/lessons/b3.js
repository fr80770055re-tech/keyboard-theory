// 入門 第 3 課：節奏與拍子
import { N, explain } from './kit.js';

// Rhythm patterns: d = beats, n: null = rest, omitted = any key.
const r = (...ds) => ds.map((d) => (typeof d === 'string' ? { d: Number(d.slice(1)), n: null } : { d }));
const fig = (pattern, label) => ({ notes: pattern.map((x) => ({ n: x.n === null ? null : 60, d: x.d })), clef: 'rhythm', label });

// 〈Hot Cross Buns〉 in time: the eighth notes finally get their real length.
const BUNS = [[N.E4, 1], [N.D4, 1], [N.C4, 2], [N.E4, 1], [N.D4, 1], [N.C4, 2],
  [N.C4, 0.5], [N.C4, 0.5], [N.C4, 0.5], [N.C4, 0.5], [N.D4, 0.5], [N.D4, 0.5], [N.D4, 0.5], [N.D4, 0.5],
  [N.E4, 1], [N.D4, 1], [N.C4, 2]].map(([n, d]) => ({ n, d }));
// 〈歡樂頌〉第一句，含附點節奏。
const ODE = [[N.E4, 1], [N.E4, 1], [N.F4, 1], [N.G4, 1], [N.G4, 1], [N.F4, 1], [N.E4, 1], [N.D4, 1],
  [N.C4, 1], [N.C4, 1], [N.D4, 1], [N.E4, 1], [N.E4, 1.5], [N.D4, 0.5], [N.D4, 2]].map(([n, d]) => ({ n, d }));

export default {
  id: 'b3',
  track: 'beginner',
  num: 3,
  title: '節奏與拍子',
  desc: '拍子與節拍器、四分／二分／全音符、休止符、八分音符與附點',
  segments: [
    {
      kind: 'warmup', minutes: 5, graded: false,
      steps: [
        explain('暖身', '音樂的心跳', `<p>到目前為止都是「等待模式」：彈對才往下走，不管快慢。真正的音樂有穩定的<b>拍子</b>，像心跳一樣。今天開始，系統會打節拍器，並判斷你彈得<b>早、準、還是晚</b>。</p>
          <p class="muted">用任何一個鍵都可以，重點是時間點。速度可以用滑桿調慢。</p>`),
        { type: 'rhythm', kicker: '暖身', title: '跟著節拍器彈四下', instruction: '聽完四下預備拍後，每一拍彈一下。', pattern: r(1, 1, 1, 1), bpm: 60, concept: 'rhythm-basic' },
      ],
    },
    {
      kind: 'concept', minutes: 12, graded: false,
      steps: [
        explain('新概念 1/5', '拍子與拍號', `<p><b>4/4 拍</b>表示每一小節有四拍，以四分音符為一拍。節拍器的「嗒」就是拍子，第一拍較重。</p>
          <p>小節線把音樂切成一段一段，方便閱讀。</p>`),
        explain('新概念 2/5', '四分、二分、全音符', `<p>音符的形狀告訴你它有多長：</p>
          <ul><li><b>四分音符</b>（實心＋符桿）：1 拍</li><li><b>二分音符</b>（空心＋符桿）：2 拍</li><li><b>全音符</b>（空心、沒有符桿）：4 拍</li></ul>
          <p class="callout">長音要<b>按住</b>，在心裡數拍子，數完才放。</p>`,
        { staff: fig(r(1, 1, 2, 4), '四分、四分、二分、全音符') }),
        { type: 'rhythm', kicker: '動手彈', title: '四分與二分', instruction: '嗒、嗒、嗒——（二分音符按住兩拍）。', pattern: r(1, 1, 2, 1, 1, 2), bpm: 66, concept: 'rhythm-basic' },
        explain('新概念 3/5', '休止符：安靜也是音樂', `<p><b>四分休止符</b>代表一拍不彈。休止時手停在鍵盤上方，心裡繼續數拍。</p>`,
        { staff: fig(r(1, 'r1', 1, 'r1'), '彈、休、彈、休') }),
        explain('新概念 4/5', '八分音符：一拍分兩半', `<p><b>八分音符</b>只有半拍，常常兩個連在一起（用符槓相連），剛好一拍。數法：「1 和 2 和」。</p>`,
        { staff: fig(r(0.5, 0.5, 1, 0.5, 0.5, 1), '八分、八分、四分') }),
        explain('新概念 5/5', '附點：再加一半', `<p>音符旁邊的<b>附點</b>讓長度多一半：附點四分音符 = 1.5 拍，常接一個八分音符（0.5 拍），合起來兩拍，「長——短」。</p>
          <p>〈歡樂頌〉每句結尾的「E. D」就是附點節奏。</p>`,
        { staff: fig(r(1.5, 0.5, 2), '附點四分、八分、二分') }),
      ],
    },
    {
      kind: 'practice', minutes: 15, graded: true,
      steps: [
        { type: 'rhythm', kicker: '練習 1：長短音', title: '四分、二分、全音符', pattern: r(1, 1, 2, 4), bpm: 66, concept: 'rhythm-basic' },
        { type: 'rhythm', kicker: '練習 2：休止符', title: '彈與休', instruction: '休止符那一拍不要彈。', pattern: r(1, 'r1', 1, 'r1', 1, 1, 2), bpm: 66, concept: 'rhythm-basic' },
        { type: 'rhythm', kicker: '練習 3：八分音符', title: '1 和 2 和', instruction: '兩個八分音符剛好佔一拍。', pattern: r(0.5, 0.5, 1, 0.5, 0.5, 1, 1, 1, 2), bpm: 60, concept: 'rhythm-eighth' },
        { type: 'rhythm', kicker: '練習 4：附點', title: '長——短', pattern: r(1.5, 0.5, 2, 1.5, 0.5, 2), bpm: 60, concept: 'rhythm-eighth' },
      ],
    },
    {
      kind: 'piece', minutes: 15, graded: true,
      celebrate: {
        title: '你第一次「準時」彈完了曲子',
        body: '同樣的旋律，加上正確的長短和穩定的拍子，聽起來就從「按對鍵」變成了「音樂」。',
        song: ODE,
        bpm: 84,
      },
      steps: [
        explain('實際曲目', '把學過的曲子彈「準」', '<p>先彈〈Hot Cross Buns〉：中間那串 C C C C D D D D 是八分音符，要快一倍。再彈〈歡樂頌〉第一句，注意結尾的附點。</p>',
          { demo: BUNS, bpm: 80 }),
        { type: 'rhythm', kicker: '第 1 首', title: 'Hot Cross Buns（準時版）', instruction: '右手 3-2-1 指放 E D C。', pattern: BUNS, bpm: 72, concept: 'rhythm-eighth', clef: 'treble' },
        { type: 'rhythm', kicker: '第 2 首', title: '歡樂頌（準時版）', instruction: '右手 C 位置。', pattern: ODE, bpm: 80, concept: 'rhythm-eighth', clef: 'treble' },
      ],
    },
    {
      kind: 'summary', minutes: 5, graded: true,
      steps: [
        explain('總結評分', '總結測驗', '<p>兩段節奏，各彈一次（第一次的成績會被計分，之後可以再練）。正確率達 70% 就能解鎖下一課。</p>'),
        { type: 'rhythm', kicker: '測驗 1', title: '綜合節奏', pattern: r(1, 1, 2, 'r1', 1, 2), bpm: 70, concept: 'rhythm-basic' },
        { type: 'rhythm', kicker: '測驗 2', title: '八分與附點', pattern: r(0.5, 0.5, 1, 1.5, 0.5, 4), bpm: 66, concept: 'rhythm-eighth' },
      ],
    },
  ],
};
