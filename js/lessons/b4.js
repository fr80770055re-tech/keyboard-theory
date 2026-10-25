// 入門 第 4 課：認識五線譜
import { N, explain, posFinger, shuffleDraw } from './kit.js';

const TREBLE = [N.C4, N.D4, N.E4, N.F4, N.G4, N.A4, N.B4, N.C5];
const BASS = [N.C3, N.D3, N.E3, N.F3, N.G3, N.A3, N.B3];
const RH = { [N.C4]: 1, [N.D4]: 2, [N.E4]: 3, [N.F4]: 4, [N.G4]: 5 };
const seq = (ns, fingers = RH) => ns.map((n) => ({ n, f: fingers[n] }));
const whole = (ns) => ns.map((n) => ({ n, d: 1 }));
const conceptOf = (n) => (n < N.C4 ? 'read-bass' : 'read-treble');

const ODE_1 = [[N.E4, 1], [N.E4, 1], [N.F4, 1], [N.G4, 1], [N.G4, 1], [N.F4, 1], [N.E4, 1], [N.D4, 1],
  [N.C4, 1], [N.C4, 1], [N.D4, 1], [N.E4, 1], [N.E4, 1.5], [N.D4, 0.5], [N.D4, 2]].map(([n, d]) => ({ n, d, f: RH[n] }));

