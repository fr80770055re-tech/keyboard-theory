// Lesson runner: plays a lesson's five segments (warm-up, new concept, guided
// practice, piece, summary) step by step, grades input and records progress.
// Also runs the standalone daily review, a one-segment "lesson".
import { addDays, today } from './store.js';
import { fullName, letter, noteName, notesOfClass, octaveMiss, pc, sci, setNotation, usesOctaveNumbers } from './notes.js';
import { wait } from './audio.js';
import { icon, star } from './icons.js';
import { CONCEPTS, reviewSteps } from './lessons/concepts.js';

export const SEGMENT_NAMES = {
  warmup: '暖身複習', concept: '新概念', practice: '引導練習', piece: '實際曲目', summary: '總結評分', review: '今日複習',
};

export function starsFor(acc) {
  acc = Math.round(acc * 100) / 100; // grade on the same percentage the learner sees
  if (acc >= 0.95) return 3;
  if (acc >= 0.85) return 2;
  if (acc >= 0.7) return 1;
  return 0;
}

export function starsHtml(n, max = 3, cls = '') {
  let s = '';
  for (let i = 0; i < max; i++) s += star(i < n);
  return `<span class="stars ${cls}" role="img" aria-label="${n} 顆星（滿分 ${max}）">${s}</span>`;
}

const conceptName = (id) => CONCEPTS[id]?.name || id;

class Aborted extends Error {}

export class LessonRunner {
  constructor({ root, lesson, hub, kb, piano, store, onExit, nextLesson = null }) {
    Object.assign(this, { root, lesson, hub, kb, piano, store, onExit, nextLesson });
    this.ctrl = new AbortController();
    this.signal = this.ctrl.signal;
    this.segResults = [];
    this.current = 0; // segment index in progress
    this.dirty = false; // has the learner done anything in this segment yet?
    hub.addEventListener('noteon', () => { this.dirty = true; }, { signal: this.signal });
  }

  async run(startSegment = 0) {
    setNotation(this.lesson.notation || 'friendly');
    this.#renderShell();
    this.#startPracticeClock();
    // Results of earlier segments survive leaving and resuming, so the lesson's
    // stars can reflect the whole lesson.
    if (!this.lesson.isReview) {
      const saved = this.store.lesson(this.lesson.id).segResults || [];
      this.segResults = startSegment > 0 ? saved.slice(0, startSegment) : [];
    }
    try {
      const segs = this.lesson.segments;
      for (let i = startSegment; i < segs.length; i++) {
        if (!this.lesson.isReview) this.store.updateLesson(this.lesson.id, { segment: i });
        this.current = i;
        this.dirty = false;
        this.atResult = false;
        const result = await this.#runSegment(i);
        // The segment is saved from here on: leaving now loses nothing.
        this.dirty = false;
        if (!this.lesson.isReview && i + 1 < segs.length) this.store.updateLesson(this.lesson.id, { segment: i + 1 });
        this.segResults[i] = result;
        if (this.lesson.isReview) return await this.#finishReview(result);
        this.store.markDay('segment');
        if (segs[i].graded) {
          const keep = this.segResults.map((r) => r && { acc: r.acc, total: r.total, right: r.right });
          this.store.updateLesson(this.lesson.id, { segResults: keep });
        }
        if (segs[i].graded && segs[i].kind !== 'summary') await this.#showSegmentResult(i, result);
      }
      await this.#finish();
    } catch (e) {
      if (!(e instanceof Aborted)) throw e;
    } finally {
      clearInterval(this.clock);
      setNotation('friendly');
      this.kb.clearMarks();
      this.kb.setLabelMode('c');
    }
  }

  exit() {
    this.ctrl.abort();
    this.onExit();
  }

  // Leaving mid-segment restarts that segment next time, so say so before it
  // happens. Nothing to lose (segment untouched, or on a result screen): just go.
  requestExit(after, { ask = false } = {}) {
    const leave = () => { this.exit(); after?.(); };
    if (!ask && (!this.dirty || this.atResult)) return leave();
    const dlg = document.getElementById('leave');
    const seg = this.lesson.segments[this.current];
    dlg.querySelector('#leave-msg').innerHTML = !this.dirty || this.atResult
      ? '目前沒有會遺失的進度。'
      : this.lesson.isReview
      ? '今日複習還沒做完，離開後下次要從頭開始。'
      : `「<b>${SEGMENT_NAMES[seg.kind]}</b>」這一段還沒做完，離開後下次會從這一段的開頭重來${this.current > 0 ? `；前面完成的 ${this.current} 段都已保存` : ''}。`;
    // Esc or 繼續上課 just closes; only 離開 leaves.
    dlg.querySelector('[data-choice="stay"]').onclick = () => dlg.close();
    dlg.querySelector('[data-choice="leave"]').onclick = () => { dlg.close(); leave(); };
    dlg.showModal();
  }

