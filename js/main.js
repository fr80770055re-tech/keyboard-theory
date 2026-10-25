import { InputHub, planRange, QWERTY } from './input.js';
import { Keyboard } from './keyboard.js';
import { Piano } from './audio.js';
import { store, today, addDays } from './store.js';
import { LessonRunner, SEGMENT_NAMES, starsHtml } from './engine.js';
import { TRACKS, findLesson } from './lessons/index.js';
import { LESSON_HIGH, LESSON_LOW, fullName, sci, setSolfege } from './notes.js';
import { CONCEPTS, reviewSteps } from './lessons/concepts.js';
import { icon } from './icons.js';

const $ = (sel) => document.querySelector(sel);
const view = $('#view');
const hub = new InputHub();
const kb = new Keyboard($('#keyboard'), hub);
const piano = new Piano();
let runner = null;
let homeTrack = store.level || 'beginner';

const QWERTY_LABELS = Object.fromEntries(Object.entries(QWERTY).map(([k, n]) => [n, k.toUpperCase()]));

setSolfege(store.settings.solfege);

// ---------- sound & keyboard wiring ----------

const unlockAudio = () => piano.unlock();
window.addEventListener('pointerdown', unlockAudio);
window.addEventListener('keydown', unlockAudio);

hub.addEventListener('noteon', (e) => {
  const { note, velocity, source } = e.detail;
  if (source !== 'midi' || store.settings.echo) piano.noteOn(note, velocity);
  $('#kb-now').textContent = fullName(note);
});
hub.addEventListener('noteoff', (e) => piano.noteOff(e.detail.note));
piano.onDemoNote = (group, on) => group.forEach((n) => kb.showDown(n, on));

function applyRange() {
  const cal = hub.deviceName ? store.calibrationFor(hub.deviceName) : null;
  hub.setCalibration(cal);
  if (cal) {
    const plan = planRange(cal.physLow, cal.physHigh);
    kb.setRange(plan.low, plan.high);
  } else {
    kb.setRange(LESSON_LOW, LESSON_HIGH);
  }
  // Without a MIDI keyboard, print the computer key on each on-screen key.
  const touch = matchMedia('(pointer: coarse)').matches;
  const qwerty = !hub.deviceName && !touch;
  kb.setKeyHints(qwerty ? QWERTY_LABELS : null);
  $('#kb-hint').textContent = hub.deviceName ? '用你的 MIDI 鍵盤彈奏'
    : touch ? '點畫面上的琴鍵彈奏' : '沒有 MIDI 鍵盤？按琴鍵上的字母，或用滑鼠點';
}

function setKeyboardVisible(on) {
  document.body.classList.toggle('kb-off', !on);
}

// In a lesson the keyboard is the stage: taller keys, a cue lane above them.
function setLessonMode(on) {
  document.body.classList.toggle('in-lesson', on);
  document.body.classList.remove('result-mode', 'step-read');
}

// ---------- MIDI status & calibration prompts ----------

function updateMidiStatus() {
  const pill = $('#midi-status');
  const name = hub.deviceName;
  pill.classList.toggle('on', Boolean(name));
  if (!hub.midiSupported) {
    pill.textContent = '此瀏覽器不支援 MIDI';
    pill.title = '請改用 Chrome 或 Edge；目前可用電腦鍵盤或滑鼠彈奏';
    return;
  }
  if (!name) {
    pill.textContent = '未連接 MIDI';
    pill.title = '接上 MIDI 鍵盤後會自動偵測';
    return;
  }
  const cal = store.calibrationFor(name);
  pill.textContent = cal ? `${name} · ${cal.physHigh - cal.physLow + 1} 鍵` : `${name} · 未校準`;
  pill.title = name;
}

hub.addEventListener('devices', () => {
  updateMidiStatus();
  applyRange();
  const name = hub.deviceName;
  if (name && !store.calibrationFor(name)) {
    if (runner) showBanner('偵測到新的 MIDI 鍵盤。離開課程後可在「設定與說明」中校準。');
    else showCalibration();
  }
});

let lastRangeWarn = 0;
hub.addEventListener('outofrange', () => {
  if (Date.now() - lastRangeWarn < 8000) return;
  lastRangeWarn = Date.now();
  showBanner('彈到校準範圍外的音了。是不是按到鍵盤的「八度切換」鍵？請切回原位，或重新校準。', true);
});

