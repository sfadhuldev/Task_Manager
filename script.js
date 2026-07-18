// ===========================
// 1. APPLICATION STATE
// ===========================
const S = {
  tasks: [], habits: [], goals: [], notes: [],
  filter: 'all', sort: 'date-desc', search: '',
  editId: null, bulk: false, bulkSet: new Set(),
  calYear: 0, calMonth: 0,
  pomo: { mode: 'focus', time: 25*60, max: 25*60, run: false, id: null, sessions: 0, today: 0, week: 0, focusTm: 25, shortTm: 5, longTm: 15 },
  completedCount: 0, streak: 0, userLevel: 1, userXP: 0,
  quoteIdx: 0, confettiEnabled: true,
  confirmCb: null, welcomed: false, userName: 'User',
  notifications: [], notifId: 0,
  focusMusicOsc: null, focusMusicGain: null,
  mood: {date: '', mood: 'neutral', energy: 5},
  activityLog: [], tourStep: -1,
  notifiedTasks: new Set()
};

// SVG ring gradient definition
document.body.insertAdjacentHTML('afterbegin', `<svg style="position:absolute;width:0;height:0"><defs><linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#7c3aed"/><stop offset="100%" stop-color="#06b6d4"/></linearGradient></defs></svg>`);

// ===========================
// 2. DOM REFS
// ===========================
const $ = s => document.querySelector(s), $$ = s => document.querySelectorAll(s);

const sidebar = $('#sidebar'), sidebarToggle = $('#sidebar-toggle'), navItems = $$('.nav-item'), navBadge = $('#nav-badge');
const miniClock = $('#mini-clock'), miniStreak = $('#mini-streak'), miniLevel = $('#mini-level');
const topbarCmd = $('#topbar-cmd'), themeBtn = $('#theme-btn'), topbarDate = $('#topbar-date'), topbarClock = $('#topbar-clock');

const stTotal = $('#st-total'), stActive = $('#st-active'), stDone = $('#st-done'), stOverdue = $('#st-overdue'), stToday = $('#st-today'), stScore = $('#st-score');
const ringFg = $('#ring-fg'), ringPct = $('#ring-pct'), ringSub = $('#ring-sub');
const dashTodayList = $('#dash-today-list'), quoteText = $('#quote-text'), quoteAuthor = $('#quote-author');
const profileAvatar = $('#profile-avatar'), profileName = $('#profile-name'), profileLv = $('#profile-lv');
const profileXpFill = $('#profile-xp-fill'), profileXp = $('#profile-xp'), profileXpNext = $('#profile-xp-next');
const profileTotalDone = $('#profile-total-done'), profileTotalStreak = $('#profile-total-streak');
const profileEditBtn = $('#profile-edit-btn');

const taskForm = $('#task-form'), taskInput = $('#task-input'), addBtn = $('#add-btn');
const taskPriority = $('#task-priority'), taskCategory = $('#task-category'), taskTags = $('#task-tags');
const taskDate = $('#task-date'), taskTime = $('#task-time'), taskRecurring = $('#task-recurring');
const taskList = $('#task-list'), taskSearch = $('#task-search'), searchClear = $('#search-clear');
const filterGroup = $('#filter-group'), taskSort = $('#task-sort');
const emptyState = $('#empty-state'), emptyTitle = $('#empty-title'), emptyMsg = $('#empty-msg');
const footCount = $('#foot-count'), clearDoneBtn = $('#clear-done-btn');
const bulkActions = $('#bulk-actions'), bulkToggle = $('#bulk-toggle'), bulkCount = $('#bulk-count');
const bulkDone = $('#bulk-done'), bulkDelete = $('#bulk-delete');
const exportBtn = $('#export-btn'), importInput = $('#import-input'), tasksClearAll = $('#tasks-clear-all');

const calBody = $('#cal-body'), calLabel = $('#cal-label'), calPrev = $('#cal-prev'), calNext = $('#cal-next'), calTodayBtn = $('#cal-today');
const calHeatmap = $('#cal-heatmap'), calHeatLabel = $('#cal-heat-label');

const kanbanBoard = $('#kanban-board'), kanbanAddBtn = $('#kanban-add-btn');

const habitAddBtn = $('#habit-add-btn'), habitForm = $('#habit-form'), habitInput = $('#habit-input');
const habitSave = $('#habit-save'), habitCancel = $('#habit-cancel'), habitList = $('#habit-list');
const heatmap = $('#heatmap'), heatLabel = $('#heat-label');

const pomoTime = $('#pomo-time'), pomoFg = $('#pomo-fg'), pomoStart = $('#pomo-start');
const pomoPause = $('#pomo-pause'), pomoReset = $('#pomo-reset'), pomoSessions = $('#pomo-sessions');
const pomoModeBtns = $$('.pomo-mode'), pomoToday = $('#pomo-today'), pomoWeek = $('#pomo-week'), pomoTotalSessions = $('#pomo-total-sessions');

const goalAddBtn = $('#goal-add-btn'), goalForm = $('#goal-form'), goalInput = $('#goal-input');
const goalDate = $('#goal-date'), goalSave = $('#goal-save'), goalCancel = $('#goal-cancel'), goalList = $('#goal-list');

const noteForm = $('#note-form'), noteTitle = $('#note-title'), noteBody = $('#note-body'), notesList = $('#notes-list');

const focusEnter = $('#focus-enter'), focusExit = $('#focus-exit'), focusActive = $('#focus-active');
const focusTaskCount = $('#focus-task-count'), focusList = $('#focus-list'), focusMusicBtn = $('#focus-music-btn');

const achieveGrid = $('#achieve-grid');
const setFocus = $('#set-focus'), setShort = $('#set-short'), setLong = $('#set-long');
const settingsExport = $('#settings-export'), settingsImport = $('#settings-import'), settingsPrint = $('#settings-print'), settingsReset = $('#settings-reset');

const modalEdit = $('#modal-edit'), modalConfirm = $('#modal-confirm');
const editForm = $('#edit-form'), editText = $('#edit-text'), editPriority = $('#edit-priority');
const editCategory = $('#edit-category'), editDate = $('#edit-date'), editTime = $('#edit-time');
const editTags = $('#edit-tags'), editRecurring = $('#edit-recurring'), editStatus = $('#edit-status');
const confirmText = $('#confirm-text'), confirmYes = $('#confirm-yes');

const cmdOverlay = $('#cmd-overlay'), cmdInput = $('#cmd-input'), cmdResults = $('#cmd-results');
const toastBox = $('#toast-box'), loader = $('#loader'), app = $('#app'), confettiCanvas = $('#confetti-canvas');
const welcomeOverlay = $('#welcome-overlay'), welcomeStart = $('#welcome-start');
const notifBtn = $('#notif-btn'), notifDropdown = $('#notif-dropdown'), notifList = $('#notif-list'), notifDot = $('#notif-dot');

const fabBtn = $('#fab-btn'), fabMenu = $('#fab-menu');
const timeline = $('#timeline');
const aiToggle = $('#ai-toggle'), aiPanel = $('#ai-panel'), aiMsgs = $('#ai-msgs'), aiInput = $('#ai-input'), aiSend = $('#ai-send'), aiClose = $('#ai-close');
const moodGrid = $('#mood-grid'), energySlider = $('#energy-slider'), energyVal = $('#energy-val');
const briefTodayDone = $('#brief-today-done'), briefFocus = $('#brief-focus'), briefFocusScore = $('#brief-focus-score');
const themeGrid = $('#theme-grid');
const tourOverlay = $('#tour-overlay'), tourTip = $('#tour-tip'), tourTitle = $('#tour-title'), tourDesc = $('#tour-desc'), tourNext = $('#tour-next'), tourSkip = $('#tour-skip');
const particleCanvas = $('#particle-canvas');

const views = Object.fromEntries(['dashboard','tasks','calendar','kanban','habits','pomodoro','goals','notes','focus','achievements','settings'].map(v => [v, $(`#view-${v}`)]));

let weeklyChart = null;

// ===========================
// 3. UTILITIES
// ===========================
const esc = s => { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; };
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2,7);
const today = () => new Date().toISOString().split('T')[0];
const pW = p => ({critical:4,high:3,medium:2,low:1}[p]||0);
const fmtDate = d => {
  if(!d) return '';
  const dt = new Date(d+'T00:00:00'), n = new Date();
  n.setHours(0,0,0,0); dt.setHours(0,0,0,0);
  const diff = Math.round((dt-n)/864e5);
  if(diff===0) return 'Today'; if(diff===1) return 'Tomorrow'; if(diff===-1) return 'Yesterday';
  return dt.toLocaleDateString('en-US',{month:'short',day:'numeric'});
};
const isLate = d => d && d < today();
const overdue = t => !t.completed && isLate(t.dueDate);
const XP_PER_LEVEL = 100;

// ===========================
// 4. LOCAL STORAGE
// ===========================
function loadAll() {
  try {
    const d = JSON.parse(localStorage.getItem('tm_data'));
    if(d) {
      S.tasks = d.tasks||[]; S.habits = d.habits||[]; S.goals = d.goals||[]; S.notes = d.notes||[];
      S.pomo.sessions = d.pomoSessions||0; S.pomo.today = d.pomoToday||0;
      S.pomo.focusTm = d.focusTm||25; S.pomo.shortTm = d.shortTm||5; S.pomo.longTm = d.longTm||15;
      S.completedCount = d.completedCount||0; S.streak = d.streak||0;
      S.userLevel = d.userLevel||1; S.userXP = d.userXP||0;
      S.userName = d.userName||'User'; S.notifications = d.notifications||[];
      S.notifiedTasks = new Set(d.notifiedTasks||[]);
      S.welcomed = d.welcomed||false; S.activityLog = d.activityLog||[];
      if(S.notifications.length) S.notifId = Math.max(...S.notifications.map(n=>n.id))+1;
      // Reset weekly pomodoro counter if week has changed
      const savedWeek = d.pomoWeekTimestamp;
      const now = new Date();
      const startOfWeek = new Date(now); startOfWeek.setDate(now.getDate()-now.getDay()); startOfWeek.setHours(0,0,0,0);
      if(!savedWeek || new Date(savedWeek) < startOfWeek) {
        S.pomo.week = 0;
      } else {
        S.pomo.week = d.pomoWeek||0;
      }
      // Reset daily pomodoro counter if day has changed
      const savedDay = d.pomoDayTimestamp;
      const todayStr = today();
      if(!savedDay || savedDay !== todayStr) {
        S.pomo.today = 0;
      }
    }
    const t = localStorage.getItem('tm_theme');
    const valid = ['dark','light','cyberpunk','midnight','ocean','forest','glass-neon'];
    document.documentElement.setAttribute('data-theme', valid.includes(t) ? t : 'dark');
  } catch(e) {}
}
function saveAll() {
  try {
    localStorage.setItem('tm_data', JSON.stringify({
      tasks: S.tasks, habits: S.habits, goals: S.goals, notes: S.notes,
      pomoSessions: S.pomo.sessions, pomoToday: S.pomo.today, pomoWeek: S.pomo.week,
      pomoWeekTimestamp: new Date().toISOString(), pomoDayTimestamp: today(),
      focusTm: S.pomo.focusTm, shortTm: S.pomo.shortTm, longTm: S.pomo.longTm,
      completedCount: S.completedCount, streak: S.streak,
      userLevel: S.userLevel, userXP: S.userXP, userName: S.userName,
      notifications: S.notifications, notifiedTasks: [...S.notifiedTasks], welcomed: S.welcomed, activityLog: S.activityLog
    }));
  } catch(e) {
    if(e.name === 'QuotaExceededError' || e.code === 22) {
      toast('Storage full! Some data may not be saved.', 'err');
    } else {
      console.error('saveAll error:', e);
    }
  }
}
function saveTheme(t) { localStorage.setItem('tm_theme', t); }

