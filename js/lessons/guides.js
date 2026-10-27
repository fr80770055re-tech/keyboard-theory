// Practice guides: what experienced teachers recommend, in our own words, with
// each step linked to the drills that practise it. Sources are listed at the end
// of each guide; nothing here is quoted from them.

export const GUIDES = {
  fretboard: {
    id: 'fretboard',
    title: '指板記憶指引',
    lead: '各家吉他老師的建議其實大同小異：先少後多、靠路標而不是從頭數、邊彈邊說出音名、每天練幾分鐘。下面整理成八個原則和一份四週練法，每一步都可以直接開始對應的練習。',
    sections: [
      {
        title: '1. 先記骨架：空弦與自然音',
        body: `<p>空弦由粗到細是 <b>E A D G B E</b>。自然音（沒有升降記號的音）之間大多隔一格，只有 <b>B–C</b> 和 <b>E–F</b> 緊鄰。</p>
          <p>先只記自然音，升降記號之後再補：升記號往上一格，降記號往下一格。</p>`,
        drills: ['gtr-open'],
      },
      {
        title: '2. 先背第 6、5 弦',
        body: `<p>大橫按和弦、強力和弦的根音多半落在第 6、5 弦，先記這兩條最划算。第 1 弦和第 6 弦都是 E，音名完全一樣，等於一次學兩條。</p>`,
        drills: ['gtr-root'],
      },
      {
        title: '3. 用路標，不要從頭數',
        body: `<ul><li><b>第 12 格</b>＝空弦高八度。上半段的音可以從第 12 格往回數。</li>
          <li><b>第 5 格</b>＝下一條（較細）弦的空弦音，這就是調音的方法；G 弦例外，用第 4 格。</li>
          <li>指板點 <b>3、5、7、12</b> 在第 6、5 弦上都是自然音：第 6 弦是 G、A、B、E，第 5 弦是 C、D、E、A。</li></ul>
          <p>從最近的路標往前或往後一兩格，比從空弦一路數上來快得多。</p>`,
        drills: ['gtr-landmark'],
      },
      {
        title: '4. 用八度形狀把音連起來',
        body: `<p>同一個音名的高八度，在<b>隔一條弦、往上 2 格</b>的地方；跨過 B 弦時（第 4→2 弦、第 3→1 弦）要<b>往上 3 格</b>，因為 G 弦和 B 弦之間只差大三度。</p>
          <p>學會第 6、5 弦以後，靠八度形狀就能推出其他弦的音。</p>`,
        drills: ['gtr-octave'],
      },
      {
        title: '5. 一次一個音名，走遍六條弦',
        body: `<p>選一個音名，從第 6 弦到第 1 弦依序找出它，再從第 1 弦找回來。不用空弦，只用第 1 到 12 格，逼自己用路標和八度去推。</p>
          <p>熟了以後跟著節拍器練：從很慢開始（例如每分鐘 40 拍、每拍一個位置），穩定了再慢慢加快。進一步可以兩個音名交替，或把七個自然音打亂順序。</p>`,
        drills: ['gtr-walk', 'gtr-all'],
      },
      {
        title: '6. 說出來，並且求快',
        body: `<p>邊找邊<b>念出音名</b>。練的是「想得起來」，而不只是「看到認得」。</p>
          <p>目標是<b>不用數</b>就知道，大約 2 秒內。這裡的吉他練習做完會顯示平均每題幾秒，可以看著這個數字慢慢往下推。先求對，再求快。</p>`,
        drills: ['gtr-name-natural', 'gtr-find'],
      },
      {
        title: '7. 短、常、混著練',
        body: `<p>每天 5 到 15 分鐘，比偶爾一次練一小時有效。答錯的位置會在之後的「今日複習」再出現，間隔越拉越長，這就是間隔重複。</p>
          <p>熟練以後，把弦和音名<b>混在一起</b>練，不要總是照順序。一項針對單簧管演奏者的小型研究發現，交錯安排的練習成果常被評得較好，不過差異沒有達到統計顯著，而且多數人仍偏好分開練。混著練會覺得比較難，這正是它有效的地方。</p>`,
        drills: ['gtr-name-all'],
      },
      {
        title: '8. 用在真正的音樂裡',
        body: `<p>練習題只是起點，真正記住是在用的時候。彈旋律、音階或和弦時，順便念出音名，找出每個和弦的根音在哪條弦、哪一格。</p>
          <p>CAGED 系統就是這個思路：記住五種和弦形狀裡根音的位置，任何和弦在指板上的任何地方都叫得出名字。</p>`,
        drills: [],
      },
    ],
    plan: {
      title: '四週練法',
      note: '每天 5 到 15 分鐘。進度因人而異；有老師估計，每天 5 分鐘，根音弦約 1 到 2 週能記熟，任何位置都能立刻說出音名大約要 2 到 3 個月。',
      weeks: [
        { title: '第 1 週：骨架', body: '空弦音名，然後是第 6、5 弦的自然音：看位置說音名、在弦上找音都要練。', drills: ['gtr-open', 'gtr-root'] },
        { title: '第 2 週：路標與八度', body: '用第 5、12 格與指板點推音，再用八度形狀把第 6、5 弦的音帶到其他弦。', drills: ['gtr-landmark', 'gtr-octave', 'gtr-name-natural'] },
        { title: '第 3 週：一個音名走遍全指板', body: '每天選一兩個音名，依序走遍六條弦，再一次找出它的所有位置。', drills: ['gtr-walk', 'gtr-all', 'gtr-find'] },
        { title: '第 4 週：補上升降、提高速度', body: '加入升降記號，混著練，把平均秒數往 2 秒內推。', drills: ['gtr-name-all', 'gtr-find'] },
      ],
    },
    sources: [
      { title: 'JustinGuitar：Notes In The First Five Frets', url: 'https://www.justinguitar.com/en/TB-007-NotesOnNeck.php', note: '先記空弦，再在前五格裡從空弦往上推音名' },
      { title: 'Tunemode：Guitar Fretboard Notes', url: 'https://tunemode.io/blog/guitar-fretboard-notes', note: '先背第 6、5 弦；節拍器逐格念音名；八度形狀與 B 弦例外；每天 5 分鐘的進度估計' },
      { title: 'TrueFire Blog：Learn Guitar Fretboard Notes', url: 'https://blog.truefire.com/guitar-lessons/learn-guitar-fretboard-notes-master-the-neck-fast-with-proven-strategies/', note: '空弦與第 12 格當路標；八度練習；限時找音（從 5 秒縮到 2 秒）；四週計畫' },
      { title: 'Guitar Tricks Blog：Learn guitar note names anywhere on the neck', url: 'https://www.guitartricks.com/blog/learn-guitar-note-names-anywhere-on-the-neck', note: '先學自然音；只有 B–C、E–F 是半音' },
      { title: 'Kyle Smith Guitar：Learning the Guitar Fretboard – Natural Notes', url: 'https://www.kylesmithguitar.com/blog/learning-the-guitar-fretboard-natural-notes', note: '單一條弦從空弦到第 12 格，上下來回並念出音名' },
      { title: 'Alex Hyett：Learning the fretboard on guitar', url: 'https://www.alexhyett.com/notes/learning-the-fretboard-on-guitar/', note: '一個音名走遍六弦、不用空弦，節拍器由 40 拍逐步到 80 拍' },
      { title: 'Premier Guitar：The Guitarist’s Guide to the CAGED System', url: 'https://www.premierguitar.com/the-guitarists-guide-to-the-caged-system', note: '五種和弦形狀與其中的根音位置' },
      { title: 'Carter & Grahn（2016），Frontiers in Psychology 7:1251', url: 'https://www.frontiersin.org/articles/10.3389/fpsyg.2016.01251/full', note: '交錯與分開練習對演奏表現的影響（10 位單簧管演奏者的小型研究）' },
    ],
  },
  chords: {
    id: 'chords',
    title: '和弦指形指引',
    lead: '吉他和弦表有上百個指形，但背後只有一個道理：和弦是「根音＋幾個音程」，指形只是這些音程落在弦上的位置。看懂一個指形裡每根手指是 R、3 還是 5，就能自己推出其他和弦，不用死背。',
    sections: [
      {
        title: '1. 和弦＝根音加上音程',
        body: `<ul><li><b>大三和弦</b>：R、3、5（根音往上 4 個半音、再 3 個半音）。</li>
          <li><b>小三和弦</b>：R、♭3、5。和大三和弦只差一個音：三度低了半音。</li>
          <li><b>屬七</b>（7）：大三和弦加 ♭7；<b>小七</b>（m7）：小三和弦加 ♭7；<b>大七</b>（maj7）：大三和弦加 7。</li></ul>
          <p>五度在大、小三和弦裡都一樣，決定明亮或陰暗的是三度。</p>`,
        drills: [],
      },
      {
        title: '2. 開放和弦：先認，再看懂',
        body: `<p>先熟悉最常用的開放和弦：<b>C、A、G、E、D</b>，加上 Am、Em、Dm 與幾個七和弦。看指形時先找<b>最低音</b>（× 的弦不彈），它通常就是根音；再看三度在哪一條弦。</p>`,
        drills: ['gch-open'],
      },
      {
        title: '3. 每根手指都有名字：R、3、5',
        body: `<p>同一個和弦裡，根音常常出現兩三次，五度也常重複，三度通常只有一個。練習時把每個按的位置說成「R、5、R、3、5、R」，指形就從一堆點變成有意義的結構。</p>
          <p>數法：從根音往上，3 個半音是 ♭3、4 個是 3、7 個是 5、10 個是 ♭7、11 個是 7。</p>`,
        drills: ['gch-role'],
      },
      {
        title: '4. 可移動指形：E 型與 A 型',
        body: `<p>不用空弦的指形可以整個往上移。把開放 E 和弦換指法、用食指當「移動的琴枕」，就是 <b>E 型橫按</b>，根音在第 6 弦；開放 A 和弦變成 <b>A 型橫按</b>，根音在第 5 弦。</p>
          <p>和弦的名字＝根音的名字：要彈 G，在第 6 弦找到 G（第 3 格），食指橫按第 3 格、按 E 型；或在第 5 弦找到 G（第 10 格），按 A 型。所以先把第 6、5 弦的音名記熟（見指板記憶指引），橫按和弦就全都會了。</p>
          <p>多數老師建議先練 E 型再練 A 型；A 型的第 1 弦是五度，按不清楚時可以不彈。</p>`,
        drills: ['gch-barre', 'gch-name'],
      },
      {
        title: '5. 推算：只動一個音',
        body: `<ul><li><b>大 → 小</b>：把三度降半音（E 型在第 3 弦、A 型在第 2 弦）。</li>
          <li><b>大 → 7</b>：把一個高八度的根音降全音，成為 ♭7（E 型在第 4 弦、A 型在第 3 弦）。</li>
          <li><b>大 → maj7</b>：把那個根音只降半音，成為 7。</li>
          <li><b>小 → m7</b>：同樣把根音降全音。</li></ul>
          <p>其他手指不動，所以換和弦時手的位置也不用變。這也是為什麼記住 R 和 3 在哪條弦最重要。</p>`,
        drills: ['gch-derive'],
      },
      {
        title: '6. 下一步：CAGED',
        body: `<p>開放的 C、A、G、E、D 五個指形都能移動，而且在指板上依序首尾相接：同一個和弦在整個指板上有五種按法。學會 E 型、A 型之後，再補上 C、G、D 型，就能在任何把位找到任何和弦，也能看出音階與和弦的關係。</p>`,
        drills: [],
      },
    ],
    plan: {
      title: '三週練法',
      note: '每天 5 到 10 分鐘的樂理練習，加上拿起吉他實際按。手機上答題訓練的是「推得出來」，手指要真的按過才記得住。',
      weeks: [
        { title: '第 1 週：開放和弦與組成音', body: '認出常用開放和弦，並說出每根手指按的是 R、3 還是 5。', drills: ['gch-open', 'gch-role'] },
        { title: '第 2 週：E 型與 A 型', body: '先複習第 6、5 弦的音名，再練找橫按位置與看指形說和弦。', drills: ['gtr-root', 'gch-barre', 'gch-name'] },
        { title: '第 3 週：推算', body: '從大三和弦出發，推出小、7、maj7、m7；混著前兩週的練習一起做。', drills: ['gch-derive', 'gch-role', 'gch-barre'] },
      ],
    },
    sources: [
      { title: 'JustinGuitar：The CAGED System – E Shape', url: 'https://justinguitar.com/guitar-lessons/the-caged-system-e-shape-tb-032', note: '不用空弦的指形都能移動；E 型橫按的根音在第 6 弦' },
      { title: 'Guitar World：How to play barre chords', url: 'https://www.guitarworld.com/lessons/how-to-play-barre-chords', note: 'E 型與 A 型橫按的大、小和弦指形' },
      { title: 'Guitar Noise：Movable Chord Shapes', url: 'https://guitarnoise.substack.com/p/movable-chord-shapes', note: '可移動指形的名字跟著根音走' },
      { title: 'FaChords：Guitar Chord Construction', url: 'https://www.fachords.com/guitar-music-theory', note: '和弦由根音、三度、五度與七度構成，大小三和弦只差三度' },
      { title: 'Premier Guitar：The Guitarist’s Guide to the CAGED System', url: 'https://www.premierguitar.com/the-guitarists-guide-to-the-caged-system', note: '五種開放指形在指板上依序相連' },
    ],
  },
};
