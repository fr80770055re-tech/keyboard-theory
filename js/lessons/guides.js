// Practice guides: what experienced teachers recommend, in our own words, with
// each step linked to the drills that practise it. Sources are listed at the end
// of each guide; nothing here is quoted from them.

import { CAGED, CAGED_ORDER, cagedFigure, cagedShift } from './guitar-chords.js';

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
        body: `<p>開放的 C、A、G、E、D 五個指形都能移動，而且在指板上依序首尾相接：同一個和弦在整個指板上有五種按法。學會 E 型、A 型之後，再補上 C、G、D 型，就能在任何把位找到任何和弦，也能看出音階與和弦的關係。詳細說明與圖解見〈CAGED 系統詳解〉。</p>`,
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
  caged: {
    id: 'caged',
    title: 'CAGED 系統詳解',
    link: '深入了解：CAGED 系統詳解',
    lead: 'CAGED 是吉他手用來「看懂整個指板」的地圖：只用五個最早學會的開放和弦 C、A、G、E、D，把它們當成可以整塊移動的指形，就能在指板上任何位置找到任何和弦，並把和弦、音階和即興串在一起。下面從原理、順序到實際用法一步步說明，每張圖的 R 是根音，3、5 是三度、五度，× 不彈，○ 是空弦。',
    sections: [
      {
        title: '1. 名字的由來與核心想法',
        body: `<p>CAGED 就是五個開放大三和弦的名字：<b>C、A、G、E、D</b>。核心想法只有兩點：</p>
          <ul><li><b>每個開放指形都能整塊往上移</b>：把琴枕想成食指（或移調夾），指形裡的相對位置不變，和弦名字跟著根音改變。</li>
          <li><b>同一個和弦在指板上有五種按法</b>，而且依 C → A → G → E → D 的順序首尾相接，鋪滿整個指板。</li></ul>
          <p>所以 CAGED 不是要多背五套東西，而是把你已經會的五個和弦，變成整個指板的座標。</p>`,
        drills: [],
      },
      {
        title: '2. 五個開放指形與根音位置',
        body: `<p>學 CAGED 最重要的是記住每個指形的<b>根音在哪幾條弦</b>，因為移動之後，就是靠根音來定位：</p>
          <ul><li><b>C 型</b>：根音在第 5、2 弦</li><li><b>A 型</b>：根音在第 5、3 弦</li>
          <li><b>G 型</b>：根音在第 6、3、1 弦</li><li><b>E 型</b>：根音在第 6、4、1 弦</li><li><b>D 型</b>：根音在第 4、2 弦</li></ul>`,
        figures: CAGED_ORDER.map((s) => ({ caption: `${s} 型：根音在第 ${CAGED[s].roots.join('、')} 弦`, fig: cagedFigure(s, CAGED[s].pc) })),
        drills: ['gch-open', 'gch-role'],
      },
      {
        title: '3. 把指形往上移：移幾格？',
        body: `<p>移動的格數＝<b>原本的根音到新根音的半音數</b>。例如要用 A 型彈 C：A 到 C 是 3 個半音，整個 A 指形往上 3 格，原本的空弦變成食指橫按第 3 格。</p>
          <p>同樣地，E 型往上 3 格是 G（E→G 三個半音）。你熟悉的 E 型、A 型橫按和弦，其實就是 CAGED 裡的兩個指形。</p>`,
        figures: [
          { caption: '開放 A 和弦（A 型）', fig: cagedFigure('A', 9) },
          { caption: 'A 型往上 3 格＝C', fig: cagedFigure('A', 0) },
          { caption: '開放 E 和弦（E 型）', fig: cagedFigure('E', 4) },
          { caption: 'E 型往上 3 格＝G', fig: cagedFigure('E', 7) },
        ],
        drills: ['gch-barre'],
      },
      {
        title: '4. 同一個和弦的五個位置：以 C 為例',
        body: `<p>C 和弦用五個指形，從琴枕一路往上：開放的 <b>C 型</b> → 第 3 格的 <b>A 型</b> → 第 5 格的 <b>G 型</b> → 第 8 格的 <b>E 型</b> → 第 10 格的 <b>D 型</b>，再往上就回到第 12 格的 C 型（高八度）。</p>
          <p>注意相鄰兩個指形<b>共用根音</b>：C 型和 A 型都在第 5 弦第 3 格有 C；A 型和 G 型在第 3 弦第 5 格共用 C；G 型和 E 型在第 6、1 弦第 8 格共用 C。共用的根音就是兩個指形之間的「接縫」。</p>`,
        figures: CAGED_ORDER.map((s) => ({ caption: `${s} 型：${cagedShift(s, 0) ? `從第 ${cagedShift(s, 0)} 格起` : '開放和弦'}`, fig: cagedFigure(s, 0) })),
        drills: [],
      },
      {
        title: '5. 順序永遠是 C-A-G-E-D 循環',
        body: `<p>不管什麼和弦，往高把位走的順序都是 <b>C → A → G → E → D → C…</b>，往低就倒過來。不同的和弦只是起點不同：</p>
          <ul><li>C 和弦從 C 型開始：C A G E D</li>
          <li>G 和弦從開放的 G 型開始：<b>G E D C A</b>（G 型開放、E 型第 3 格、D 型第 5 格、C 型第 7 格、A 型第 10 格）</li>
          <li>A 和弦從開放的 A 型開始：A G E D C</li></ul>
          <p>所以只要知道一個位置，就能推出往上、往下的其他四個。</p>`,
        figures: ['G', 'E', 'D', 'C', 'A'].map((s) => ({ caption: `G 和弦的 ${s} 型：${cagedShift(s, 7) ? `第 ${cagedShift(s, 7)} 格起` : '開放'}`, fig: cagedFigure(s, 7) })),
        drills: ['gch-caged'],
      },
      {
        title: '6. 任何和弦：從根音弦開始推',
        body: `<ol><li>在第 6 弦找到根音 → 從這格往上是 <b>E 型</b>；G 型的第 6 弦根音也在這格，整個 G 型在它下方。</li>
          <li>在第 5 弦找到根音 → 從這格往上是 <b>A 型</b>；C 型的第 5 弦根音也在這格，整個 C 型在它下方。</li>
          <li>在第 4 弦找到根音 → 從這格往上是 <b>D 型</b>。</li>
          <li>再用順序補齊：E 型的上面是 D 型、下面是 G 型；A 型的上面是 G 型、下面是 C 型。</li></ol>
          <p>這就是為什麼第 6、5 弦的音名要先記熟（見〈指板記憶指引〉）：CAGED 的定位全靠根音。</p>`,
        drills: ['gtr-root', 'gch-name'],
      },
      {
        title: '7. 小三和弦與七和弦也適用',
        body: `<p>CAGED 講的是「位置」，不只是大三和弦。把每個指形裡的 <b>3 降半音</b>就是小三和弦的指形（Am、Em、Dm 最常用，C、G 型的小和弦較難按，常只按其中幾條弦）；把一個根音降全音就是屬七。規則和〈和弦指形指引〉的「只動一個音」完全相同，只是套用在五個位置上。</p>`,
        drills: ['gch-derive'],
      },
      {
        title: '8. 和音階、即興串起來',
        body: `<p>每個 CAGED 指形周圍，都有一個對應的音階把位。五聲音階的五個把位，正好可以對到五個和弦指形：例如 A 小調五聲最常用的第一把位（第 5 格），就圍繞著第 5 格 E 型的 Am 和弦。</p>
          <p>即興時看著當下和弦的指形，就知道哪些音是和弦音（R、3、5）：把句子停在這些音上，旋律就會和和弦貼合。這也是 CAGED 最大的用處：<b>和弦、音階、即興用同一張地圖</b>。</p>`,
        drills: [],
      },
      {
        title: '9. 實際按的時候',
        body: `<ul><li><b>不必按完整指形</b>。完整的 G 型、C 型橫按很難按，實務上多半只按其中三、四條弦，或只取高音三條弦的三和弦。CAGED 是地圖，不是每次都要按滿六條弦。</li>
          <li>先從已經會的 <b>E 型、A 型</b>開始，再加入 <b>D 型</b>，最後是 C 型和 G 型。</li>
          <li>也有老師認為不一定要用 CAGED 學指板，它是好用的工具之一，不是唯一的方法；搭配音名記憶一起練效果最好。</li></ul>`,
        drills: [],
      },
    ],
    plan: {
      title: '四週練法',
      note: '每天 10 分鐘：手機上的練習負責「看懂、推得出來」，再拿吉他實際把五個位置按一遍、彈一遍。',
      weeks: [
        { title: '第 1 週：五個開放指形與根音', body: '確認五個開放和弦都會按，說得出每個指形的根音在哪幾條弦。', drills: ['gch-open', 'gch-role'] },
        { title: '第 2 週：移動指形', body: 'E 型、A 型橫按，練習「要移幾格」：找根音、算半音。', drills: ['gtr-root', 'gch-barre', 'gch-caged'] },
        { title: '第 3 週：一個和弦走遍五個位置', body: '每天選一個和弦（從 C、G、A 開始），從低到高按出五個位置，說出每個位置的指形名稱與共用的根音。', drills: ['gch-caged', 'gch-name'] },
        { title: '第 4 週：換和弦不換把位', body: '選一個把位（例如第 5 格附近），用不同指形彈 I–IV–V（例如 A、D、E），練習不離開這個把位就換和弦。', drills: ['gch-caged', 'gch-derive'] },
      ],
    },
    sources: [
      { title: 'Premier Guitar：The Guitarist’s Guide to the CAGED System', url: 'https://www.premierguitar.com/the-guitarists-guide-to-the-caged-system', note: '五個開放指形、根音位置與在指板上的連接' },
      { title: 'TrueFire：CAGED System for Guitar', url: 'https://learn.truefire.com/caged-system-for-guitar', note: '指形依固定順序往上下重複；E 型之後是 D、C、A、G' },
      { title: 'Andy Guitar：The CAGED System Explained', url: 'https://www.andyguitar.co.uk/lessons/06-the-caged-system-explained', note: '以 C 與 G 和弦說明五個位置' },
      { title: 'Songnotes：CAGED Chord Shapes, Explained', url: 'https://songnotes.net/lessons/385', note: '每個大和弦都能用五種指形彈；小和弦同理' },
      { title: 'JustinGuitar：The CAGED System – E Shape', url: 'https://justinguitar.com/guitar-lessons/the-caged-system-e-shape-tb-032', note: '不用空弦的指形都可移動；E 型根音在第 6 弦' },
    ],
  },
};