// ===========================
// 5. TOAST
// ===========================
function toast(msg, type='info') {
  const icons = {ok:'fa-check-circle',err:'fa-circle-exclamation',info:'fa-circle-info'};
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<i class="fa-solid ${icons[type]||icons.info}"></i> ${esc(msg)}`;
  toastBox.appendChild(el);
  setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 300); }, 3000);
}

// ===========================
// 6. SOUND
// ===========================
function playSound() {
  try {
    if(!window.ac) window.ac = new (window.AudioContext||window.webkitAudioContext)();
    const c = window.ac; if(c.state==='suspended') c.resume();
    const o = c.createOscillator(), g = c.createGain();
    o.connect(g); g.connect(c.destination);
    o.frequency.setValueAtTime(880, c.currentTime);
    o.frequency.setValueAtTime(1100, c.currentTime+.1);
    g.gain.setValueAtTime(.3, c.currentTime);
    g.gain.exponentialRampToValueAtTime(.01, c.currentTime+.3);
    o.start(); o.stop(c.currentTime+.3);
  } catch(e) {}
}

// ===========================
// 7. NOTIFICATIONS
// ===========================
function addNotif(text, icon='fa-bell') {
  S.notifications.push({id: S.notifId++, text, icon, time: new Date().toISOString(), read: false});
  if(S.notifications.length > 50) S.notifications.shift();
  saveAll(); renderNotifDot(); renderNotifList();
}
function renderNotifDot() {
  const unread = S.notifications.some(n => !n.read);
  notifDot.classList.toggle('hidden', !unread);
}
function renderNotifList() {
  const recent = [...S.notifications].reverse().slice(0,20);
  if(!recent.length) {
    notifList.innerHTML = '<div style="padding:20px;text-align:center;color:var(--tm);font-size:13px">No notifications</div>';
    return;
  }
  notifList.innerHTML = recent.map(n => `<div class="notif-item" data-nid="${n.id}"><i class="fa-solid ${n.icon}" style="color:var(--p)"></i><span>${esc(n.text)}</span></div>`).join('');
  notifList.querySelectorAll('.notif-item').forEach(el => {
    el.addEventListener('click', () => {
      const n = S.notifications.find(x => x.id === parseInt(el.dataset.nid));
      if(n) n.read = true;
      renderNotifDot();
      notifDropdown.classList.add('hidden');
    });
  });
}

// ===========================
// 8. CONFETTI
// ===========================
function confetti() {
  if(!S.confettiEnabled) return;
  const c = confettiCanvas, ctx = c.getContext('2d');
  c.width = window.innerWidth; c.height = window.innerHeight;
  const particles = Array.from({length:120}, () => ({
    x: Math.random()*c.width, y: Math.random()*c.height-c.height,
    w: Math.random()*8+4, h: Math.random()*6+3,
    color: ['#7c3aed','#06b6d4','#f59e0b','#10b981','#ef4444','#ec4899'][Math.floor(Math.random()*6)],
    vx: (Math.random()-.5)*4, vy: Math.random()*3+2, rot: Math.random()*360, rv: (Math.random()-.5)*10
  }));
  let frames = 0;
  function draw() {
    if(frames++ > 100) { ctx.clearRect(0,0,c.width,c.height); return; }
    ctx.clearRect(0,0,c.width,c.height);
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.vy += .05; p.rot += p.rv;
      ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rot*Math.PI/180);
      ctx.fillStyle = p.color; ctx.fillRect(-p.w/2,-p.h/2,p.w,p.h);
      ctx.restore();
    });
    requestAnimationFrame(draw);
  }
  draw();
}

// ===========================
// 9. XP & LEVELS
// ===========================
function addXP(amount) {
  S.userXP += amount;
  while(S.userXP >= XP_PER_LEVEL) {
    S.userXP -= XP_PER_LEVEL;
    S.userLevel++;
    toast(`Level Up! You're now level ${S.userLevel}!`,'ok');
    confetti();
    addNotif(`Reached level ${S.userLevel}!`,'fa-trophy');
  }
  saveAll(); updateProfile();
}
function updateProfile() {
  if(profileAvatar) profileAvatar.textContent = S.userName.charAt(0).toUpperCase();
  if(profileName) profileName.textContent = S.userName;
  if(profileLv) profileLv.textContent = S.userLevel;
  if(miniLevel) miniLevel.textContent = S.userLevel;
  if(profileXpFill) profileXpFill.style.width = Math.min(100, (S.userXP/XP_PER_LEVEL)*100)+'%';
  if(profileXp) profileXp.textContent = S.userXP;
  if(profileXpNext) profileXpNext.textContent = XP_PER_LEVEL;
}

// ===========================
// 10. QUOTES
// ===========================
const QUOTES = [
  {t:'The only way to do great work is to love what you do.',a:'Steve Jobs'},
  {t:'Start where you are. Use what you have. Do what you can.',a:'Arthur Ashe'},
  {t:'The future depends on what you do today.',a:'Mahatma Gandhi'},
  {t:'Don\'t watch the clock; do what it does. Keep going.',a:'Sam Levenson'},
  {t:'The secret of getting ahead is getting started.',a:'Mark Twain'},
  {t:'You don\'t have to be great to start, but you have to start to be great.',a:'Zig Ziglar'},
  {t:'Believe you can and you\'re halfway there.',a:'Theodore Roosevelt'},
  {t:'Success is not final, failure is not fatal.',a:'Winston Churchill'},
  {t:'The best time to plant a tree was 20 years ago. The second best time is now.',a:'Chinese Proverb'},
  {t:'Your limitation—it\'s only your imagination.',a:'Unknown'},
  {t:'It does not matter how slowly you go as long as you do not stop.',a:'Confucius'},
  {t:'Everything you\'ve ever wanted is on the other side of fear.',a:'George Addair'},
  {t:'The only impossible journey is the one you never begin.',a:'Tony Robbins'},
  {t:'What you get by achieving your goals is not as important as what you become.',a:'Zig Ziglar'},
  {t:'The way to get started is to quit talking and begin doing.',a:'Walt Disney'}
];
function nextQuote() {
  S.quoteIdx = (S.quoteIdx+1) % QUOTES.length;
  const q = QUOTES[S.quoteIdx];
  if(quoteText) quoteText.textContent = q.t;
  if(quoteAuthor) quoteAuthor.textContent = '— '+q.a;
}

// ===========================
// 11. NAVIGATION
// ===========================
function goView(name) {
  Object.entries(views).forEach(([k,v]) => v.classList.toggle('active', k===name));
  navItems.forEach(n => n.classList.toggle('active', n.dataset.view===name));
  sidebar.classList.remove('open');
  if(name==='dashboard') setTimeout(updateChart, 100);
  if(name==='calendar') { renderCal(); renderCalHeatmap(); }
  if(name==='kanban') renderKanban();
  if(name==='habits') { renderHabits(); renderHeatmap(); }
  if(name==='achievements') renderAchievements();
}

// ===========================
// 12. TASK CRUD
// ===========================
function addTask(text, priority, category, tags, date, time, recurring) {
  if(!text.trim()) return;
  S.tasks.push({
    id: uid(), text: text.trim(), completed: false, status: 'not-started',
    priority: priority||'medium', category: category||'Other',
    tags: tags ? tags.split(',').map(t=>t.trim()).filter(Boolean) : [],
    dueDate: date||'', dueTime: time||'', recurring: recurring||'',
    subtasks: [], pinned: false, favorite: false, archived: false,
    taskNote: '', createdAt: new Date().toISOString(), completedAt: null,
    reminder: null
  });
  saveAll(); renderTasks(); updateAll();
  taskInput.value = ''; taskInput.focus();
  toast('Task added!','ok');
  addNotif(`Task created: ${text.trim()}`,'fa-plus-circle');
  logActivity(`Task created: ${text.trim()}`,'fa-plus-circle');
}
function delTask(id, anim=true) {
  if(anim) {
    const el = document.querySelector(`.task-item[data-id="${id}"]`);
    if(el) { el.classList.add('removing'); setTimeout(() => { S.tasks = S.tasks.filter(t=>t.id!==id); saveAll(); renderTasks(); updateAll(); }, 300); return; }
  }
  S.tasks = S.tasks.filter(t=>t.id!==id); saveAll(); renderTasks(); updateAll();
}
function toggleTask(id) {
  const t = S.tasks.find(x=>x.id===id); if(!t) return;
  t.completed = !t.completed; t.completedAt = t.completed ? new Date().toISOString() : null;
  t.status = t.completed ? 'done' : 'not-started';
  if(t.completed) { S.completedCount++; playSound(); checkStreak(); confetti(); addXP(10); addNotif(`Task completed: ${t.text}`,'fa-check-circle'); logActivity(`Completed: ${t.text}`,'fa-check-circle','done'); }
  else { S.completedCount = Math.max(0, S.completedCount-1); logActivity(`Uncompleted: ${t.text}`,'fa-rotate'); }
  saveAll(); renderTasks(); updateAll(); renderKanban();
}
function pinTask(id) {
  const t = S.tasks.find(x=>x.id===id); if(!t) return;
  t.pinned = !t.pinned; saveAll(); renderTasks();
}
function favTask(id) {
  const t = S.tasks.find(x=>x.id===id); if(!t) return;
  t.favorite = !t.favorite; saveAll(); renderTasks();
}
function archiveTask(id) {
  const t = S.tasks.find(x=>x.id===id); if(!t) return;
  t.archived = !t.archived; saveAll(); renderTasks(); updateAll();
  if(t.archived) toast('Task archived','info');
}
function dupTask(id) {
  const t = S.tasks.find(x=>x.id===id); if(!t) return;
  const n = {...t, id: uid(), text: t.text+' (copy)', createdAt: new Date().toISOString(), completed: false, status: 'not-started', pinned: false, archived: false};
  S.tasks.push(n); saveAll(); renderTasks(); updateAll();
  toast('Task duplicated','info');
}
function openEdit(id) {
  const t = S.tasks.find(x=>x.id===id); if(!t) return;
  S.editId = id;
  editText.value = t.text; editPriority.value = t.priority; editCategory.value = t.category;
  editDate.value = t.dueDate||''; editTime.value = t.dueTime||'';
  editTags.value = (t.tags||[]).join(', '); editRecurring.value = t.recurring||'';
  editStatus.value = t.status||'not-started';
  modalEdit.classList.add('active');
  setTimeout(()=>editText.focus(),100);
}
function saveEdit(data) {
  if(!S.editId) return;
  const t = S.tasks.find(x=>x.id===S.editId); if(!t) return;
  Object.assign(t, {
    text: data.text.trim(), priority: data.priority, category: data.category,
    dueDate: data.date||'', dueTime: data.time||'',
    tags: data.tags ? data.tags.split(',').map(x=>x.trim()).filter(Boolean) : [],
    recurring: data.recurring||'', status: data.status
  });
  if(data.status === 'done') { t.completed = true; t.completedAt = new Date().toISOString(); }
  else if(data.status === 'not-started') { t.completed = false; t.completedAt = null; }
  saveAll(); renderTasks(); updateAll(); renderKanban();
  modalEdit.classList.remove('active'); S.editId = null;
  toast('Task updated','ok');
}
function clearDone() {
  S.tasks = S.tasks.filter(t=>!t.completed); saveAll(); renderTasks(); updateAll(); renderKanban();
  toast('Completed tasks cleared','info');
}
function clearAllTasks() {
  S.completedCount = 0; S.tasks = []; saveAll(); renderTasks(); updateAll(); renderKanban();
  modalConfirm.classList.remove('active');
  toast('All tasks deleted','info');
}