function showBanner(text, withCalibrate = false) {
  const b = $('#banner');
  b.innerHTML = `<span>${text}</span><span class="row">
    ${withCalibrate && !runner ? '<button class="btn" data-act="cal">重新校準</button>' : ''}
    <button class="btn btn-ghost" data-act="close" aria-label="關閉提示">${icon.cross()}</button></span>`;
  b.hidden = false;
  b.querySelector('[data-act="close"]').onclick = () => { b.hidden = true; };
  const cal = b.querySelector('[data-act="cal"]');
  if (cal) cal.onclick = () => { b.hidden = true; showCalibration(); };
}

// ---------- views ----------

function showCalibration() {
  if (runner) return;
  const name = hub.deviceName;
  if (!name) { showHome(); return; }
  setKeyboardVisible(true);
  setLessonMode(false);
  let low = null;
  let high = null;
  const render = () => {
    const stepCls = (i) => (i === 0 ? (low === null ? 'cur' : 'done') : low === null ? '' : high === null ? 'cur' : 'done');
    const plan = high !== null ? planRange(low, high) : null;
    view.innerHTML = `
      <section class="panel">
        <h1>校準你的 MIDI 鍵盤</h1>
        <p class="sub">${name}</p>
        <p>為了讓畫面上的琴鍵和你的鍵盤對齊，請依序按下鍵盤上<b>最左邊</b>和<b>最右邊</b>的鍵。如果剛剛動過八度切換鍵，請先切回原位。</p>
        <ol class="calib-steps">
          <li class="calib-step ${stepCls(0)}"><b>按最左邊（最低）的鍵</b><span>${low !== null ? `${icon.check()} ${sci(low)}` : '等待中…'}</span></li>
          <li class="calib-step ${stepCls(1)}"><b>按最右邊（最高）的鍵</b><span>${high !== null ? `${icon.check()} ${sci(high)}` : low !== null ? '等待中…' : '　'}</span></li>
        </ol>
        ${plan ? `<p class="callout">${icon.check()}<span>偵測到 <b>${plan.keys} 鍵</b>（${sci(low)}–${sci(high)}）。${plan.offset ? '已自動調整八度，讓課程的音域落在你的鍵盤上。' : ''}${plan.keys < 25 ? '你的鍵盤少於 25 鍵，部分練習可能超出範圍。' : ''}</span></p>` : ''}
        <div class="footer-actions">
          <button class="btn" data-act="redo">重新開始</button>
          <span class="spacer"></span>
          <button class="btn btn-primary" data-act="done" ${plan ? '' : 'disabled'}>完成校準</button>
        </div>
      </section>`;
    view.querySelector('[data-act="redo"]').onclick = () => { low = high = null; render(); };
    const done = view.querySelector('[data-act="done"]');
    done.onclick = () => {
      const p = planRange(low, high);
      store.setCalibration(name, { physLow: low, physHigh: high, offset: p.offset });
      hub.capture = null;
      applyRange();
      updateMidiStatus();
      showHome();
    };
    if (plan) done.focus();
  };
  hub.capture = (note) => {
    if (low === null) low = note;
    else if (high === null) {
      if (note <= low) low = note; // pressed something lower: treat as the new lowest
      else high = note;
    }
    render();
  };
  render();
}

function showLevelChoice() {
  setKeyboardVisible(false);
  view.innerHTML = `
    <section class="welcome">
      <div class="staff-rule" aria-hidden="true"></div>
      <h1>從第一個音開始，<br>好好學會鍵盤上的樂理。</h1>
      <p class="lead">用 MIDI 鍵盤或電腦鍵盤，一堂 30–60 分鐘，邊彈邊學音名、指法與和弦。進度存在這個瀏覽器裡。</p>
      <h2 class="choice-title">先選一條路線（之後隨時可以切換）</h2>
      <div class="choice-grid">
        <button class="choice" data-level="beginner"><b>入門</b><span>從沒學過，或很久沒碰琴。從認識鍵盤、中央 C、手指編號開始。</span></button>
        <button class="choice" data-level="advanced"><b>進階</b><span>會認鍵盤、彈過簡單曲子，想學音程、調性、七和弦與伴奏。</span></button>
      </div>
    </section>`;
  view.querySelectorAll('[data-level]').forEach((b) => {
    b.onclick = () => { store.setLevel(b.dataset.level); homeTrack = b.dataset.level; showHome(); };
  });
}