export default {
  id: 'b4',
  track: 'beginner',
  num: 4,
  title: '認識五線譜',
  desc: '高音譜號與低音譜號、線與間、中央 C、看譜彈奏（琴鍵提示逐步關閉）',
  segments: [
    {
      kind: 'warmup', minutes: 5, graded: false,
      steps: [
        explain('暖身', '從音名到樂譜', '<p>目前你靠音名（C D E）和琴鍵提示彈奏。<b>五線譜</b>把「哪個音」和「多長」畫在同一張圖上，是全世界通用的語言。學會之後，就能自己讀新的曲子。</p>'),
        { type: 'melody', kicker: '暖身', title: 'C D E F G', hint: 'show', concept: 'finger-five', notes: seq([N.C4, N.D4, N.E4, N.F4, N.G4, N.F4, N.E4, N.D4, N.C4]) },
      ],
    },
    {
      kind: 'concept', minutes: 14, graded: false,
      steps: [
        explain('新概念 1/5', '五線四間', `<p>五線譜有<b>五條線、四個間</b>，由下往上數：第一線、第二線……。音符的位置越高，聲音越高；每往上一格（線→間→線），就是下一個白鍵。</p>`,
        { staff: { notes: whole(TREBLE), clef: 'treble', label: 'C 到 C 的音階在高音譜號上' }, demo: TREBLE }),
        explain('新概念 2/5', '高音譜號與中央 C', `<p>開頭的<b>高音譜號</b>（又叫 G 譜號）的圓圈繞著第二線：那條線就是 <b>G</b>（中央 C 右邊的 G）。</p>
          <p><b>中央 C</b> 在五線下方，要多畫一條短短的<b>加線</b>：下加一線。</p>`,
        { staff: { notes: whole([N.C4, N.G4]), clef: 'treble', label: '中央 C 與 G' }, keys: [[N.C4, 'hint', 'C'], [N.G4, 'hint', 'G']], demo: [N.C4, N.G4] }),
        explain('新概念 3/5', '線與間的口訣', `<ul><li>高音譜號的<b>線</b>（由下往上）：E、G、B、D、F</li><li>高音譜號的<b>間</b>：F、A、C、E，剛好拼成英文字 <b>FACE</b>（臉）</li></ul>
          <p class="muted">口訣只是起點。多讀幾次，眼睛會直接認出位置，就像認字一樣。</p>`,
        { staff: { notes: whole([N.E4, N.G4, N.B4, N.F4, N.A4, N.C5]), clef: 'treble', label: '線上的 E G B，間裡的 F A C' } }),
        explain('新概念 4/5', '低音譜號：左手的譜', `<p><b>低音譜號</b>（F 譜號）的兩個點夾著第四線：那條線是 <b>F</b>（低八度的 F）。左手的音多半寫在這裡。</p>
          <ul><li>低音譜號的線：G、B、D、F、A</li><li>低音譜號的間：A、C、E、G</li></ul>
          <p>中央 C 在低音譜號的<b>上加一線</b>。</p>`,
        { staff: { notes: whole(BASS), clef: 'bass', label: '低八度的 C 到 B 在低音譜號上' }, demo: BASS }),
        explain('新概念 5/5', '大譜表', `<p>鋼琴譜通常把兩個譜表疊在一起：上面高音譜號給右手，下面低音譜號給左手，這叫<b>大譜表</b>。中央 C 剛好在兩個譜表的正中間。</p>`,
        { staff: [{ notes: whole([N.C4, N.E4, N.G4, N.C5]), clef: 'treble', label: '大譜表上半：右手' }, { notes: whole([N.C3, N.E3, N.G3, N.C4]), clef: 'bass', label: '大譜表下半：左手' }] }),
      ],
    },
    {
      kind: 'practice', minutes: 16, graded: true,
      steps: [
        () => ({ type: 'find', finger: posFinger, staff: true, clef: 'treble', match: 'exact', kicker: '練習 1：讀高音譜號（有提示）', instruction: '看譜上的音，在鍵盤上找出來。這次琴鍵會亮，上面的數字是建議指法：右手 C 到 G 用 C 位置（1–5），A、B、C 換到 G 位置（2、3、4）。', targets: shuffleDraw(TREBLE.slice(0, 5), 6), hint: 'show', concept: conceptOf }),
        () => ({ type: 'find', finger: posFinger, staff: true, clef: 'treble', match: 'exact', kicker: '練習 2：提示變慢', instruction: '4 秒後才亮。先試著自己讀。', targets: shuffleDraw(TREBLE, 8), hint: 'delay', concept: conceptOf }),
        () => ({ type: 'find', finger: posFinger, staff: true, clef: 'bass', match: 'exact', kicker: '練習 3：讀低音譜號', instruction: '左手的音域：低八度的 C 到 B。左手 C 到 G 用 C 位置（5–1）；A、B 把手移到中央 C 位置（3、2 指）。', targets: shuffleDraw(BASS, 6), hint: 'delay', concept: conceptOf }),
        { type: 'melody', staff: true, clef: 'treble', hideNames: true, kicker: '練習 4：看譜彈旋律', title: '只看譜', hint: 'show', concept: 'read-treble', instruction: '這次沒有音名，只有五線譜和琴鍵提示。', notes: seq([N.C4, N.E4, N.D4, N.F4, N.E4, N.G4, N.E4, N.C4]) },
      ],
    },
    {
      kind: 'piece', minutes: 12, graded: true,
      celebrate: {
        title: '你第一次看譜彈完了一句曲子',
        body: '這一次沒有音名，只靠五線譜。從現在起，你可以自己讀簡單的樂譜了。',
        song: ODE_1.map(({ n, d }) => ({ n, d })),
        bpm: 96,
      },
      steps: [
        explain('實際曲目', '看譜彈〈歡樂頌〉', '<p>同一首曲子，這次只看譜。注意每個音在線上還是間裡，以及最後的附點節奏。</p>',
          { staff: { notes: ODE_1.map(({ n, d }) => ({ n, d })), clef: 'treble', time: '4/4', label: '歡樂頌第一句' }, demo: ODE_1.map(({ n, d }) => ({ n, d })), bpm: 96 }),
        { type: 'melody', staff: true, clef: 'treble', hideNames: true, kicker: '第 1 遍：有琴鍵提示', title: '歡樂頌', hint: 'show', concept: 'read-treble', notes: ODE_1, bpm: 96 },
        { type: 'melody', staff: true, clef: 'treble', hideNames: true, kicker: '第 2 遍：只看譜', title: '歡樂頌', hint: 'none', concept: 'read-treble', notes: ODE_1, bpm: 96 },
      ],
    },
    {
      kind: 'summary', minutes: 5, graded: true,
      steps: [
        explain('總結評分', '總結測驗', '<p>只看譜，沒有任何提示。正確率達 70% 就能解鎖下一課。</p>'),
        () => ({ type: 'find', finger: posFinger, staff: true, clef: 'treble', match: 'exact', kicker: '測驗 1：高音譜號', targets: shuffleDraw(TREBLE, 5), hint: 'none', concept: conceptOf }),
        () => ({ type: 'find', finger: posFinger, staff: true, clef: 'bass', match: 'exact', kicker: '測驗 2：低音譜號', targets: shuffleDraw(BASS, 4), hint: 'none', concept: conceptOf }),
      ],
    },
  ],
};