// ===========================
// 13. SUBTASKS
// ===========================
function addSubtask(taskId, text) {
  const t = S.tasks.find(x=>x.id===taskId); if(!t||!text.trim()) return;
  t.subtasks.push({id: uid(), text: text.trim(), completed: false});
  saveAll(); renderTasks(); toast('Subtask added','info');
}
function toggleSubtask(taskId, subId) {
  const t = S.tasks.find(x=>x.id===taskId); if(!t) return;
  const s = t.subtasks.find(x=>x.id===subId); if(!s) return;
  s.completed = !s.completed; saveAll(); renderTasks();
}
function delSubtask(taskId, subId) {
  const t = S.tasks.find(x=>x.id===taskId); if(!t) return;
  t.subtasks = t.subtasks.filter(x=>x.id!==subId); saveAll(); renderTasks();
}

// ===========================
// 14. FILTER, SORT, SEARCH
// ===========================
function getTasks() {
  return S.tasks.filter(t => {
    if(t.archived && S.filter !== 'archived') return false;
    if(!t.archived && S.filter === 'archived') return false;
    if(S.search && !t.text.toLowerCase().includes(S.search.toLowerCase())) return false;
    switch(S.filter) {
      case 'active': return !t.completed;
      case 'done': return t.completed;
      case 'today': return t.dueDate === today();
      case 'overdue': return overdue(t);
      case 'critical': return t.priority === 'critical' && !t.completed;
      case 'pinned': return t.pinned;
      default: return true;
    }
  });
}
function sortTasks(arr) {
  const r = [...arr];
  switch(S.sort) {
    case 'date-desc': r.sort((a,b)=>(b.dueDate||'Z')>(a.dueDate||'Z')?1:(b.dueDate||'Z')<(a.dueDate||'Z')?-1:0); break;
    case 'date-asc': r.sort((a,b)=>(a.dueDate||'Z')<(b.dueDate||'Z')?-1:(a.dueDate||'Z')>(b.dueDate||'Z')?1:0); break;
    case 'priority-desc': r.sort((a,b)=>pW(b.priority)-pW(a.priority)); break;
    case 'priority-asc': r.sort((a,b)=>pW(a.priority)-pW(b.priority)); break;
    case 'name': r.sort((a,b)=>a.text.localeCompare(b.text)); break;
    case 'status': r.sort((a,b)=>a.completed===b.completed?0:a.completed?1:-1); break;
  }
  return r;
}

// ===========================
// 15. RENDER TASKS
// ===========================
function renderTasks() {
  const f = getTasks(), s = sortTasks(f);
  if(s.length===0) {
    taskList.innerHTML = '';
    emptyState.classList.remove('hidden');
    const ms = {all:['No tasks','Add one above'],active:['All clear!','No active tasks'],done:['No completed','Complete a task'],today:['Nothing due today','Enjoy!'],overdue:['No overdue tasks','You\'re on top!'],critical:['No critical tasks','Stay focused!'],pinned:['No pinned tasks','Pin a task'],archived:['No archived tasks','Archive a task to see it here']};
    const m = ms[S.filter]||ms.all;
    if(S.search) { emptyTitle.textContent='No results'; emptyMsg.textContent=`No tasks matching "${S.search}"`; }
    else { emptyTitle.textContent=m[0]; emptyMsg.textContent=m[1]; }
  } else {
    emptyState.classList.add('hidden');
    taskList.innerHTML = s.map(t => renderTask(t)).join('');
    // Subtask click handlers
    taskList.querySelectorAll('.sub-cb').forEach(cb => { cb.addEventListener('change', () => toggleSubtask(cb.dataset.tid, cb.dataset.sid)); });
    taskList.querySelectorAll('.sub-del').forEach(el => { el.addEventListener('click', () => delSubtask(el.dataset.tid, el.dataset.sid)); });
    // Subtask add
    taskList.querySelectorAll('.sub-add-form').forEach(form => {
      form.addEventListener('submit', e => {
        e.preventDefault();
        const inp = form.querySelector('.sub-input');
        if(inp && inp.value.trim()) { addSubtask(inp.dataset.tid, inp.value); inp.value=''; }
      });
    });
  }
  const a = S.tasks.filter(t=>!t.completed).length;
  footCount.textContent = `${a} task${a!==1?'s':''} remaining`;
  clearDoneBtn.classList.toggle('hidden', !S.tasks.some(t=>t.completed));
  navBadge.textContent = a; navBadge.style.display = a>0?'inline':'none';
  updateBulkUI();
  $$('.task-item').forEach(el => { el.draggable = !S.bulk; });
}
function renderTask(t) {
  const od = overdue(t), td = t.dueDate===today();
  let dueHtml = '';
  if(t.dueDate||t.dueTime) {
    const p=[];
    if(t.dueDate) { const c=od?'over':td?'today':''; p.push(`<span class="tk-due ${c}"><i class="fa-regular fa-calendar"></i> ${fmtDate(t.dueDate)}</span>`); }
    if(t.dueTime) p.push(`<span class="tk-due"><i class="fa-regular fa-clock"></i> ${esc(t.dueTime)}</span>`);
    dueHtml = `<div style="margin-top:2px">${p.join('')}</div>`;
  }
  const tags = (t.tags||[]).map(x=>`<span class="tk-badge tag">#${esc(x)}</span>`).join('');
  const pri = t.priority.charAt(0).toUpperCase()+t.priority.slice(1);
  const pin = t.pinned ? 'pinned' : '';
  const fav = t.favorite ? 'faved' : '';
  const arch = t.archived ? 'archived' : '';
  const subCount = t.subtasks.length;
  const subDone = t.subtasks.filter(s=>s.completed).length;
  const subHtml = subCount ? `<span class="tk-subtask"><i class="fa-solid fa-list-check"></i> ${subDone}/${subCount}</span>` : '';
  return `<li class="task-item ${t.completed?'done':''} ${pin} ${arch}" data-id="${t.id}" draggable="true" custom-priority="${t.priority}" style="${S.bulk?'cursor:pointer':''}">
    ${S.bulk ? `<input type="checkbox" class="bulk-cb" ${S.bulkSet.has(t.id)?'checked':''} style="accent-color:var(--p);cursor:pointer">` : `<span class="drag-h"><i class="fa-solid fa-grip-vertical"></i></span>`}
    <input type="checkbox" class="tk-cb" ${t.completed?'checked':''}>
    <div class="tk-c">
      <div class="tk-t">${esc(t.text)}</div>
      <div class="tk-m">
        <span class="tk-badge pr-${t.priority}"><i class="fa-solid fa-flag"></i> ${pri}</span>
        <span class="tk-badge cat-${t.category}"><i class="fa-solid fa-tag"></i> ${esc(t.category)}</span>
        ${tags} ${subHtml}
        ${t.recurring?`<span class="tk-recur"><i class="fa-solid fa-rotate"></i> ${esc(t.recurring)}</span>`:''}
      </div>
      ${dueHtml}
      ${t.subtasks.length ? renderInlineSubtasks(t) : ''}
    </div>
    <div class="tk-acts">
      <button class="act fav ${fav}" data-act="fav"><i class="fa-solid fa-star"></i></button>
      <button class="act pin ${t.pinned?'pinned':''}" data-act="pin"><i class="fa-solid fa-thumbtack"></i></button>
      <button class="act edit" data-act="edit"><i class="fa-solid fa-pen"></i></button>
      <button class="act dup" data-act="dup"><i class="fa-solid fa-copy"></i></button>
      <button class="act archive" data-act="archive"><i class="fa-solid fa-box-archive"></i></button>
      <button class="act del" data-act="del"><i class="fa-solid fa-trash-can"></i></button>
    </div>
  </li>`;
}
function renderInlineSubtasks(t) {
  let html = `<div style="margin:4px 0 0 18px;display:flex;flex-direction:column;gap:2px">`;
  t.subtasks.forEach(s => {
    html += `<div style="display:flex;align-items:center;gap:4px;font-size:11px">
      <input type="checkbox" class="sub-cb" data-tid="${t.id}" data-sid="${s.id}" ${s.completed?'checked':''} style="accent-color:var(--p);width:12px;height:12px;cursor:pointer">
      <span style="${s.completed?'text-decoration:line-through;color:var(--tm)':''}">${esc(s.text)}</span>
      <button class="sub-del" data-tid="${t.id}" data-sid="${s.id}" style="background:none;border:none;color:var(--tm);cursor:pointer;font-size:9px;padding:2px"><i class="fa-solid fa-xmark"></i></button>
    </div>`;
  });
  html += `<form class="sub-add-form" style="display:flex;gap:4px;margin-top:2px"><input class="sub-input" data-tid="${t.id}" placeholder="+ subtask" style="flex:1;background:var(--s2);border:1px solid var(--b);border-radius:4px;padding:3px 6px;font-size:11px;color:var(--t1);font-family:inherit;outline:none"><button type="submit" style="background:none;border:none;color:var(--p);cursor:pointer;font-size:11px">Add</button></form></div>`;
  return html;
}
function updateBulkUI() {
  bulkActions.classList.toggle('hidden', !S.bulk);
  bulkCount.textContent = S.bulkSet.size+' selected';
}

// ===========================
// 16. KANBAN BOARD
// ===========================
const KANBAN_COLS = ['backlog','in-progress','review','done'];
function renderKanban() {
  KANBAN_COLS.forEach(col => {
    const list = document.getElementById(`kanban-list-${col}`);
    const count = document.getElementById(`kanban-count-${col}`);
    if(!list) return;
    const tasks = S.tasks.filter(t => {
      if(t.archived) return false;
      if(col === 'done') return t.completed;
      return t.status === col;
    });
    if(count) count.textContent = tasks.length;
    list.innerHTML = tasks.map(t => renderKanbanCard(t)).join('');
  });
  // Card action clicks
  document.querySelectorAll('.kanban-card .kb-act').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const card = e.target.closest('.kanban-card');
      if(!card) return;
      const id = card.dataset.id, act = btn.dataset.kact;
      if(act === 'edit') openEdit(id);
      if(act === 'del') delTask(id);
      if(act === 'toggle') toggleTask(id);
    });
  });
  // Card drag start
  document.querySelectorAll('.kanban-card').forEach(card => {
    card.addEventListener('dragstart', e => {
      e.dataTransfer.setData('text/plain', card.dataset.id);
      card.classList.add('dragging');
    });
    card.addEventListener('dragend', () => card.classList.remove('dragging'));
  });
}
function renderKanbanCard(t) {
  const pri = t.priority.charAt(0).toUpperCase()+t.priority.slice(1);
  return `<div class="kanban-card" data-id="${t.id}" draggable="true" style="${t.completed?'opacity:.5':''}">
    <div class="kb-actions">
      <button class="kb-act" data-kact="toggle"><i class="fa-solid ${t.completed?'fa-rotate':'fa-check'}"></i></button>
      <button class="kb-act" data-kact="edit"><i class="fa-solid fa-pen"></i></button>
      <button class="kb-act" data-kact="del"><i class="fa-solid fa-trash-can"></i></button>
    </div>
    <div class="kb-text">${esc(t.text)}</div>
    <div class="kb-meta">
      <span class="kb-badge kb-priority-${t.priority}">${pri}</span>
      ${t.dueDate?`<span class="kb-badge kb-category">${fmtDate(t.dueDate)}</span>`:''}
      ${t.subtasks.length?`<span class="kb-badge kb-category"><i class="fa-solid fa-list-check"></i> ${t.subtasks.filter(s=>s.completed).length}/${t.subtasks.length}</span>`:''}
    </div>
  </div>`;
}