function lessonState(track, i) {
  const lessons = TRACKS[track].lessons;
  const l = lessons[i];
  const playable = Boolean(l.segments);
  // Unlocked once every earlier lesson that exists is finished (lessons still in
  // production don't block the ones after them).
  const unlocked = lessons.slice(0, i).every((p) => !p.segments || store.lesson(p.id).completed);
  return { l, playable, unlocked, p: store.lesson(l.id), next: lessons[i + 1] || null };
}

function calendarHtml() {
  const weeks = 12;
  const t = today();
  const dow = new Date(`${t}T12:00:00`).getDay();
  const start = addDays(t, -(weeks - 1) * 7 - dow);
  let cells = '';
  let days = 0;
  for (let i = 0; i < weeks * 7; i++) {
    const d = addDays(start, i);
    if (d > t) { cells += '<i class="future"></i>'; continue; }
    const m = store.practiceOn(d) / 60;
    if (m > 0) days++;
    const l = m <= 0 ? 0 : m < 10 ? 1 : m < 30 ? 2 : 3;
    cells += `<i data-l="${l}" class="${d === t ? 'today' : ''}" title="${d}：${minutesText(m * 60)}"></i>`;
  }
  return `<figure class="cal-wrap">
    <div class="cal" role="img" aria-label="最近 12 週有 ${days} 天練習">${cells}</div>
    <figcaption class="cal-legend"><span>最近 12 週</span><span class="spacer"></span>少<i data-l="0"></i><i data-l="1"></i><i data-l="2"></i><i data-l="3"></i>多</figcaption>
  </figure>`;
}

function minutesText(seconds) {
  if (seconds <= 0) return '0 分鐘';
  if (seconds < 60) return '不到 1 分鐘';
  return `${Math.round(seconds / 60)} 分鐘`;
}

function reviewSet() {
  return store.reviewQueue(4).filter((id) => CONCEPTS[id]);
}

// The daily habit: a five-minute review that is always available once anything
// has been learned, and that keeps the streak going between lessons.
function dailyHtml(compact = false, hideButton = false) {
  const set = reviewSet();
  const done = Boolean(store.dayOf(today())?.review);
  const streak = store.streak();
  const week = Array.from({ length: 7 }, (_, i) => addDays(today(), i - 6));
  const wd = ['日', '一', '二', '三', '四', '五', '六'];
  const strip = week.map((d) => {
    const on = Boolean(store.dayOf(d));
    const dow = new Date(`${d}T12:00:00`).getDay();
    const name = d === today() ? '今天' : `星期${wd[dow]}`;
    return `<li class="${on ? 'on' : ''} ${d === today() ? 'today' : ''}"><span class="dot" aria-hidden="true">${on ? icon.check() : ''}</span><small aria-hidden="true">${d === today() ? '今天' : wd[dow]}</small><span class="sr-only">${name}${on ? '已練習' : '未練習'}</span></li>`;
  }).join('');
  const H = compact ? 'h2' : 'h1';
  return `<section class="daily ${done ? 'is-done' : ''} ${compact ? 'compact' : ''}">
    <div class="daily-text">
      <${H}>${done ? '今天的複習完成了' : '今日複習'}</${H}>
      <p class="lead">${done
        ? '明天再回來 5 分鐘，記憶會越來越穩。想多練也可以再來一輪。'
        : `約 5 分鐘，複習 <b>${set.map((id) => CONCEPTS[id].name).join('、')}</b>。答錯的明天再出現，答對的會隔越來越久。`}</p>
      ${hideButton ? '' : `<div class="daily-actions">
        <button class="btn ${done || compact ? '' : 'btn-primary btn-lg'}" data-review>${icon.replay()}${done ? '再複習一輪' : '開始今日複習'}</button>
      </div>`}
    </div>
    <div class="daily-streak" role="group" aria-label="連續練習 ${streak} 天">
      <p class="streak-num"><b>${streak}</b> 天連續練習</p>
      <ol class="week">${strip}</ol>
    </div>
  </section>`;
}

