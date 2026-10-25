// Staff notation, drawn with VexFlow (loaded from the CDN the first time a
// lesson needs it). Notes are { n, d }: n = MIDI number (null = rest, array =
// chord), d = length in beats (4 whole, 2 half, 1 quarter, 0.5 eighth, 1.5 / 3 dotted).

const SRC = 'https://cdn.jsdelivr.net/npm/vexflow@5.0.0/build/cjs/vexflow.js';
const NAMES = ['c', 'c#', 'd', 'd#', 'e', 'f', 'f#', 'g', 'g#', 'a', 'a#', 'b'];
const DUR = { 4: 'w', 3: 'hd', 2: 'h', 1.5: 'qd', 1: 'q', 0.5: '8', 0.25: '16' };

let loading = null;
export function loadVexFlow() {
  if (window.VexFlow) return Promise.resolve(window.VexFlow);
  loading ||= new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = SRC;
    s.onload = () => resolve(window.VexFlow);
    s.onerror = () => { loading = null; reject(new Error('無法載入五線譜元件')); };
    document.head.appendChild(s);
  });
  return loading;
}

const vfKey = (n) => `${NAMES[n % 12]}/${Math.floor(n / 12) - 1}`;
export const clefFor = (notes) => (notes.some((x) => x.n !== null && [].concat(x.n).some((m) => m < 57)) ? 'bass' : 'treble');

function staveNote(VF, x, clef) {
  const dur = DUR[x.d ?? 1] || 'q';
  const rest = x.n === null || x.n === undefined;
  const ns = rest ? [] : [].concat(x.n);
  // On the one-line rhythm staff, f/5 lands exactly on its only line.
  const keys = clef === 'rhythm' ? ['f/5'] : rest ? [clef === 'bass' ? 'd/3' : 'b/4'] : ns.map(vfKey);
  const note = new VF.StaveNote({
    keys,
    duration: dur.replace('d', '') + (rest ? 'r' : ''),
    clef: clef === 'rhythm' ? 'treble' : clef,
    ...(clef === 'rhythm' ? { stemDirection: 1 } : { autoStem: true }),
  });
  if (dur.includes('d')) VF.Dot.buildAndAttach([note], { all: true });
  if (!rest && clef !== 'rhythm') {
    ns.forEach((m, i) => { if (NAMES[m % 12].includes('#')) note.addModifier(new VF.Accidental('#'), i); });
  }
  return note;
}

// Draws one staff into el. opts: clef ('treble' | 'bass' | 'rhythm' for a
// one-line rhythm staff), time ('4/4' or null), states: per-note class names
// ('cur' | 'done' | 'miss'), label (aria label).
export async function drawStaff(el, notes, opts = {}) {
  const VF = await loadVexFlow();
  const clef = opts.clef || clefFor(notes);
  const width = Math.max(260, 110 + notes.reduce((w, x) => w + 30 + (x.d ?? 1) * 14, 0));
  const height = clef === 'rhythm' ? 100 : 140;
  el.innerHTML = '';
  el.setAttribute('role', 'img');
  if (opts.label) el.setAttribute('aria-label', opts.label);
  const renderer = new VF.Renderer(el, VF.Renderer.Backends.SVG);
  renderer.resize(width, height);
  const ctx = renderer.getContext();
  const stave = clef === 'rhythm'
    ? new VF.Stave(8, 18, width - 16, { numLines: 1 })
    : new VF.Stave(8, 18, width - 16);
  if (clef !== 'rhythm') stave.addClef(clef);
  if (opts.time && clef !== 'rhythm') stave.addTimeSignature(opts.time);
  stave.setContext(ctx).draw();
  const vfNotes = notes.map((x) => staveNote(VF, x, clef));
  const voice = new VF.Voice({ numBeats: 4, beatValue: 4 }).setMode(VF.Voice.Mode.SOFT);
  voice.addTickables(vfNotes);
  const beams = VF.Beam.generateBeams(vfNotes.filter((_, i) => (notes[i].d ?? 1) < 1 && notes[i].n !== null));
  new VF.Formatter().joinVoices([voice]).format([voice], width - (clef === 'rhythm' ? 60 : 110));
  voice.draw(ctx, stave);
  beams.forEach((b) => b.setContext(ctx).draw());
  // Bar lines every 4 beats (the voice is free-running, so draw them ourselves).
  const top = stave.getYForLine(0) - (clef === 'rhythm' ? 12 : 0);
  const bottom = clef === 'rhythm' ? stave.getYForLine(0) + 12 : stave.getYForLine(4);
  let beat = 0;
  notes.forEach((x, i) => {
    beat += x.d ?? 1;
    if (beat % 4 !== 0 || i === notes.length - 1) return;
    const bx = (vfNotes[i].getAbsoluteX() + vfNotes[i + 1].getAbsoluteX()) / 2 + 4;
    ctx.beginPath(); ctx.moveTo(bx, top); ctx.lineTo(bx, bottom); ctx.stroke();
  });
  const svg = el.querySelector('svg');
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.removeAttribute('width');
  svg.removeAttribute('height');
  svg.style.width = `min(100%, ${width * (opts.scale || 1.25)}px)`;
  svg.setAttribute('aria-hidden', 'true');
  (opts.states || []).forEach((cls, i) => { if (cls) vfNotes[i]?.getSVGElement?.()?.classList.add(cls); });
  return { notes: vfNotes };
}

// Update highlight classes without redrawing.
export function markStaff(drawn, states) {
  drawn.notes.forEach((n, i) => {
    const g = n.getSVGElement?.();
    if (!g) return;
    g.classList.remove('cur', 'done', 'miss');
    if (states[i]) g.classList.add(states[i]);
  });
}