// ===========================
// 17. UPDATE ALL (Dashboard)
// ===========================
function updateAll() {
  const total = S.tasks.length, done = S.tasks.filter(t=>t.completed).length, act = total-done;
  const od = S.tasks.filter(t=>overdue(t)).length;
  const td = S.tasks.filter(t=>t.dueDate===today()).length;
  const score = total===0?0:Math.round((done/total)*100);

  if(stTotal) stTotal.textContent = total;
  if(stActive) stActive.textContent = act;
  if(stDone) stDone.textContent = done;
  if(stOverdue) stOverdue.textContent = od;
  if(stToday) stToday.textContent = td;
  if(stScore) stScore.textContent = score+'%';
  if(profileTotalDone) profileTotalDone.textContent = done;
  if(profileTotalStreak) profileTotalStreak.textContent = S.streak;

  const r = 50, circ = 2*Math.PI*r;
  const offset = total===0 ? circ : circ - (done/total)*circ;
  if(ringFg) ringFg.style.strokeDasharray = circ;
  if(ringFg) ringFg.style.strokeDashoffset = offset;
  if(ringPct) ringPct.textContent = score+'%';
  if(ringSub) ringSub.textContent = `${done} / ${total} tasks`;

  if(dashTodayList) {
    const tds = S.tasks.filter(t=>t.dueDate===today()&&!t.completed).slice(0,5);
    dashTodayList.innerHTML = tds.length ? tds.map(t=>`<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--b);font-size:13px"><span style="width:6px;height:6px;border-radius:50%;background:var(--p);flex-shrink:0"></span>${esc(t.text)}</div>`).join('') : '<p class="text-muted">No tasks due today.</p>';
  }
  checkStreak(); updateProfile();
}

// ===========================
// 18. STREAK
// ===========================
function checkStreak() {
  const dates = S.tasks.filter(t=>t.completed&&t.completedAt).map(t=>t.completedAt.split('T')[0]);
  const unique = [...new Set(dates)].sort().reverse();
  let streak = 0;
  for(let i=0; i<unique.length; i++) {
    const d = new Date(); d.setDate(d.getDate()-i);
    if(unique[i] === d.toISOString().split('T')[0]) streak++;
    else break;
  }
  S.streak = streak;
  if(miniStreak) miniStreak.textContent = streak;
  saveAll();
}

// ===========================
// 19. WEEKLY CHART
// ===========================
function updateChart() {
  if(!window.Chart) return;
  const labels = [], data = [];
  for(let i=6; i>=0; i--) {
    const d = new Date(); d.setDate(d.getDate()-i);
    labels.push(d.toLocaleDateString('en-US',{weekday:'short'}));
    data.push(S.tasks.filter(t=>t.completedAt&&t.completedAt.startsWith(d.toISOString().split('T')[0])).length);
  }
  const ctx = document.getElementById('weekly-chart');
  if(!ctx) return;
  if(weeklyChart) weeklyChart.destroy();
  weeklyChart = new Chart(ctx, {
    type:'bar',
    data:{labels, datasets:[{label:'Done',data,backgroundColor:'rgba(124,58,237,.5)',borderColor:'#7c3aed',borderWidth:2,borderRadius:6,borderSkipped:false}]},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},
    scales:{y:{beginAtZero:true,ticks:{stepSize:1,color:'#6b6b8d'},grid:{color:'rgba(255,255,255,.04)'}},x:{ticks:{color:'#6b6b8d'},grid:{display:false}}}}
  });
}