// What a learner should do next in the course, in priority order:
// 1. the lesson they are working through (resume or start),
// 2. a replay they left mid-way,
// 3. raising the lowest-starred finished lesson,
// 4. with everything at three stars, another review round.
function nextStep() {
  const states = TRACKS[homeTrack].lessons.map((_, i) => lessonState(homeTrack, i));
  if (!states.some((s) => s.playable)) return { kind: 'none' };
  const core = states.find((s) => s.playable && s.unlocked && !s.p.completed);
  if (core) return { kind: core.p.segment > 0 ? 'resume' : 'start', s: core };
  const replay = states.find((s) => s.playable && s.p.completed && s.p.segment > 0);
  if (replay) return { kind: 'replay', s: replay };
  const improve = states.filter((s) => s.playable && s.p.completed && s.p.bestStars < 3)
    .sort((x, y) => x.p.bestStars - y.p.bestStars)[0];
  if (improve) return { kind: 'improve', s: improve };
  return { kind: 'review', s: [...states].reverse().find((s) => s.playable) };
}

function heroHtml(secondary) {
  const track = TRACKS[homeTrack];
  const next = nextStep();
  const H = secondary ? 'h2' : 'h1';
  const cls = secondary ? '' : 'btn-primary btn-lg'; // only one filled button leads the page
  const card = (title, lead, button) => `<section class="hero ${secondary ? 'hero-sm' : ''}">
      <div class="hero-text"><${H}>${title}</${H}><p class="lead">${lead}</p></div>
      ${button}
    </section>`;
  const { s } = next;
  const segName = (st) => SEGMENT_NAMES[st.l.segments[st.p.segment].kind];
  const upcoming = s && TRACKS[homeTrack].lessons.find((l) => l.num === s.l.num + 1);
  const comingSoon = upcoming && !upcoming.segments ? `第 ${upcoming.num} 課還在製作中，` : '';

  switch (next.kind) {
    case 'none':
      return card(`${track.name}課程製作中`, `${track.name}路線的課程正在編寫。現在可以先從入門第 1 課開始，順便熟悉操作方式。`,
        `<button class="btn ${cls}" data-track="beginner">改看入門課程${icon.next()}</button>`);
    case 'resume':
      return card(`第 ${s.l.num} 課　${s.l.title}`, `上次停在第 ${s.p.segment + 1} 段「${segName(s)}」，從這一段繼續。`,
        `<button class="btn ${cls}" data-start="${s.l.id}" data-seg="${s.p.segment}">繼續上課${icon.next()}</button>`);
    case 'start':
      return card(`第 ${s.l.num} 課　${s.l.title}`, s.l.desc,
        `<button class="btn ${cls}" data-start="${s.l.id}" data-seg="0">開始上課${icon.next()}</button>`);
    case 'replay':
      return card(`繼續重玩第 ${s.l.num} 課`, `重玩到第 ${s.p.segment + 1} 段「${segName(s)}」。目前最佳 ${s.p.bestStars} 顆星；這次若更好，會取代目前的紀錄。`,
        `<button class="btn ${cls}" data-start="${s.l.id}" data-seg="${s.p.segment}">繼續重玩${icon.next()}</button>`);
    case 'improve':
      return card(`挑戰第 ${s.l.num} 課三顆星`, `目前最佳 ${s.p.bestStars} 顆星。${comingSoon}現在最好的加強方式是把這一課再彈一次，約 30 分鐘。`,
        `<button class="btn ${cls}" data-start="${s.l.id}" data-seg="0">重玩第 ${s.l.num} 課${icon.next()}</button>`);
    default:
      return card('目前的課程都拿到三顆星了', `${comingSoon}在那之前，多做幾輪複習能讓記憶更穩。`,
        `<button class="btn ${cls}" data-review>${icon.replay()}再複習一輪</button>`);
  }
}

function statsHtml() {
  const any = Object.keys(store.data.practice).length > 0;
  if (!any) {
    return `<section class="panel progress-panel">
      <h2>練習紀錄</h2>
      <p class="muted">還沒有練習紀錄。開始上課後，每天的練習時間和連續天數會記在這裡。</p>
      ${calendarHtml()}
    </section>`;
  }
  return `<section class="panel progress-panel">
    <h2>練習紀錄</h2>
    <dl class="stats">
      <div><dt>累計練習</dt><dd>${Object.keys(store.data.days).length}<small> 天</small></dd></div>
      <div><dt>今天</dt><dd>${minutesText(store.practiceOn(today())).replace(' 分鐘', '<small> 分鐘</small>')}</dd></div>
      <div><dt>近 7 天</dt><dd>${store.totalMinutesLast(7)}<small> 分鐘</small></dd></div>
    </dl>
    ${calendarHtml()}
  </section>`;
}

