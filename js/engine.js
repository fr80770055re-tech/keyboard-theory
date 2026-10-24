// Lesson runner: plays a lesson's five segments (warm-up, new concept, guided
// practice, piece, summary) step by step, grades input and records progress.
import { noteName, notesOfClass, pc, sci } from './notes.js';
import { wait } from './audio.js';
import { CONCEPTS, reviewSteps } from './lessons/concepts.js';

const SEGMENT_NAMES = { warmup: '暖身複習', concept: '新概念', practice: '引導練習', piece: '實際曲目', summary: '總結評分' };

export function starsFor(acc) {
  if (acc >= 0.95) return 3;
  if (acc >= 0.85) return 2;
  if (acc >= 0.7) return 1;
  return 0;
}

export function starsHtml(n, max = 3) {
  return `<span class="stars" aria-label="${n} 顆星">${'★'.repeat(n)}<span class="off">${'★'.repeat(max - n)}</span></span>`;
}

const conceptName = (id) => CONCEPTS[id]?.name || id;

class Aborted extends Error {}

export class LessonRunner {
  constructor({ root, lesson, hub, kb, piano, store, onExit }) {
    Object.assign(this, { root, lesson, hub, kb, piano, store, onExit });
    this.ctrl = new AbortController();
    this.signal = this.ctrl.signal;
    this.segResults = [];
  }

  async run(startSegment = 0) {
    this.#renderShell();
    this.#startPracticeClock();
    try {
      const segs = this.lesson.segments;
      for (let i = startSegment; i < segs.length; i++) {
        this.store.updateLesson(this.lesson.id, { segment: i });
        const result = await this.#runSegment(i);
        this.segResults[i] = result;
        if (segs[i].graded && segs[i].kind !== 'summary') await this.#showSegmentResult(i, result);
      }
      await this.#finish();
    } catch (e) {
      if (!(e instanceof Aborted)) throw e;
    } finally {
      clearInterval(this.clock);
      this.kb.clearMarks();
      this.kb.setLabelMode('c');
    }
  }

  exit() {
    this.ctrl.abort();
    this.onExit();
  }

  // ---------- shell ----------

