import { InputHub, planRange } from './input.js';
import { Keyboard } from './keyboard.js';
import { Piano } from './audio.js';
import { store, today, addDays } from './store.js';
import { LessonRunner, starsHtml } from './engine.js';
import { TRACKS, findLesson } from './lessons/index.js';
import { LESSON_HIGH, LESSON_LOW, noteName, sci, setSolfege } from './notes.js';
import { CONCEPTS } from './lessons/concepts.js';

const $ = (sel) => document.querySelector(sel);
const view = $('#view');
const hub = new InputHub();
const kb = new Keyboard($('#keyboard'), hub);
const piano = new Piano();
let runner = null;
let homeTrack = store.level || 'beginner';

setSolfege(store.settings.solfege);

// ---------- sound & keyboard wiring ----------

const unlockAudio = () => piano.unlock();
window.addEventListener('pointerdown', unlockAudio);
window.addEventListener('keydown', unlockAudio);

hub.addEventListener('noteon', (e) => {
  const { note, velocity, source } = e.detail;
  if (source !== 'midi' || store.settings.echo) piano.noteOn(note, velocity);
  $('#kb-now').textContent = `${noteName(note)}（${sci(note)}）`;
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
}

// ---------- MIDI status & calibration prompts ----------

function updateMidiStatus() {
  const pill = $('#midi-status');
  if (!hub.midiSupported) {
    pill.textContent = '此瀏覽器不支援 MIDI · 使用電腦鍵盤';
    pill.classList.remove('on');
    return;
  }
  const name = hub.deviceName;
  if (!name) {
    pill.textContent = 'MIDI：未連接 · 使用電腦鍵盤';
    pill.classList.remove('on');
    return;
  }
  const cal = store.calibrationFor(name);
  pill.textContent = `MIDI：${name}${cal ? `（${cal.physHigh - cal.physLow + 1} 鍵）` : '（未校準）'}`;
  pill.classList.add('on');
}

hub.addEventListener('devices', () => {
  updateMidiStatus();
  applyRange();
  const name = hub.deviceName;
  if (name && !store.calibrationFor(name)) {
    if (runner) showBanner('偵測到新的 MIDI 鍵盤。離開課程後可在「設定」中校準。');
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
    <button class="btn btn-ghost" data-act="close">關閉</button></span>`;
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
  let low = null;
  let high = null;
  const render = () => {
    const stepCls = (i) => (i === 0 ? (low === null ? 'cur' : 'done') : low === null ? '' : high === null ? 'cur' : 'done');
    const plan = high !== null ? planRange(low, high) : null;
    view.innerHTML = `
      <div class="card">
        <div class="stage-kicker">校準 MIDI 鍵盤</div>
        <h2>${name}</h2>
        <p>為了正確對齊畫面上的琴鍵，請依序按下你的鍵盤上<b>最左邊</b>和<b>最右邊</b>的鍵。若剛剛動過八度切換鍵，請先切回原位。</p>
        <div class="calib-steps">
          <div class="calib-step ${stepCls(0)}"><b>1. 按最左邊（最低）的鍵</b>${low !== null ? `✓ ${sci(low)}` : '等待中…'}</div>
          <div class="calib-step ${stepCls(1)}"><b>2. 按最右邊（最高）的鍵</b>${high !== null ? `✓ ${sci(high)}` : low !== null ? '等待中…' : ''}</div>
        </div>
        ${plan ? `<p class="callout">偵測到 <b>${plan.keys} 鍵</b>（${sci(low)}–${sci(high)}）。${plan.offset ? '已自動調整八度，讓課程的音域落在你的鍵盤上。' : ''}${plan.keys < 25 ? '<br>你的鍵盤少於 25 鍵，部分練習可能超出範圍。' : ''}</p>` : ''}
        <div class="footer-actions">
          <button class="btn" data-act="redo">重新開始</button>
          <span class="spacer"></span>
          <button class="btn btn-primary" data-act="done" ${plan ? '' : 'disabled'}>完成</button>
        </div>
      </div>`;
    view.querySelector('[data-act="redo"]').onclick = () => { low = high = null; render(); };
    view.querySelector('[data-act="done"]').onclick = () => {
      const p = planRange(low, high);
      store.setCalibration(name, { physLow: low, physHigh: high, offset: p.offset });
      hub.capture = null;
      applyRange();
      updateMidiStatus();
      showHome();
    };
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
  view.innerHTML = `
    <div class="card">
      <h1>歡迎來到鍵上樂理</h1>
      <p>用 MIDI 鍵盤學樂理、指法與和弦。每堂課 30–60 分鐘，進度存在這個瀏覽器裡。</p>
      <p>先選一條路線，之後隨時可以在首頁切換：</p>
      <div class="choice-grid">
        <button class="choice" data-level="beginner"><b>入門</b>從沒學過，或很久沒碰琴。從認識鍵盤、中央 C、手指編號開始。</button>
        <button class="choice" data-level="advanced"><b>進階</b>會認鍵盤、彈過簡單曲子，想學音程、調性、七和弦與伴奏。</button>
      </div>
    </div>`;
  view.querySelectorAll('[data-level]').forEach((b) => {
    b.onclick = () => { store.setLevel(b.dataset.level); homeTrack = b.dataset.level; showHome(); };
  });
}

function lessonState(track, i) {
  const lessons = TRACKS[track].lessons;
  const l = lessons[i];
  const playable = Boolean(l.segments);
  const unlocked = i === 0 || store.lesson(lessons[i - 1].id).completed;
  return { l, playable, unlocked, p: store.lesson(l.id) };
}

function calendarHtml() {
  const weeks = 12;
  const t = today();
  const dow = new Date(`${t}T12:00:00`).getDay();
  const start = addDays(t, -(weeks - 1) * 7 - dow);
  let cells = '';
  for (let i = 0; i < weeks * 7; i++) {
    const d = addDays(start, i);
    if (d > t) { cells += '<i style="visibility:hidden"></i>'; continue; }
    const m = store.practiceOn(d) / 60;
    const l = m <= 0 ? 0 : m < 10 ? 1 : m < 30 ? 2 : 3;
    cells += `<i data-l="${l}" class="${d === t ? 'today' : ''}" title="${d}：${Math.round(m)} 分鐘"></i>`;
  }
  return `<div class="cal" aria-label="最近 12 週練習紀錄">${cells}</div>`;
}

function showHome() {
  runner = null;
  hub.capture = null;
  kb.clearMarks();
  if (!store.level) { showLevelChoice(); return; }
  const track = TRACKS[homeTrack];

  // "Continue" target: a lesson left mid-way, else the first unlocked, unfinished, playable lesson.
  let cont = null;
  track.lessons.forEach((_, i) => {
    const s = lessonState(homeTrack, i);
    if (!cont && s.playable && s.unlocked && s.p.segment > 0) cont = { ...s, resume: true };
  });
  if (!cont) {
    track.lessons.forEach((_, i) => {
      const s = lessonState(homeTrack, i);
      if (!cont && s.playable && s.unlocked && !s.p.completed) cont = { ...s, resume: false };
    });
  }

  const due = store.dueConcepts().filter((id) => CONCEPTS[id]);
  const segNames = ['暖身複習', '新概念', '引導練習', '實際曲目', '總結評分'];

  view.innerHTML = `
    <div class="card hero">
      <div>
        <div class="stage-kicker">${track.name}路線</div>
        ${cont
          ? `<h1>第 ${cont.l.num} 課：${cont.l.title}</h1>
             <p class="muted">${cont.resume ? `上次停在第 ${cont.p.segment + 1} 段「${segNames[cont.p.segment]}」` : cont.l.desc}</p>`
          : `<h1>這條路線目前的課程都完成了</h1><p class="muted">更多課程製作中。可以重玩已完成的課來拿更多星星。</p>`}
      </div>
      ${cont ? `<button class="btn btn-primary btn-lg" data-start="${cont.l.id}" data-seg="${cont.resume ? cont.p.segment : 0}">${cont.resume ? '繼續上課' : '開始上課'} →</button>` : ''}
    </div>

    <div class="card">
      <div class="stats">
        <div class="stat"><b>${store.streak()}</b><span>連續練習天數</span></div>
        <div class="stat"><b>${Math.round(store.practiceOn(today()) / 60)}</b><span>今天練習（分鐘）</span></div>
        <div class="stat"><b>${store.totalMinutesLast(7)}</b><span>近 7 天（分鐘）</span></div>
      </div>
      ${calendarHtml()}
      ${due.length ? `<p class="callout" style="margin-top:14px">有 <b>${due.length}</b> 個概念待複習（${due.map((id) => CONCEPTS[id].name).join('、')}），會出現在下一課的暖身。</p>` : ''}
    </div>

    <div class="card">
      <div class="row">
        <h2 style="margin:0">課程</h2><span class="spacer"></span>
        <div class="tabs" role="tablist">
          ${Object.entries(TRACKS).map(([k, t]) => `<button class="tab" role="tab" data-track="${k}" aria-selected="${k === homeTrack}">${t.name}</button>`).join('')}
        </div>
      </div>
      <ul class="lesson-list">
        ${track.lessons.map((_, i) => {
          const s = lessonState(homeTrack, i);
          const open = s.playable && s.unlocked;
          const right = !s.playable
            ? '<span class="pill">製作中</span>'
            : !s.unlocked
              ? '<span class="pill">🔒 完成上一課解鎖</span>'
              : `${s.p.completed || s.p.bestStars ? starsHtml(s.p.bestStars) : ''}
                 <button class="btn" data-start="${s.l.id}" data-seg="0">${s.p.completed ? '重玩' : '開始'}</button>`;
          return `<li class="lesson ${open ? '' : 'locked'}">
            <span class="lesson-num">${s.l.num}</span>
            <div class="lesson-body"><div class="lesson-title">${s.l.title}</div><div class="lesson-desc">${s.l.desc}</div></div>
            ${right}
          </li>`;
        }).join('')}
      </ul>
    </div>`;

  view.querySelectorAll('[data-track]').forEach((b) => {
    b.onclick = () => { homeTrack = b.dataset.track; store.setLevel(homeTrack); showHome(); };
  });
  view.querySelectorAll('[data-start]').forEach((b) => {
    b.onclick = () => startLesson(b.dataset.start, Number(b.dataset.seg));
  });
}

function startLesson(id, segment) {
  const lesson = findLesson(id);
  if (!lesson?.segments) return;
  $('#banner').hidden = true;
  runner = new LessonRunner({ root: view, lesson, hub, kb, piano, store, onExit: showHome });
  runner.run(segment);
}

// ---------- settings ----------

const dlg = $('#settings');
$('#settings-btn').onclick = () => {
  $('#set-echo').checked = store.settings.echo;
  $('#set-solfege').checked = store.settings.solfege;
  $('#set-calibrate').disabled = !hub.deviceName;
  dlg.showModal();
};
$('#set-echo').onchange = (e) => store.setSetting('echo', e.target.checked);
$('#set-solfege').onchange = (e) => { store.setSetting('solfege', e.target.checked); setSolfege(e.target.checked); };
$('#set-calibrate').onclick = () => {
  dlg.close();
  if (runner) runner.exit();
  showCalibration();
};
$('#set-export').onclick = () => store.export();
$('#set-import').onchange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    await store.import(file);
    setSolfege(store.settings.solfege);
    applyRange();
    dlg.close();
    if (runner) runner.exit(); else showHome();
  } catch {
    alert('無法讀取這個檔案，請確認是「鍵上樂理」匯出的進度檔。');
  }
  e.target.value = '';
};
$('#set-reset').onclick = () => {
  if (!confirm('確定要清除所有進度、星等與練習紀錄嗎？此動作無法復原。')) return;
  store.reset();
  setSolfege(false);
  dlg.close();
  if (runner) runner.exit(); else showHome();
};
$('#brand').onclick = () => { if (runner) runner.exit(); else showHome(); };

// ---------- boot ----------

applyRange();
updateMidiStatus();
showHome();
hub.initMidi().then(updateMidiStatus);
