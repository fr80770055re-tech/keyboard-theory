// Shared building blocks for lesson content: note numbers, a chord table with
// spelled tones and voicings that fit a 25-key keyboard (C3–C5), and helpers.

export const N = {
  C3: 48, Db3: 49, D3: 50, Eb3: 51, E3: 52, F3: 53, Gb3: 54, G3: 55, Ab3: 56, A3: 57, Bb3: 58, B3: 59,
  C4: 60, Db4: 61, D4: 62, Eb4: 63, E4: 64, F4: 65, Gb4: 66, G4: 67, Ab4: 68, A4: 69, Bb4: 70, B4: 71,
  C5: 72,
};

const PC = {
  C: 0, 'C♯': 1, 'D♭': 1, D: 2, 'D♯': 3, 'E♭': 3, E: 4, F: 5, 'F♯': 6, 'G♭': 6, G: 7,
  'G♯': 8, 'A♭': 8, A: 9, 'A♯': 10, 'B♭': 10, B: 11, 'C♭': 11,
};

// Avoid the same item twice in a row so drills don't feel stuck.
export function shuffleDraw(pool, k) {
  const out = [];
  while (out.length < k) {
    const n = pool[Math.floor(Math.random() * pool.length)];
    if (pool.length === 1 || n !== out[out.length - 1]) out.push(n);
  }
  return out;
}

// tones: spelled chord tones, root first. voicing: suggested notes (lowest first).
function chord(sym, tones, voicing, extra = {}) {
  return { sym, tones, pcs: tones.map((t) => PC[t]), voicing, ...extra };
}

// The same chord with a context label (Roman numeral) and/or another voicing.
export const as = (c, roman, extra = {}) => ({ ...c, roman, ...extra });

// Shell voicing: root (left hand, low) + 3rd and 7th. The 5th is optional.
export const shell = (c, voicing, roman) => ({
  ...c, roman, voicing, fingers: undefined, need: [c.pcs[0], c.pcs[1], c.pcs[3]],
});

