// Concept bank: every graded item belongs to a concept. Spaced review pulls due
// concepts into the next warm-up using each concept's review() steps.

// Avoid the same note twice in a row so drills don't feel stuck.
export function shuffleDraw(pool, k) {
  const out = [];
  while (out.length < k) {
    const n = pool[Math.floor(Math.random() * pool.length)];
    if (n !== out[out.length - 1]) out.push(n);
  }
  return out;
}

const findNote = (pitchClass, label) => () => ({
  type: 'find',
  kicker: `複習：找 ${label}`,
  instruction: '任何一個八度都可以。',
  targets: shuffleDraw([48, 60, 72].map((c) => c + pitchClass).filter((n) => n <= 72), 3),
  hint: 'delay',
  concept: () => `note-${label}`,
});

export const CONCEPTS = {
  'note-C': { name: '找 C', review: () => [findNote(0, 'C')] },
  'note-D': { name: '找 D', review: () => [findNote(2, 'D')] },
  'note-E': { name: '找 E', review: () => [findNote(4, 'E')] },
  'middle-c': {
    name: '中央 C',
    review: () => [{
      type: 'find', kicker: '複習：中央 C', targets: [60], match: 'exact', hint: 'delay',
      promptFor: () => '彈 <span class="big">中央 C</span>', concept: () => 'middle-c',
    }],
  },
  'ear-CDE': {
    name: '聽辨 C D E',
    review: () => [() => ({
      type: 'listen', kicker: '複習：聽→彈', items: shuffleDraw([60, 62, 64], 3),
      candidates: [60, 62, 64], instruction: '答案在中央 C、D、E 之中（淡藍框）。', concept: 'ear-CDE',
    })],
  },
  'finger-123': {
    name: '右手 1-2-3 指',
    review: () => [{
      type: 'melody', kicker: '複習：指法', title: 'C D E D C', hint: 'show', concept: 'finger-123',
      instruction: '拇指放中央 C，照指號彈。',
      notes: [[60, 1], [62, 2], [64, 3], [62, 2], [60, 1]].map(([n, f]) => ({ n, f })),
    }],
  },
};

export function reviewSteps(id) {
  return CONCEPTS[id]?.review() ?? [];
}