// ===========================
// 20. CALENDAR
// ===========================
function renderCal() {
  const now = new Date();
  let y = S.calYear || now.getFullYear(), m = S.calMonth ?? now.getMonth();
  S.calYear = y; S.calMonth = m;
  calLabel.textContent = new Date(y,m).toLocaleDateString('en-US',{month:'long',year:'numeric'});
  const first = new Date(y,m,1).getDay();
  const days = new Date(y,m+1,0).getDate();
  const prevDays = new Date(y,m,0).getDate();
  const todayStr = today();
  let html = '';
  for(let i=first-1; i>=0; i--) html += `<div class="cal-day other">${prevDays-i}</div>`;
  for(let d=1; d<=days; d++) {
    const ds = `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const has = S.tasks.filter(t=>t.dueDate===ds);
    const isToday = ds===todayStr;
    html += `<div class="cal-day ${isToday?'today':''} ${has.length?'has-tasks':''}" data-date="${ds}">
      ${d}${has.length?`<span class="cal-count">${has.length}</span>`:''}
      ${has.length?`<div class="cal-dot">${has.slice(0,4).map(()=>'<i class="fa-solid fa-circle" style="font-size:5px;color:var(--p)"></i>').join('')}</div>`:''}
    </div>`;
  }
  const total = first+days;
  const rem = 7-(total%7);
  if(rem<7) for(let i=1; i<=rem; i++) html += `<div class="cal-day other">${i}</div>`;
  calBody.innerHTML = html;
  calBody.querySelectorAll('.cal-day[data-date]').forEach(el => {
    el.addEventListener('click', () => {
      const ds = el.dataset.date;
      const tasks = S.tasks.filter(t=>t.dueDate===ds);
      if(tasks.length) toast(`Tasks on ${ds}: ${tasks.map(t=>t.text).join(', ')}`,'info');
    });
  });
}
function renderCalHeatmap() {
  if(!calHeatmap) return;
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth()+1, 0).getDate();
  const taskCounts = {};
  S.tasks.filter(t=>t.dueDate).forEach(t => {
    const m = t.dueDate.slice(0,7);
    if(m === now.toISOString().slice(0,7)) taskCounts[t.dueDate] = (taskCounts[t.dueDate]||0)+1;
  });
  let html = '';
  for(let d=1; d<=daysInMonth; d++) {
    const ds = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const c = taskCounts[ds]||0;
    const lv = c===0?'':c===1?'l1':c<=3?'l2':c<=5?'l3':'l4';
    html += `<span class="${lv}" title="${ds}: ${c} tasks"></span>`;
  }
  calHeatmap.innerHTML = html;
  if(calHeatLabel) calHeatLabel.textContent = `${now.toLocaleDateString('en-US',{month:'long'})} task activity`;
}

// ===========================
// 21. HABITS
// ===========================
function renderHabits() {
  if(!S.habits.length) {
    habitList.innerHTML = '<div class="empty-state"><i class="fa-solid fa-check-double"></i><h3>No habits</h3><p>Create a habit to track daily.</p></div>';
    return;
  }
  habitList.innerHTML = S.habits.map(h => {
    const week = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const weekDays = week.map((wd,i) => {
      const ch = (h.days||[]).includes(today()) && i === new Date().getDay();
      return `<span class="${ch?'checked':''}" data-h="${h.id}" data-d="${i}">${wd[0]}</span>`;
    }).join('');
    const weekCompletions = (h.days||[]).filter(d => {
      const dt = new Date(d), n=new Date(), start=new Date(n); start.setDate(n.getDate()-n.getDay());
      return dt >= start;
    }).length;
    return `<div class="habit-card">
      <button class="habit-del" data-id="${h.id}"><i class="fa-solid fa-xmark"></i></button>
      <h4>${esc(h.name)}</h4>
      <div class="habit-days">${weekDays}</div>
      <div class="habit-streak"><i class="fa-solid fa-fire"></i> ${weekCompletions}/7 this week</div>
    </div>`;
  }).join('');
  habitList.querySelectorAll('.habit-days span').forEach(el => {
    el.addEventListener('click', () => {
      const hid = el.dataset.h, dayIdx = parseInt(el.dataset.d);
      const h = S.habits.find(x=>x.id===hid); if(!h) return;
      if(!h.days) h.days = [];
      const idx = h.days.indexOf(today());
      if(idx>-1) h.days.splice(idx,1);
      else { h.days.push(today()); playSound(); addXP(5); confetti(); logActivity(`Habit: ${h.name}`,'fa-check-double','done'); }
      saveAll(); renderHabits(); renderHeatmap();
    });
  });
  habitList.querySelectorAll('.habit-del').forEach(el => {
    el.addEventListener('click', () => {
      S.habits = S.habits.filter(x=>x.id!==el.dataset.id);
      saveAll(); renderHabits(); renderHeatmap();
    });
  });
}
function renderHeatmap() {
  if(!heatmap) return;
  const allDates = S.habits.flatMap(h=>h.days||[]);
  const counts = {};
  allDates.forEach(d => { counts[d] = (counts[d]||0)+1; });
  const now = new Date(), start = new Date(now); start.setDate(start.getDate()-25);
  let html = '';
  for(let i=0; i<26; i++) {
    const d = new Date(start); d.setDate(d.getDate()+i);
    const ds = d.toISOString().split('T')[0];
    const c = counts[ds]||0;
    const level = c===0?'':c===1?'l1':c===2?'l2':c===3?'l3':'l4';
    html += `<span class="${level}" title="${ds}: ${c} habits"></span>`;
  }
  heatmap.innerHTML = html;
}

// ===========================
// 22. POMODORO
// ===========================
function pomoDisplay() {
  const m = Math.floor(S.pomo.time/60), s = S.pomo.time%60;
  pomoTime.textContent = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  const r = 85, circ = 2*Math.PI*r;
  const pct = S.pomo.time / S.pomo.max;
  pomoFg.style.strokeDasharray = circ;
  pomoFg.style.strokeDashoffset = circ * (1 - pct);
}
function pomoSetMode(mode) {
  S.pomo.mode = mode; S.pomo.run = false;
  if(S.pomo.id) { clearInterval(S.pomo.id); S.pomo.id = null; }
  pomoStart.innerHTML = '<i class="fa-solid fa-play"></i> Start';
  pomoModeBtns.forEach(b=>b.classList.toggle('active',b.dataset.pm===mode));
  const times = {focus:S.pomo.focusTm*60, short:S.pomo.shortTm*60, long:S.pomo.longTm*60};
  S.pomo.time = times[mode]||times.focus;
  S.pomo.max = S.pomo.time;
  pomoDisplay();
}
function pomoStartTimer() {
  if(S.pomo.run) return;
  if(S.pomo.time<=0) pomoSetMode(S.pomo.mode);
  S.pomo.run = true;
  pomoStart.innerHTML = '<i class="fa-solid fa-play"></i> Running';
  S.pomo.id = setInterval(() => {
    S.pomo.time--;
    pomoDisplay();
    if(S.pomo.time<=0) {
      clearInterval(S.pomo.id); S.pomo.id=null; S.pomo.run=false;
      pomoStart.innerHTML = '<i class="fa-solid fa-play"></i> Start';
      if(S.pomo.mode==='focus') {
        S.pomo.sessions++; S.pomo.today += S.pomo.focusTm; S.pomo.week += S.pomo.focusTm;
        pomoSessions.textContent = `Sessions: ${S.pomo.sessions}`;
        if(pomoToday) pomoToday.textContent = S.pomo.today+' min';
        if(pomoWeek) pomoWeek.textContent = S.pomo.week+' min';
        if(pomoTotalSessions) pomoTotalSessions.textContent = S.pomo.sessions;
        saveAll();
        playSound(); confetti(); addXP(20);
        addNotif('Focus session complete!','fa-clock');
        toast('Focus session complete! Take a break.','ok');
        logActivity('Focus session completed','fa-clock','done');
      } else { toast('Break over! Time to focus.','info'); }
    }
  }, 1000);
}
function pomoPauseTimer() {
  if(!S.pomo.run) return;
  clearInterval(S.pomo.id); S.pomo.id=null; S.pomo.run=false;
  pomoStart.innerHTML = '<i class="fa-solid fa-play"></i> Resume';
}
function pomoResetTimer() {
  if(S.pomo.id) { clearInterval(S.pomo.id); S.pomo.id=null; }
  S.pomo.run = false;
  pomoStart.innerHTML = '<i class="fa-solid fa-play"></i> Start';
  pomoSetMode(S.pomo.mode);
}

// ===========================
// 23. GOALS
// ===========================
function renderGoals() {
  if(!S.goals.length) {
    goalList.innerHTML = '<div class="empty-state"><i class="fa-solid fa-bullseye"></i><h3>No goals</h3><p>Set a goal and track your progress.</p></div>';
    return;
  }
  goalList.innerHTML = S.goals.map(g => {
    const related = S.tasks.filter(t=>t.category===g.category||t.text.toLowerCase().includes(g.keyword||''));
    const done = related.filter(t=>t.completed).length;
    const total = related.length||1;
    const pct = Math.round((done/total)*100);
    const od = g.dueDate ? (g.dueDate<today()?'Overdue':'Due '+fmtDate(g.dueDate)) : 'No deadline';
    return `<div class="goal-card">
      <button class="goal-del" data-id="${g.id}"><i class="fa-solid fa-xmark"></i></button>
      <h4>${esc(g.name)}</h4>
      <div class="goal-bar"><div class="goal-bar-fill" style="width:${pct}%"></div></div>
      <div class="goal-meta"><span>${pct}% · ${done}/${total} tasks</span><span style="color:${g.dueDate&&g.dueDate<today()?'var(--dan)':'var(--t2)'}">${od}</span></div>
    </div>`;
  }).join('');
  goalList.querySelectorAll('.goal-del').forEach(el => {
    el.addEventListener('click', () => { S.goals = S.goals.filter(x=>x.id!==el.dataset.id); saveAll(); renderGoals(); });
  });
}

// ===========================
// 24. NOTES
// ===========================
function renderNotes() {
  if(!S.notes.length) {
    notesList.innerHTML = '<div class="empty-state"><i class="fa-solid fa-note-sticky"></i><h3>No notes</h3><p>Write your first note.</p></div>';
    return;
  }
  notesList.innerHTML = [...S.notes].reverse().map(n =>
    `<div class="note-card">
      <button class="note-del" data-id="${n.id}"><i class="fa-solid fa-xmark"></i></button>
      <h4>${esc(n.title||'Untitled')}</h4>
      <p>${esc(n.body||'')}</p>
      <div class="note-date">${new Date(n.createdAt).toLocaleDateString('en-US',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})}</div>
    </div>`
  ).join('');
  notesList.querySelectorAll('.note-del').forEach(el => {
    el.addEventListener('click', () => { S.notes = S.notes.filter(x=>x.id!==el.dataset.id); saveAll(); renderNotes(); });
  });
}

// ===========================
// 25. ACHIEVEMENTS
// ===========================
const ACHIEVEMENTS = [
  {id:'first', name:'First Step', icon:'fa-solid fa-star', desc:'Complete your first task', need:1},
  {id:'five', name:'Getting Started', icon:'fa-solid fa-medal', desc:'Complete 5 tasks', need:5},
  {id:'ten', name:'Dedicated', icon:'fa-solid fa-award', desc:'Complete 10 tasks', need:10},
  {id:'twentyfive', name:'Elite', icon:'fa-solid fa-crown', desc:'Complete 25 tasks', need:25},
  {id:'fifty', name:'Legend', icon:'fa-solid fa-gem', desc:'Complete 50 tasks', need:50},
  {id:'hundred', name:'Centurion', icon:'fa-solid fa-trophy', desc:'Complete 100 tasks', need:100},
  {id:'streak3', name:'3-Day Streak', icon:'fa-solid fa-fire', desc:'Complete tasks 3 days in a row', need:3, type:'streak'},
  {id:'streak7', name:'Week Warrior', icon:'fa-solid fa-fire', desc:'Complete tasks 7 days in a row', need:7, type:'streak'},
  {id:'pomo1', name:'First Focus', icon:'fa-solid fa-clock', desc:'Complete 1 Pomodoro session', need:1, type:'pomo'},
  {id:'pomo10', name:'Focus Master', icon:'fa-solid fa-clock', desc:'Complete 10 Pomodoro sessions', need:10, type:'pomo'},
  {id:'habit7', name:'Habit Starter', icon:'fa-solid fa-check-double', desc:'Log habits for 7 days', need:7, type:'habit'},
  {id:'all', name:'Clear Mind', icon:'fa-solid fa-check-circle', desc:'Have 0 active tasks', need:0, type:'zero'},
  {id:'level5', name:'Power User', icon:'fa-solid fa-rocket', desc:'Reach level 5', need:5, type:'level'},
  {id:'level10', name:'Unstoppable', icon:'fa-solid fa-star', desc:'Reach level 10', need:10, type:'level'},
  {id:'archived5', name:'Archivist', icon:'fa-solid fa-box-archive', desc:'Archive 5 tasks', need:5, type:'archive'}
];
function renderAchievements() {
  const done = S.tasks.filter(t=>t.completed).length;
  const active = S.tasks.filter(t=>!t.completed).length;
  const habitDays = [...new Set(S.habits.flatMap(h=>h.days||[]))].length;
  const archived = S.tasks.filter(t=>t.archived).length;
  achieveGrid.innerHTML = ACHIEVEMENTS.map(a => {
    let unlocked = false;
    if(a.type==='streak') unlocked = S.streak >= a.need;
    else if(a.type==='pomo') unlocked = S.pomo.sessions >= a.need;
    else if(a.type==='habit') unlocked = habitDays >= a.need;
    else if(a.type==='zero') unlocked = active === 0;
    else if(a.type==='level') unlocked = S.userLevel >= a.need;
    else if(a.type==='archive') unlocked = archived >= a.need;
    else unlocked = done >= a.need;
    return `<div class="achieve-card ${unlocked?'unlocked':'locked'}">
      <i class="${a.icon}"></i>
      <h4>${a.name}</h4>
      <p>${a.desc}</p>
    </div>`;
  }).join('');
}

// ===========================
// 26. FOCUS MODE
// ===========================
function enterFocus() {
  focusEnter.classList.add('hidden');
  focusActive.classList.remove('hidden');
  const active = S.tasks.filter(t=>!t.completed);
  focusTaskCount.textContent = active.length + ' tasks remaining';
  focusList.innerHTML = active.map(t => `<li style="display:flex;align-items:center;gap:10px;padding:10px 12px;background:var(--s2);border-radius:8px;margin-bottom:6px;border:1px solid var(--b)">
    <input type="checkbox" class="tk-cb" data-id="${t.id}" ${t.completed?'checked':''}>
    <span style="flex:1;font-size:15px">${esc(t.text)}</span>
  </li>`).join('');
  focusList.querySelectorAll('.tk-cb').forEach(cb => {
    cb.addEventListener('change', () => { toggleTask(cb.dataset.id); setTimeout(() => enterFocus(), 100); });
  });
  toast('Focus mode activated','info');
}
function exitFocus() {
  focusEnter.classList.remove('hidden');
  focusActive.classList.add('hidden');
}

// ===========================
// 27. FOCUS MUSIC
// ===========================
function toggleFocusMusic() {
  if(S.focusMusicOsc) {
    // Stop
    try {
      S.focusMusicGain.gain.exponentialRampToValueAtTime(.001, window.ac.currentTime+.3);
      setTimeout(() => { S.focusMusicOsc.stop(); S.focusMusicOsc=null; S.focusMusicGain=null; }, 300);
    } catch(e) {}
    focusMusicBtn.innerHTML = '<i class="fa-solid fa-play"></i> Play';
    return;
  }
  try {
    if(!window.ac) window.ac = new (window.AudioContext||window.webkitAudioContext)();
    const c = window.ac; if(c.state==='suspended') c.resume();
    // Brown noise oscillator
    const bufferSize = c.sampleRate * 2;
    const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0;
    for(let i=0; i<bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5;
    }
    const source = c.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    const gain = c.createGain();
    gain.gain.setValueAtTime(0.15, c.currentTime);
    source.connect(gain); gain.connect(c.destination);
    source.start();
    S.focusMusicOsc = source;
    S.focusMusicGain = gain;
    focusMusicBtn.innerHTML = '<i class="fa-solid fa-stop"></i> Stop';
    toast('Focus music playing','info');
  } catch(e) { toast('Could not play audio','err'); }
}

// ===========================
// 28. COMMAND BAR
// ===========================
function openCmd() {
  cmdOverlay.classList.add('active');
  cmdInput.value = '';
  cmdResults.innerHTML = '';
  setTimeout(()=>cmdInput.focus(),100);
}
function closeCmd() {
  cmdOverlay.classList.remove('active');
}
function runCmd(val) {
  const v = val.toLowerCase().trim();
  if(v.startsWith('add ')) {
    const text = v.slice(4);
    if(text) { addTask(text); closeCmd(); toast('Quick task added!','ok'); return; }
  }
  const navCmds = ['dashboard','tasks','calendar','kanban','habits','pomodoro','goals','notes','focus','achievements','settings'];
  for(const n of navCmds) {
    if(v===n||v===`go to ${n}`) { closeCmd(); goView(n); return; }
  }
  if(v==='theme'||v==='dark'||v==='light') { toggleTheme(); closeCmd(); return; }
  if(v==='export') { exportData(); closeCmd(); return; }
  if(v==='clear'||v==='delete all'||v==='reset') { confirmAction('Delete all tasks?', ()=>{ clearAllTasks(); closeCmd(); }); return; }
  if(v==='focus mode') { closeCmd(); goView('focus'); setTimeout(enterFocus,200); return; }
  if(v==='music'||v==='focus music') { closeCmd(); toggleFocusMusic(); return; }

  // Smart suggestions
  const sug = [];
  if(v.includes('add')||v.includes('task')) sug.push({icon:'fa-plus',text:'Add a task: type "add Buy groceries"',action:()=>{cmdInput.value='add Buy groceries';cmdInput.focus();}});
  if(v.includes('go')) sug.push({icon:'fa-arrow-right',text:'Go to a view: "go to kanban"',action:()=>{}});
  if(v.includes('theme')||v.includes('dark')||v.includes('light')) sug.push({icon:'fa-palette',text:'Toggle theme: type "theme"',action:()=>{toggleTheme();closeCmd();}});
  if(v.includes('music')||v.includes('sound')) sug.push({icon:'fa-headphones',text:'Focus music: type "music"',action:()=>{toggleFocusMusic();closeCmd();}});
  sug.push({icon:'fa-download',text:'Export data: type "export"',action:()=>{exportData();closeCmd();}});
  sug.push({icon:'fa-trash',text:'Clear all: type "clear"',action:()=>{confirmAction('Delete all tasks?',()=>{clearAllTasks();closeCmd();});}});
  cmdResults.innerHTML = sug.map(s => `<div class="cmd-item"><i class="fa-solid ${s.icon}"></i> ${esc(s.text)}</div>`).join('');
  cmdResults.querySelectorAll('.cmd-item').forEach((el,i) => {
    el.addEventListener('click', () => { if(sug[i] && sug[i].action) sug[i].action(); });
  });
}

// ===========================
// 29. EXPORT / IMPORT
// ===========================
function exportData() {
  const data = {
    tasks: S.tasks, habits: S.habits, goals: S.goals, notes: S.notes,
    completedCount: S.completedCount, streak: S.streak,
    pomoSessions: S.pomo.sessions, userLevel: S.userLevel, userXP: S.userXP,
    userName: S.userName, exportedAt: new Date().toISOString()
  };
  const blob = new Blob([JSON.stringify(data,null,2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = `sfadhul-workspace-${today()}.json`;
  a.click(); URL.revokeObjectURL(url);
  toast('Data exported!','ok');
}
function importData(file) {
  const r = new FileReader();
  r.onload = e => {
    try {
      const d = JSON.parse(e.target.result);
      if(!d || typeof d !== 'object') { toast('Invalid file format','err'); return; }
      if(d.tasks && Array.isArray(d.tasks)) {
        S.tasks = d.tasks.filter(t => t && typeof t.id === 'string' && typeof t.text === 'string');
      }
      if(d.habits && Array.isArray(d.habits)) {
        S.habits = d.habits.filter(h => h && typeof h.id === 'string' && typeof h.name === 'string');
      }
      if(d.goals && Array.isArray(d.goals)) {
        S.goals = d.goals.filter(g => g && typeof g.id === 'string' && typeof g.name === 'string');
      }
      if(d.notes && Array.isArray(d.notes)) {
        S.notes = d.notes.filter(n => n && typeof n.id === 'string');
      }
      if(d.userName) S.userName = String(d.userName);
      if(d.userLevel) S.userLevel = Math.max(1, parseInt(d.userLevel)||1);
      if(d.userXP) S.userXP = Math.max(0, parseInt(d.userXP)||0);
      if(d.completedCount) S.completedCount = Math.max(0, parseInt(d.completedCount)||0);
      if(d.streak) S.streak = Math.max(0, parseInt(d.streak)||0);
      if(d.pomoSessions) S.pomo.sessions = Math.max(0, parseInt(d.pomoSessions)||0);
      saveAll(); renderTasks(); updateAll(); renderHabits(); renderHeatmap(); renderGoals(); renderNotes(); renderAchievements(); renderKanban();
      toast(`Imported ${S.tasks.length} tasks!`,'ok');
    } catch(e) { toast('Invalid file','err'); }
  };
  r.readAsText(file);
}
function printReport() {
  const w = window.open('','_blank');
  w.document.write(`<html><head><title>SFadhul Workspace Report</title><style>body{font-family:Inter,sans-serif;padding:40px;color:#1a1a2e}h1{font-size:28px;margin-bottom:4px}.date{color:#666;margin-bottom:24px}h2{margin:20px 0 10px}table{width:100%;border-collapse:collapse;margin-bottom:20px}th,td{padding:8px 12px;text-align:left;border-bottom:1px solid #eee}th{background:#f5f5f5}.stats{display:flex;gap:20px;margin:16px 0}.stat{background:#f5f5f5;padding:12px 20px;border-radius:8px;text-align:center}.stat strong{display:block;font-size:24px}</style></head><body>`);
  w.document.write(`<h1>SFadhul Workspace</h1><p class="date">Report generated ${new Date().toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric',hour:'2-digit',minute:'2-digit'})}</p>`);
  const total=S.tasks.length,done=S.tasks.filter(t=>t.completed).length,act=total-done,od=S.tasks.filter(t=>overdue(t)).length;
  w.document.write(`<div class="stats"><div class="stat"><strong>${total}</strong>Total</div><div class="stat"><strong>${act}</strong>Active</div><div class="stat"><strong>${done}</strong>Done</div><div class="stat"><strong>${od}</strong>Overdue</div><div class="stat"><strong>${total?Math.round(done/total*100):0}%</strong>Score</div><div class="stat"><strong>Lv.${S.userLevel}</strong>Level</div></div>`);
  w.document.write(`<h2>Tasks</h2><table><tr><th>Task</th><th>Priority</th><th>Category</th><th>Status</th><th>Due</th></tr>`);
  S.tasks.forEach(t => { w.document.write(`<tr><td>${esc(t.text)}</td><td>${t.priority}</td><td>${t.category}</td><td>${t.completed?'Done':t.status}</td><td>${t.dueDate||'-'}</td></tr>`); });
  w.document.write(`</table><h2>Notes (${S.notes.length})</h2>`);
  S.notes.forEach(n => { w.document.write(`<div style="margin:8px 0"><strong>${esc(n.title||'Untitled')}</strong><p style="color:#666">${esc(n.body||'')}</p></div>`); });
  w.document.write(`<h2>Habits (${S.habits.length})</h2><ul>`);
  S.habits.forEach(h => { w.document.write(`<li>${esc(h.name)} — ${(h.days||[]).length} days logged</li>`); });
  w.document.write(`</ul></body></html>`);
  w.document.close(); w.print();
}

// ===========================
// 30. THEME
// ===========================
function toggleTheme() {
  const html = document.documentElement;
  const current = html.getAttribute('data-theme')||'dark';
  const themes = ['dark','light','cyberpunk','midnight','ocean','forest','glass-neon'];
  const idx = themes.indexOf(current);
  const next = themes[(idx+1)%themes.length];
  setTheme(next);
}

// ===========================
// 31. CLOCK
// ===========================
function updateClock() {
  const n = new Date();
  const t = n.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false});
  topbarClock.textContent = t;
  miniClock.textContent = t;
  topbarDate.textContent = n.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'});
}

