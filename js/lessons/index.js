// Course map. Lessons without a module are listed as "製作中" in the prototype.
import b1 from './b1.js';

export const TRACKS = {
  beginner: {
    name: '入門',
    lessons: [
      b1,
      { id: 'b2', num: 2, title: '五指位置與 C 大調五音', desc: 'C 位置五指、F 和 G、簡單旋律' },
      { id: 'b3', num: 3, title: '節奏與拍子', desc: '四分、二分、全音符，節拍器與早/準/晚判定' },
      { id: 'b4', num: 4, title: '認識五線譜', desc: '高音譜號、讀譜，琴鍵提示逐步關閉' },
      { id: 'b5', num: 5, title: 'C 大調音階與穿指', desc: '八個音的音階、拇指穿越' },
      { id: 'b6', num: 6, title: '第一個三和弦與左手低音', desc: 'C、F、G 和弦，低音譜號，大譜表' },
    ],
  },
  advanced: {
    name: '進階',
    lessons: [
      { id: 'a1', num: 1, title: '音程：從聽到彈', desc: '二度到八度、大小音程聽辨' },
      { id: 'a2', num: 2, title: '大調與小調', desc: '自然小調、關係大小調' },
      { id: 'a3', num: 3, title: '七和弦', desc: '大七、屬七、小七和弦' },
      { id: 'a4', num: 4, title: '和弦轉位', desc: '原位、第一、第二轉位與平順連接' },
      { id: 'a5', num: 5, title: '和弦進行', desc: 'I–IV–V–I、卡農進行' },
      { id: 'a6', num: 6, title: '伴奏型', desc: '左手根音＋右手和弦、分解和弦' },
    ],
  },
};

export const findLesson = (id) =>
  Object.values(TRACKS).flatMap((t) => t.lessons).find((l) => l.id === id);
