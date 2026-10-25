// Course map. Lessons without a module are listed as "製作中" in the prototype.
// docs/CURRICULUM.md maps every topic (fingering, chords, chord applications)
// to its lesson.
import b1 from './b1.js';
import b2 from './b2.js';
import b3 from './b3.js';
import b4 from './b4.js';
import b5 from './b5.js';
import b6 from './b6.js';
import b7 from './b7.js';
import a1 from './a1.js';
import a2 from './a2.js';
import a3 from './a3.js';
import a4 from './a4.js';
import a5 from './a5.js';
import a6 from './a6.js';
import a7 from './a7.js';
import a8 from './a8.js';
import a9 from './a9.js';
import a10 from './a10.js';
import a11 from './a11.js';

export const TRACKS = {
  beginner: {
    name: '入門',
    lessons: [
      b1,
      b2,
      b3,
      b4,
      b5,
      b6,
      b7,
    ],
  },
  advanced: {
    name: '進階',
    lessons: [
      a1,
      a2,
      a3,
      a4,
      a5,
      a6,
      a7,
      a8,
      a9,
      a10,
      a11,
    ],
  },
};

export const findLesson = (id) =>
  Object.values(TRACKS).flatMap((t) => t.lessons).find((l) => l.id === id);