// ===========================
// 32. CONFIRM
// ===========================
function confirmAction(msg, cb) {
  confirmText.textContent = msg;
  S.confirmCb = cb;
  modalConfirm.classList.add('active');
}

// ===========================
// 33. KEYBOARD SHORTCUTS
// ===========================
document.addEventListener('keydown', e => {
  if((e.ctrlKey||e.metaKey) && e.key==='k') { e.preventDefault(); if(cmdOverlay.classList.contains('active')) closeCmd(); else openCmd(); return; }
  if(e.key==='Escape') {
    if(cmdOverlay.classList.contains('active')) { closeCmd(); return; }
    if(!notifDropdown.classList.contains('hidden')) { notifDropdown.classList.add('hidden'); return; }
    $$('.modal-overlay.active').forEach(m=>m.classList.remove('active')); S.editId=null; if(document.activeElement) document.activeElement.blur(); return;
  }
  if((e.ctrlKey||e.metaKey) && e.key==='n') { e.preventDefault(); goView('tasks'); setTimeout(()=>taskInput.focus(),100); }
  if((e.ctrlKey||e.metaKey) && e.key==='f') { e.preventDefault(); goView('tasks'); setTimeout(()=>taskSearch.focus(),100); }
  if((e.ctrlKey||e.metaKey) && e.key==='d') { e.preventDefault(); toggleTheme(); }
  if((e.ctrlKey||e.metaKey) && e.key==='b') { e.preventDefault(); goView('kanban'); }
});

// ===========================
// 34. PARTICLES
// ===========================
function startParticles() {
  const c = particleCanvas, ctx = c.getContext('2d');
  if(!c) return;
  c.width = window.innerWidth; c.height = window.innerHeight;
  const particles = Array.from({length:25}, () => ({
    x: Math.random()*c.width, y: Math.random()*c.height,
    r: Math.random()*3+1.5, vx: (Math.random()-.5)*.3, vy: -(Math.random()*.2+.05),
    o: Math.random()*.4+.1, hue: Math.random()*60+260
  }));
  function draw() {
    ctx.clearRect(0,0,c.width,c.height);
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if(p.y < -10) { p.y = c.height+10; p.x = Math.random()*c.width; }
      if(p.x < -10 || p.x > c.width+10) p.vx *= -1;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.fillStyle = `hsla(${p.hue},80%,60%,${p.o})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  draw();
  window.addEventListener('resize', () => { c.width = window.innerWidth; c.height = window.innerHeight; });
}

// ===========================
// 35. ACTIVITY LOG
// ===========================
function logActivity(text, icon='fa-circle-check', type='info') {
  S.activityLog.unshift({id: uid(), text, icon, type, time: new Date().toISOString()});
  if(S.activityLog.length > 50) S.activityLog.length = 50;
  saveAll(); renderTimeline();
}
function renderTimeline() {
  if(!timeline) return;
  if(!S.activityLog.length) {
    timeline.innerHTML = '<p class="text-muted" style="font-size:12px;padding:8px 0">No recent activity.</p>';
    return;
  }
  timeline.innerHTML = S.activityLog.slice(0,15).map(a => {
    const dotClass = a.type==='done'?'done':a.type==='warn'?'warn':'';
    const t = new Date(a.time);
    const timeStr = t.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'});
    return `<div class="tl-item"><div class="tl-dot ${dotClass}"></div><div class="tl-text"><strong>${esc(a.text)}</strong></div><div class="tl-time">${timeStr}</div></div>`;
  }).join('');
}

// ===========================
// 36. MOOD TRACKER
// ===========================
function initMood() {
  const todayMood = S.mood.date === today() ? S.mood : {date: today(), mood: 'neutral', energy: 5};
  if(S.mood.date !== today()) { S.mood = todayMood; saveAll(); }
  moodGrid.querySelectorAll('.mood-btn').forEach(b => b.classList.toggle('active', b.dataset.mood === S.mood.mood));
  if(energySlider) { energySlider.value = S.mood.energy; if(energyVal) energyVal.textContent = S.mood.energy; }
}
function setMood(mood) {
  S.mood.date = today(); S.mood.mood = mood; saveAll();
  moodGrid.querySelectorAll('.mood-btn').forEach(b => b.classList.toggle('active', b.dataset.mood === mood));
  logActivity(`Mood: ${mood}`,'fa-face-smile');
}
function setEnergy(val) {
  S.mood.energy = parseInt(val); S.mood.date = today(); saveAll();
  if(energyVal) energyVal.textContent = val;
}

// ===========================
// 37. AI ASSISTANT
// ===========================
const AI_RESPONSES = {
  hello: "Hello! I'm your productivity assistant. How can I help you today?",
  hi: "Hi there! Ready to boost your productivity?",
  productivity: (() => {
    const done = S.tasks.filter(t=>t.completed).length;
    const active = S.tasks.filter(t=>!t.completed).length;
    return `You've completed <strong>${done}</strong> tasks total, with <strong>${active}</strong> active. Your productivity score is <strong>${done+active?Math.round(done/(done+active)*100):0}%</strong>. Keep going!`;
  }),
  advice: "Try the Pomodoro technique: 25 minutes of focused work, then a 5-minute break. It helps maintain high productivity without burnout!",
  tip: "Here's a pro tip: Break large tasks into smaller subtasks. Each small win releases dopamine and keeps you motivated!",
  focus: "For better focus, try: 1) Turn off notifications 2) Use the Focus Mode in this app 3) Listen to brown noise 4) Set a timer for 25 min blocks",
  tasks: (() => {
    const od = S.tasks.filter(t=>t.dueDate&&t.dueDate<today()&&!t.completed).length;
    return od ? `You have <strong>${od}</strong> overdue tasks. Consider reassessing priorities or breaking them down.` : 'All tasks are on track! Great job keeping up.';
  }),
  overdu: (() => {
    const od = S.tasks.filter(t=>t.dueDate&&t.dueDate<today()&&!t.completed);
    return od.length ? `Overdue tasks: ${od.map(t=>t.text).join(', ')}` : 'No overdue tasks. You\'re on top of everything!';
  }),
  stats: (() => {
    return `📊 <strong>Your Stats</strong><br>Level ${S.userLevel} · ${S.userXP} XP<br>${S.streak}-day streak<br>${S.pomo.sessions} Pomodoro sessions<br>${S.habits.length} habits tracked`;
  }),
  level: (() => `You're at <strong>Level ${S.userLevel}</strong> with ${S.userXP} XP. ${S.userLevel<5?'Keep completing tasks and building streaks to level up!':'You\'re a power user! 🎉'}`),
  burnout: (() => {
    const recent = S.activityLog.filter(a => new Date(a.time) > new Date(Date.now()-864e5*3)).length;
    return recent > 20 ? '⚠️ You\'ve been very active lately. Make sure to take breaks and rest! Burnout warning.' : 'Your workload looks balanced. Keep maintaining a healthy pace!';
  })
};
function getAIResponse(input) {
  const v = input.toLowerCase().trim();
  for(const [key, val] of Object.entries(AI_RESPONSES)) {
    if(v.includes(key)) return typeof val === 'function' ? val() : val;
  }
  return 'I can help with: productivity tips, task overview, stats, focus advice, or burnout warnings. Try asking something!';
}
function addAIMsg(text, isUser=false) {
  const div = document.createElement('div');
  div.className = `ai-msg ${isUser?'user':'bot'}`;
  div.innerHTML = text;
  aiMsgs.appendChild(div);
  aiMsgs.scrollTop = aiMsgs.scrollHeight;
}
function handleAISend() {
  const text = aiInput.value.trim();
  if(!text) return;
  addAIMsg(text, true);
  aiInput.value = '';
  setTimeout(() => {
    const response = getAIResponse(text);
    addAIMsg(response);
  }, 400 + Math.random()*600);
}

