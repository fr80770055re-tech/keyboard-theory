// Guitar fretboard (standard tuning, open strings to fret 12), drawn as SVG.
// Narrow screens get it upright like a chord chart (low E on the left, nut at
// the top) so every fret is a comfortable tap target in portrait; wide screens
// get it lying down like tablature (high E on top). Strings are numbered the
// guitarist's way: 1 = high E … 6 = low E.

export const OPEN = { 1: 64, 2: 59, 3: 55, 4: 50, 5: 45, 6: 40 }; // E4 B3 G3 D3 A2 E2
export const STRING_NAME = { 1: 'E', 2: 'B', 3: 'G', 4: 'D', 5: 'A', 6: 'E' };
const SHARP = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
const FLAT = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B'];
// Black-key names show both spellings, as guitarists meet both.
export const fretName = (n) => (SHARP[n % 12] === FLAT[n % 12] ? SHARP[n % 12] : `${SHARP[n % 12]}/${FLAT[n % 12]}`);
export const midiAt = (s, f) => OPEN[s] + f;
const INLAYS = [3, 5, 7, 9];

// el: container. opts: { frets, marks: [{ s, f, kind, label }], onTap(s, f), label,
// vertical (force an orientation; by default upright below 520px), from }.
// from > 0 draws a window like a chord chart up the neck: frets from+1 … from+frets,
// a thin top line instead of the nut and the first fret numbered beside it.
// kind: 'hint' | 'ok' | 'bad' | 'soft' | 'dot'. Returns { mark, unmark, clear }.
// The board redraws itself (marks kept) when its container changes size, e.g.
// when a phone is turned sideways mid-question.
export function drawFretboard(el, opts = {}) {
  const frets = opts.frets ?? 12;
  const from = opts.from ?? 0;
  const marks = new Map();
  let xy;
  let layer;
  let drawnWidth = 0;
  let unit = 30; // string spacing, so marks shrink on small charts
  const build = () => {
    const width = Math.min(el.clientWidth || 340, 720);
    drawnWidth = width;
    const vertical = opts.vertical ?? width < 520;
    const P = 26; // outer padding (room for fret numbers and string names)
    const openGap = vertical ? 34 : 40;
    let W; let H; let along; let across; // along: fret axis length per fret; across: string spacing
    if (vertical) {
      across = Math.min(56, (width - P * 2) / 5.6);
      // Fit all twelve frets on a phone screen below the question when possible.
      along = Math.max(28, Math.min(40, ((window.innerHeight || 800) - 430) / frets));
      W = P * 2 + across * 5 + 8;
      H = P + openGap + along * frets + 16;
    } else {
      along = Math.min(64, (width - P - openGap - 16) / frets);
      across = 30;
      W = P + openGap + along * frets + 16;
      H = P * 2 + across * 5;
    }
    // Position of string s across the board, and of the middle of fret f along it.
    const cross = (s) => (vertical ? P + 4 + (6 - s) * across : P + (s - 1) * across);
    const nut = vertical ? P + openGap : P + openGap;
    // f = 0 (or any fret below the window) sits in the gap above the top line.
    const mid = (f) => (f <= from ? nut - openGap / 2 : nut + (f - from - 0.5) * along);
    const wire = (f) => nut + (f - from) * along;
    const shown = (f) => f > from && f <= from + frets;
    const pos = (s, f) => (vertical ? [cross(s), mid(f)] : [mid(f), cross(s)]);
    const line = (a1, c1, a2, c2, cls) => {
      const [x1, y1, x2, y2] = vertical ? [c1, a1, c2, a2] : [a1, c1, a2, c2];
      return `<line class="${cls}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;
    };

    let svg = '';
    const lo = cross(vertical ? 6 : 1);
    const hi = cross(vertical ? 1 : 6);
    // inlay dots
    for (const f of INLAYS) if (shown(f)) svg += `<circle class="fb-inlay" cx="${vertical ? (lo + hi) / 2 : mid(f)}" cy="${vertical ? mid(f) : (lo + hi) / 2}" r="5"/>`;
    if (shown(12)) {
      const a = (lo + hi) / 2 - across;
      const b = (lo + hi) / 2 + across;
      svg += vertical
        ? `<circle class="fb-inlay" cx="${a}" cy="${mid(12)}" r="5"/><circle class="fb-inlay" cx="${b}" cy="${mid(12)}" r="5"/>`
        : `<circle class="fb-inlay" cx="${mid(12)}" cy="${a}" r="5"/><circle class="fb-inlay" cx="${mid(12)}" cy="${b}" r="5"/>`;
    }
    // frets and nut
    for (let f = from + 1; f <= from + frets; f++) svg += line(wire(f), lo, wire(f), hi, 'fb-fret');
    svg += line(nut, lo - 1, nut, hi + 1, from ? 'fb-fret' : 'fb-nut');
    // strings: thicker for the low ones
    for (let s = 1; s <= 6; s++) {
      svg += `<line class="fb-string" style="stroke-width:${0.8 + (s - 1) * 0.35}" ${vertical
        ? `x1="${cross(s)}" y1="${nut - openGap + 6}" x2="${cross(s)}" y2="${wire(from + frets)}"`
        : `x1="${nut - openGap + 6}" y1="${cross(s)}" x2="${wire(from + frets)}" y2="${cross(s)}"`}/>`;
    }
    // fret numbers and string names
    for (const f of from ? [from + 1] : [3, 5, 7, 9, 12]) {
      if (!shown(f)) continue;
      svg += vertical
        ? `<text class="fb-num" x="${P - 12}" y="${mid(f) + 4}">${f}</text>`
        : `<text class="fb-num" x="${mid(f)}" y="${H - 6}">${f}</text>`;
    }
    for (let s = 1; s <= 6; s++) {
      svg += vertical
        ? `<text class="fb-num" x="${cross(s)}" y="${P - 10}">${STRING_NAME[s]}</text>`
        : `<text class="fb-num" x="${P - 14}" y="${cross(s) + 4}">${STRING_NAME[s]}</text>`;
    }
    // tap targets: one cell per string and fret
    for (let s = 1; s <= 6; s++) {
      for (let k = 0; k <= frets; k++) {
        if (k === 0 && from) continue;
        const f = k === 0 ? 0 : from + k;
        const [x, y] = pos(s, f);
        const w = vertical ? across : k === 0 ? openGap : along;
        const h = vertical ? (k === 0 ? openGap : along) : across;
        svg += `<rect class="fb-hit" data-s="${s}" data-f="${f}" x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}"
          ${opts.onTap ? `role="button" tabindex="-1" aria-label="第 ${s} 弦${f ? `第 ${f} 格` : '空弦'}"` : ''}/>`;
      }
    }
    svg += '<g class="fb-marks"></g>';

    el.innerHTML = `<svg class="fretboard ${vertical ? 'is-vertical' : ''} ${opts.onTap ? 'is-live' : ''}" viewBox="0 0 ${W} ${H}"
      style="width:min(100%, ${W}px)" role="${opts.onTap ? 'group' : 'img'}" aria-label="${opts.label || '吉他指板'}">${svg}</svg>`;
    layer = el.querySelector('.fb-marks');
    xy = pos;
    unit = across;
  };
  build();
  const render = () => {
    layer.innerHTML = [...marks.values()].map(({ s, f, kind, label }) => {
      const [x, y] = xy(s, f);
      const r = Math.min(kind === 'dot' ? 9 : 13, unit * 0.46);
      const size = r < 12 && kind !== 'mute' ? ` style="font-size:${Math.max(8, r * 0.95).toFixed(1)}px"` : '';
      return `<g class="fb-mark fb-${kind}"><circle cx="${x}" cy="${y}" r="${r}"/>${label ? `<text x="${x}" y="${y + r * 0.35}"${size}>${label}</text>` : ''}</g>`;
    }).join('');
  };
  const api = {
    mark(s, f, kind, label = '') { marks.set(`${s}:${f}`, { s, f, kind, label }); render(); },
    unmark(s, f) { marks.delete(`${s}:${f}`); render(); },
    clear() { marks.clear(); render(); },
  };
  for (const m of opts.marks || []) marks.set(`${m.s}:${m.f}`, m);
  render();
  if (opts.onTap) {
    el.addEventListener('click', (e) => {
      const hit = e.target.closest('.fb-hit');
      if (hit) opts.onTap(Number(hit.dataset.s), Number(hit.dataset.f));
    });
  }
  if ('ResizeObserver' in window) {
    const ro = new ResizeObserver(() => {
      if (!el.isConnected) { ro.disconnect(); return; }
      const width = Math.min(el.clientWidth || 340, 720);
      if (Math.abs(width - drawnWidth) > 24) { build(); render(); }
    });
    ro.observe(el);
  }
  return api;
}
