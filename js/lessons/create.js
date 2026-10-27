// Making music, not only reading it (Orff, Dalcroze; the 創作 strand of the
// curriculum): after a lesson's piece, the learner improvises over a backing
// loop or composes a short tune from the notes just learnt. Neither is graded.
// addCreative() appends these steps to the end of each lesson's piece segment.

// Backing chords, voiced inside C3–C5.
const C = [48, 52, 55];
const F = [48, 53, 57];
const G = [50, 55, 59];
const Am = [48, 52, 57];
const Gb = [54, 58, 61];
const Ebm = [51, 54, 58];
const Dm7 = [50, 53, 57, 60];
const G7 = [50, 53, 55, 59];
const Cmaj7 = [48, 52, 55, 59];
// Each chord twice for a steady two-beat pulse.
const loop = (...chords) => chords.flatMap((n) => [{ n, d: 2 }, { n, d: 2 }]);

const MAJOR = [0, 2, 4, 5, 7, 9, 11];
const PENTA = [0, 2, 4, 7, 9]; // C D E G A — also A minor pentatonic
const BLACK = [1, 3, 6, 8, 10];

const CREATE = {
  b1: [
    {
      type: 'improv', kicker: '即興：只用黑鍵', title: '黑鍵五聲音階', scale: BLACK, bpm: 84,
      backing: loop(Gb, Ebm),
      body: `<p>五個黑鍵剛好組成<b>五聲音階</b>，配上這段伴奏，怎麼彈都和諧，沒有「錯音」。</p>
        <p>試試：只用兩三個鍵、重複同一個音、模仿伴奏的節奏、從高彈到低。彈到想停為止。</p>`,
    },
    {
      type: 'compose', kicker: '創作：第一句旋律', title: '用 C、D、E 編一句', notes: [60, 62, 64], end: 0, min: 4, max: 8, bpm: 100,
      body: '<p>用今天學的 <b>C、D、E</b> 編一句 4 到 8 個音的旋律，<b>最後落在 C</b>。可以按「聽聽看」，不滿意就「重來」。</p>',
      after: '和〈Hot Cross Buns〉用的是同樣三個音。',
    },
  ],
  b2: [
    {
      type: 'compose', kicker: '創作：五指旋律', title: '用 C 到 G 編一句', notes: [60, 62, 64, 65, 67], end: 0, min: 5, max: 8, bpm: 100,
      body: '<p>手放在 C 位置不動，用 <b>C D E F G</b> 編一句 5 到 8 個音的旋律，<b>最後回到 C</b>。試著先往上爬，再一步一步走回來。</p>',
      after: '一指一鍵，手不用移動，就能寫出一整句。',
    },
  ],
  b5: [
    {
      type: 'improv', kicker: '即興：C 大調', title: '在 C–Am–F–G 上即興', scale: MAJOR, bpm: 88,
      backing: loop(C, Am, F, G),
      body: `<p>伴奏是 C → Am → F → G 循環。用 <b>C 大調音階</b>的七個白鍵即興。</p>
        <p>小訣竅：每次和弦換的時候，停在 C、E、G 這類穩定的音上；中間可以用音階上下走。</p>`,
    },
  ],
  b6: [
    {
      type: 'compose', kicker: '創作：配合和弦的旋律', title: '寫一句會「回家」的旋律', notes: [60, 62, 64, 65, 67, 69, 71, 72], end: 0, min: 6, max: 8, bpm: 96,
      body: '<p>用 C 大調的白鍵（中央 C 到高音 C）編 6 到 8 個音，<b>最後落在 C</b>。想像底下是 C–F–G–C：開頭在 C、E、G 附近，結尾從 B 或 D 走回 C，最有「回家」的感覺。</p>',
      after: '旋律從 B 或 D 走到 C，就是和聲上「屬到主」的解決。',
    },
  ],
  b8: [
    {
      type: 'improv', kicker: '即興：五聲音階', title: '在 vi–IV–I–V 上即興', scale: PENTA, bpm: 92,
      backing: loop(Am, F, C, G),
      body: `<p>伴奏是今天學的 Am → F → C → G（vi–IV–I–V），流行歌最常見的進行之一。</p>
        <p>只用 <b>C D E G A</b> 五個音（C 大調五聲音階，去掉了容易不和諧的 F 和 B），怎麼彈都順耳。先跟著伴奏的節奏彈，再試著留一點空白。</p>`,
    },
  ],
  a2: [
    {
      type: 'improv', kicker: '即興：小調五聲', title: '在 Am–F–G–Am 上即興', scale: PENTA, bpm: 84,
      backing: loop(Am, F, G, Am),
      body: `<p>用 <b>A C D E G</b> 即興，這是 <b>A 小調五聲音階</b>。它和 C 大調五聲是同樣五個音，只是以 A 為中心，所以聽起來比較暗。</p>
        <p>試著常常回到 A，把句子結束在 A 上，感受小調的「家」。</p>`,
    },
  ],
  a5: [
    {
      type: 'improv', kicker: '即興：ii–V–I', title: '在 Dm7–G7–Cmaj7 上即興', scale: MAJOR, bpm: 96,
      backing: loop(Dm7, G7, Cmaj7, Cmaj7),
      body: `<p>伴奏是 ii–V–I：Dm7 → G7 → Cmaj7。用 C 大調音階即興。</p>
        <p>試著瞄準導音線：Dm7 時停在 <b>F</b>，G7 時滑到 <b>F 或 B</b>，到 Cmaj7 落在 <b>E 或 B</b>。和弦換的那一刻踩對音，即興就有了方向。</p>`,
    },
  ],
};

export function addCreative(lessons) {
  for (const l of lessons) {
    const piece = l.segments?.find((s) => s.kind === 'piece');
    if (piece && CREATE[l.id]) piece.steps = [...piece.steps, ...CREATE[l.id]];
  }
}