// ===========================
// 38. TASK TEMPLATES
// ===========================
const TEMPLATES = {
  meeting: {text:'Follow up meeting',priority:'high',category:'Work',tags:'meeting',recurring:''},
  email: {text:'Reply to important emails',priority:'medium',category:'Work',tags:'email',recurring:''},
  study: {text:'Study session',priority:'high',category:'Study',tags:'study',recurring:''},
  workout: {text:'Daily workout',priority:'medium',category:'Health',tags:'fitness',recurring:'daily'},
  project: {text:'Project milestone review',priority:'critical',category:'Work',tags:'project',recurring:''}
};
function applyTemplate(name) {
  const t = TEMPLATES[name];
  if(!t) return;
  addTask(t.text, t.priority, t.category, t.tags, today(), '', t.recurring);
  logActivity(`Used template: ${name}`,'fa-layer-group');
}

// ===========================
// 39. ENHANCED THEME
// ===========================
function setTheme(name) {
  const html = document.documentElement;
  html.setAttribute('data-theme', name);
  saveTheme(name);
  const icon = name==='light'?'fa-sun':'fa-moon';
  themeBtn.innerHTML = `<i class="fa-solid ${icon}"></i>`;
  themeGrid.querySelectorAll('.theme-card').forEach(c => c.classList.toggle('active', c.dataset.theme === name));
  updateRingGradient(name);
  updateChartColors();
}
function updateRingGradient(theme) {
  const colors = {
    dark:['#7c3aed','#06b6d4'], light:['#7c3aed','#06b6d4'],
    cyberpunk:['#ff0066','#00d4ff'], midnight:['#f0c040','#40b0d0'],
    ocean:['#0891b2','#22d3ee'], forest:['#065f46','#14b8a6'],
    'glass-neon':['#a855f7','#06b6d4']
  };
  const c = colors[theme]||colors.dark;
  const grad = document.getElementById('ring-grad');
  if(grad) {
    const stops = grad.querySelectorAll('stop');
    if(stops[0]) stops[0].setAttribute('stop-color', c[0]);
    if(stops[1]) stops[1].setAttribute('stop-color', c[1]);
  }
}
function updateChartColors() {
  if(!weeklyChart) return;
  const theme = document.documentElement.getAttribute('data-theme')||'dark';
  const colors = {
    dark:{bg:'rgba(124,58,237,.5)',bd:'#7c3aed',t:'#6b6b8d',g:'rgba(255,255,255,.04)'},
    light:{bg:'rgba(124,58,237,.5)',bd:'#7c3aed',t:'#6b6b8d',g:'rgba(0,0,0,.06)'},
    cyberpunk:{bg:'rgba(255,0,102,.5)',bd:'#ff0066',t:'#bb99dd',g:'rgba(255,0,100,.08)'},
    midnight:{bg:'rgba(240,192,64,.5)',bd:'#f0c040',t:'#9890b0',g:'rgba(240,192,64,.08)'},
    ocean:{bg:'rgba(8,145,178,.5)',bd:'#0891b2',t:'#80b0a8',g:'rgba(255,255,255,.04)'},
    forest:{bg:'rgba(6,95,70,.5)',bd:'#065f46',t:'#80a888',g:'rgba(255,255,255,.04)'},
    'glass-neon':{bg:'rgba(168,85,247,.5)',bd:'#a855f7',t:'#9999cc',g:'rgba(255,255,255,.04)'}
  };
  const c = colors[theme]||colors.dark;
  weeklyChart.data.datasets[0].backgroundColor = c.bg;
  weeklyChart.data.datasets[0].borderColor = c.bd;
  weeklyChart.options.scales.y.ticks.color = c.t;
  weeklyChart.options.scales.y.grid.color = c.g;
  weeklyChart.options.scales.x.ticks.color = c.t;
  weeklyChart.update();
}

// ===========================
// 40. ONBOARDING TOUR
// ===========================
const TOUR_STEPS = [
  {title:'Welcome to SFadhul Workspace', desc:'Your all-in-one productivity hub. Track tasks, habits, goals, and more — all in your browser with zero setup.', target:'#view-dashboard'},
  {title:'Dashboard Overview', desc:'Your command center. Monitor stats, activity, mood, and daily briefing at a glance.', target:'#view-dashboard'},
  {title:'Smart Tasks', desc:'Add tasks with priority, category, tags, due dates, subtasks, and recurrence. Filter, sort, and search through everything.', target:'[data-view="tasks"]'},
  {title:'Kanban Board', desc:'Visualize your workflow. Drag and drop tasks between Backlog, In Progress, Review, and Done columns.', target:'[data-view="kanban"]'},
  {title:'Pomodoro Timer', desc:'Boost focus with timed work sessions. Track your focus minutes and build momentum.', target:'[data-view="pomodoro"]'},
  {title:'Habits & Streaks', desc:'Build daily routines. Track habits and maintain your streak for maximum productivity.', target:'[data-view="habits"]'},
  {title:'You\'re All Set!', desc:'Explore the other tools: Calendar, Goals, Notes, Focus Mode, Achievements, and Settings. Press Ctrl+K anytime for quick commands.', target:'#view-dashboard'}
];
function startTour() {
  S.tourStep = -1;
  tourOverlay.classList.add('active');
  nextTourStep();
}
function nextTourStep() {
  S.tourStep++;
  if(S.tourStep >= TOUR_STEPS.length) { endTour(); return; }
  const step = TOUR_STEPS[S.tourStep];
  tourTitle.textContent = step.title;
  tourDesc.textContent = step.desc;
  const target = document.querySelector(step.target);
  if(target) {
    const rect = target.getBoundingClientRect();
    const tipW = 320, tipH = 180;
    let left = rect.left + rect.width/2 - tipW/2;
    let top = rect.bottom + 12;
    if(top + tipH > window.innerHeight) top = rect.top - tipH - 12;
    if(left < 12) left = 12;
    if(left + tipW > window.innerWidth - 12) left = window.innerWidth - tipW - 12;
    tourTip.style.left = left+'px';
    tourTip.style.top = top+'px';
  }
  tourTip.classList.remove('active');
  setTimeout(() => tourTip.classList.add('active'), 50);
  tourNext.textContent = S.tourStep >= TOUR_STEPS.length-1 ? 'Finish' : 'Next';
}
function endTour() {
  S.tourStep = -1;
  tourOverlay.classList.remove('active');
  tourTip.classList.remove('active');
}
// ===========================
// 41. ENHANCED DAILY BRIEFING
// ===========================
function updateBriefing() {
  if(!briefTodayDone) return;
  const todayStr = today();
  const doneToday = S.tasks.filter(t=>t.completedAt&&t.completedAt.startsWith(todayStr)).length;
  briefTodayDone.textContent = doneToday;
  briefFocus.textContent = S.pomo.today+'m';
  const focusScore = S.pomo.today > 0 ? Math.min(100, Math.round((S.pomo.today/120)*100)) : Math.round(S.tasks.filter(t=>t.completed).length/Math.max(1,S.tasks.length)*100);
  briefFocusScore.textContent = focusScore+'%';
}