function lessonsHtml() {
  const track = TRACKS[homeTrack];
  return `<section class="panel">
    <div class="row">
      <h2>課程</h2><span class="spacer"></span>
      <div class="seg-control" role="group" aria-label="路線">
        ${Object.entries(TRACKS).map(([k, t]) => `<button class="seg-btn" data-track="${k}" aria-pressed="${k === homeTrack}">${t.name}</button>`).join('')}
      </div>
    </div>
    <ol class="lesson-list">
      ${track.lessons.map((_, i) => {
        const s = lessonState(homeTrack, i);
        const open = s.playable && s.unlocked;
        let right;
        if (!s.playable) right = '<span class="tag">製作中</span>';
        else if (!s.unlocked) right = `<span class="tag">${icon.lock()}完成上一課解鎖</span>`;
        else if (s.p.segment > 0) {
          // A replay in progress keeps the lesson's best stars visible.
          right = `${s.p.completed ? starsHtml(s.p.bestStars) : ''}<button class="btn" data-start="${s.l.id}" data-seg="${s.p.segment}">${s.p.completed ? '繼續重玩' : '繼續'}（第 ${s.p.segment + 1} 段）</button>`;
        }
        else right = `${s.p.completed ? starsHtml(s.p.bestStars) : ''}<button class="btn" data-start="${s.l.id}" data-seg="0">${s.p.completed ? '重玩' : '開始'}</button>`;
        return `<li class="lesson ${open ? '' : 'locked'} ${s.p.completed ? 'completed' : ''}">
          <span class="lesson-num" aria-hidden="true">${s.p.completed ? icon.check() : s.l.num}</span>
          <div class="lesson-body"><div class="lesson-title">第 ${s.l.num} 課　${s.l.title}</div><div class="lesson-desc">${s.l.desc}</div></div>
          <div class="lesson-right">${right}</div>
        </li>`;
      }).join('')}
    </ol>
  </section>`;
}

function showHome() {
  runner = null;
  setLessonMode(false);
  hub.capture = null;
  kb.clearMarks();
  if (!store.level) { showLevelChoice(); return; }
  setKeyboardVisible(false);
  // Lead with one clear action. New learners start lesson 1. Unfinished course
  // progress comes first; otherwise today's review leads until it is done, and
  // then the next course step does, with the finished review shrunk to a row.
  const learned = store.hasLearned();
  const next = nextStep();
  const reviewDone = Boolean(store.dayOf(today())?.review);
  let top;
  if (!learned) top = heroHtml(false);
  else if (next.kind === 'resume') top = heroHtml(false) + dailyHtml(true);
  // With everything at three stars, the review itself is the next step: don't offer it twice.
  else if (!reviewDone) top = dailyHtml() + (next.kind === 'review' ? '' : heroHtml(true));
  else top = heroHtml(false) + dailyHtml(true, next.kind === 'review');
  view.innerHTML = `${top}<div class="home-grid">${lessonsHtml()}${statsHtml()}</div>`;

  view.querySelectorAll('[data-track]').forEach((b) => {
    b.onclick = () => { homeTrack = b.dataset.track; store.setLevel(homeTrack); showHome(); };
  });
  view.querySelectorAll('[data-start]').forEach((b) => {
    b.onclick = () => startLesson(b.dataset.start, Number(b.dataset.seg));
  });
  view.querySelectorAll('[data-review]').forEach((b) => { b.onclick = startReview; });
  view.scrollTo(0, 0);
}

function startLesson(id, segment) {
  const lesson = findLesson(id);
  if (!lesson?.segments) return;
  const track = Object.values(TRACKS).find((t) => t.lessons.includes(lesson));
  const nextLesson = track.lessons[track.lessons.indexOf(lesson) + 1] || null;
  launch(new LessonRunner({ root: view, lesson, hub, kb, piano, store, onExit: showHome, nextLesson }), segment);
}

function startReview() {
  const due = reviewSet();
  if (!due.length) return;
  const lesson = {
    id: 'review', isReview: true, title: '今日複習',
    segments: [{ kind: 'review', minutes: 5, graded: true, steps: due.flatMap((id) => reviewSteps(id)) }],
  };
  launch(new LessonRunner({ root: view, lesson, hub, kb, piano, store, onExit: showHome }), 0);
}

