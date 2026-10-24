// Progress persisted in localStorage: settings, calibration, lesson progress,
// per-concept mastery (Leitner boxes for spaced review) and daily practice time.

const KEY = 'keyboard-theory.v1';
// Days until the next review, by Leitner box (1..5).
const BOX_INTERVAL = [0, 1, 2, 4, 7, 14];

const fresh = () => ({
  version: 1,
  level: null, // 'beginner' | 'advanced'
  settings: { echo: true, solfege: false },
  calibration: {}, // deviceName -> { physLow, physHigh, offset }
  lessons: {}, // lessonId -> { segment, bestStars, completed, lastStars }
  concepts: {}, // conceptId -> { box, due, seen, right }
  practice: {}, // 'YYYY-MM-DD' -> seconds
});

export const today = (d = new Date()) => {
  const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return z.toISOString().slice(0, 10);
};
const addDays = (iso, days) => {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + days);
  return today(d);
};

class Store {
  constructor() {
    this.data = fresh();
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) this.data = { ...fresh(), ...JSON.parse(raw) };
    } catch { /* storage unavailable: run in memory */ }
  }

  save() {
    try { localStorage.setItem(KEY, JSON.stringify(this.data)); } catch { /* ignore */ }
  }

  get settings() { return this.data.settings; }
  setSetting(k, v) { this.data.settings[k] = v; this.save(); }

  get level() { return this.data.level; }
  setLevel(l) { this.data.level = l; this.save(); }

  calibrationFor(device) { return this.data.calibration[device] || null; }
  setCalibration(device, cal) { this.data.calibration[device] = cal; this.save(); }

  lesson(id) {
    return this.data.lessons[id] || { segment: 0, bestStars: 0, completed: false, lastStars: null };
  }
  updateLesson(id, patch) {
    this.data.lessons[id] = { ...this.lesson(id), ...patch };
    this.save();
  }

  recordConcept(id, right) {
    const c = this.data.concepts[id] || { box: 1, due: today(), seen: 0, right: 0 };
    c.seen++;
    if (right) { c.right++; c.box = Math.min(5, c.box + 1); } else { c.box = 1; }
    c.due = addDays(today(), BOX_INTERVAL[c.box]);
    this.data.concepts[id] = c;
    this.save();
  }

  // Concepts due for review, weakest first.
  dueConcepts() {
    const t = today();
    return Object.entries(this.data.concepts)
      .filter(([, c]) => c.due <= t)
      .sort((a, b) => a[1].box - b[1].box)
      .map(([id]) => id);
  }

  logPractice(seconds) {
    const t = today();
    this.data.practice[t] = (this.data.practice[t] || 0) + seconds;
    this.save();
  }

  practiceOn(iso) { return this.data.practice[iso] || 0; }

  streak() {
    let d = today();
    if (!this.practiceOn(d)) d = addDays(d, -1); // today not practiced yet doesn't break it
    let n = 0;
    while (this.practiceOn(d) > 0) { n++; d = addDays(d, -1); }
    return n;
  }

  totalMinutesLast(days) {
    let s = 0;
    for (let i = 0; i < days; i++) s += this.practiceOn(addDays(today(), -i));
    return Math.round(s / 60);
  }

  export() {
    const blob = new Blob([JSON.stringify(this.data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `鍵上樂理-進度-${today()}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  async import(file) {
    const parsed = JSON.parse(await file.text());
    if (!parsed || parsed.version !== 1) throw new Error('格式不符');
    this.data = { ...fresh(), ...parsed };
    this.save();
  }

  reset() { this.data = fresh(); this.save(); }
}

export { addDays };
export const store = new Store();
