// Lesson runner: plays a lesson's five segments (warm-up, new concept, guided
// practice, piece, summary) step by step, grades input and records progress.
// Also runs the standalone daily review, a one-segment "lesson".
import { addDays, today } from './store.js';
import { fullName, letter, noteName, notesOfClass, octaveMiss, pc, sci, setNotation, usesOctaveNumbers } from './notes.js';
import { wait } from './audio.js';
import { icon, star } from './icons.js';
import { drawStaff, markStaff } from './staff.js';
import { drawFretboard, fretName, midiAt } from './fretboard.js';
import { CONCEPTS, reviewSteps } from './lessons/concepts.js';

export const SEGMENT_NAMES = {
  warmup: '暖身複習', concept: '新概念', practice: '引導練習', piece: '實際曲目', summary: '總結評分', review: '今日複習', drill: '樂理練習',
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

// Returned by a step (or a segment) when the learner pressed 上一頁.
const BACK = Symbol('back');

// Aborts when either signal does (AbortSignal.any is missing on older Safari).
function anySignal(a, b) {
  if (AbortSignal.any) return AbortSignal.any([a, b]);
  const c = new AbortController();
  for (const s of [a, b]) s.addEventListener('abort', () => c.abort(), { once: true });
  return c.signal;
}

export class LessonRunner {
  constructor({ root, lesson, hub, kb, piano, store, onExit, nextLesson = null }) {
    Object.assign(this, { root, lesson, hub, kb, piano, store, onExit, nextLesson });
    this.ctrl = new AbortController();
    this.signal = this.ctrl.signal;
    this.segResults = [];
    this.answerTimes = []; // seconds to each correct answer (for drills with a speed goal)
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
    this.runs = [];
    try {
      const segs = this.lesson.segments;
      // from: the step to start the segment at; -1 = its last step (came back to it).
      let i = startSegment;
      let from = 0;
      while (i < segs.length) {
        if (!this.lesson.isReview && from === 0) this.store.updateLesson(this.lesson.id, { segment: i });
        this.current = i;
        this.dirty = false;
        this.atResult = false;
        const result = await this.#runSegment(i, from);
        if (result === BACK) { i--; from = -1; continue; } // previous segment, last step
        from = 0;
        // The segment is saved from here on: leaving now loses nothing.
        this.dirty = false;
        if (!this.lesson.isReview && i + 1 < segs.length) this.store.updateLesson(this.lesson.id, { segment: i + 1 });
        this.segResults[i] = result;
        if (this.lesson.isReview) this.#setBack(false);
        if (this.lesson.isDrill) return await this.#finishDrill(result);
        if (this.lesson.isReview) return await this.#finishReview(result);
        this.store.markDay('segment');
        if (segs[i].graded) {
          const keep = this.segResults.map((r) => r && { acc: r.acc, total: r.total, right: r.right });
          this.store.updateLesson(this.lesson.id, { segResults: keep });
        }
        if (segs[i].graded && segs[i].kind !== 'summary' && await this.#showSegmentResult(i, result) === BACK) {
          from = -1; // back from the result screen: the segment's last step
          continue;
        }
        i++;
      }
      this.#setBack(false);
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
      : this.lesson.isDrill
      ? '這一輪練習還沒做完，離開後這一輪不會記錄。'
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
        <button class="btn btn-ghost btn-icon-text" data-act="exit" title="已完成的段落會保存；目前這一段若沒做完，下次會從頭開始">${icon.cross()}離開</button>
        <h1 class="lesson-name">${name}</h1>
        ${this.lesson.isDrill ? '' : `<button class="btn btn-ghost btn-icon-text lesson-back" data-act="back" disabled title="回到上一個畫面再看一次；已作答的題目照第一次的結果計分">${icon.back()}上一頁</button>`}
      </div>
      <div class="seg-row">
        ${segs.length > 1 ? `<ol class="seg-track" aria-label="課程進度">${segs.map((s) => `<li class="seg"><span>${SEGMENT_NAMES[s.kind]}</span></li>`).join('')}</ol>` : ''}
        <span class="seg-label"></span>
      </div>
      <section class="stage" aria-labelledby="stage-title"></section>`;
    this.root.querySelector('[data-act="exit"]').onclick = () => this.requestExit();
    this.backBtn = this.root.querySelector('[data-act="back"]');
    if (this.backBtn) this.backBtn.onclick = () => this.stepCtrl?.abort();
    this.stage = this.root.querySelector('.stage');
  }

  #setBack(on) {
    if (this.backBtn) this.backBtn.disabled = !on;
  }

  // Run one screen under its own signal, so 上一頁 can cancel just that screen
  // (its listeners, timers and playback all hang off this.signal).
  async #scoped(fn) {
    const ctrl = new AbortController();
    this.stepCtrl = ctrl;
    this.signal = anySignal(this.ctrl.signal, ctrl.signal);
    const back = () => ctrl.signal.aborted && !this.ctrl.signal.aborted;
    try {
      const r = await fn();
      return back() ? BACK : r;
    } catch (e) {
      if (e instanceof Aborted && back()) return BACK;
      throw e;
    }
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

  // Runs segment i from step `from` (-1 = its last step). Returns its result, or
  // BACK when 上一頁 is pressed on its first step.
  async #runSegment(i, from = 0) {
    const seg = this.lesson.segments[i];
    this.#setSegment(i);
    // The steps (and any random questions in them) are fixed the first time
    // through, so going back shows the same screen again.
    let run = this.runs[i];
    if (!run) {
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
      if (seg.kind === 'piece' && !seg.noEcho) {
        const echo = echoStep(steps);
        if (echo) steps = [echo, ...steps];
      }
      run = this.runs[i] = { steps, resolved: [], results: [] };
    }
    const { steps } = run;
    let k = from < 0 ? steps.length - 1 : from;
    while (k < steps.length) {
      document.body.classList.remove('result-mode');
      const raw = steps[k];
      const step = run.resolved[k] ??= typeof raw === 'function' ? raw() : raw;
      // Reading steps get a smaller keyboard so the text has room on laptops.
      document.body.classList.toggle('step-read', step.type === 'explain');
      this.kb.clearMarks();
      this.kb.setLabelMode(step.labels || 'c');
      this.#setBack(k > 0 || i > 0);
      const r = await this.#scoped(() => this[`step_${step.type}`](step, seg));
      if (r === BACK) {
        if (k === 0) return BACK;
        k--;
        continue;
      }
      this.dirty = true;
      // A question answered again after going back keeps its first score.
      if (run.results[k] === undefined) run.results[k] = r || null;
      k++;
    }
    this.kb.clearMarks();
    // A segment finished earlier (even in a past visit) keeps its score.
    const done = this.segResults[i];
    if (done) return { misses: [], ...done, stars: starsFor(done.acc) };
    const total = { total: 0, right: 0, misses: [] };
    for (const r of run.results) {
      if (!r || !seg.graded) continue;
      total.total += r.total;
      total.right += r.right;
      total.misses.push(...r.misses);
    }
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
    this.#setBack(true);
    return this.#scoped(() => this.#click(this.stage.querySelector('[data-act="next"]'), true, false));
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

  // A round of tap-to-answer theory practice (no keyboard): score, weak spots, go again.
  async #finishDrill(r) {
    this.store.markDay('segment');
    this.#setSegment(0, true);
    this.stage.innerHTML = `
      <div class="result">
        <div class="staff-rule" aria-hidden="true"></div>
        <h2 id="stage-title">這一輪練習完成了</h2>
        ${pctHtml(r.acc, '答對')}
        ${this.lesson.speed ? speedHtml(this.answerTimes, r.acc) : ''}
        ${weakHtml(r.misses)}
        <p class="muted small">答錯的概念會排進今日複習。</p>
        <div class="footer-actions">
          <button class="btn" data-act="home">${this.lesson.backLabel || '回首頁'}</button>
          <span class="spacer"></span>
          <button class="btn btn-primary" data-act="again">${icon.replay()}再練一輪</button>
        </div>
      </div>`;
    this.#showResultTop();
    const choice = await Promise.race([
      this.#click(this.stage.querySelector('[data-act="again"]'), true, false).then(() => 'again'),
      this.#click(this.stage.querySelector('[data-act="home"]'), false, false).then(() => 'home'),
    ]);
    if (choice === 'again' && this.lesson.again) this.lesson.again();
    else this.onExit();
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
      ${step.staff ? [].concat(step.staff).map((_, k) => `<div class="staff" data-fig="${k}"></div>`).join('') : ''}
      <div class="footer-actions">
        ${step.demo ? `<button class="btn" data-act="demo">${icon.play()}聽示範</button>` : ''}
        <span class="spacer"></span>
        <button class="btn btn-primary" data-act="next">繼續${icon.next()}</button>
      </div>`;
    for (const [n, kind, text] of step.keys || []) this.kb.mark(n, kind, text);
    // Notation figures: { notes, clef, time, label }.
    [].concat(step.staff || []).forEach((fig, k) => {
      drawStaff(this.stage.querySelector(`[data-fig="${k}"]`), fig.notes, fig).catch(() => {});
    });
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
        ${step.staff ? '<p class="prompt">彈出譜上的這個音</p><div class="staff staff-one" data-el="staff"></div>' : `<p class="prompt">${promptText}</p>`}
        <p class="feedback"></p>`;
      // Reading steps show the note on the staff instead of its name (screen
      // readers still hear the name, since they cannot see the staff).
      if (step.staff) drawStaff(this.stage.querySelector('[data-el="staff"]'), [{ n: t, d: 4 }], { clef: step.clef, label: '譜上的一個音' }).catch(() => {});
      this.#announce(`第 ${i + 1} 題，共 ${targets.length} 題。${step.staff ? `譜上的音是 ${fullName(t)}` : promptText}。${i === 0 ? step.instruction || '' : ''}`);
      const matches = (n) => (exact ? n === t : pc(n) === pc(t));
      // The lit key carries its finger number when the step suggests one (else its
      // letter); the label above the key always names the note.
      const showHint = () => {
        const f = step.finger?.(t);
        this.kb.mark(t, 'hint', f || letter(t));
        this.kb.cue([{ n: t, label: letter(t), sub: f ? `${f} 指` : '' }]);
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
      // An item is a note, or { root, n } for intervals: hear root then n, play n.
      const item = items[i];
      const t = typeof item === 'number' ? item : item.n;
      const root = typeof item === 'number' ? null : item.root;
      const ask = root === null ? '聽，然後彈出這個音' : `從 ${fullName(root)} 出發，聽，然後彈出第二個音`;
      this.stage.innerHTML = `
        ${this.#head(step, '聽→彈')}
        ${this.#dots(results, i, items.length)}
        <p class="prompt"><span class="prompt-icon">${icon.ear()}</span>${ask}</p>
        ${step.instruction ? `<p class="muted">${step.instruction}</p>` : ''}
        <div class="row"><button class="btn" data-act="replay">${icon.replay()}再聽一次</button></div>
        <p class="feedback"></p>`;
      for (const c of step.candidates || []) this.kb.mark(c, 'soft');
      if (root !== null) this.kb.mark(root, 'hint', step.finger ? '1' : letter(root));
      this.#announce(`第 ${i + 1} 題，共 ${items.length} 題。${ask}。${i === 0 ? step.instruction || '' : ''}按 L 可以再聽一次。`);
      const play = () => this.#demo(root === null ? [t] : [root, { n: t, d: 1.5 }], { bpm: 70 });
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
          this.kb.mark(t, 'hint', step.finger?.(t, root) || letter(t));
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

  // Play a rhythm in time with a metronome. Each note is graded 準 / 早 / 晚 / 漏
  // by when it was played; with pitches in the pattern, the pitch must match too.
  // The learner can try again; the first take is the graded one.
  async step_rhythm(step) {
    const pattern = step.pattern; // [{ d, n? }] — n null = rest, n omitted = any key
    const notes = pattern.map((x, i) => ({ ...x, i })).filter((x) => x.n !== null);
    const totalBeats = pattern.reduce((s, x) => s + x.d, 0);
    let bpm = step.bpm || 72;
    const countIn = step.countIn ?? 4;
    const pitched = pattern.some((x) => typeof x.n === 'number' || Array.isArray(x.n));
    this.stage.innerHTML = `
      ${this.#head(step, '節奏')}
      ${step.instruction ? `<p class="muted">${step.instruction}</p>` : ''}
      <div class="staff" data-el="staff"></div>
      <div class="lane" data-el="lane" aria-hidden="true"><i class="playhead" data-el="head"></i></div>
      <div class="row tempo">
        <label>速度 <input type="range" min="${Math.max(40, bpm - 30)}" max="${bpm + 30}" step="2" value="${bpm}" data-el="bpm"> <span data-el="bpmv">${bpm}</span> BPM</label>
      </div>
      <p class="feedback"></p>
      <div class="hits" data-el="hits"></div>
      <div class="footer-actions">
        <button class="btn" data-act="demo">${icon.play()}先聽一次</button>
        <span class="spacer"></span>
        <button class="btn btn-primary" data-act="go">開始（預備 ${countIn} 拍）</button>
      </div>`;
    const $ = (s) => this.stage.querySelector(s);
    const staffEl = $('[data-el="staff"]');
    let drawn = null;
    try {
      drawn = await drawStaff(staffEl, pattern.map((x) => ({ n: x.n === undefined ? 60 : x.n, d: x.d })), {
        clef: pitched ? step.clef : 'rhythm', time: '4/4', label: step.title || '節奏譜',
      });
    } catch {
      staffEl.innerHTML = '<p class="muted small">（譜例載入失敗，仍可照下方時間軸練習）</p>';
    }
    // Timeline: one block per note/rest, width proportional to its length.
    const lane = $('[data-el="lane"]');
    let at = 0;
    const blocks = pattern.map((x) => {
      const b = document.createElement('span');
      b.className = `blk${x.n === null ? ' rest' : ''}`;
      b.style.left = `${(at / totalBeats) * 100}%`;
      b.style.width = `${(x.d / totalBeats) * 100}%`;
      b.textContent = x.n === null ? '休' : typeof x.n === 'number' ? noteName(x.n) : '';
      at += x.d;
      lane.appendChild(b);
      return b;
    });
    for (let b = 1; b < totalBeats; b++) {
      const t = document.createElement('i');
      t.className = `tick${b % 4 === 0 ? ' bar' : ''}`;
      t.style.left = `${(b / totalBeats) * 100}%`;
      lane.appendChild(t);
    }
    const slider = $('[data-el="bpm"]');
    slider.oninput = () => { bpm = Number(slider.value); $('[data-el="bpmv"]').textContent = bpm; };
    this.#announce(`${step.title || step.kicker || '節奏'}。${step.instruction || ''}共 ${notes.length} 個音，${totalBeats} 拍。按「開始」後先聽 ${countIn} 下預備拍，再跟著節拍器彈。`);

    const onsetsOf = (start, beat) => {
      let t = start;
      return pattern.map((x, i) => { const o = { ...x, i, t }; t += x.d * beat; return o; }).filter((x) => x.n !== null);
    };
    const schedule = (withNotes) => {
      this.piano.unlock();
      const ctx = this.piano.ctx;
      const beat = 60 / bpm;
      const t0 = ctx.currentTime + 0.25;
      const start = t0 + countIn * beat;
      for (let k = 0; k < countIn + Math.ceil(totalBeats); k++) this.piano.click(t0 + k * beat, k % 4 === 0);
      if (withNotes) {
        for (const o of onsetsOf(start, beat)) {
          [].concat(o.n === undefined ? 60 : o.n).forEach((n) => this.piano.noteAt(n, o.t, o.d * beat * 0.85));
        }
      }
      return { ctx, beat, start, end: start + totalBeats * beat };
    };
    const animate = (timing, until) => new Promise((resolve) => {
      // Animation frames pause in background tabs; a timer still ends the take on schedule.
      const fallback = setTimeout(resolve, Math.max(0, until - timing.ctx.currentTime) * 1000 + 100);
      const done = resolve;
      resolve = () => { clearTimeout(fallback); done(); };
      const head = $('[data-el="head"]');
      const frame = () => {
        if (this.signal.aborted || !head.isConnected) return resolve();
        const now = timing.ctx.currentTime - this.piano.outputDelay;
        const p = Math.min(1, Math.max(0, (now - timing.start) / (timing.end - timing.start)));
        head.style.left = `${p * 100}%`;
        head.classList.toggle('counting', now < timing.start);
        if (drawn) {
          const beatPos = (now - timing.start) / timing.beat;
          let acc = 0;
          const cur = pattern.findIndex((x) => { const hit = beatPos >= acc && beatPos < acc + x.d; acc += x.d; return hit; });
          markStaff(drawn, pattern.map((_, i) => (i === cur ? 'cur' : '')));
        }
        if (timing.ctx.currentTime < until) requestAnimationFrame(frame);
        else resolve();
      };
      requestAnimationFrame(frame);
    });

    $('[data-act="demo"]').onclick = async () => {
      const t = schedule(true);
      await animate(t, t.end + 0.2);
      if (drawn) markStaff(drawn, []);
    };

    let first = null;
    const goBtn = $('[data-act="go"]');
    let armed = false; // true when "再試一次" was just clicked
    for (;;) {
      if (!armed) await this.#click(goBtn);
      armed = false;
      goBtn.disabled = true;
      $('[data-act="demo"]').disabled = true;
      $('[data-el="hits"]').innerHTML = '';
      this.#feedback('');
      lane.querySelectorAll('.hit').forEach((h) => h.remove());
      blocks.forEach((b) => b.classList.remove('ok', 'early', 'late', 'miss'));
      if (pitched && step.hint !== 'none') notes.forEach((x) => [].concat(x.n).forEach((n) => this.kb.mark(n, 'soft')));
      const timing = schedule(false);
      // Collect key presses (in AudioContext time, as heard through the speakers).
      const played = [];
      const onNote = (e) => {
        if (document.querySelector('dialog[open]')) return;
        const { ctx } = timing;
        const t = ctx.currentTime - (performance.now() - (e.detail.time ?? performance.now())) / 1000 - this.piano.outputDelay;
        if (t < timing.start - timing.beat * 0.75 || t > timing.end + 0.3) return;
        played.push({ t, n: e.detail.note });
        const h = document.createElement('i');
        h.className = 'hit';
        h.style.left = `${Math.min(100, Math.max(0, ((t - timing.start) / (timing.end - timing.start)) * 100))}%`;
        lane.appendChild(h);
      };
      this.hub.addEventListener('noteon', onNote, { signal: this.signal });
      await animate(timing, timing.end + 0.6);
      this.hub.removeEventListener('noteon', onNote);
      if (this.signal.aborted) throw new Aborted();
      this.kb.clearMarks();
      if (drawn) markStaff(drawn, []);

      // Match each expected onset to the nearest unused press within ±0.3 s.
      const expected = onsetsOf(timing.start, timing.beat);
      const used = new Set();
      const tally = { ok: 0, early: 0, late: 0, miss: 0, wrong: 0 };
      expected.forEach((o) => {
        let best = -1;
        played.forEach((p, k) => {
          if (used.has(k) || Math.abs(p.t - o.t) > 0.3) return;
          if (best < 0 || Math.abs(p.t - o.t) < Math.abs(played[best].t - o.t)) best = k;
        });
        let cls;
        if (best < 0) cls = 'miss';
        else {
          used.add(best);
          const p = played[best];
          const want = o.n === undefined ? null : [].concat(o.n);
          if (want && !want.includes(p.n)) cls = 'wrong';
          else {
            const dt = p.t - o.t;
            cls = Math.abs(dt) <= 0.08 ? 'ok' : dt < 0 ? 'early' : 'late';
          }
        }
        tally[cls]++;
        blocks[o.i].classList.add(cls === 'wrong' ? 'miss' : cls);
      });
      const extra = played.length - used.size;
      const right = tally.ok + 0.5 * (tally.early + tally.late);
      const acc = right / expected.length;
      $('[data-el="hits"]').innerHTML = [
        ['ok', '準', tally.ok], ['early', '早', tally.early], ['late', '晚', tally.late],
        ['miss', '漏', tally.miss], ['miss', '音錯', tally.wrong], ['miss', '多按', extra],
      ].filter(([, , v], k) => v || k < 3).map(([c, l, v]) => `<span class="hit-chip ${c}">${l} ${v}</span>`).join('');
      const msg = acc >= 0.9 ? '很穩，節奏都對上了' : acc >= 0.6 ? '大致跟上了。看看哪幾個音偏早或偏晚，再試一次會更穩' : '還沒對齊。可以先把速度調慢，或先按「先聽一次」';
      this.#feedback(`${msg}（準 ${tally.ok}、早 ${tally.early}、晚 ${tally.late}、漏 ${tally.miss + tally.wrong}）`, acc >= 0.6 ? 'ok' : 'bad');
      if (!first) first = { right, total: expected.length, acc };
      goBtn.disabled = false;
      goBtn.textContent = '再試一次';
      goBtn.classList.remove('btn-primary');
      $('[data-act="demo"]').disabled = false;
      if (!this.stage.querySelector('[data-act="next"]')) {
        goBtn.insertAdjacentHTML('afterend', `<button class="btn btn-primary" data-act="next">繼續${icon.next()}</button>`);
      }
      const next = this.stage.querySelector('[data-act="next"]');
      const choice = await Promise.race([
        this.#click(next).then(() => 'next'),
        this.#click(goBtn, false).then(() => 'again'),
      ]);
      if (choice === 'next') break;
      armed = true;
    }
    if (step.concept) this.store.recordConcept(step.concept, first.acc >= 0.75);
    return { total: first.total, right: first.right, misses: first.acc < 0.75 ? [{ concept: step.concept, label: step.title || '節奏' }] : [] };
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
        <span class="muted small">${step.bass ? '最低音要彈根音。' : chords.some((c) => c.low !== undefined) ? '注意最低音：斜線後面的音要在最下面。' : '任何轉位、任何八度都可以。'}</span>
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
          // c.low: the pitch class the lowest note must be (inversions, slash chords).
          const wantLow = c.low ?? (step.bass ? c.pcs[0] : null);
          if (wantLow !== null && pc(lowest) !== wantLow) {
            firstTry = false;
            this.#feedback(wantLow === c.pcs[0] ? `音都對了，但最低音要是根音 ${c.tones[0]}` : `音都對了，但最低音要是 ${toneOf(wantLow)}`, 'bad');
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

  // Guitar fretboard: tap the position(s) asked for. Items: { prompt, targets:
  // [[string, fret], …], all (find every target), marks (shown first), explain }.
  // One-target items take any of the listed positions; `all` items need each one.
  async step_fretboard(step) {
    const items = step.items;
    const results = [];
    const misses = [];
    for (let i = 0; i < items.length; i++) {
      const q = items[i];
      this.stage.innerHTML = `
        ${this.#head(step, '吉他指板')}
        ${this.#dots(results, i, items.length)}
        <p class="prompt">${q.prompt}${q.all ? '<span class="count" data-el="count"></span>' : ''}</p>
        ${step.instruction && i === 0 ? `<p class="muted">${step.instruction}</p>` : ''}
        <div class="fb-wrap" data-el="fb"></div>
        <p class="feedback"></p>
        <div class="footer-actions" data-el="after" hidden><span class="spacer"></span><button class="btn btn-primary" data-act="next">下一題${icon.next()}</button></div>`;
      this.#announce(`第 ${i + 1} 題，共 ${items.length} 題。${q.prompt.replace(/<[^>]+>/g, '')}`);
      const key = ([s, f]) => `${s}:${f}`;
      const want = new Set(q.targets.map(key));
      const found = new Set();
      let wrong = 0;
      let done = null;
      const finished = new Promise((resolve) => { done = resolve; });
      const count = () => {
        const el = this.stage.querySelector('[data-el="count"]');
        if (el) el.textContent = `${found.size} / ${want.size}`;
      };
      const showTargets = (kind) => q.targets.forEach(([s, f]) => { if (!found.has(key([s, f]))) fb.mark(s, f, kind); });
      const fb = drawFretboard(this.stage.querySelector('[data-el="fb"]'), {
        marks: q.marks || [],
        label: q.prompt.replace(/<[^>]+>/g, ''),
        onTap: (s, f) => {
          if (done === null) return;
          this.dirty = true;
          this.hub.lastInputAt = Date.now();
          const n = midiAt(s, f);
          this.piano.unlock();
          this.piano.noteOn(n, 0.7);
          setTimeout(() => this.piano.noteOff(n), 700);
          const k = key([s, f]);
          if (want.has(k)) {
            if (found.has(k)) return;
            found.add(k);
            fb.mark(s, f, 'ok', fretName(n).split('/')[0]);
            count();
            if (!q.all) this.answerTimes.push((performance.now() - shownAt) / 1000);
            if (!q.all || found.size === want.size) {
              this.#feedback(`答對了。${q.explain || ''}`, 'ok');
              const d = done; done = null; d();
            } else this.#feedback(`找到一個：第 ${s} 弦${f ? `第 ${f} 格` : '空弦'}`, 'ok');
            return;
          }
          if (q.marks?.some((m) => m.s === s && m.f === f)) return; // tapping the given note again
          wrong++;
          fb.mark(s, f, 'bad', fretName(n).split('/')[0]);
          setTimeout(() => { if (!found.has(k)) fb.unmark(s, f); }, 900);
          this.#feedback(`這是 ${fretName(n)}（第 ${s} 弦${f ? `第 ${f} 格` : '空弦'}）。${q.hint || ''}`, 'bad');
          if (wrong >= (q.all ? 3 : 2)) showTargets('soft');
        },
      });
      count();
      const shownAt = performance.now();
      await Promise.race([finished, new Promise((_, reject) => this.signal.addEventListener('abort', () => reject(new Aborted()), { once: true }))]);
      const firstTry = wrong === 0;
      results.push(firstTry);
      if (step.concept) this.store.recordConcept(step.concept, firstTry);
      if (!firstTry) misses.push({ concept: step.concept, label: q.answerLabel || q.prompt.replace(/<[^>]+>/g, '') });
      const after = this.stage.querySelector('[data-el="after"]');
      after.hidden = false;
      await this.#click(after.querySelector('[data-act="next"]'));
    }
    return { total: items.length, right: results.filter(Boolean).length, misses };
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
        <p class="prompt">${q.play ? `<span class="prompt-icon">${icon.ear()}</span>` : ''}${q.prompt}</p>
        ${q.staff ? [].concat(q.staff).map((_, k) => `<div class="staff staff-quiz" data-fig="${k}"></div>`).join('') : ''}
        ${q.fretboard ? '<div class="fb-wrap" data-el="fb"></div>' : ''}
        ${q.play ? `<div class="row"><button class="btn" data-act="replay">${icon.replay()}再聽一次</button></div>` : ''}
        <div class="choices${q.options.every((o) => o.length <= 5) ? ' choices-short' : q.options.length >= 4 ? ' choices-grid' : ''}" role="group" aria-label="選項">${q.options.map((o, k) => `<button class="btn choice-btn" data-opt="${k}">${o}</button>`).join('')}</div>
        <p class="feedback"></p>
        <div class="footer-actions" data-el="after" hidden><span class="spacer"></span><button class="btn btn-primary" data-act="next">下一題${icon.next()}</button></div>`;
      // Notation questions: { notes, clef, key, label } figures drawn above the answers.
      [].concat(q.staff || []).forEach((fig, k) => {
        drawStaff(this.stage.querySelector(`[data-fig="${k}"]`), fig.notes || [], fig).catch(() => {});
      });
      if (q.fretboard) drawFretboard(this.stage.querySelector('[data-el="fb"]'), q.fretboard);
      const play = () => q.play && this.#demo(q.play, { bpm: q.bpm || 76 });
      const replay = this.stage.querySelector('[data-act="replay"]');
      if (replay) replay.onclick = play;
      this.#announce(`第 ${i + 1} 題，共 ${items.length} 題。${q.prompt}選項：${q.options.map((o, k) => `${k + 1}，${o}`).join('；')}。${q.play ? '按 L 可以再聽一次。' : ''}`);
      await this.#pause(300);
      play();
      const shownAt = performance.now();
      let firstTry = true;
      await new Promise((resolve, reject) => {
        const onAbort = () => reject(new Aborted());
        this.signal.addEventListener('abort', onAbort, { once: true });
        this.stage.querySelectorAll('[data-opt]').forEach((b) => {
          b.onclick = () => {
            this.dirty = true;
            this.hub.lastInputAt = Date.now(); // tapping answers counts as practice time
            const k = Number(b.dataset.opt);
            if (k === q.answer) {
              this.answerTimes.push((performance.now() - shownAt) / 1000);
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
  // Free improvisation over a looping backing, on a set of notes lit on the keys
  // (step.scale: pitch classes). Nothing is wrong here: it only counts what was
  // played and how much stayed inside the set. Not graded.
  async step_improv(step) {
    const allowed = new Set(step.scale.map(pc));
    this.stage.innerHTML = `
      ${this.#head(step, '即興')}
      <div class="explain-body">${step.body}</div>
      <p class="prompt" data-el="count">按「開始伴奏」，然後隨意彈亮起的鍵。</p>
      <p class="feedback"></p>
      <div class="footer-actions">
        <button class="btn" data-act="loop">${icon.play()}開始伴奏</button>
        <span class="spacer"></span>
        <button class="btn btn-primary" data-act="next">彈夠了，繼續${icon.next()}</button>
      </div>`;
    for (let n = 48; n <= 72; n++) if (allowed.has(pc(n))) this.kb.mark(n, 'soft');
    this.#announce(`${step.title}。${step.body}`);
    const loopBtn = this.stage.querySelector('[data-act="loop"]');
    const countEl = this.stage.querySelector('[data-el="count"]');
    let loop = null;
    const stop = () => {
      loop?.abort();
      loop = null;
      loopBtn.innerHTML = `${icon.play()}開始伴奏`;
    };
    loopBtn.onclick = async () => {
      if (loop) return stop();
      const mine = new AbortController();
      loop = mine;
      loopBtn.textContent = '停止伴奏';
      const signal = anySignal(this.signal, mine.signal);
      // Loop the backing until stopped (or ten times round, a few minutes).
      for (let k = 0; k < 10 && !signal.aborted; k++) {
        await this.piano.playSequence(step.backing, { bpm: step.bpm || 90, signal, show: false });
      }
      if (loop === mine) stop();
    };
    let total = 0;
    let inside = 0;
    const onNote = (e) => {
      const n = e.detail.note;
      total++;
      if (allowed.has(pc(n))) inside++;
      else this.#feedback(`${noteName(n)} 不在這組音裡：聽聽看它比較「緊」的味道，再回到亮起的鍵。`);
      countEl.textContent = `已經彈了 ${total} 個音`;
    };
    this.hub.addEventListener('noteon', onNote, { signal: this.signal });
    try {
      await this.#click(this.stage.querySelector('[data-act="next"]'), false);
    } finally {
      stop();
      this.hub.removeEventListener('noteon', onNote);
    }
    if (total) {
      this.#feedback(`彈了 ${total} 個音，${Math.round((inside / total) * 100)}% 在這組音裡。即興沒有標準答案，多彈幾次就會找到自己喜歡的句子。`, 'ok');
      await this.#pause(1800);
    }
    return null;
  }

  // Make up a short tune from a few given notes (step.notes, MIDI) that ends on
  // step.end (a pitch class). The tune is shown as it grows and played back;
  // only length, the notes used and the last note are checked. Not graded.
  async step_compose(step) {
    const allowed = new Set(step.notes);
    const min = step.min || 4;
    const max = step.max || 8;
    const endName = noteName(step.end + 60);
    this.stage.innerHTML = `
      ${this.#head(step, '創作')}
      <div class="explain-body">${step.body}</div>
      <ol class="bar compose-bar" data-el="tune" aria-label="你的旋律"></ol>
      <p class="feedback"></p>
      <div class="footer-actions" data-el="edit">
        <button class="btn" data-act="clear">${icon.replay()}重來</button>
        <button class="btn" data-act="hear">${icon.play()}聽聽看</button>
        <span class="spacer"></span>
        <button class="btn btn-primary" data-act="done" disabled>完成${icon.next()}</button>
      </div>
      <div class="footer-actions" data-el="after" hidden><span class="spacer"></span><button class="btn btn-primary" data-act="next">繼續${icon.next()}</button></div>`;
    for (const n of allowed) this.kb.mark(n, 'soft', letter(n));
    this.#announce(`${step.title}。${step.body}`);
    const tuneEl = this.stage.querySelector('[data-el="tune"]');
    const doneBtn = this.stage.querySelector('[data-act="done"]');
    const tune = [];
    const ready = () => tune.length >= min && pc(tune[tune.length - 1]) === step.end;
    const render = () => {
      tuneEl.innerHTML = Array.from({ length: max }, (_, k) => (k < tune.length
        ? `<li class="note-chip done"><b>${noteName(tune[k])}</b></li>`
        : `<li class="note-chip compose-slot${k < min ? ' need' : ''}"><b>·</b></li>`)).join('');
      doneBtn.disabled = !ready();
    };
    const playTune = () => this.#demo(tune.map((n, k) => ({ n, d: k === tune.length - 1 ? 2 : 1 })), { bpm: step.bpm || 90 });
    render();
    const onNote = (e) => {
      const n = e.detail.note;
      if (!allowed.has(n)) {
        this.#feedback(`這次只用亮起的 ${allowed.size} 個鍵。`, 'bad');
        return;
      }
      if (tune.length >= max) {
        this.#feedback(`已經 ${max} 個音了。按「重來」重新編，或結束在 ${endName} 後按「完成」。`);
        return;
      }
      tune.push(n);
      render();
      if (tune.length >= min && !ready()) this.#feedback(`再加一個音，最後落在 ${endName}，聽起來才像「說完了」。`);
      else if (ready()) this.#feedback(`落在 ${endName} 了，可以按「完成」，也可以繼續加長。`, 'ok');
      else this.#feedback('');
    };
    this.hub.addEventListener('noteon', onNote, { signal: this.signal });
    this.stage.querySelector('[data-act="clear"]').onclick = () => { tune.length = 0; render(); this.#feedback(''); };
    this.stage.querySelector('[data-act="hear"]').onclick = () => { if (tune.length) playTune(); };
    try {
      await this.#click(doneBtn, false);
    } finally {
      this.hub.removeEventListener('noteon', onNote);
    }
    this.stage.querySelector('[data-el="edit"]').hidden = true;
    this.#feedback(`這是你自己編的旋律：${tune.map(noteName).join(' ')}。${step.after || ''}`, 'ok');
    await playTune();
    const after = this.stage.querySelector('[data-el="after"]');
    after.hidden = false;
    await this.#click(after.querySelector('[data-act="next"]'));
    return null;
  }

  // Hear a phrase, play it back by ear: no names, no score, and the keys stay
  // still during playback. The phrase's first note is lit as a starting point;
  // two misses on a note light that key. Not graded: the read-along steps after
  // it are. 直接看音名 skips ahead to them.
  async step_echo(step) {
    const bass = step.mode === 'bass';
    const rounds = bass
      ? step.chords.map((c) => ({ seq: [{ n: c.voicing, d: 2 }], targets: [Math.min(...c.voicing)] }))
      : step.phrases.map((p) => ({ seq: p, targets: p.map((x) => x.n) }));
    const results = [];
    const SKIP = Symbol('skip');
    for (let r = 0; r < rounds.length; r++) {
      const { seq, targets } = rounds[r];
      const ask = bass ? `第 ${r + 1} 個和弦的低音` : `第 ${r + 1} 句（${targets.length} 個音）`;
      this.stage.innerHTML = `
        ${this.#head({ kicker: '第 0 遍：先用耳朵學', title: step.title })}
        ${r === 0 ? `<p class="muted">${bass
          ? '先不看和弦名稱。每聽一個和弦，找出它最低的那個音，任何八度都可以。第一個低音已經亮起。'
          : '先不看音名和譜。聽一句，憑耳朵把它彈回來；亮起的鍵是這句的第一個音。這一步不計分。'}</p>` : ''}
        ${this.#dots(results, r, rounds.length)}
        <p class="prompt"><span class="prompt-icon">${icon.ear()}</span>${ask}<span class="echo-turn" data-el="turn"></span></p>
        ${bass ? '' : `<ol class="echo-dots" aria-hidden="true">${targets.map(() => '<li></li>').join('')}</ol>`}
        <p class="feedback"></p>
        <div class="footer-actions echo-actions">
          <button class="btn" data-act="replay">${icon.replay()}再聽一次</button>
          <span class="spacer"></span>
          <button class="btn btn-ghost" data-act="skip">直接看音名${icon.next()}</button>
        </div>`;
      // Notes are only taken once the phrase has finished, so say whose turn it is.
      const turn = this.stage.querySelector('[data-el="turn"]');
      const play = async () => {
        turn.textContent = '播放中，先聽…';
        turn.classList.remove('go');
        await this.#demo(seq, { bpm: step.bpm, show: false });
        turn.textContent = '換你彈';
        turn.classList.add('go');
      };
      this.stage.querySelector('[data-act="replay"]').onclick = () => play();
      const skipped = new Promise((res) => { this.stage.querySelector('[data-act="skip"]').onclick = () => res(SKIP); });
      const dots = [...this.stage.querySelectorAll('.echo-dots li')];
      if (!bass || r === 0) this.kb.mark(targets[0], 'hint', '起');
      this.#announce(`${ask}。${bass ? '' : '第一個音已經在琴鍵上亮起。'}`);
      await this.#pause(300);
      await play();
      let clean = true;
      for (let i = 0; i < targets.length; i++) {
        const t = targets[i];
        let tries = 0;
        for (;;) {
          const n = await Promise.race([this.#note(), skipped]);
          if (n === SKIP) return null;
          if (bass ? pc(n) === pc(t) : n === t) { this.kb.flash(n, true); break; }
          tries++;
          clean = false;
          this.kb.flash(n, false);
          if (tries >= 2) {
            this.kb.mark(t, 'hint', '');
            this.#feedback('下一個音的位置已經亮起', 'bad');
          } else {
            this.#feedback(i === 0 ? '不是這個音，再聽一次' : `前 ${i} 個音都對了。再聽一次，接著彈第 ${i + 1} 個音`, 'bad');
            turn.textContent = '再聽一次…';
            turn.classList.remove('go');
            await this.#pause(400);
            await play();
          }
        }
        this.kb.unmark(t);
        dots[i]?.classList.add('done');
      }
      results.push(clean);
      this.#feedback(clean ? '一次就彈對了' : bass ? '找到低音了' : '這句彈出來了', 'ok');
      await this.#pause(r + 1 < rounds.length ? 700 : 400);
      this.kb.clearMarks();
    }
    this.#feedback(`${bass ? '低音線' : '旋律'}已經聽熟了。接下來對照${bass ? '和弦名稱' : '音名和譜'}再彈一次。`, 'ok');
    await this.#pause(1600);
    return null;
  }

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
      ${step.staff ? '<div class="staff" data-el="staff"></div>' : ''}
      <div class="score" aria-label="樂句"${step.hideNames ? ' hidden' : ''}>${bars.map((b) => `<ol class="bar">${b.map(chipHtml).join('')}</ol>`).join('')}</div>
      <p class="feedback"></p>
      <div class="footer-actions">
        <button class="btn" data-act="demo">${icon.play()}先聽一次</button>
        <span class="muted small">等待模式：彈對了才會往下走，不必趕。</span>
      </div>`;
    const chips = [...this.stage.querySelectorAll('.note-chip')];
    // With a staff, the phrase is read from notation; the current note is highlighted on it.
    let staffDrawn = null;
    const staffStates = notes.map(() => '');
    if (step.staff) {
      staffDrawn = await drawStaff(this.stage.querySelector('[data-el="staff"]'), notes.map((x) => ({ n: x.n, d: x.d || 1 })), { clef: step.clef, time: notes.some((x) => x.d) ? '4/4' : null, label: step.title }).catch(() => null);
    }
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
      if (staffDrawn) { staffStates[i] = 'cur'; markStaff(staffDrawn, staffStates); }
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
      if (staffDrawn) { staffStates[i] = firstTry ? 'done' : 'miss'; markStaff(staffDrawn, staffStates); }
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

// Sound before symbol: a piece segment opens with its music by ear. A melody is
// echoed phrase by phrase (about a bar each, the first four phrases); a chord
// piece by its bass line. Names and score come only in the steps after.
export function echoStep(steps) {
  const mel = steps.find((s) => s.type === 'melody');
  if (mel) {
    const phrases = [];
    let cur = [];
    let beats = 0;
    for (const x of mel.notes) {
      cur.push({ n: x.n, d: x.d || 1 });
      beats += x.d || 1;
      if ((beats >= 4 && cur.length >= 3) || cur.length >= 8) { phrases.push(cur); cur = []; beats = 0; }
    }
    if (cur.length) {
      if (cur.length < 3 && phrases.length) phrases[phrases.length - 1].push(...cur);
      else phrases.push(cur);
    }
    return { type: 'echo', mode: 'melody', title: mel.title, phrases: phrases.slice(0, 4), bpm: mel.bpm || 90 };
  }
  const prog = steps.find((s) => s.type === 'chords' && s.progression);
  if (prog) return { type: 'echo', mode: 'bass', title: prog.title, chords: prog.chords.slice(0, 10), bpm: prog.bpm || 80 };
  return null;
}

// Average answer time for recall drills: the aim is to know, not to count.
function speedHtml(times, acc) {
  if (!times.length) return '';
  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  const note = acc < 0.85 ? '先求對，再求快：正確率穩定在九成左右，再來看秒數。' : avg <= 2 ? '已經到了「不用數」的速度，可以換更難的練習。' : avg <= 5 ? '目標是 2 秒內：先求對，再慢慢縮短。' : '先不急，熟了自然會變快。目標是 2 秒內。';
  return `<p class="result-speed">平均每題 <b>${avg.toFixed(1)} 秒</b>。${note}</p>`;
}

// Segment accuracy in words as well as numbers.
function pctHtml(acc, verb = '彈對') {
  const pct = Math.round(acc * 100);
  const word = acc >= 0.95 ? '非常穩' : acc >= 0.85 ? '很不錯' : acc >= 0.7 ? '大致掌握' : '還需要多練幾次';
  return `<div class="result-score"><p class="result-pct">一次就${verb} <b>${pct}%</b> · ${word}</p></div>`;
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
