// 圖解和弦查表: pick a root and a chord type; see its formula and spelled notes,
// where it sits on the piano, and its guitar shapes (open chord, E/A barre shapes,
// CAGED positions, triads on string sets, shell voicing) plus the five CAGED
// arpeggio positions. Every shape is computed from the formula, not typed in.
import { drawFretboard, midiAt, OPEN } from './fretboard.js';
import { OPEN_CHORDS, MOVABLE, CAGED, CAGED_ORDER, cagedShift } from './lessons/guitar-chords.js';
import { cagedArpeggio, boxFigure, closeTriad, STRING_SETS, shellFrets } from './lessons/guitar-arp.js';
import { icon } from './icons.js';
import { VOICINGS_C, REQUIRED, voicingsFor, checkVoicing } from './lessons/guitar-voicings.js';

const mod12 = (x) => ((x % 12) + 12) % 12;
export const ROOTS = ['C', 'C♯', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B'];

// Chord types: [semitones, letter steps above the root, degree label] per tone.
export const TYPES = [
  { key: '', group: '三和弦', name: '大三和弦', tones: [[0, 0, 'R'], [4, 2, '3'], [7, 4, '5']] },
  { key: 'm', group: '三和弦', name: '小三和弦', tones: [[0, 0, 'R'], [3, 2, '♭3'], [7, 4, '5']] },
  { key: 'dim', group: '三和弦', name: '減三和弦', tones: [[0, 0, 'R'], [3, 2, '♭3'], [6, 4, '♭5']] },
  { key: 'aug', group: '三和弦', name: '增三和弦', tones: [[0, 0, 'R'], [4, 2, '3'], [8, 4, '♯5']] },
  { key: 'sus2', group: '三和弦', name: '掛留二和弦', tones: [[0, 0, 'R'], [2, 1, '2'], [7, 4, '5']] },
  { key: 'sus4', group: '三和弦', name: '掛留四和弦', tones: [[0, 0, 'R'], [5, 3, '4'], [7, 4, '5']] },
  { key: '7', group: '七和弦', name: '屬七和弦', tones: [[0, 0, 'R'], [4, 2, '3'], [7, 4, '5'], [10, 6, '♭7']] },
  { key: 'maj7', group: '七和弦', name: '大七和弦', tones: [[0, 0, 'R'], [4, 2, '3'], [7, 4, '5'], [11, 6, '7']] },
  { key: 'm7', group: '七和弦', name: '小七和弦', tones: [[0, 0, 'R'], [3, 2, '♭3'], [7, 4, '5'], [10, 6, '♭7']] },
  { key: 'm7♭5', group: '七和弦', name: '半減七和弦', tones: [[0, 0, 'R'], [3, 2, '♭3'], [6, 4, '♭5'], [10, 6, '♭7']] },
  { key: 'dim7', group: '七和弦', name: '減七和弦', tones: [[0, 0, 'R'], [3, 2, '♭3'], [6, 4, '♭5'], [9, 6, '𝄫7']] },
  { key: 'mMaj7', group: '七和弦', name: '小大七和弦', tones: [[0, 0, 'R'], [3, 2, '♭3'], [7, 4, '5'], [11, 6, '7']] },
  { key: '6', group: '其他', name: '大六和弦', tones: [[0, 0, 'R'], [4, 2, '3'], [7, 4, '5'], [9, 5, '6']] },
  { key: 'm6', group: '其他', name: '小六和弦', tones: [[0, 0, 'R'], [3, 2, '♭3'], [7, 4, '5'], [9, 5, '6']] },
  { key: '7sus4', group: '其他', name: '屬七掛四和弦', tones: [[0, 0, 'R'], [5, 3, '4'], [7, 4, '5'], [10, 6, '♭7']] },
  { key: 'add9', group: '其他', name: '加九和弦', tones: [[0, 0, 'R'], [4, 2, '3'], [7, 4, '5'], [14, 1, '9']] },
];
export const findType = (key) => TYPES.find((t) => t.key === key);

// Spell by letter (thirds on every other letter; 𝄫/𝄪 when the formula needs them).
const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const LETTER_PC = [0, 2, 4, 5, 7, 9, 11];
const ACC = { 0: '', 1: '♯', 2: '𝄪', 11: '♭', 10: '𝄫' };
export function spellChord(root, type) {
  const li = LETTERS.indexOf(ROOTS[root][0]);
  return type.tones.map(([semi, step]) => {
    const l = (li + step) % 7;
    return LETTERS[l] + (ACC[mod12(root + semi - LETTER_PC[l])] ?? '?');
  });
}
const degreeOf = (type, semis) => type.tones.find(([s]) => mod12(s) === mod12(semis))?.[2];

// ---------- piano ----------
// Two octaves from C3, chord in close position from the lowest root that fits.
export function pianoNotes(root, type) {
  const base = 48 + root;
  return type.tones.map(([s]) => base + s);
}
function pianoSvg(root, type) {
  const notes = pianoNotes(root, type);
  const lo = 48; const hi = Math.max(71, Math.max(...notes));
  const white = [];
  for (let n = lo; n <= hi; n++) if (![1, 3, 6, 8, 10].includes(n % 12)) white.push(n);
  const W = 26; const H = 110; const BW = 16; const BH = 68;
  let svg = '';
  const label = (n) => degreeOf(type, n - (48 + root));
  white.forEach((n, i) => {
    const on = notes.includes(n);
    svg += `<rect x="${i * W}" y="0" width="${W}" height="${H}" class="pk-w ${on ? 'on' : ''}"/>`;
    if (on) svg += `<text x="${i * W + W / 2}" y="${H - 10}" class="pk-t">${label(n)}</text>`;
  });
  white.forEach((n, i) => {
    const b = n + 1;
    if (b > hi || ![1, 3, 6, 8, 10].includes(b % 12)) return;
    const on = notes.includes(b);
    svg += `<rect x="${(i + 1) * W - BW / 2}" y="0" width="${BW}" height="${BH}" class="pk-b ${on ? 'on' : ''}"/>`;
    if (on) svg += `<text x="${(i + 1) * W}" y="${BH - 8}" class="pk-t pk-tb">${label(b)}</text>`;
  });
  const w = white.length * W;
  return `<svg class="pk" viewBox="-1 -1 ${w + 2} ${H + 2}" style="width:min(100%, ${w * 1.4}px)" role="img" aria-label="鋼琴上的位置：${notes.length} 個音">${svg}</svg>`;
}

// ---------- guitar ----------
const STRINGS = [6, 5, 4, 3, 2, 1];
// Chord-chart figure from frets (strings 6 → 1, null = not played), labelled by degree.
function chart(frets, root, type, caption) {
  const played = frets.filter((f) => f !== null);
  const top = Math.max(...played);
  const low = Math.min(...played.filter((f) => f > 0), top);
  const from = top <= 4 ? 0 : low - 1;
  const marks = STRINGS.map((s, k) => {
    const f = frets[k];
    if (f === null) return { s, f: 0, kind: 'mute', label: '×' };
    const d = degreeOf(type, midiAt(s, f) - root);
    return { s, f, kind: f === 0 ? 'open' : d === 'R' ? 'root' : 'tone', label: d };
  });
  return { caption, fig: { from, frets: Math.max(4, top - from), vertical: true, marks, label: caption } };
}
const QUALITY_KEY = { '': '', m: 'm', 7: '7', maj7: 'maj7', m7: 'm7' };

export function guitarSections(root, type) {
  const name = `${ROOTS[root]}${type.key}`;
  const sections = [];
  // Open chords.
  const opens = OPEN_CHORDS.filter(([r, q]) => r === root && q === QUALITY_KEY[type.key] && type.key in QUALITY_KEY);
  if (opens.length) sections.push({ title: '開放和弦', note: '× 不彈，○ 空弦。', figs: opens.map(([, , fr]) => chart(fr, root, type, `${name}（開放）`)) });
  // E-shape and A-shape barre chords.
  if (type.key in QUALITY_KEY) {
    const figs = ['E', 'A'].map((sh) => {
      const m = MOVABLE[sh];
      let f = mod12(root - OPEN[m.rootString]);
      if (f === 0) f = 12;
      const fr = m.shapes[QUALITY_KEY[type.key]].map((o) => (o === null ? null : o + f));
      return chart(fr, root, type, `${name}：${sh} 型橫按（根音在第 ${m.rootString} 弦第 ${f} 格）`);
    });
    sections.push({ title: '橫按和弦（E 型、A 型）', note: '食指橫按根音那一格，整個指形可以上下移動。', figs });
  }
  // CAGED chord positions (major; minor = each major shape with its 3rd lowered a semitone).
  if (type.key === '' || type.key === 'm') {
    const figs = CAGED_ORDER.map((sh) => {
      const b = cagedShift(sh, root);
      const fr = CAGED[sh].frets.map((f, k) => {
        if (f === null) return null;
        let x = f + b;
        if (type.key === 'm' && mod12(midiAt(STRINGS[k], x) - root) === 4) x -= 1;
        return x;
      });
      if (fr.some((x) => x !== null && x < 0)) return null;
      return chart(fr, root, type, `${name}：${sh} 型${b ? `（從第 ${b} 格起）` : '（開放）'}`);
    }).filter(Boolean);
    sections.push({
      title: 'CAGED 五個和弦位置',
      note: type.key === 'm' ? '由大三和弦的五個指形把三度降半音推得；有些按法較吃力，可只彈其中三、四條弦。' : '依 C → A → G → E → D 的順序往高把位相接。',
      figs,
    });
  }
  // Triads on string sets (three-note chords only).
  if (type.tones.length === 3) {
    const pcs = type.tones.map(([s]) => mod12(root + s));
    const inv = ['原位', '第一轉位', '第二轉位'];
    const figs = [];
    for (const set of [STRING_SETS[3], STRING_SETS[2]]) {
      for (let i = 0; i < 3; i++) {
        const fr = closeTriad(pcs, i, set, 0);
        if (!fr) continue;
        const frets = STRINGS.map((s) => (set.includes(s) ? fr[set.indexOf(s)] : null));
        figs.push(chart(frets, root, type, `${inv[i]}（第 ${set.join('-')} 弦）`));
      }
    }
    if (figs.length) sections.push({ title: '三條弦上的三和弦', note: '最低音決定轉位：根音＝原位、三音＝第一轉位、五音＝第二轉位。', figs });
  }
  // Shell voicings.
  if (['maj7', '7', 'm7'].includes(type.key)) {
    const figs = [6, 5].map((rs) => {
      let rf = mod12(root - OPEN[rs]);
      if (rf < 2) rf += 12;
      const { third, seventh } = shellFrets(rs, rf, type.key);
      const frets = STRINGS.map((s) => (s === rs ? rf : s === third[0] ? third[1] : s === seventh[0] ? seventh[1] : null));
      return chart(frets, root, type, `殼和弦（根音在第 ${rs} 弦）`);
    });
    sections.push({ title: '殼和弦（R＋3＋7）', note: '五度省略；三音決定大小，七音決定種類。', figs });
  }
  // Full voicings for the other chord types (sourced from FaChords, re-checked here).
  if (VOICINGS_C[type.key]) {
    const tonesSemi = type.tones.map(([x]) => x);
    const figs = voicingsFor(type.key, root)
      .map((v) => ({ v, c: checkVoicing(v.frets, root, tonesSemi, REQUIRED[type.key]) }))
      .filter(({ c }) => c.ok)
      .map(({ v, c }) => {
        const bassDeg = degreeOf(type, c.bass);
        const where = v.open ? '用到空弦' : `根音在第 ${c.rootString} 弦`;
        return chart(v.frets, root, type, `${name}：${where}${bassDeg !== 'R' ? `，最低音是 ${bassDeg}（轉位）` : ''}`);
      });
    if (figs.length) sections.push({ title: '常用六弦按法', note: '整理自 FaChords 的和弦圖，每個按法都經過檢查：只含和弦音、包含決定和弦性質的音、手指跨度在五格內。沒有空弦的按法可以整塊移到其他根音。', figs });
  }
  // CAGED arpeggio positions (any chord type).
  const tones = type.tones.map(([s]) => mod12(s));
  const arps = CAGED_ORDER.map((sh) => {
    const box = cagedArpeggio(root, '', sh, undefined, tones);
    box.notes.forEach((x) => { x.role = degreeOf(type, x.n - root) ?? x.role; });
    return { caption: `${sh} 型琶音（第 ${box.lo}–${box.hi} 格）`, fig: boxFigure(box) };
  });
  sections.push({ title: 'CAGED 五個琶音位置', note: '同一組和弦音，在五個區域各彈一次；R 是根音。', figs: arps });
  return sections;
}

// ---------- page ----------
export function renderChordLookup(el, { root = 0, key = '', onPlay, onBack } = {}) {
  const type = findType(key) ?? TYPES[0];
  const names = spellChord(root, type);
  const sym = `${ROOTS[root]}${type.key}`;
  const groups = [...new Set(TYPES.map((t) => t.group))];
  const sections = guitarSections(root, type);
  el.innerHTML = `<article class="guide lookup">
    <div class="lesson-head"><button class="btn btn-ghost btn-icon-text" data-act="home">${icon.back()}回首頁</button></div>
    <h1>圖解和弦查表</h1>
    <p class="lead">選根音與和弦種類，看組成音、鋼琴位置與吉他指形。指形由和弦公式算出，或整理自公開和弦圖；每一個都經過程式檢查。</p>
    <div class="lk-pick" role="group" aria-label="根音">${ROOTS.map((r, i) => `<button class="seg-btn lk-root" data-root="${i}" aria-pressed="${i === root}">${r}</button>`).join('')}</div>
    ${groups.map((g) => `<div class="lk-pick" role="group" aria-label="${g}"><span class="lk-g">${g}</span>${TYPES.filter((t) => t.group === g).map((t) => `<button class="seg-btn lk-type" data-key="${t.key}" aria-pressed="${t.key === type.key}">${t.key || 'M'}</button>`).join('')}</div>`).join('')}
    <section class="guide-sec lk-head">
      <h2><span class="lk-sym">${sym}</span> ${type.name}</h2>
      <p>公式 <b>${type.tones.map(([, , d]) => d).join('–')}</b>　組成音 <b>${names.join('、')}</b></p>
      <div class="row"><button class="btn" data-play="chord">${icon.play()}聽和弦</button><button class="btn" data-play="arp">${icon.play()}聽琶音</button></div>
    </section>
    <section class="guide-sec"><h2>鋼琴</h2>${pianoSvg(root, type)}</section>
    ${sections.map((sec, i) => `<section class="guide-sec"><h2>吉他：${sec.title}</h2><p class="muted small">${sec.note}</p>
      <div class="guide-figs">${sec.figs.map((f, k) => `<figure><div class="fb-wrap" data-lk="${i}-${k}"></div><figcaption>${f.caption}</figcaption></figure>`).join('')}</div></section>`).join('')}
  </article>`;
  el.querySelectorAll('[data-lk]').forEach((box) => {
    const [i, k] = box.dataset.lk.split('-').map(Number);
    drawFretboard(box, sections[i].figs[k].fig);
  });
  const go = (r, k) => renderChordLookup(el, { root: r, key: k, onPlay, onBack });
  el.querySelectorAll('[data-root]').forEach((b) => { b.onclick = () => go(Number(b.dataset.root), type.key); });
  el.querySelectorAll('[data-key]').forEach((b) => { b.onclick = () => go(root, b.dataset.key); });
  const notes = pianoNotes(root, type);
  el.querySelector('[data-play="chord"]').onclick = () => onPlay?.([{ n: notes, d: 3 }]);
  el.querySelector('[data-play="arp"]').onclick = () => onPlay?.([...notes, notes[0] + 12].map((n) => ({ n, d: 0.5 })));
  el.querySelector('[data-act="home"]').onclick = () => onBack?.();
  try { localStorage.setItem('keyboard-theory.lookup', JSON.stringify({ root, key: type.key })); } catch { /* ignore */ }
}

export function lastLookup() {
  try { return JSON.parse(localStorage.getItem('keyboard-theory.lookup')) || {}; } catch { return {}; }
}