  #renderShell() {
    this.root.innerHTML = `
      <div class="lesson-head">
        <button class="btn btn-ghost" data-act="exit" title="進度會保留在目前這一段">← 離開</button>
        <div class="seg-track">${this.lesson.segments.map(() => '<div class="seg"></div>').join('')}</div>
        <span class="seg-label"></span>
      </div>
      <div class="card stage"></div>`;
    this.root.querySelector('[data-act="exit"]').onclick = () => this.exit();
    this.stage = this.root.querySelector('.stage');
  }

  #setSegment(i) {
    const seg = this.lesson.segments[i];
    this.root.querySelectorAll('.seg').forEach((el, j) => {
      el.className = `seg ${j < i ? 'done' : j === i ? 'cur' : ''}`;
    });
    this.root.querySelector('.seg-label').textContent =
      `第 ${i + 1}/5 段 · ${SEGMENT_NAMES[seg.kind]} · 約 ${seg.minutes} 分鐘`;
  }

  #startPracticeClock() {
    // Count time only while the page is visible and the learner played recently.
    clearInterval(this.clock);
    this.clock = setInterval(() => {
      if (document.visibilityState === 'visible' && Date.now() - this.hub.lastInputAt < 120000) {
        this.store.logPractice(5);
      }
    }, 5000);
  }

  // ---------- segments ----------

  async #runSegment(i) {
    const seg = this.lesson.segments[i];
    this.#setSegment(i);
    let steps = seg.steps;
    if (seg.kind === 'warmup') {
      const due = this.store.dueConcepts().filter((id) => CONCEPTS[id]).slice(0, 3);
      if (due.length) {
        steps = [
          { type: 'explain', title: '暖身複習', body: `<p>先複習上次比較不熟的地方：<b>${due.map(conceptName).join('、')}</b>。</p><p class="muted">系統會依你的答題紀錄，自動安排要複習的內容。</p>` },
          ...due.flatMap((id) => reviewSteps(id)),
        ];
      }
    }
    const total = { total: 0, right: 0, misses: [] };
    for (const raw of steps) {
      const step = typeof raw === 'function' ? raw() : raw;
      this.kb.clearMarks();
      this.kb.setLabelMode(step.labels || 'c');
      const r = await this[`step_${step.type}`](step, seg);
      if (r && seg.graded) {
        total.total += r.total;
        total.right += r.right;
        total.misses.push(...r.misses);
      }
    }
    this.kb.clearMarks();
    total.acc = total.total ? total.right / total.total : 1;
    total.stars = starsFor(total.acc);
    return total;
  }

  async #showSegmentResult(i, r) {
    const seg = this.lesson.segments[i];
    this.stage.innerHTML = `
      <div class="stage-kicker">${SEGMENT_NAMES[seg.kind]} 完成</div>
      <div class="result-grid">
        <div><div class="result-big">${Math.round(r.acc * 100)}%</div><small>一次就彈對的比例</small></div>
        <div><div class="result-stars">${starsHtml(r.stars)}</div><small>本段星等</small></div>
      </div>
      ${weakHtml(r.misses)}
      <div class="footer-actions"><button class="btn btn-primary btn-lg" data-act="next">下一段：${SEGMENT_NAMES[this.lesson.segments[i + 1].kind]} →</button></div>`;
    await this.#click(this.stage.querySelector('[data-act="next"]'));
  }

  async #finish() {
    const summary = this.segResults[this.segResults.length - 1];
    const stars = summary?.stars ?? 0;
    const prev = this.store.lesson(this.lesson.id);
    const passed = stars >= 1;
    this.store.updateLesson(this.lesson.id, {
      segment: 0,
      completed: prev.completed || passed,
      bestStars: Math.max(prev.bestStars, stars),
      lastStars: stars,
    });
    const allMisses = this.segResults.filter(Boolean).flatMap((r) => r.misses);
    const due = this.store.dueConcepts().filter((id) => CONCEPTS[id]);
    const rows = this.lesson.segments.map((s, i) => {
      const r = this.segResults[i];
      if (!s.graded || !r) return '';
      return `<li>${SEGMENT_NAMES[s.kind]}：${Math.round(r.acc * 100)}% ${starsHtml(r.stars)}</li>`;
    }).join('');
    this.stage.innerHTML = `
      <div class="stage-kicker">第 ${this.lesson.num} 課完成</div>
      <h2>${this.lesson.title}</h2>
      <div class="result-grid">
        <div><div class="result-stars">${starsHtml(stars)}</div><small>總結評分（決定是否解鎖）</small></div>
        <div><div class="result-big">${Math.round((summary?.acc ?? 0) * 100)}%</div><small>總結測驗正確率</small></div>
      </div>
      <p>${passed ? '已解鎖下一課。想拿到 3 顆星，可以隨時重玩總結測驗。' : '需要 <b>1 顆星</b>（正確率 70%）才能解鎖下一課。再試一次總結測驗吧。'}</p>
      ${rows ? `<h3>各段表現</h3><ul>${rows}</ul>` : ''}
      ${weakHtml(allMisses)}
      ${due.length ? `<p class="callout">下次暖身會複習：<b>${due.map(conceptName).join('、')}</b></p>` : ''}
      <div class="footer-actions">
        <button class="btn ${passed ? '' : 'btn-primary'}" data-act="retry">重玩總結測驗</button>
        <button class="btn ${passed ? 'btn-primary' : ''}" data-act="home">回首頁</button>
      </div>`;
    const btn = await Promise.race([
      this.#click(this.stage.querySelector('[data-act="retry"]')).then(() => 'retry'),
      this.#click(this.stage.querySelector('[data-act="home"]')).then(() => 'home'),
    ]);
    if (btn === 'retry') {
      const last = this.lesson.segments.length - 1;
      this.segResults = [];
      return this.run(last);
    }
    this.onExit();
  }

  // ---------- input helpers ----------

  #note() {
    return new Promise((resolve, reject) => {
      if (this.signal.aborted) return reject(new Aborted());
      const onNote = (e) => { cleanup(); resolve(e.detail.note); };
      const onAbort = () => { cleanup(); reject(new Aborted()); };
      const cleanup = () => {
        this.hub.removeEventListener('noteon', onNote);
        this.signal.removeEventListener('abort', onAbort);
      };
      this.hub.addEventListener('noteon', onNote);
      this.signal.addEventListener('abort', onAbort, { once: true });
    });
  }

  #click(el) {
    return new Promise((resolve, reject) => {
      if (this.signal.aborted) return reject(new Aborted());
      const onAbort = () => reject(new Aborted());
      this.signal.addEventListener('abort', onAbort, { once: true });
      el.addEventListener('click', () => {
        this.signal.removeEventListener('abort', onAbort);
        resolve();
      }, { once: true });
      el.focus({ preventScroll: true });
    });
  }

  async #pause(ms) {
    await wait(ms, this.signal);
    if (this.signal.aborted) throw new Aborted();
  }

  #feedback(text, kind = '') {
    const el = this.stage.querySelector('.feedback');
    if (!el) return;
    el.className = `feedback ${kind}`;
    el.textContent = text;
  }

  #demo(notes, opts) {
    return this.piano.playSequence(notes, { ...opts, signal: this.signal });
  }

  // ---------- step types ----------

  async step_explain(step) {
    this.stage.innerHTML = `
      ${step.kicker ? `<div class="stage-kicker">${step.kicker}</div>` : ''}
      <h2>${step.title}</h2>
      <div class="explain-body">${step.body}</div>
      <div class="footer-actions">
        ${step.demo ? '<button class="btn" data-act="demo">▶ 聽示範</button>' : ''}
        <span class="spacer"></span>
        <button class="btn btn-primary" data-act="next">繼續 →</button>
      </div>`;
    for (const [n, kind, text] of step.keys || []) this.kb.mark(n, kind, text);
    const demoBtn = this.stage.querySelector('[data-act="demo"]');
    if (demoBtn) demoBtn.onclick = () => this.#demo(step.demo, { bpm: step.bpm || 80 });
    await this.#click(this.stage.querySelector('[data-act="next"]'));
  }

  async step_free(step) {
    this.stage.innerHTML = `
      <h2>${step.title}</h2>
      <p>${step.body}</p>
      <p class="prompt">剛剛彈的是：<span class="big" data-el="last">—</span></p>
      <div class="footer-actions">
        <span class="timer" data-el="timer"></span><span class="spacer"></span>
        <button class="btn btn-primary" data-act="next">繼續 →</button>
      </div>`;
    const last = this.stage.querySelector('[data-el="last"]');
    const timer = this.stage.querySelector('[data-el="timer"]');
    const onNote = (e) => { last.textContent = `${noteName(e.detail.note)}（${sci(e.detail.note)}）`; };
    this.hub.addEventListener('noteon', onNote, { signal: this.signal });
    let left = step.seconds;
    timer.textContent = `建議至少彈 ${left} 秒`;
    const tick = setInterval(() => {
      left--;
      timer.textContent = left > 0 ? `建議至少彈 ${left} 秒` : '可以繼續了';
      if (left <= 0) clearInterval(tick);
    }, 1000);
    try {
      await this.#click(this.stage.querySelector('[data-act="next"]'));
    } finally {
      clearInterval(tick);
      this.hub.removeEventListener('noteon', onNote);
    }
  }

  // Press target notes one by one ("sequence"), or find every key of one pitch class ("all").
  async step_find(step) {
    if (step.mode === 'all') return this.#findAll(step);
    const targets = step.targets;
    const results = [];
    const misses = [];
    for (let i = 0; i < targets.length; i++) {
      const t = targets[i];
      const promptText = step.promptFor ? step.promptFor(t) : `彈 <span class="big">${noteName(t)}</span>`;
      this.stage.innerHTML = `
        <div class="stage-kicker">${step.kicker || ''}</div>
        <p class="muted">${step.instruction || ''}</p>
        <div class="progress-dots">${targets.map((_, j) => `<i class="${results[j] === undefined ? (j === i ? 'cur' : '') : results[j] ? 'ok' : 'bad'}"></i>`).join('')}</div>
        <p class="prompt">${promptText}</p>
        <p class="feedback"></p>`;
      const matches = (n) => (step.match === 'exact' ? n === t : pc(n) === pc(t));
      const showHint = () => this.kb.mark(t, 'hint', step.finger?.(t) || '');
      if (step.hint === 'show') showHint();
      const hintTimer = step.hint === 'delay' ? setTimeout(showHint, 4000) : null;
      let firstTry = true;
      try {
        for (;;) {
          const n = await this.#note();
          if (matches(n)) {
            this.kb.flash(n, true);
            this.#feedback(`✓ 正確，這是 ${noteName(n)}`, 'ok');
            break;
          }
          firstTry = false;
          this.kb.flash(n, false);
          showHint();
          this.#feedback(`✗ 這是 ${noteName(n)}，正確的鍵已標示出來`, 'bad');
        }
      } finally {
        clearTimeout(hintTimer);
      }
      results.push(firstTry);
      const concept = step.concept?.(t);
      if (concept) this.store.recordConcept(concept, firstTry);
      if (!firstTry) misses.push({ concept, note: t });
      await this.#pause(450);
      this.kb.unmark(t);
    }
    return step.graded === false ? null : { total: targets.length, right: results.filter(Boolean).length, misses };
  }

  async #findAll(step) {
    const targets = notesOfClass(step.pitchClass, this.kb.low, this.kb.high);
    const found = new Set();
    let wrong = 0;
    const render = () => {
      this.stage.querySelector('[data-el="count"]').textContent = `${found.size}/${targets.length}`;
    };
    this.stage.innerHTML = `
      <div class="stage-kicker">${step.kicker || ''}</div>
      <p class="prompt">${step.prompt}（<span data-el="count"></span>）</p>
      <p class="muted">${step.instruction || ''}</p>
      <p class="feedback"></p>`;
    render();
    while (found.size < targets.length) {
      const n = await this.#note();
      if (pc(n) === step.pitchClass) {
        if (!found.has(n)) {
          found.add(n);
          this.kb.mark(n, 'found', '✓');
          this.#feedback(`✓ 找到一個 ${noteName(n)}（${sci(n)}）`, 'ok');
          render();
        }
      } else {
        wrong++;
        this.kb.flash(n, false);
        this.#feedback(`✗ 這是 ${noteName(n)}。${step.tip || ''}`, 'bad');
        if (wrong >= 3) targets.filter((x) => !found.has(x)).forEach((x) => this.kb.mark(x, 'soft'));
      }
    }
    this.#feedback(`✓ 全部找到了！`, 'ok');
    const concept = step.concept;
    if (concept) this.store.recordConcept(concept, wrong === 0);
    await this.#pause(900);
    return { total: targets.length, right: Math.max(0, targets.length - wrong), misses: wrong ? [{ concept, note: targets[0] }] : [] };
  }

  // Ear training: hear a note, find it on the keyboard.
  async step_listen(step) {
    const items = step.items;
    const results = [];
    const misses = [];
    for (let i = 0; i < items.length; i++) {
      const t = items[i];
      this.stage.innerHTML = `
        <div class="stage-kicker">${step.kicker || '聽→彈'}</div>
        <div class="progress-dots">${items.map((_, j) => `<i class="${results[j] === undefined ? (j === i ? 'cur' : '') : results[j] ? 'ok' : 'bad'}"></i>`).join('')}</div>
        <p class="prompt">聽，然後彈出這個音</p>
        <p class="muted">${step.instruction || ''}</p>
        <div class="row"><button class="btn" data-act="replay">▶ 再聽一次</button></div>
        <p class="feedback"></p>`;
      for (const c of step.candidates || []) this.kb.mark(c, 'soft');
      const play = () => this.#demo([t], { bpm: 70 });
      this.stage.querySelector('[data-act="replay"]').onclick = play;
      await this.#pause(400);
      play();
      let tries = 0;
      for (;;) {
        const n = await this.#note();
        if (n === t) {
          this.kb.flash(n, true);
          this.#feedback(`✓ 答對了，是 ${noteName(n)}`, 'ok');
          break;
        }
        tries++;
        this.kb.flash(n, false);
        if (tries >= 2) {
          this.kb.mark(t, 'hint');
          this.#feedback(`✗ 你彈的是 ${noteName(n)}。答案是 ${noteName(t)}，已標示出來`, 'bad');
        } else {
          this.#feedback(`✗ 不是 ${noteName(n)}。比較一下兩個音，再聽一次`, 'bad');
          await this.#pause(500);
          play();
        }
      }
      results.push(tries === 0);
      if (step.concept) this.store.recordConcept(step.concept, tries === 0);
      if (tries) misses.push({ concept: step.concept, note: t });
      await this.#pause(600);
      this.kb.clearMarks();
    }
    return { total: items.length, right: results.filter(Boolean).length, misses };
  }

  // Play a melody in wait mode: the music waits until the right key is pressed.
  async step_melody(step) {
    const notes = step.notes;
    this.stage.innerHTML = `
      <div class="stage-kicker">${step.kicker || ''}</div>
      <h2>${step.title}</h2>
      <p class="muted">${step.instruction || ''}</p>
      <div class="notes-strip">${notes.map((x) => `<div class="note-chip"><b>${noteName(x.n)}</b><span>${x.f ? `${x.f} 指` : ''}</span></div>`).join('')}</div>
      <p class="feedback"></p>
      <div class="footer-actions">
        <button class="btn" data-act="demo">▶ 先聽一次</button>
        <span class="muted">等待模式：彈對了才會往下走，不必趕。</span>
      </div>`;
    const chips = [...this.stage.querySelectorAll('.note-chip')];
    this.stage.querySelector('[data-act="demo"]').onclick = () =>
      this.#demo(notes.map((x) => ({ n: x.n, d: x.d || 1 })), { bpm: step.bpm || 90 });
    const misses = [];
    let right = 0;
    for (let i = 0; i < notes.length; i++) {
      const { n: t, f } = notes[i];
      chips.forEach((c, j) => c.classList.toggle('cur', j === i));
      if (step.hint === 'show') this.kb.mark(t, 'hint', f ? String(f) : '');
      let firstTry = true;
      for (;;) {
        const n = await this.#note();
        if (n === t) { this.kb.flash(n, true); break; }
        firstTry = false;
        this.kb.flash(n, false);
        this.kb.mark(t, 'hint', f ? String(f) : '');
        this.#feedback(`✗ 這是 ${noteName(n)}（${sci(n)}），應該彈 ${noteName(t)}${f ? `，用 ${f} 指` : ''}`, 'bad');
      }
      if (firstTry) { right++; this.#feedback('', ''); } else misses.push({ concept: step.concept, note: t });
      chips[i].classList.add('done');
      if (!firstTry) chips[i].classList.add('miss');
      this.kb.unmark(t);
    }
    chips.forEach((c) => c.classList.remove('cur'));
    if (step.concept) this.store.recordConcept(step.concept, misses.length === 0);
    this.#feedback(misses.length ? `完成！有 ${misses.length} 個音需要再練習（紅框）` : '✓ 完美，一次都沒彈錯！', misses.length ? '' : 'ok');
    await this.#pause(1200);
    return { total: notes.length, right, misses };
  }
}

function weakHtml(misses) {
  if (!misses.length) return '<p class="feedback ok">✓ 這段沒有任何錯誤。</p>';
  const byConcept = new Map();
  for (const m of misses) {
    const key = m.concept ? conceptName(m.concept) : '其他';
    if (!byConcept.has(key)) byConcept.set(key, new Set());
    if (m.note !== undefined) byConcept.get(key).add(noteName(m.note));
  }
  const items = [...byConcept].map(([k, set]) => `<li><b>${k}</b>${set.size ? `：${[...set].join('、')}` : ''}</li>`).join('');
  return `<h3>需要加強</h3><ul class="weak-list">${items}</ul>`;
}