export const CH = {
  // triads, close voicings around middle C
  C: chord('C', ['C', 'E', 'G'], [N.C4, N.E4, N.G4], { fingers: ['1', '3', '5'] }),
  F: chord('F', ['F', 'A', 'C'], [N.F4, N.A4, N.C5], { fingers: ['1', '3', '5'] }),
  G: chord('G', ['G', 'B', 'D'], [N.G3, N.B3, N.D4], { fingers: ['5', '3', '1'] }),
  Am: chord('Am', ['A', 'C', 'E'], [N.A3, N.C4, N.E4], { fingers: ['5', '3', '1'] }),
  Dm: chord('Dm', ['D', 'F', 'A'], [N.D4, N.F4, N.A4], { fingers: ['1', '3', '5'] }),
  Em: chord('Em', ['E', 'G', 'B'], [N.E4, N.G4, N.B4], { fingers: ['1', '3', '5'] }),
  // inversions for smooth I–IV–V in one hand position
  F_C: chord('F/C', ['F', 'A', 'C'], [N.C4, N.F4, N.A4], { fingers: ['1', '4', '5'] }),
  G_B: chord('G/B', ['G', 'B', 'D'], [N.B3, N.D4, N.G4], { fingers: ['1', '2', '5'] }),
  // seventh chords (close voicings)
  Cmaj7: chord('Cmaj7', ['C', 'E', 'G', 'B'], [N.C4, N.E4, N.G4, N.B4], { fingers: ['1', '2', '3', '5'] }),
  Fmaj7: chord('Fmaj7', ['F', 'A', 'C', 'E'], [N.F3, N.A3, N.C4, N.E4], { fingers: ['5', '3', '2', '1'] }),
  G7: chord('G7', ['G', 'B', 'D', 'F'], [N.G3, N.B3, N.D4, N.F4], { fingers: ['5', '3', '2', '1'] }),
  Dm7: chord('Dm7', ['D', 'F', 'A', 'C'], [N.D4, N.F4, N.A4, N.C5], { fingers: ['1', '2', '3', '5'] }),
  Am7: chord('Am7', ['A', 'C', 'E', 'G'], [N.A3, N.C4, N.E4, N.G4], { fingers: ['5', '3', '2', '1'] }),
  Em7: chord('Em7', ['E', 'G', 'B', 'D'], [N.E3, N.G3, N.B3, N.D4], { fingers: ['5', '3', '2', '1'] }),
  Bm7b5: chord('Bø7', ['B', 'D', 'F', 'A'], [N.B3, N.D4, N.F4, N.A4], { fingers: ['1', '2', '3', '5'] }),
  // borrowed from C minor (modal mixture)
  Fm: chord('Fm', ['F', 'A♭', 'C'], [N.F3, N.Ab3, N.C4], { fingers: ['5', '3', '1'] }),
  Ab: chord('A♭', ['A♭', 'C', 'E♭'], [N.Ab3, N.C4, N.Eb4], { fingers: ['5', '3', '1'] }),
  Bb: chord('B♭', ['B♭', 'D', 'F'], [N.Bb3, N.D4, N.F4], { fingers: ['5', '3', '1'] }),
  Eb: chord('E♭', ['E♭', 'G', 'B♭'], [N.Eb3, N.G3, N.Bb3], { fingers: ['5', '3', '1'] }),
  // secondary dominants
  D7: chord('D7', ['D', 'F♯', 'A', 'C'], [N.D3, N.Gb3, N.A3, N.C4], { fingers: ['5', '3', '2', '1'] }),
  E7: chord('E7', ['E', 'G♯', 'B', 'D'], [N.E3, N.Ab3, N.B3, N.D4], { fingers: ['5', '3', '2', '1'] }),
  A7: chord('A7', ['A', 'C♯', 'E', 'G'], [N.A3, N.Db4, N.E4, N.G4], { fingers: ['5', '3', '2', '1'] }),
  C7: chord('C7', ['C', 'E', 'G', 'B♭'], [N.C4, N.E4, N.G4, N.Bb4], { fingers: ['1', '2', '3', '5'] }),
  // tritone substitutes
  Db7: chord('D♭7', ['D♭', 'F', 'A♭', 'C♭'], [N.Db3, N.F3, N.Ab3, N.B3], { fingers: ['5', '3', '2', '1'] }),
  Ab7: chord('A♭7', ['A♭', 'C', 'E♭', 'G♭'], [N.Ab3, N.C4, N.Eb4, N.Gb4], { fingers: ['5', '3', '2', '1'] }),
  Eb7: chord('E♭7', ['E♭', 'G', 'B♭', 'D♭'], [N.Eb3, N.G3, N.Bb3, N.Db4], { fingers: ['5', '3', '2', '1'] }),
  // diminished: stacked minor thirds
  Bdim: chord('B°', ['B', 'D', 'F'], [N.B3, N.D4, N.F4], { fingers: ['1', '3', '5'] }),
  Bdim7: chord('B°7', ['B', 'D', 'F', 'A♭'], [N.B3, N.D4, N.F4, N.Ab4], { fingers: ['1', '2', '3', '5'] }),
  Csdim7: chord('C♯°7', ['C♯', 'E', 'G', 'B♭'], [N.Db4, N.E4, N.G4, N.Bb4], { fingers: ['1', '2', '3', '5'] }),
  Dsdim7: chord('D♯°7', ['D♯', 'F♯', 'A', 'C'], [N.Eb4, N.Gb4, N.A4, N.C5], { fingers: ['1', '2', '3', '5'] }),
  Fsdim7: chord('F♯°7', ['F♯', 'A', 'C', 'E♭'], [N.Gb3, N.A3, N.C4, N.Eb4], { fingers: ['1', '2', '3', '5'] }),
  Gsdim7: chord('G♯°7', ['G♯', 'B', 'D', 'F'], [N.Ab3, N.B3, N.D4, N.F4], { fingers: ['1', '2', '3', '5'] }),
  // extended chords: left-hand root, right hand 3-5-7-9 or 7-9-3-5 (the 5th is optional)
  Cmaj9: chord('Cmaj9', ['C', 'E', 'G', 'B', 'D'], [N.C3, N.B3, N.D4, N.E4, N.G4], { fingers: ['5', '1', '2', '3', '5'], need: [0, 4, 11, 2] }),
  Am9: chord('Am9', ['A', 'C', 'E', 'G', 'B'], [N.A3, N.C4, N.E4, N.G4, N.B4], { fingers: ['5', '1', '2', '3', '5'], need: [9, 0, 7, 11] }),
  Dm9: chord('Dm9', ['D', 'F', 'A', 'C', 'E'], [N.D3, N.C4, N.E4, N.F4, N.A4], { fingers: ['5', '1', '2', '3', '5'], need: [2, 5, 0, 4] }),
  G9: chord('G9', ['G', 'B', 'D', 'F', 'A'], [N.G3, N.B3, N.F4, N.A4], { fingers: ['5', '1', '3', '5'], need: [7, 11, 5, 9] }),
  Dm11: chord('Dm11', ['D', 'F', 'A', 'C', 'E', 'G'], [N.D3, N.C4, N.F4, N.G4], { fingers: ['5', '1', '3', '4'], need: [2, 5, 0, 7] }),
  Fmaj7s11: chord('Fmaj7♯11', ['F', 'A', 'C', 'E', 'G', 'B'], [N.F3, N.A3, N.E4, N.B4], { fingers: ['5', '1', '3', '5'], need: [5, 9, 4, 11] }),
  G9sus: chord('G9sus4', ['G', 'C', 'D', 'F', 'A'], [N.G3, N.F4, N.A4, N.C5], { fingers: ['5', '1', '2', '4'], need: [7, 0, 5, 9] }),
  G13: chord('G13', ['G', 'B', 'D', 'F', 'A', 'E'], [N.G3, N.B3, N.E4, N.F4, N.A4], { fingers: ['5', '1', '2', '3', '5'], need: [7, 11, 5, 4] }),
};