function launch(r, segment) {
  $('#banner').hidden = true;
  setKeyboardVisible(true);
  setLessonMode(true);
  // On narrow screens the keyboard scrolls; start with middle C in view.
  const sc = $('.kb-scroll');
  sc.scrollLeft = (sc.scrollWidth - sc.clientWidth) / 2;
  runner = r;
  runner.run(segment);
  view.scrollTo(0, 0);
}

// ---------- settings ----------

const dlg = $('#settings');
const msg = (text) => { $('#set-msg').textContent = text; };
let resetArmed = false;
$('#settings-btn').onclick = () => {
  $('#set-echo').checked = store.settings.echo;
  $('#set-solfege').checked = store.settings.solfege;
  $('#set-calibrate').disabled = !hub.deviceName;
  $('#cal-note').textContent = hub.deviceName ? `目前裝置：${hub.deviceName}` : '連接 MIDI 鍵盤後才能校準。';
  resetArmed = false;
  $('#set-reset').textContent = '清除所有進度…';
  msg('');
  dlg.showModal();
};
$('#set-echo').onchange = (e) => store.setSetting('echo', e.target.checked);
$('#set-solfege').onchange = (e) => { store.setSetting('solfege', e.target.checked); setSolfege(e.target.checked); };
$('#set-calibrate').onclick = () => {
  dlg.close();
  if (runner) runner.requestExit(showCalibration);
  else showCalibration();
};
$('#set-export').onclick = () => { store.export(); msg('已下載進度檔。'); };
$('#set-import-btn').onclick = () => $('#set-import').click();
$('#set-import').onchange = async (e) => {
  const file = e.target.files[0];
  e.target.value = '';
  if (!file) return;
  try {
    await store.import(file);
  } catch {
    msg('無法讀取這個檔案：請選擇從「鍵上樂理」匯出的 .json 進度檔。');
    return;
  }
  setSolfege(store.settings.solfege);
  applyRange();
  msg('已匯入進度。');
  if (runner) runner.exit(); else showHome();
};
$('#set-reset').onclick = () => {
  if (!resetArmed) {
    resetArmed = true;
    $('#set-reset').textContent = '確定清除？星等、複習與練習紀錄都會刪除，無法復原。再按一次確認';
    return;
  }
  store.reset();
  setSolfege(false);
  dlg.close();
  if (runner) runner.exit(); else showHome();
};
// Keep hands near the keys: Enter / Space = the stage's main button, L = listen again.
// L is deliberately outside the computer-keyboard note map, so it never plays a note.
window.addEventListener('keydown', (e) => {
  if (!runner || dlg.open || $('#leave').open || e.ctrlKey || e.metaKey || e.altKey) return;
  // A stray Esc should never drop the learner out of a lesson unasked.
  if (e.key === 'Escape') { e.preventDefault(); runner.requestExit(null, { ask: true }); return; }
  const t = e.target;
  if (t && (t.tagName === 'BUTTON' || t.tagName === 'INPUT' || t.tagName === 'SUMMARY')) return;
  const stage = view.querySelector('.stage');
  if (!stage) return;
  if (e.key === 'Enter' || e.key === ' ') {
    const primary = stage.querySelector('.btn-primary');
    if (primary) { e.preventDefault(); primary.click(); }
  } else if (e.key.toLowerCase() === 'l' && !(e.key.toLowerCase() in QWERTY)) {
    const replay = stage.querySelector('[data-act="replay"], [data-act="demo"]');
    if (replay) { e.preventDefault(); replay.click(); }
  }
});

$('#brand').onclick = () => { if (runner) runner.requestExit(); else showHome(); };

// Closing or reloading the tab mid-segment would silently restart it: warn first.
window.addEventListener('beforeunload', (e) => {
  if (runner?.dirty && !runner.atResult) e.preventDefault();
});

// Another tab saved progress: refresh the home page so it never shows stale state.
store.addEventListener('change', () => {
  setSolfege(store.settings.solfege);
  if (!runner && !hub.capture && !dlg.open && store.level) showHome();
});

// ---------- boot ----------

applyRange();
updateMidiStatus();
showHome();
hub.initMidi().then(updateMidiStatus);

// Installable web app: cache the app shell so it opens offline.
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