  // ---------- shell ----------

  #renderShell() {
    const segs = this.lesson.segments;
    const name = this.lesson.isReview ? this.lesson.title : `第 ${this.lesson.num} 課　${this.lesson.title}`;
    this.root.innerHTML = `
      <div class="lesson-head">
        <button class="btn btn-ghost btn-icon-text" data-act="exit" title="已完成的段落會保存；目前這一段若沒做完，下次會從頭開始">${icon.back()}離開</button>
        <h1 class="lesson-name">${name}</h1>
      </div>
      <div class="seg-row">
        ${segs.length > 1 ? `<ol class="seg-track" aria-label="課程進度">${segs.map((s) => `<li class="seg"><span>${SEGMENT_NAMES[s.kind]}</span></li>`).join('')}</ol>` : ''}
        <span class="seg-label"></span>
      </div>
      <section class="stage" aria-labelledby="stage-title"></section>`;
    this.root.querySelector('[data-act="exit"]').onclick = () => this.requestExit();
    this.stage = this.root.querySelector('.stage');
  }

  #setSegment(i, allDone = false) {
    const seg = this.lesson.segments[i];
    this.root.querySelectorAll('.seg').forEach((el, j) => {
      el.className = `seg ${allDone || j < i ? 'done' : j === i ? 'cur' : ''}`;
      if (j === i && !allDone) el.setAttribute('aria-current', 'step'); else el.removeAttribute('aria-current');
    });
    const label = this.root.querySelector('.seg-label');
    if (allDone) label.textContent = '全部完成';
    else if (this.lesson.isReview) label.textContent = `約 ${seg.minutes} 分鐘`;
    else label.textContent = `第 ${i + 1}/${this.lesson.segments.length} 段 · 約 ${seg.minutes} 分鐘`;
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
          { type: 'explain', title: '先複習上次不熟的地方', body: `<p>今天的暖身：<b>${due.map(conceptName).join('、')}</b>。</p><p class="muted">系統依你的答題紀錄自動安排複習：答錯的概念很快會再出現，答對的會隔越來越久。</p>` },
          ...due.flatMap((id) => reviewSteps(id)),
        ];
      }
    }
    const total = { total: 0, right: 0, misses: [] };
    for (const raw of steps) {
      document.body.classList.remove('result-mode');
      const step = typeof raw === 'function' ? raw() : raw;
      // Reading steps get a smaller keyboard so the text has room on laptops.
      document.body.classList.toggle('step-read', step.type === 'explain');
      this.kb.clearMarks();
      this.kb.setLabelMode(step.labels || 'c');
      const r = await this[`step_${step.type}`](step, seg);
      this.dirty = true;
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
    const next = SEGMENT_NAMES[this.lesson.segments[i + 1].kind];
    const c = seg.celebrate;
    this.stage.innerHTML = `
      <div class="result ${c ? 'result-celebrate' : ''}">
        ${c ? `<div class="staff-rule" aria-hidden="true"></div>` : ''}
        <h2 id="stage-title">${c ? c.title : `${SEGMENT_NAMES[seg.kind]}完成`}</h2>
        ${c ? `<p class="lead">${c.body}</p>` : ''}
        ${pctHtml(r.acc)}
        ${weakHtml(r.misses)}
        <p class="muted small">各段的正確率會一起算進這一課的星等。</p>
        <div class="footer-actions">
          ${c ? `<button class="btn" data-act="replay">${icon.play()}聽一次這首曲子</button>` : ''}
          <span class="spacer"></span>
          <button class="btn btn-primary btn-lg" data-act="next">下一段：${next}${icon.next()}</button>
        </div>
      </div>`;
    const replay = this.stage.querySelector('[data-act="replay"]');
    if (replay) replay.onclick = () => this.#demo(c.song, { bpm: c.bpm || 100 });
    this.#showResultTop();
    await this.#click(this.stage.querySelector('[data-act="next"]'), true, false);
  }

  async #finish() {
    const segs = this.lesson.segments;
    const summary = this.segResults[segs.length - 1];
    // Stars measure the whole lesson: guided practice, the piece and the summary
    // quiz weigh equally. The summary quiz alone decides unlocking (70%).
    const graded = segs.map((s, i) => (s.graded ? this.segResults[i] : null)).filter(Boolean);
    const mastery = graded.reduce((sum, r) => sum + r.acc, 0) / (graded.length || 1);
    const stars = starsFor(mastery);
    const passed = (summary?.acc ?? 0) >= 0.7;
    const prev = this.store.lesson(this.lesson.id);
    this.store.updateLesson(this.lesson.id, {
      segment: 0,
      completed: prev.completed || passed,
      bestStars: passed ? Math.max(prev.bestStars, stars) : prev.bestStars,
      lastStars: stars,
    });
    this.#setSegment(segs.length - 1, true);
    const allMisses = this.segResults.filter(Boolean).flatMap((r) => r.misses || []);
    const due = this.store.dueBy(addDays(today(), 1)).filter((id) => CONCEPTS[id]).slice(0, 3);
    const rows = segs.map((s, i) => {
      const r = this.segResults[i];
      if (!s.graded || !r) return '';
      return `<tr><th scope="row">${SEGMENT_NAMES[s.kind]}</th><td>${Math.round(r.acc * 100)}%</td></tr>`;
    }).join('');
    const nextLine = !passed
      ? `總結測驗 ${Math.round((summary?.acc ?? 0) * 100)}%，還差一點：達到 <b>70%</b> 就能解鎖下一課。再挑戰一次只要 5 分鐘。`
      : this.nextLesson?.segments
        ? `已解鎖第 ${this.nextLesson.num} 課〈${this.nextLesson.title}〉。`
        : `第 ${this.lesson.num + 1} 課製作中。在那之前，每天回來做 5 分鐘的「今日複習」，把今天學的記牢，也讓連續天數一直往上加。`;
    this.stage.innerHTML = `
      <div class="result result-final">
        <div class="staff-rule" aria-hidden="true"></div>
        <h2 id="stage-title">第 ${this.lesson.num} 課完成</h2>
        <div class="result-score">
          ${starsHtml(stars, 3, 'stars-xl pop')}
          <p class="result-pct">整課掌握度 <b>${Math.round(mastery * 100)}%</b></p>
        </div>
        <table class="seg-table"><tbody>${rows}</tbody></table>
        <p class="muted small">星等＝引導練習、實際曲目、總結測驗三段正確率的平均（95% 三顆、85% 兩顆、70% 一顆）。</p>
        <p>${nextLine}</p>
        ${allMisses.length ? `<details class="details"><summary>需要加強的地方</summary>${weakHtml(allMisses)}</details>` : ''}
        ${due.length ? `<p class="callout">${icon.replay()}<span>明天的今日複習會出現：<b>${due.map(conceptName).join('、')}</b></span></p>` : ''}
        <div class="footer-actions">
          <button class="btn ${passed ? '' : 'btn-primary'}" data-act="retry">${passed ? '重做總結測驗' : '再挑戰總結測驗'}</button>
          <span class="spacer"></span>
          <button class="btn ${passed ? 'btn-primary' : ''}" data-act="home">回首頁</button>
        </div>
      </div>`;
    this.#showResultTop();
    const btn = await Promise.race([
      this.#click(this.stage.querySelector('[data-act="retry"]'), !passed, false).then(() => 'retry'),
      this.#click(this.stage.querySelector('[data-act="home"]'), passed, false).then(() => 'home'),
    ]);
    if (btn === 'retry') return this.run(segs.length - 1);
    this.onExit();
  }

  async #finishReview(r) {
    this.store.markDay('review');
    this.#setSegment(0, true);
    const streak = this.store.streak();
    this.stage.innerHTML = `
      <div class="result">
        <div class="staff-rule" aria-hidden="true"></div>
        <h2 id="stage-title">今天的複習完成了</h2>
        <p class="lead">連續練習 <b>${streak}</b> 天。${streak >= 2 ? '保持下去，記憶會越來越穩。' : '明天再回來，連續天數就會開始累積。'}</p>
        ${pctHtml(r.acc)}
        ${weakHtml(r.misses)}
        <p class="muted small">答錯的概念明天會再出現；答對的會隔越來越久才複習。</p>
        <div class="footer-actions"><span class="spacer"></span><button class="btn btn-primary" data-act="home">回首頁</button></div>
      </div>`;
    this.#showResultTop();
    await this.#click(this.stage.querySelector('[data-act="home"]'), true, false);
    this.onExit();
  }

  // ---------- input helpers ----------

  #note() {
    return new Promise((resolve, reject) => {
      if (this.signal.aborted) return reject(new Aborted());
      const onNote = (e) => {
        if (document.querySelector('dialog[open]')) return; // paused behind a dialog
        cleanup();
        resolve(e.detail.note);
      };
      const onAbort = () => { cleanup(); reject(new Aborted()); };
      const cleanup = () => {
        this.hub.removeEventListener('noteon', onNote);
        this.signal.removeEventListener('abort', onAbort);
      };
      this.hub.addEventListener('noteon', onNote);
      this.signal.addEventListener('abort', onAbort, { once: true });
    });
  }

  #click(el, focus = true, reveal = true) {
    return new Promise((resolve, reject) => {
      if (this.signal.aborted) return reject(new Aborted());
      const onAbort = () => reject(new Aborted());
      this.signal.addEventListener('abort', onAbort, { once: true });
      el.addEventListener('click', () => {
        this.signal.removeEventListener('abort', onAbort);
        resolve();
      }, { once: true });
      if (focus) {
        el.focus({ preventScroll: true });
        if (reveal) el.scrollIntoView({ block: 'nearest' });
      }
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
    const ic = kind === 'ok' ? icon.check() : kind === 'bad' ? icon.cross() : '';
    el.innerHTML = text ? `${ic}<span>${text}</span>` : '';
    const lead = kind === 'bad' ? '錯。' : kind === 'ok' && !/^(正確|答對|完美|找到|全部)/.test(text) ? '對。' : '';
    if (text) this.#announce(`${lead}${text}`);
  }

  // The stage is re-rendered for every question, so screen readers would hear
  // nothing. A single live region outside it speaks each prompt and result.
  #announce(html) {
    const el = document.getElementById('sr-live');
    if (!el) return;
    const text = String(html).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    el.textContent = '';
    clearTimeout(this.announceTimer);
    // Clearing first lets the same sentence be announced twice in a row.
    this.announceTimer = setTimeout(() => { el.textContent = text; }, 60);
  }

  // Result screens are the payoff: nothing is played, so the keyboard steps
  // aside and the heading and stars stay in view.
  #showResultTop() {
    this.atResult = true;
    document.body.classList.add('result-mode');
    this.root.scrollTo(0, 0);
    this.#announceResult();
  }

  // Speak a result screen: its heading and score line.
  #announceResult() {
    const parts = ['h2', '.lead', '.result-pct'].map((s) => this.stage.querySelector(s)?.textContent).filter(Boolean);
    const stars = this.stage.querySelector('.stars')?.getAttribute('aria-label');
    this.#announce([...parts, stars].filter(Boolean).join('。'));
  }

  #demo(notes, opts) {
    return this.piano.playSequence(notes, { ...opts, signal: this.signal });
  }

  // Heading for a step: the step's own title, with its kind (e.g. "練習 1：有提示") as a line below.
  #head(step, fallback = '') {
    const title = step.title || step.kicker || fallback;
    const sub = step.title && step.kicker ? step.kicker : '';
    return `<h2 id="stage-title">${title}</h2>${sub ? `<p class="sub">${sub}</p>` : ''}`;
  }

  #dots(results, i, count) {
    return `<ol class="progress-dots" aria-label="第 ${i + 1} 題，共 ${count} 題">${Array.from({ length: count }, (_, j) => {
      const r = results[j];
      const cls = r === undefined ? (j === i ? 'cur' : '') : r ? 'ok' : 'bad';
      const ic = r === undefined ? '' : r ? icon.check() : icon.cross();
      return `<li class="${cls}">${ic}</li>`;
    }).join('')}</ol>`;
  }

  // ---------- step types ----------

  async step_explain(step) {
    this.stage.innerHTML = `
      ${this.#head(step)}
      <div class="explain-body">${step.body}</div>
      <div class="footer-actions">
        ${step.demo ? `<button class="btn" data-act="demo">${icon.play()}聽示範</button>` : ''}
        <span class="spacer"></span>
        <button class="btn btn-primary" data-act="next">繼續${icon.next()}</button>
      </div>`;
    for (const [n, kind, text] of step.keys || []) this.kb.mark(n, kind, text);
    this.#announce(`${step.title}。${step.body}`);
    const demoBtn = this.stage.querySelector('[data-act="demo"]');
    if (demoBtn) demoBtn.onclick = () => this.#demo(step.demo, { bpm: step.bpm || 80 });
    await this.#click(this.stage.querySelector('[data-act="next"]'));
  }

  async step_free(step) {
    this.stage.innerHTML = `
      ${this.#head(step)}
      <p>${step.body}</p>
      <p class="prompt" aria-live="polite">剛剛彈的是 <span class="big" data-el="last">—</span></p>
      <div class="footer-actions">
        <span class="timer" data-el="timer"></span><span class="spacer"></span>
        <button class="btn btn-primary" data-act="next">繼續${icon.next()}</button>
      </div>`;
    const last = this.stage.querySelector('[data-el="last"]');
    const timer = this.stage.querySelector('[data-el="timer"]');
    this.#announce(`${step.title}。${step.body}`);
    const onNote = (e) => { last.textContent = fullName(e.detail.note); };
    this.hub.addEventListener('noteon', onNote, { signal: this.signal });
    let left = step.seconds;
    timer.textContent = `建議至少彈 ${left} 秒`;
    const tick = setInterval(() => {
      left--;
      timer.textContent = left > 0 ? `建議至少彈 ${left} 秒` : '可以繼續了';
      if (left <= 0) clearInterval(tick);
    }, 1000);
    try {
      await this.#click(this.stage.querySelector('[data-act="next"]'), false);
    } finally {
      clearInterval(tick);
      this.hub.removeEventListener('noteon', onNote);
    }
  }

  // Press target notes one by one ("sequence"), or find every key of one pitch class ("all").
  async step_find(step) {
    if (step.mode === 'all') return this.#findAll(step);
    const targets = step.targets;
    const exact = step.match === 'exact';
    const results = [];
    const misses = [];
    for (let i = 0; i < targets.length; i++) {
      const t = targets[i];
      const promptText = step.promptFor ? step.promptFor(t) : `彈 <span class="big">${noteName(t)}</span>`;
      this.stage.innerHTML = `
        ${this.#head(step, '找音')}
        ${step.instruction ? `<p class="muted">${step.instruction}</p>` : ''}
        ${this.#dots(results, i, targets.length)}
        <p class="prompt">${promptText}</p>
        <p class="feedback"></p>`;
      this.#announce(`第 ${i + 1} 題，共 ${targets.length} 題。${promptText}。${i === 0 ? step.instruction || '' : ''}`);
      const matches = (n) => (exact ? n === t : pc(n) === pc(t));
      // The lit key carries its letter so the learner reads the name, not just the light.
      const showHint = () => {
        this.kb.mark(t, 'hint', step.finger?.(t) || letter(t));
        this.kb.cue([{ n: t, label: letter(t) }]);
      };
      if (step.hint === 'show') showHint();
      const hintTimer = step.hint === 'delay' ? setTimeout(showHint, 4000) : null;
      let firstTry = true;
      try {
        for (;;) {
          const n = await this.#note();
          if (matches(n)) {
            this.kb.flash(n, true);
            this.#feedback(`正確，這是 ${exact ? fullName(n) : noteName(n)}`, 'ok');
            break;
          }
          firstTry = false;
          this.kb.flash(n, false);
          showHint();
          if (exact && octaveMiss(n, t)) {
            this.#feedback(`${octaveMiss(n, t)}，已標示出來`, 'bad');
          } else {
            this.#feedback(`這是 ${noteName(n)}，正確的鍵已標示出來`, 'bad');
          }
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
      this.kb.cue([]);
    }
    return step.graded === false ? null : { total: targets.length, right: results.filter(Boolean).length, misses };
  }

  async #findAll(step) {
    const targets = notesOfClass(step.pitchClass, this.kb.low, this.kb.high);
    const found = new Set();
    let wrong = 0;
    this.stage.innerHTML = `
      ${this.#head(step, '動手找')}
      <p class="prompt">${step.prompt}<span class="count" data-el="count"></span></p>
      ${step.instruction ? `<p class="muted">${step.instruction}</p>` : ''}
      <p class="feedback"></p>`;
    const render = () => {
      this.stage.querySelector('[data-el="count"]').textContent = `${found.size} / ${targets.length}`;
    };
    this.#announce(`${step.prompt}，共 ${targets.length} 個。${step.instruction || ''}`);
    render();
    while (found.size < targets.length) {
      const n = await this.#note();
      if (pc(n) === step.pitchClass) {
        if (!found.has(n)) {
          found.add(n);
          this.kb.mark(n, 'found');
          this.#feedback(usesOctaveNumbers() ? `找到一個 ${noteName(n)}（${sci(n)}）` : `找到一個 ${noteName(n)}`, 'ok');
          render();
        }
      } else {
        wrong++;
        this.kb.flash(n, false);
        this.#feedback(`這是 ${noteName(n)}。${step.tip || ''}`, 'bad');
        if (wrong >= 3) targets.filter((x) => !found.has(x)).forEach((x) => this.kb.mark(x, 'soft'));
      }
    }
    this.#feedback('全部找到了', 'ok');
    const concept = step.concept;
    if (concept) this.store.recordConcept(concept, wrong === 0);
    await this.#pause(900);
    // Accuracy = correct presses / all presses.
    return { total: targets.length + wrong, right: targets.length, misses: wrong ? [{ concept, note: targets[0] }] : [] };
  }

  // Ear training: hear a note, find it on the keyboard.
  async step_listen(step) {
    const items = step.items;
    const results = [];
    const misses = [];
    for (let i = 0; i < items.length; i++) {
      const t = items[i];
      this.stage.innerHTML = `
        ${this.#head(step, '聽→彈')}
        ${this.#dots(results, i, items.length)}
        <p class="prompt"><span class="prompt-icon">${icon.ear()}</span>聽，然後彈出這個音</p>
        ${step.instruction ? `<p class="muted">${step.instruction}</p>` : ''}
        <div class="row"><button class="btn" data-act="replay">${icon.replay()}再聽一次</button></div>
        <p class="feedback"></p>`;
      for (const c of step.candidates || []) this.kb.mark(c, 'soft');
      this.#announce(`第 ${i + 1} 題，共 ${items.length} 題。聽，然後彈出這個音。${i === 0 ? step.instruction || '' : ''}按 L 可以再聽一次。`);
      const play = () => this.#demo([t], { bpm: 70 });
      this.stage.querySelector('[data-act="replay"]').onclick = play;
      await this.#pause(400);
      play();
      let tries = 0;
      for (;;) {
        const n = await this.#note();
        if (n === t) {
          this.kb.flash(n, true);
          this.#feedback(`答對了，是 ${fullName(n)}`, 'ok');
          break;
        }
        tries++;
        this.kb.flash(n, false);
        if (tries >= 2) {
          this.kb.mark(t, 'hint', letter(t));
          this.#feedback(octaveMiss(n, t) ? `${octaveMiss(n, t)}，已標示出來` : `你彈的是 ${fullName(n)}。答案是 ${fullName(t)}，已標示出來`, 'bad');
        } else {
          this.#feedback(octaveMiss(n, t) ? `音名對了，但${octaveMiss(n, t).replace(/^這個 S+ /, '')}。再聽一次` : `不是 ${fullName(n)}。比較一下兩個音的高低，再聽一次`, 'bad');
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

  // Play chords, one at a time or as a progression. Any voicing counts: what
  // matters is which notes sound together (pressed within ~1.5 s, or held), so
  // mouse users can roll a chord too. Some chords only need root, 3rd and 7th
  // (shell voicings); `bass: true` also requires the root to be the lowest note.
  async step_chords(step) {
    const chords = step.chords;
    const prog = Boolean(step.progression);
    const results = [];
    const misses = [];
    const chipHtml = (c) => `<li class="note-chip chord-chip"><b>${c.sym}</b><span>${c.roman || ''}</span><i class="chip-mark"></i></li>`;
    this.stage.innerHTML = `
      ${this.#head(step, '彈和弦')}
      ${step.instruction ? `<p class="muted">${step.instruction}</p>` : ''}
      ${prog
        ? `<ol class="bar chord-bar">${chords.map(chipHtml).join('')}</ol>`
        : '<div data-el="dots"></div><p class="prompt" data-el="prompt"></p><p class="tones muted" data-el="tones"></p>'}
      <p class="feedback"></p>
      <div class="footer-actions">
        <button class="btn" data-act="demo">${icon.play()}${prog ? '聽整段' : '聽這個和弦'}</button>
        <span class="muted small">${step.bass ? '最低音要彈根音。' : '任何轉位、任何八度都可以。'}</span>
      </div>`;
    const chips = [...this.stage.querySelectorAll('.chord-chip')];
    let cur = 0;
    this.stage.querySelector('[data-act="demo"]').onclick = () =>
      this.#demo((prog ? chords : [chords[cur]]).map((c) => ({ n: c.voicing, d: 2 })), { bpm: step.bpm || 80 });
    const label = (c) => `${c.sym}${c.roman ? `（${c.roman}）` : ''}`;
    if (prog) this.#announce(`${step.title || step.kicker || ''}。${step.instruction || ''}和弦進行：${chords.map((c) => c.sym).join('、')}。`);

    for (let i = 0; i < chords.length; i++) {
      const c = chords[i];
      cur = i;
      const allowed = new Set(c.pcs);
      const need = c.need || c.pcs;
      const toneOf = (p) => c.tones[c.pcs.indexOf(p)];
      if (prog) {
        chips.forEach((el, j) => el.classList.toggle('cur', j === i));
        chips[i].scrollIntoView({ block: 'nearest' });
        if (i > 0) this.#announce(`第 ${i + 1} 個：${label(c)}，${c.tones.join('、')}`);
      } else {
        this.stage.querySelector('[data-el="dots"]').innerHTML = this.#dots(results, i, chords.length);
        this.stage.querySelector('[data-el="prompt"]').innerHTML = `彈 <span class="big">${c.sym}</span>${c.roman ? `<span class="count">${c.roman}</span>` : ''}`;
        this.stage.querySelector('[data-el="tones"]').textContent = step.hint === 'none'
          ? '' : `組成音：${c.tones.join('、')}${c.need ? `（至少彈 ${need.map(toneOf).join('、')}）` : ''}`;
        this.#announce(`第 ${i + 1} 題，共 ${chords.length} 題。彈 ${label(c)}。${step.hint === 'none' ? '' : `組成音 ${c.tones.join('、')}。`}`);
      }
      const showHint = () => {
        c.voicing.forEach((n, k) => this.kb.mark(n, 'hint', c.fingers?.[k] || toneOf(pc(n)) || ''));
        this.kb.cue([{ n: c.voicing[0], label: c.sym, sub: c.roman || '' }]);
      };
      if (step.hint === 'show') showHint();
      const hintTimer = step.hint === 'delay' ? setTimeout(showHint, 5000) : null;
      const recent = new Map(); // note -> time pressed
      let firstTry = true;
      try {
        for (;;) {
          const n = await this.#note();
          const now = Date.now();
          recent.set(n, now);
          for (const [k, t] of recent) if (now - t > 1500 && !this.hub.held.has(k)) recent.delete(k);
          if (!allowed.has(pc(n))) {
            firstTry = false;
            recent.delete(n);
            this.kb.flash(n, false);
            showHint();
            this.#feedback(`${letter(n)} 不在 ${c.sym} 裡。${c.sym} 由 ${c.tones.join('、')} 組成，建議按法已標示`, 'bad');
            continue;
          }
          this.kb.mark(n, 'found');
          const played = new Set([...recent.keys()].map(pc));
          if (!need.every((p) => played.has(p))) continue;
          const lowest = Math.min(...recent.keys());
          if (step.bass && pc(lowest) !== c.pcs[0]) {
            firstTry = false;
            this.#feedback(`音都對了，但最低音要是根音 ${c.tones[0]}`, 'bad');
            continue;
          }
          [...recent.keys()].forEach((k) => this.kb.flash(k, true));
          this.#feedback(`正確：${label(c)}`, 'ok');
          break;
        }
      } finally {
        clearTimeout(hintTimer);
      }
      results.push(firstTry);
      const concept = typeof step.concept === 'function' ? step.concept(c) : step.concept;
      if (concept) this.store.recordConcept(concept, firstTry);
      if (!firstTry) {
        misses.push({ concept, label: c.sym });
        if (prog) { chips[i].classList.add('miss'); chips[i].querySelector('.chip-mark').innerHTML = icon.cross(); }
      }
      if (prog) chips[i].classList.add('done');
      await this.#pause(prog ? 350 : 650);
      this.kb.clearMarks();
    }
    if (prog) chips.forEach((el) => el.classList.remove('cur'));
    return { total: chords.length, right: results.filter(Boolean).length, misses };
  }

  // Listening questions with multiple-choice answers (e.g. "which chord was borrowed?").
  async step_choice(step) {
    const items = step.items;
    const results = [];
    const misses = [];
    for (let i = 0; i < items.length; i++) {
      const q = items[i];
      this.stage.innerHTML = `
        ${this.#head(step, '聽與辨')}
        ${this.#dots(results, i, items.length)}
        <p class="prompt"><span class="prompt-icon">${icon.ear()}</span>${q.prompt}</p>
        ${q.play ? `<div class="row"><button class="btn" data-act="replay">${icon.replay()}再聽一次</button></div>` : ''}
        <div class="choices" role="group" aria-label="選項">${q.options.map((o, k) => `<button class="btn choice-btn" data-opt="${k}">${o}</button>`).join('')}</div>
        <p class="feedback"></p>
        <div class="footer-actions" data-el="after" hidden><span class="spacer"></span><button class="btn btn-primary" data-act="next">下一題${icon.next()}</button></div>`;
      const play = () => q.play && this.#demo(q.play, { bpm: q.bpm || 76 });
      const replay = this.stage.querySelector('[data-act="replay"]');
      if (replay) replay.onclick = play;
      this.#announce(`第 ${i + 1} 題，共 ${items.length} 題。${q.prompt}選項：${q.options.map((o, k) => `${k + 1}，${o}`).join('；')}。${q.play ? '按 L 可以再聽一次。' : ''}`);
      await this.#pause(300);
      play();
      let firstTry = true;
      await new Promise((resolve, reject) => {
        const onAbort = () => reject(new Aborted());
        this.signal.addEventListener('abort', onAbort, { once: true });
        this.stage.querySelectorAll('[data-opt]').forEach((b) => {
          b.onclick = () => {
            this.dirty = true;
            const k = Number(b.dataset.opt);
            if (k === q.answer) {
              b.classList.add('is-right');
              this.stage.querySelectorAll('[data-opt]').forEach((x) => { x.disabled = true; });
              this.#feedback(`答對了。${q.explain || ''}`, 'ok');
              this.signal.removeEventListener('abort', onAbort);
              resolve();
            } else {
              firstTry = false;
              b.classList.add('is-wrong');
              b.disabled = true;
              this.#feedback(`不是「${q.options[k]}」。${q.hint || '再聽一次，注意和弦的色彩。'}`, 'bad');
            }
          };
        });
      });
      results.push(firstTry);
      const concept = step.concept;
      if (concept) this.store.recordConcept(concept, firstTry);
      if (!firstTry) misses.push({ concept, label: q.options[q.answer] });
      const after = this.stage.querySelector('[data-el="after"]');
      after.hidden = false;
      await this.#click(after.querySelector('[data-act="next"]'));
    }
    return { total: items.length, right: results.filter(Boolean).length, misses };
  }

  // Play a melody in wait mode: the music waits until the right key is pressed.
  async step_melody(step) {
    const notes = step.notes;
    // Group notes into 4-beat bars so rhythm is visible; short notes get narrower chips.
    let beat = 0;
    let bars = [[]];
    notes.forEach((x, idx) => {
      if (beat >= 4) { bars.push([]); beat = 0; }
      bars[bars.length - 1].push(idx);
      beat += x.d || 1;
    });
    if (!notes.some((x) => x.d)) bars = [notes.map((_, idx) => idx)];
    const chipHtml = (idx) => {
      const x = notes[idx];
      const d = x.d || 1;
      return `<li class="note-chip" style="--d:${d}"><b>${noteName(x.n)}</b><span>${x.f ? `${x.f} 指` : ''}</span><i class="chip-mark"></i></li>`;
    };
    this.stage.innerHTML = `
      ${this.#head(step)}
      ${step.instruction ? `<p class="muted">${step.instruction}</p>` : ''}
      <div class="score" aria-label="樂句">${bars.map((b) => `<ol class="bar">${b.map(chipHtml).join('')}</ol>`).join('')}</div>
      <p class="feedback"></p>
      <div class="footer-actions">
        <button class="btn" data-act="demo">${icon.play()}先聽一次</button>
        <span class="muted small">等待模式：彈對了才會往下走，不必趕。</span>
      </div>`;
    const chips = [...this.stage.querySelectorAll('.note-chip')];
    this.stage.querySelector('[data-act="demo"]').onclick = () =>
      this.#demo(notes.map((x) => ({ n: x.n, d: x.d || 1 })), { bpm: step.bpm || 90 });
    const misses = [];
    let right = 0;
    const seq = notes.map((x) => noteName(x.n)).join(' ');
    this.#announce(`${step.title}。${step.instruction || ''}共 ${notes.length} 個音：${seq}。等待模式，彈對了才會往下走。`);
    for (let i = 0; i < notes.length; i++) {
      const { n: t, f } = notes[i];
      // After the overview, name each note as it comes up (with its finger).
      if (i > 0) this.#announce(`${noteName(t)}${f ? `，${f} 指` : ''}`);
      chips.forEach((c, j) => c.classList.toggle('cur', j === i));
      chips[i].scrollIntoView({ block: 'nearest' });
      if (step.hint === 'show') {
        this.kb.mark(t, 'hint', f ? String(f) : letter(t));
        // Now-note over its key, the next two ghosted, so the hand can read ahead.
        this.kb.cue([2, 1].map((k) => notes[i + k]).filter(Boolean)
          .map((x) => ({ n: x.n, label: noteName(x.n), next: true }))
          .filter((x) => x.n !== t)
          .concat([{ n: t, label: noteName(t), sub: f ? `${f} 指` : '' }]));
      }
      let firstTry = true;
      for (;;) {
        const n = await this.#note();
        if (n === t) { this.kb.flash(n, true); break; }
        firstTry = false;
        this.kb.flash(n, false);
        this.kb.mark(t, 'hint', f ? String(f) : letter(t));
        this.kb.cue([{ n: t, label: noteName(t), sub: f ? `${f} 指` : '' }]);
        this.#feedback(`${octaveMiss(n, t) || `這是 ${fullName(n)}，應該彈 ${fullName(t)}`}${f ? `，用 ${f} 指` : ''}`, 'bad');
      }
      this.#feedback('');
      chips[i].classList.add('done');
      if (firstTry) right++;
      else {
        misses.push({ concept: step.concept, note: t });
        chips[i].classList.add('miss');
        chips[i].querySelector('.chip-mark').innerHTML = icon.cross();
      }
      this.kb.unmark(t);
      this.kb.cue([]);
    }
    chips.forEach((c) => c.classList.remove('cur'));
    if (step.concept) this.store.recordConcept(step.concept, misses.length === 0);
    this.#feedback(misses.length ? `完成！有 ${misses.length} 個音需要再練習（已用紅框標示）` : '完美，一個音都沒彈錯', misses.length ? '' : 'ok');
    await this.#pause(1200);
    return { total: notes.length, right, misses };
  }
}

// Segment accuracy in words as well as numbers.
function pctHtml(acc) {
  const pct = Math.round(acc * 100);
  const word = acc >= 0.95 ? '非常穩' : acc >= 0.85 ? '很不錯' : acc >= 0.7 ? '大致掌握' : '還需要多練幾次';
  return `<div class="result-score"><p class="result-pct">一次就彈對 <b>${pct}%</b> · ${word}</p></div>`;
}

function weakHtml(misses) {
  if (!misses.length) return `<p class="feedback ok">${icon.check()}<span>這段沒有任何錯誤</span></p>`;
  const byConcept = new Map();
  for (const m of misses) {
    const key = m.concept ? conceptName(m.concept) : '其他';
    if (!byConcept.has(key)) byConcept.set(key, new Set());
    if (m.note !== undefined) byConcept.get(key).add(noteName(m.note));
    else if (m.label) byConcept.get(key).add(m.label);
  }
  const items = [...byConcept].slice(0, 3).map(([k, set]) => `<li><b>${k}</b>${set.size ? `：${[...set].join('、')}` : ''}</li>`).join('');
  return `<div class="weak"><h3>需要加強</h3><ul>${items}</ul></div>`;
}