// ===========================
// 42. INIT
// ===========================
function init() {
  loadAll();

  const now = new Date();
  taskDate.value = today();
  const mins = now.getMinutes(), r = Math.ceil(mins/30)*30;
  now.setMinutes(r,0,0);
  taskTime.value = now.toTimeString().slice(0,5);

  S.calYear = now.getFullYear();
  S.calMonth = now.getMonth();

  setFocus.value = S.pomo.focusTm;
  setShort.value = S.pomo.shortTm;
  setLong.value = S.pomo.longTm;
  pomoSetMode('focus');
  pomoSessions.textContent = `Sessions: ${S.pomo.sessions}`;
  if(pomoToday) pomoToday.textContent = S.pomo.today+' min';
  if(pomoWeek) pomoWeek.textContent = S.pomo.week+' min';
  if(pomoTotalSessions) pomoTotalSessions.textContent = S.pomo.sessions;

  renderTasks(); updateAll(); renderHabits(); renderHeatmap(); renderGoals(); renderNotes(); renderAchievements();
  updateClock(); nextQuote(); updateProfile(); renderNotifDot(); renderNotifList();

  // Enhanced init
  startParticles();
  initMood();
  renderTimeline();
  updateBriefing();
  setTheme(document.documentElement.getAttribute('data-theme')||'dark');

  // Welcome screen
  if(!S.welcomed) {
    setTimeout(() => { welcomeOverlay.classList.add('active'); }, 600);
  }

  setTimeout(() => { loader.classList.add('hidden'); app.classList.add('loaded'); aiToggle.classList.add('visible'); }, 500);
  setInterval(updateClock, 1000);
  setInterval(nextQuote, 20000);
  setInterval(updateBriefing, 30000);

  // Check overdue tasks daily
  setInterval(() => {
    const od = S.tasks.filter(t => overdue(t));
    od.forEach(t => {
      if(!S.notifiedTasks.has(t.id)) { S.notifiedTasks.add(t.id); addNotif(`Task overdue: ${t.text}`,'fa-exclamation-triangle'); }
    });
  }, 60000);
  checkOverdue();
  function checkOverdue() {
    S.tasks.filter(t => overdue(t) && !S.notifiedTasks.has(t.id)).forEach(t => {
      S.notifiedTasks.add(t.id); addNotif(`Task overdue: ${t.text}`,'fa-exclamation-triangle');
    });
  }

  // === WELCOME ===
  welcomeStart.addEventListener('click', () => {
    welcomeOverlay.classList.remove('active');
    S.welcomed = true;
    saveAll();
    setTimeout(startTour, 400);
  });

  // === NAV ===
  navItems.forEach(n => n.addEventListener('click', () => goView(n.dataset.view)));
  sidebarToggle.addEventListener('click', () => sidebar.classList.toggle('open'));
  document.addEventListener('click', e => {
    if(window.innerWidth<=768 && !sidebar.contains(e.target) && !sidebarToggle.contains(e.target))
      sidebar.classList.remove('open');
  });

  // === FAB ===
  fabBtn.addEventListener('click', () => {
    fabBtn.classList.toggle('open');
    fabMenu.classList.toggle('open');
  });
  document.querySelectorAll('.fab-item').forEach(el => {
    el.addEventListener('click', () => {
      fabBtn.classList.remove('open');
      fabMenu.classList.remove('open');
      const act = el.dataset.fab;
      if(act==='task') { goView('tasks'); setTimeout(()=>taskInput.focus(),100); }
      if(act==='note') { goView('notes'); setTimeout(()=>noteTitle.focus(),100); }
      if(act==='pomo') { goView('pomodoro'); }
      if(act==='cmd') { openCmd(); }
    });
  });

  // === MOOD & ENERGY ===
  moodGrid.addEventListener('click', e => {
    const btn = e.target.closest('.mood-btn');
    if(btn) setMood(btn.dataset.mood);
  });
  energySlider.addEventListener('input', () => setEnergy(energySlider.value));

  // === AI ASSISTANT ===
  aiToggle.addEventListener('click', () => {
    aiPanel.classList.toggle('open');
    if(aiPanel.classList.contains('open')) setTimeout(()=>aiInput.focus(),200);
  });
  aiClose.addEventListener('click', () => aiPanel.classList.remove('open'));
  aiSend.addEventListener('click', handleAISend);
  aiInput.addEventListener('keydown', e => { if(e.key==='Enter') handleAISend(); });

  // === TASK TEMPLATES ===
  document.querySelector('.template-grid')?.addEventListener('click', e => {
    const card = e.target.closest('.template-card');
    if(card) applyTemplate(card.dataset.template);
  });

  // === PROFILE ===
  profileEditBtn.addEventListener('click', () => {
    const name = prompt('Enter your name:', S.userName);
    if(name && name.trim()) { S.userName = name.trim(); saveAll(); updateProfile(); toast('Name updated','ok'); }
  });

  // === NOTIFICATIONS ===
  notifBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    notifDropdown.classList.toggle('hidden');
    S.notifications.forEach(n => n.read = true);
    renderNotifDot();
  });
  document.addEventListener('click', (e) => {
    if(!e.target.closest('#notif-wrap')) notifDropdown.classList.add('hidden');
  });

  // === TASKS ===
  taskForm.addEventListener('submit', e => {
    e.preventDefault();
    addTask(taskInput.value, taskPriority.value, taskCategory.value, taskTags.value, taskDate.value, taskTime.value, taskRecurring.value);
  });
  taskList.addEventListener('click', e => {
    const item = e.target.closest('.task-item');
    if(!item) return;
    const id = item.dataset.id;
    if(S.bulk) {
      const cb = e.target.closest('.bulk-cb');
      if(cb) {
        if(S.bulkSet.has(id)) S.bulkSet.delete(id); else S.bulkSet.add(id);
        updateBulkUI(); renderTasks(); return;
      }
    }
    const act = e.target.closest('[data-act]');
    if(act) {
      switch(act.dataset.act) {
        case 'edit': openEdit(id); break;
        case 'del': delTask(id); break;
        case 'pin': pinTask(id); break;
        case 'dup': dupTask(id); break;
        case 'fav': favTask(id); break;
        case 'archive': archiveTask(id); break;
      }
      return;
    }
    const cb = e.target.closest('.tk-cb');
    if(cb) toggleTask(id);
  });

  // Edit form
  editForm.addEventListener('submit', e => {
    e.preventDefault();
    saveEdit({text:editText.value, priority:editPriority.value, category:editCategory.value, date:editDate.value, time:editTime.value, tags:editTags.value, recurring:editRecurring.value, status:editStatus.value});
  });

  // Filter
  filterGroup.addEventListener('click', e => {
    const b = e.target.closest('.fltr'); if(!b) return;
    $$('.fltr').forEach(x=>x.classList.remove('active')); b.classList.add('active');
    S.filter = b.dataset.f; renderTasks();
  });
  taskSort.addEventListener('change', () => { S.sort = taskSort.value; renderTasks(); });
  taskSearch.addEventListener('input', () => { S.search = taskSearch.value; searchClear.classList.toggle('hidden', !taskSearch.value); renderTasks(); });
  searchClear.addEventListener('click', () => { taskSearch.value=''; S.search=''; renderTasks(); taskSearch.focus(); });

  // Bulk
  bulkToggle.addEventListener('change', () => {
    S.bulk = bulkToggle.checked; S.bulkSet.clear();
    if(S.bulk) S.tasks.forEach(t=>{if(!t.archived)S.bulkSet.add(t.id);});
    else S.bulkSet.clear();
    updateBulkUI(); renderTasks();
  });
  bulkDone.addEventListener('click', () => {
    S.bulkSet.forEach(id => { const t=S.tasks.find(x=>x.id===id); if(t&&!t.completed) toggleTask(id); });
    S.bulkSet.clear(); updateBulkUI(); renderTasks();
  });
  bulkDelete.addEventListener('click', () => {
    S.bulkSet.forEach(id => { const t=S.tasks.find(x=>x.id===id); if(t&&t.completed) S.completedCount = Math.max(0, S.completedCount-1); });
    S.tasks = S.tasks.filter(t=>!S.bulkSet.has(t.id));
    S.bulkSet.clear(); saveAll(); updateBulkUI(); renderTasks(); updateAll(); renderKanban();
    toast('Bulk deleted','info');
  });
  clearDoneBtn.addEventListener('click', clearDone);
  tasksClearAll.addEventListener('click', () => confirmAction('Delete ALL tasks?', clearAllTasks));
  exportBtn.addEventListener('click', exportData);
  importInput.addEventListener('change', e => { if(e.target.files[0]) importData(e.target.files[0]); });

  // === CALENDAR ===
  calPrev.addEventListener('click', () => { S.calMonth--; if(S.calMonth<0) { S.calMonth=11; S.calYear--; } renderCal(); renderCalHeatmap(); });
  calNext.addEventListener('click', () => { S.calMonth++; if(S.calMonth>11) { S.calMonth=0; S.calYear++; } renderCal(); renderCalHeatmap(); });
  calTodayBtn.addEventListener('click', () => { const n=new Date(); S.calYear=n.getFullYear(); S.calMonth=n.getMonth(); renderCal(); renderCalHeatmap(); });

  // === KANBAN ===
  kanbanAddBtn.addEventListener('click', () => {
    goView('tasks');
    setTimeout(() => { taskInput.focus(); toast('Add a task, then drag it to Kanban columns','info'); }, 200);
  });
  // Kanban column drag events (attached once)
  KANBAN_COLS.forEach(col => {
    const list = document.getElementById(`kanban-list-${col}`);
    if(!list) return;
    list.addEventListener('dragover', e => { e.preventDefault(); list.classList.add('drag-over-col'); });
    list.addEventListener('dragleave', () => list.classList.remove('drag-over-col'));
    list.addEventListener('drop', e => {
      e.preventDefault(); list.classList.remove('drag-over-col');
      const id = e.dataTransfer.getData('text/plain');
      if(!id) return;
      const t = S.tasks.find(x=>x.id===id);
      if(!t) return;
      if(col === 'done') { t.completed = true; t.status = 'done'; t.completedAt = new Date().toISOString(); }
      else { t.status = col; t.completed = false; t.completedAt = null; }
      saveAll(); renderKanban(); renderTasks(); updateAll();
    });
  });

  // === HABITS ===
  habitAddBtn.addEventListener('click', () => habitForm.classList.toggle('hidden'));
  habitCancel.addEventListener('click', () => { habitForm.classList.add('hidden'); habitInput.value=''; });
  habitSave.addEventListener('click', () => {
    const name = habitInput.value.trim();
    if(!name) return;
    S.habits.push({id:uid(), name, days:[], createdAt:new Date().toISOString()});
    saveAll(); renderHabits(); renderHeatmap(); habitInput.value=''; habitForm.classList.add('hidden');
    toast('Habit created!','ok');
  });

  // === POMODORO ===
  pomoModeBtns.forEach(b => b.addEventListener('click', () => pomoSetMode(b.dataset.pm)));
  pomoStart.addEventListener('click', pomoStartTimer);
  pomoPause.addEventListener('click', pomoPauseTimer);
  pomoReset.addEventListener('click', pomoResetTimer);
  setFocus.addEventListener('change', () => { S.pomo.focusTm = Math.max(1,parseInt(setFocus.value)||25); saveAll(); if(S.pomo.mode==='focus') pomoSetMode('focus'); });
  setShort.addEventListener('change', () => { S.pomo.shortTm = Math.max(1,parseInt(setShort.value)||5); saveAll(); if(S.pomo.mode==='short') pomoSetMode('short'); });
  setLong.addEventListener('change', () => { S.pomo.longTm = Math.max(1,parseInt(setLong.value)||15); saveAll(); if(S.pomo.mode==='long') pomoSetMode('long'); });

  // === GOALS ===
  goalAddBtn.addEventListener('click', () => goalForm.classList.toggle('hidden'));
  goalCancel.addEventListener('click', () => { goalForm.classList.add('hidden'); goalInput.value=''; });
  goalSave.addEventListener('click', () => {
    const name = goalInput.value.trim();
    if(!name) return;
    S.goals.push({id:uid(), name, dueDate:goalDate.value||'', category:'', keyword:'', createdAt:new Date().toISOString()});
    saveAll(); renderGoals(); goalInput.value=''; goalForm.classList.add('hidden');
    toast('Goal created!','ok');
  });

  // === NOTES ===
  noteForm.addEventListener('submit', e => {
    e.preventDefault();
    const title = noteTitle.value.trim(), body = noteBody.value.trim();
    if(!title&&!body) return;
    S.notes.push({id:uid(), title:title||'Untitled', body, createdAt:new Date().toISOString()});
    saveAll(); renderNotes(); noteTitle.value=''; noteBody.value=''; noteTitle.focus();
    toast('Note added','ok');
  });

  // === FOCUS ===
  focusEnter.addEventListener('click', enterFocus);
  focusExit.addEventListener('click', exitFocus);
  focusMusicBtn.addEventListener('click', toggleFocusMusic);

  // === THEME ===
  themeBtn.addEventListener('click', toggleTheme);
  themeGrid.addEventListener('click', e => {
    const card = e.target.closest('.theme-card');
    if(card) setTheme(card.dataset.theme);
  });

  // === SETTINGS ===
  settingsExport.addEventListener('click', exportData);
  settingsImport.addEventListener('change', e => { if(e.target.files[0]) importData(e.target.files[0]); });
  settingsPrint.addEventListener('click', printReport);
  settingsReset.addEventListener('click', () => confirmAction('Reset ALL data? This cannot be undone.', () => {
    localStorage.removeItem('tm_data'); location.reload();
  }));

  // === MODALS ===
  document.addEventListener('click', e => {
    if(e.target.classList.contains('modal-overlay')) { e.target.classList.remove('active'); S.editId=null; }
    const cb = e.target.closest('.modal-close');
    if(cb) { document.getElementById(cb.dataset.modal).classList.remove('active'); S.editId=null; }
  });
  confirmYes.addEventListener('click', () => { modalConfirm.classList.remove('active'); if(S.confirmCb) S.confirmCb(); S.confirmCb = null; });

  // === TOUR ===
  tourNext.addEventListener('click', nextTourStep);
  tourSkip.addEventListener('click', endTour);
  document.addEventListener('keydown', e => {
    if(e.key==='Escape' && tourOverlay.classList.contains('active') && S.tourStep>=0) endTour();
  });

  // === CMD BAR ===
  topbarCmd.addEventListener('click', openCmd);
  cmdInput.addEventListener('input', () => runCmd(cmdInput.value));
  cmdInput.addEventListener('keydown', e => {
    if(e.key==='Enter' && cmdInput.value.trim()) runCmd(cmdInput.value);
  });
  cmdOverlay.addEventListener('click', e => { if(e.target===cmdOverlay) closeCmd(); });

  // === DRAG & DROP (Task List) ===
  let dragId = null;
  taskList.addEventListener('dragstart', e => {
    const item = e.target.closest('.task-item'); if(!item) return;
    dragId = item.dataset.id; item.classList.add('dragging'); e.dataTransfer.effectAllowed = 'move';
  });
  taskList.addEventListener('dragend', e => {
    const item = e.target.closest('.task-item'); if(item) item.classList.remove('dragging');
    $$('.task-item.drag-over').forEach(el=>el.classList.remove('drag-over')); dragId = null;
  });
  taskList.addEventListener('dragover', e => {
    e.preventDefault(); const item = e.target.closest('.task-item');
    if(!item||item.dataset.id===dragId) return;
    $$('.task-item.drag-over').forEach(el=>el.classList.remove('drag-over')); item.classList.add('drag-over');
  });
  taskList.addEventListener('dragleave', e => { const item = e.target.closest('.task-item'); if(item) item.classList.remove('drag-over'); });
  taskList.addEventListener('drop', e => {
    e.preventDefault(); const target = e.target.closest('.task-item');
    if(!target||!dragId||target.dataset.id===dragId) return;
    $$('.task-item.drag-over').forEach(el=>el.classList.remove('drag-over'));
    const from = S.tasks.findIndex(t=>t.id===dragId);
    const to = S.tasks.findIndex(t=>t.id===target.dataset.id);
    if(from===-1||to===-1) return;
    const[m]=S.tasks.splice(from,1); S.tasks.splice(to,0,m);
    dragId = null; saveAll(); renderTasks();
  });

  setTimeout(updateChart, 300);
}

document.addEventListener('DOMContentLoaded', init);