// The same chord over a given bass (left hand): `low` makes the bass the required lowest note.
export const over = (c, sym, roman, voicing) => ({ ...c, sym, roman, voicing, fingers: undefined, low: voicing[0] % 12 });

// Guide-tone (shell) voicings: left-hand root + right-hand 3rd & 7th, moving by
// the smallest steps. Note G7 and D♭7 share the same right hand (B and F).
export const SHELL = {
  Dm7: shell(CH.Dm7, [N.D3, N.C4, N.F4], 'ii7'),
  G7: shell(CH.G7, [N.G3, N.B3, N.F4], 'V7'),
  Cmaj7: shell(CH.Cmaj7, [N.C3, N.B3, N.E4], 'Imaj7'),
  Db7: shell(CH.Db7, [N.Db3, N.B3, N.F4], '♭II7'),
  A7: shell(CH.A7, [N.A3, N.Db4, N.G4], 'V7/ii'),
  Eb7: shell(CH.Eb7, [N.Eb3, N.Db4, N.G4], 'subV/ii'),
  Fmaj7: shell(CH.Fmaj7, [N.F3, N.A3, N.E4], 'IVmaj7'),
};

// Triads with a required lowest note (`low`, a pitch class): the bass decides
// the name. C = root position, C/E = 1st inversion, C/G = 2nd inversion.
const inv = (c, sym, voicing, fingers) => ({ ...c, sym, voicing, fingers, low: voicing[0] % 12 });
export const INV = {
  C: inv(CH.C, 'C', [N.C4, N.E4, N.G4], ['1', '3', '5']),
  C_E: inv(CH.C, 'C/E', [N.E4, N.G4, N.C5], ['1', '2', '5']),
  C_G: inv(CH.C, 'C/G', [N.G3, N.C4, N.E4], ['1', '3', '5']),
  F: inv(CH.F, 'F', [N.F3, N.A3, N.C4], ['1', '3', '5']),
  F_A: inv(CH.F, 'F/A', [N.A3, N.C4, N.F4], ['1', '2', '5']),
  F_C: inv(CH.F, 'F/C', [N.C4, N.F4, N.A4], ['1', '3', '5']),
  G: inv(CH.G, 'G', [N.G3, N.B3, N.D4], ['1', '3', '5']),
  G_B: inv(CH.G, 'G/B', [N.B3, N.D4, N.G4], ['1', '2', '5']),
  G_D: inv(CH.G, 'G/D', [N.D4, N.G4, N.B4], ['1', '3', '5']),
  Am: inv(CH.Am, 'Am', [N.A3, N.C4, N.E4], ['1', '3', '5']),
  Am_C: inv(CH.Am, 'Am/C', [N.C4, N.E4, N.A4], ['1', '2', '5']),
  Am_E: inv(CH.Am, 'Am/E', [N.E4, N.A4, N.C5], ['1', '3', '5']),
  Dm_F: inv(CH.Dm, 'Dm/F', [N.F3, N.A3, N.D4], ['1', '2', '5']),
  Em_G: inv(CH.Em, 'Em/G', [N.G3, N.B3, N.E4], ['1', '2', '5']),
};

// Scales from A (A3–A4), as note lists. A minor and A major need only sharps,
// so every name on screen is spelled correctly.
export const SCALE = {
  major: [N.A3, N.B3, N.Db4, N.D4, N.E4, N.Gb4, N.Ab4, N.A4],
  natural: [N.A3, N.B3, N.C4, N.D4, N.E4, N.F4, N.G4, N.A4],
  harmonic: [N.A3, N.B3, N.C4, N.D4, N.E4, N.F4, N.Ab4, N.A4],
  melodic: [N.A3, N.B3, N.C4, N.D4, N.E4, N.Gb4, N.Ab4, N.A4],
};
// Fingering for these eight-note scales (same as C major): right hand up
// 1-2-3 | thumb under | 1-2-3-4-5, down the reverse; left hand up 5-4-3-2-1 | 3 over | 2-1.
const RH = [1, 2, 3, 1, 2, 3, 4, 5];
const LH = [5, 4, 3, 2, 1, 3, 2, 1];
export const rhUp = (s) => s.map((n, i) => ({ n, f: RH[i] }));
export const rhDown = (s) => [...s].reverse().map((n, i) => ({ n, f: RH[7 - i] }));
export const lhUp = (s) => s.map((n, i) => ({ n, f: LH[i] }));

// Demo sequence for a list of chords (two beats each).
export const play = (chords, d = 2) => chords.map((c) => ({ n: c.voicing, d }));

export const explain = (kicker, title, body, extra = {}) => ({ type: 'explain', kicker, title, body, ...extra });

// Keyboard marks for showing a chord's voicing in an explanation.
export const marks = (c, kind = 'hint') => c.voicing.map((n, k) => [n, kind, c.fingers?.[k] || c.tones[c.pcs.indexOf(n % 12)]]);
