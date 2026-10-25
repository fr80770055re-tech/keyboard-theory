// Course map. Lessons without a module are listed as "製作中" in the prototype.
// docs/CURRICULUM.md maps every topic (fingering, chords, chord applications)
// to its lesson.
import b1 from './b1.js';
import b2 from './b2.js';
import b3 from './b3.js';
import b4 from './b4.js';
import b5 from './b5.js';
import b6 from './b6.js';
import a3 from './a3.js';
import a5 from './a5.js';
import a6 from './a6.js';
import a7 from './a7.js';
import a8 from './a8.js';
import a9 from './a9.js';

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
    ],
  },
  advanced: {
    name: '進階',
    lessons: [
      { id: 'a1', num: 1, title: '音程：從聽到彈', desc: '二度到八度、大小音程聽辨' },
      { id: 'a2', num: 2, title: '大調與小調', desc: '自然、和聲、旋律小調；關係與同主音大小調' },
      a3,
      { id: 'a4', num: 4, title: '轉位與聲部進行', desc: '原位、第一、第二轉位與平順連接' },
      a5,
      a6,
      a7,
      a8,
      a9,
    ],
  },
};

export const findLesson = (id) =>
  Object.values(TRACKS).flatMap((t) => t.lessons).find((l) => l.id === id);
