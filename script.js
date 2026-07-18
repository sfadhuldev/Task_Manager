/* SFadhul Workspace - script.js */

// ========================================
// DOM References
// ========================================
const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

function el(id) { return document.getElementById(id); }

// ========================================
// State
// ========================================
const state = {
  tasks: [],
  habits: [],
  goals: [],
  notes: [],
  filter: 'all',
  sort: 'date-desc',
  search: '',
  editId: null,
  confirmCb: null,
  calYear: 0,
  calMonth: 0,
  pomo: {
    mode: 'focus',
    time: 25 * 60,
    max: 25 * 60,
    running: false,
    interval: null,
    sessions: 0,
    today: 0,
    week: 0,
    focusMin: 25,
    shortMin: 5,
    longMin: 15
  },
  completedCount: 0,
  streak: 0,
  theme: 'dark',
  activityLog: [],
  quoteIdx: 0
};

const STORAGE_KEY = 'sfadhul_workspace_data';

const QUOTES = [
  { t: 'The only way to do great work is to love what you do.', a: 'Steve Jobs' },
  { t: 'Start where you are. Use what you have. Do what you can.', a: 'Arthur Ashe' },
  { t: 'The future depends on what you do today.', a: 'Mahatma Gandhi' },
  { t: 'Don\'t watch the clock; do what it does. Keep going.', a: 'Sam Levenson' },
  { t: 'The secret of getting ahead is getting started.', a: 'Mark Twain' },
  { t: 'Believe you can and you\'re halfway there.', a: 'Theodore Roosevelt' },
  { t: 'Success is not final, failure is not fatal.', a: 'Winston Churchill' },
  { t: 'It does not matter how slowly you go as long as you do not stop.', a: 'Confucius' }
];

const ACHIEVEMENTS = [
  { id: 'first', name: 'First Step', icon: '\u2B50', desc: 'Complete 1 task', check: function(s) { return s.completedCount >= 1; } },
  { id: 'five', name: 'Getting Started', icon: '\uD83C\uDFC5', desc: 'Complete 5 tasks', check: function(s) { return s.completedCount >= 5; } },
  { id: 'ten', name: 'Dedicated', icon: '\uD83C\uDFC6', desc: 'Complete 10 tasks', check: function(s) { return s.completedCount >= 10; } },
  { id: 'streak3', name: '3-Day Streak', icon: '\uD83D\uDD25', desc: '3 day streak', check: function(s) { return s.streak >= 3; } },
  { id: 'streak7', name: 'Week Warrior', icon: '\uD83D\uDD25', desc: '7 day streak', check: function(s) { return s.streak >= 7; } },
  { id: 'pomo1', name: 'First Focus', icon: '\u23F1', desc: '1 Pomodoro session', check: function(s) { return s.pomo.sessions >= 1; } },
  { id: 'pomo10', name: 'Focus Master', icon: '\u23F1', desc: '10 Pomodoro sessions', check: function(s) { return s.pomo.sessions >= 10; } },
  { id: 'habit1', name: 'Habit Builder', icon: '\u2713', desc: 'Create 1 habit', check: function(s) { return s.habits.length >= 1; } },
  { id: 'habit5', name: 'Routine Pro', icon: '\u2713', desc: 'Create 5 habits', check: function(s) { return s.habits.length >= 5; } },
  { id: 'goal1', name: 'Goal Setter', icon: '\uD83C\uDFAF', desc: 'Create 1 goal', check: function(s) { return s.goals.length >= 1; } },
  { id: 'note1', name: 'Note Taker', icon: '\uD83D\uDCDD', desc: 'Write 1 note', check: function(s) { return s.notes.length >= 1; } },
  { id: 'tasks25', name: 'Elite', icon: '\uD83D\uDC8E', desc: 'Complete 25 tasks', check: function(s) { return s.completedCount >= 25; } }
];

const KANBAN_COLS = ['not-started', 'in-progress', 'review', 'done'];
const VIEW_NAMES = ['dashboard', 'tasks', 'calendar', 'kanban', 'habits', 'pomodoro', 'goals', 'notes', 'focus', 'achievements', 'settings'];

// ========================================
// Utilities
// ========================================
function esc(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function today() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

function fmtDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  const diff = Math.round((d - now) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff === -1) return 'Yesterday';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function isOverdue(task) {
  return !task.completed && task.dueDate && task.dueDate < today();
}

function isToday(dateStr) {
  return dateStr === today();
}

function debounce(fn, ms) {
  var timer;
  return function() {
    var ctx = this, args = arguments;
    clearTimeout(timer);
    timer = setTimeout(function() { fn.apply(ctx, args); }, ms);
  };
}

// ========================================
// LocalStorage
// ========================================
function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      tasks: state.tasks,
      habits: state.habits,
      goals: state.goals,
      notes: state.notes,
      completedCount: state.completedCount,
      streak: state.streak,
      pomoSessions: state.pomo.sessions,
      pomoToday: state.pomo.today,
      pomoWeek: state.pomo.week,
      pomoWeekNum: state.pomo.weekNum || getWeekNumber(new Date()),
      pomoFocusMin: state.pomo.focusMin,
      pomoShortMin: state.pomo.shortMin,
      pomoLongMin: state.pomo.longMin,
      pomoDayTimestamp: today(),
      activityLog: state.activityLog,
      theme: state.theme
    }));
  } catch (e) {
    if (e.name === 'QuotaExceededError') {
      toast('Storage full! Data may not save.', 'err');
    }
  }
}

function getWeekNumber(d) {
  var date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  var dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  var yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(((date - yearStart) / 86400000 + 1) / 7);
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const d = JSON.parse(raw);
    if (!d || typeof d !== 'object') return;

    state.tasks = Array.isArray(d.tasks) ? d.tasks : [];
    state.habits = Array.isArray(d.habits) ? d.habits : [];
    state.goals = Array.isArray(d.goals) ? d.goals : [];
    state.notes = Array.isArray(d.notes) ? d.notes : [];
    state.completedCount = d.completedCount || 0;
    state.streak = d.streak || 0;
    state.pomo.sessions = d.pomoSessions || 0;
    state.pomo.focusMin = d.pomoFocusMin || 25;
    state.pomo.shortMin = d.pomoShortMin || 5;
    state.pomo.longMin = d.pomoLongMin || 15;
    state.activityLog = Array.isArray(d.activityLog) ? d.activityLog : [];
    state.theme = d.theme || 'dark';

    // Reset daily pomodoro counter if it's a new day
    if (d.pomoDayTimestamp !== today()) {
      state.pomo.today = 0;
    } else {
      state.pomo.today = d.pomoToday || 0;
    }

    // Reset weekly pomodoro counter if it's a new week
    var currentWeek = getWeekNumber(new Date());
    if ((d.pomoWeekNum || 0) !== currentWeek) {
      state.pomo.week = 0;
    } else {
      state.pomo.week = d.pomoWeek || 0;
    }
    state.pomo.weekNum = currentWeek;
  } catch (e) {
    console.warn('Failed to load data:', e);
  }
}

// ========================================
// Toast
// ========================================
function toast(msg, type) {
  type = type || 'info';
  const container = el('toast-container');
  if (!container) return;
  const div = document.createElement('div');
  div.className = 'toast ' + type;
  div.textContent = msg;
  container.appendChild(div);
  setTimeout(function() {
    div.classList.add('out');
    setTimeout(function() { div.remove(); }, 300);
  }, 3000);
}

// ========================================
// Activity Log
// ========================================
function logActivity(text) {
  state.activityLog.unshift({ text: text, time: new Date().toISOString() });
  if (state.activityLog.length > 30) state.activityLog.length = 30;
  save();
  renderTimeline();
}

// ========================================
// Navigation
// ========================================
function openView(name) {
  if (!el('view-' + name)) return;

  VIEW_NAMES.forEach(function(v) {
    const view = el('view-' + v);
    if (view) view.classList.toggle('active', v === name);
  });

  $$('.nav-btn').forEach(function(btn) {
    btn.classList.toggle('active', btn.dataset.view === name);
  });

  // Close mobile sidebar
  el('sidebar').classList.remove('open');

  // Refresh view data
  if (name === 'dashboard') updateDashboard();
  if (name === 'calendar') renderCalendar();
  if (name === 'kanban') renderKanban();
  if (name === 'habits') renderHabits();
  if (name === 'goals') renderGoals();
  if (name === 'notes') renderNotes();
  if (name === 'achievements') renderAchievements();
}

// ========================================
// Tasks
// ========================================
function addTask(title, priority, category, dueDate, recurring) {
  if (!title || !title.trim()) return;

  state.tasks.push({
    id: uid(),
    title: title.trim(),
    priority: priority || 'medium',
    category: category || 'Work',
    dueDate: dueDate || '',
    recurring: recurring || '',
    status: 'not-started',
    completed: false,
    createdAt: new Date().toISOString()
  });

  save();
  renderTasks();
  updateDashboard();
  logActivity('Created: ' + title.trim());
  toast('Task added!', 'ok');
}

function toggleTask(id) {
  const task = state.tasks.find(function(t) { return t.id === id; });
  if (!task) return;

  task.completed = !task.completed;
  task.status = task.completed ? 'done' : 'not-started';

  if (task.completed) {
    task.completedAt = today();
    state.completedCount++;
    checkStreak();
    logActivity('Completed: ' + task.title);
    toast('Task completed!', 'ok');
  } else {
    task.completedAt = null;
    state.completedCount = Math.max(0, state.completedCount - 1);
    logActivity('Reopened: ' + task.title);
  }

  save();
  renderTasks();
  updateDashboard();
  renderKanban();
}

function deleteTask(id) {
  const task = state.tasks.find(function(t) { return t.id === id; });
  state.tasks = state.tasks.filter(function(t) { return t.id !== id; });
  if (task && task.completed) {
    state.completedCount = Math.max(0, state.completedCount - 1);
  }
  save();
  renderTasks();
  updateDashboard();
  renderKanban();
  toast('Task deleted', 'info');
}

function openEditTask(id) {
  const task = state.tasks.find(function(t) { return t.id === id; });
  if (!task) return;

  state.editId = id;
  el('edit-text').value = task.title;
  el('edit-priority').value = task.priority;
  el('edit-category').value = task.category;
  el('edit-date').value = task.dueDate || '';
  el('edit-status').value = task.status || 'not-started';
  el('edit-recurring').value = task.recurring || '';
  el('modal-edit').classList.add('active');
  setTimeout(function() { el('edit-text').focus(); }, 100);
}

function saveEditTask(data) {
  if (!state.editId) return;
  const task = state.tasks.find(function(t) { return t.id === state.editId; });
  if (!task) return;

  task.title = data.title.trim();
  task.priority = data.priority;
  task.category = data.category;
  task.dueDate = data.dueDate || '';
  task.status = data.status;
  task.recurring = data.recurring || '';

  var wasCompleted = task.completed;
  if (data.status === 'done') {
    task.completed = true;
  } else {
    task.completed = false;
  }

  if (task.completed && !wasCompleted) {
    state.completedCount++;
    checkStreak();
  } else if (!task.completed && wasCompleted) {
    state.completedCount = Math.max(0, state.completedCount - 1);
  }

  save();
  renderTasks();
  updateDashboard();
  renderKanban();
  el('modal-edit').classList.remove('active');
  state.editId = null;
  toast('Task updated', 'ok');
}

function clearCompleted() {
  state.tasks = state.tasks.filter(function(t) { return !t.completed; });
  state.completedCount = 0;
  save();
  renderTasks();
  updateDashboard();
  renderKanban();
  toast('Completed tasks cleared', 'info');
}

function getFilteredTasks() {
  return state.tasks.filter(function(t) {
    if (state.search && !t.title.toLowerCase().includes(state.search.toLowerCase())) return false;
    switch (state.filter) {
      case 'active': return !t.completed;
      case 'done': return t.completed;
      case 'today': return t.dueDate === today();
      case 'overdue': return isOverdue(t);
      default: return true;
    }
  });
}

function getSortedTasks(tasks) {
  var arr = tasks.slice();
  switch (state.sort) {
    case 'date-desc': arr.sort(function(a, b) { return (b.dueDate || 'z').localeCompare(a.dueDate || 'z'); }); break;
    case 'date-asc': arr.sort(function(a, b) { return (a.dueDate || 'z').localeCompare(b.dueDate || 'z'); }); break;
    case 'priority-desc': arr.sort(function(a, b) { return priWeight(b.priority) - priWeight(a.priority); }); break;
    case 'priority-asc': arr.sort(function(a, b) { return priWeight(a.priority) - priWeight(b.priority); }); break;
    case 'name': arr.sort(function(a, b) { return a.title.localeCompare(b.title); }); break;
  }
  return arr;
}

function priWeight(p) {
  return { critical: 4, high: 3, medium: 2, low: 1 }[p] || 0;
}

// ========================================
// Render Tasks
// ========================================
function renderTasks() {
  var filtered = getFilteredTasks();
  var sorted = getSortedTasks(filtered);
  var list = el('task-list');
  var empty = el('empty-state');

  if (sorted.length === 0) {
    list.innerHTML = '';
    empty.style.display = 'flex';
    el('empty-title').textContent = state.search ? 'No results' : 'No tasks';
    el('empty-msg').textContent = state.search ? 'No tasks matching your search' : 'Add your first task above.';
  } else {
    empty.style.display = 'none';
    list.innerHTML = sorted.map(renderTaskItem).join('');
  }

  // Active count for badge and footer
  var active = state.tasks.filter(function(t) { return !t.completed; }).length;
  el('nav-badge').textContent = active;
  el('nav-badge').style.display = active > 0 ? 'inline' : 'none';
  el('foot-count').textContent = active + ' task' + (active !== 1 ? 's' : '') + ' remaining';
  el('clear-done-btn').style.display = state.tasks.some(function(t) { return t.completed; }) ? 'inline-block' : 'none';
}

function renderTaskItem(task) {
  var od = isOverdue(task);
  var td = isToday(task.dueDate);
  var pri = task.priority.charAt(0).toUpperCase() + task.priority.slice(1);

  var dueHtml = '';
  if (task.dueDate) {
    var cls = od ? 'overdue' : (td ? 'today-due' : '');
    dueHtml = '<div class="task-due ' + cls + '">' + fmtDate(task.dueDate) + '</div>';
  }

  return '<li class="task-item priority-' + task.priority + (task.completed ? ' done' : '') + '" data-id="' + task.id + '">' +
    '<input type="checkbox" class="task-cb" ' + (task.completed ? 'checked' : '') + '>' +
    '<div class="task-content">' +
      '<div class="task-text">' + esc(task.title) + '</div>' +
      '<div class="task-meta">' +
        '<span class="task-badge badge-pri-' + task.priority + '">' + pri + '</span>' +
        '<span class="task-badge badge-cat">' + esc(task.category) + '</span>' +
        (task.recurring ? '<span class="task-badge badge-recur">' + esc(task.recurring) + '</span>' : '') +
      '</div>' +
      dueHtml +
    '</div>' +
    '<div class="task-actions">' +
      '<button class="task-act" data-action="edit" title="Edit">&#9998;</button>' +
      '<button class="task-act del" data-action="delete" title="Delete">&#10005;</button>' +
    '</div>' +
  '</li>';
}

// ========================================
// Dashboard
// ========================================
function updateDashboard() {
  var total = state.tasks.length;
  var done = state.tasks.filter(function(t) { return t.completed; }).length;
  var active = total - done;
  var overdue = state.tasks.filter(function(t) { return isOverdue(t); }).length;
  var todayCount = state.tasks.filter(function(t) { return t.dueDate === today() && !t.completed; }).length;
  var score = total === 0 ? 0 : Math.round((done / total) * 100);

  el('st-total').textContent = total;
  el('st-active').textContent = active;
  el('st-done').textContent = done;
  el('st-overdue').textContent = overdue;
  el('st-today').textContent = todayCount;
  el('st-score').textContent = score + '%';

  // Completion ring
  var r = 50;
  var circ = 2 * Math.PI * r;
  var offset = total === 0 ? circ : circ - (done / total) * circ;
  el('ring-fg').style.strokeDasharray = circ;
  el('ring-fg').style.strokeDashoffset = offset;
  el('ring-pct').textContent = score + '%';
  el('ring-sub').textContent = done + ' / ' + total + ' tasks';

  // Today's tasks
  var todayTasks = state.tasks.filter(function(t) { return t.dueDate === today() && !t.completed; }).slice(0, 6);
  var todayList = el('dash-today-list');
  if (todayTasks.length === 0) {
    todayList.innerHTML = '<p class="muted">No tasks due today.</p>';
  } else {
    todayList.innerHTML = todayTasks.map(function(t) {
      return '<div class="mini-item"><span class="mini-dot"></span>' + esc(t.title) + '</div>';
    }).join('');
  }

  renderTimeline();
}

// ========================================
// Timeline
// ========================================
function renderTimeline() {
  var container = el('timeline');
  if (!container) return;

  if (state.activityLog.length === 0) {
    container.innerHTML = '<p class="muted">No recent activity.</p>';
    return;
  }

  container.innerHTML = state.activityLog.slice(0, 10).map(function(entry) {
    var t = new Date(entry.time);
    var timeStr = t.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    return '<div class="tl-item"><div class="tl-dot"></div><div class="tl-text">' + esc(entry.text) + '</div><div class="tl-time">' + timeStr + '</div></div>';
  }).join('');
}

// ========================================
// Streak
// ========================================
function checkStreak() {
  var dates = state.tasks
    .filter(function(t) { return t.completed; })
    .map(function(t) {
      if (t.completedAt) return t.completedAt;
      return t.createdAt ? t.createdAt.slice(0, 10) : '';
    })
    .filter(function(d) { return d.length > 0; });

  var unique = dates.filter(function(v, i, a) { return a.indexOf(v) === i; }).sort().reverse();

  var streak = 0;
  var now = new Date();
  var check = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  for (var i = 0; i <= unique.length; i++) {
    var dateStr = check.getFullYear() + '-' + String(check.getMonth() + 1).padStart(2, '0') + '-' + String(check.getDate()).padStart(2, '0');
    if (unique.indexOf(dateStr) > -1) {
      streak++;
      check.setDate(check.getDate() - 1);
    } else {
      break;
    }
  }
  state.streak = streak;
}

// ========================================
// Calendar
// ========================================
function renderCalendar() {
  var now = new Date();
  var y = state.calYear || now.getFullYear();
  var m = state.calMonth != null ? state.calMonth : now.getMonth();
  state.calYear = y;
  state.calMonth = m;

  el('cal-label').textContent = new Date(y, m).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  var firstDay = new Date(y, m, 1).getDay();
  var daysInMonth = new Date(y, m + 1, 0).getDate();
  var daysInPrev = new Date(y, m, 0).getDate();
  var todayStr = today();
  var html = '';

  // Previous month days
  for (var i = firstDay - 1; i >= 0; i--) {
    html += '<div class="cal-day other">' + (daysInPrev - i) + '</div>';
  }

  // Current month days
  for (var d = 1; d <= daysInMonth; d++) {
    var dateStr = y + '-' + String(m + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
    var tasksOnDay = state.tasks.filter(function(t) { return t.dueDate === dateStr; });
    var isToday = dateStr === todayStr;
    var countBadge = tasksOnDay.length > 0 ? '<span class="cal-count">' + tasksOnDay.length + '</span>' : '';

    html += '<div class="cal-day' + (isToday ? ' today' : '') + '" data-date="' + dateStr + '">' + d + countBadge + '</div>';
  }

  // Next month days
  var totalCells = firstDay + daysInMonth;
  var remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
  for (var j = 1; j <= remaining; j++) {
    html += '<div class="cal-day other">' + j + '</div>';
  }

  el('cal-body').innerHTML = html;

  // Click on day to see tasks
  el('cal-body').querySelectorAll('.cal-day[data-date]').forEach(function(dayEl) {
    dayEl.addEventListener('click', function() {
      var dateStr = dayEl.dataset.date;
      var tasks = state.tasks.filter(function(t) { return t.dueDate === dateStr; });
      if (tasks.length > 0) {
        toast(dateStr + ': ' + tasks.map(function(t) { return t.title; }).join(', '), 'info');
      }
    });
  });
}

// ========================================
// Kanban
// ========================================
function renderKanban() {
  KANBAN_COLS.forEach(function(col) {
    var list = el('kl-' + col);
    var count = el('kc-' + col);
    if (!list) return;

    var tasks;
    if (col === 'done') {
      tasks = state.tasks.filter(function(t) { return t.completed; });
    } else {
      tasks = state.tasks.filter(function(t) { return t.status === col && !t.completed; });
    }

    count.textContent = tasks.length;

    list.innerHTML = tasks.map(function(t) {
      var pri = t.priority.charAt(0).toUpperCase() + t.priority.slice(1);
      return '<div class="kanban-card" data-id="' + t.id + '" draggable="true">' +
        '<div class="kb-text">' + esc(t.title) + '</div>' +
        '<div class="kb-meta">' +
          '<span class="kb-badge kb-pri-' + t.priority + '">' + pri + '</span>' +
          (t.dueDate ? '<span class="kb-badge kb-status">' + fmtDate(t.dueDate) + '</span>' : '') +
        '</div>' +
      '</div>';
    }).join('');

    // Drag and drop
    list.querySelectorAll('.kanban-card').forEach(function(card) {
      card.addEventListener('dragstart', function(e) {
        e.dataTransfer.setData('text/plain', card.dataset.id);
        card.classList.add('dragging');
      });
      card.addEventListener('dragend', function() {
        card.classList.remove('dragging');
      });
    });
  });
}

// ========================================
// Habits
// ========================================
function renderHabits() {
  var container = el('habit-list');

  if (state.habits.length === 0) {
    container.innerHTML = '<div class="empty-state"><div class="empty-icon">&#10003;</div><h3>No habits</h3><p>Create a habit to start tracking.</p></div>';
    return;
  }

  var days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  container.innerHTML = state.habits.map(function(h) {
    var weekDays = days.map(function(dayName, i) {
      var d = new Date();
      d.setDate(d.getDate() - d.getDay() + i);
      var dateStr = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
      var checked = (h.days || []).indexOf(dateStr) > -1;
      return '<span class="habit-day' + (checked ? ' checked' : '') + '" data-habit="' + h.id + '" data-day="' + dateStr + '">' + dayName[0] + '</span>';
    }).join('');

    var weekCompleted = (h.days || []).filter(function(d) {
      var now = new Date();
      var startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      return d >= (startOfWeek.getFullYear() + '-' + String(startOfWeek.getMonth() + 1).padStart(2, '0') + '-' + String(startOfWeek.getDate()).padStart(2, '0'));
    }).length;

    return '<div class="habit-card">' +
      '<button class="habit-del" data-id="' + h.id + '">&times;</button>' +
      '<h4>' + esc(h.name) + '</h4>' +
      '<div class="habit-days">' + weekDays + '</div>' +
      '<div class="habit-streak">' + weekCompleted + '/7 this week</div>' +
    '</div>';
  }).join('');

  // Toggle habit day
  container.querySelectorAll('.habit-day').forEach(function(dayEl) {
    dayEl.addEventListener('click', function() {
      var habitId = dayEl.dataset.habit;
      var dateStr = dayEl.dataset.day;
      var habit = state.habits.find(function(h) { return h.id === habitId; });
      if (!habit) return;
      if (!habit.days) habit.days = [];
      var idx = habit.days.indexOf(dateStr);
      if (idx > -1) {
        habit.days.splice(idx, 1);
      } else {
        habit.days.push(dateStr);
        logActivity('Habit: ' + habit.name);
      }
      save();
      renderHabits();
    });
  });

  // Delete habit
  container.querySelectorAll('.habit-del').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var habit = state.habits.find(function(h) { return h.id === btn.dataset.id; });
      var name = habit ? habit.name : 'this habit';
      confirmAction('Delete habit "' + name + '"?', function() {
        state.habits = state.habits.filter(function(h) { return h.id !== btn.dataset.id; });
        save();
        renderHabits();
        toast('Habit deleted', 'info');
      });
    });
  });
}

// ========================================
// Pomodoro
// ========================================
function updatePomodoroDisplay() {
  var m = Math.floor(state.pomo.time / 60);
  var s = state.pomo.time % 60;
  el('pomo-time').textContent = String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
}

function setPomodoroMode(mode) {
  state.pomo.mode = mode;
  state.pomo.running = false;
  if (state.pomo.interval) {
    clearInterval(state.pomo.interval);
    state.pomo.interval = null;
  }

  $$('.pomo-mode').forEach(function(btn) {
    btn.classList.toggle('active', btn.dataset.mode === mode);
  });

  var times = { focus: state.pomo.focusMin * 60, short: state.pomo.shortMin * 60, long: state.pomo.longMin * 60 };
  state.pomo.time = times[mode] || times.focus;
  state.pomo.max = state.pomo.time;
  el('pomo-start').textContent = 'Start';
  updatePomodoroDisplay();
}

function startPomodoro() {
  if (state.pomo.running) return;
  if (state.pomo.time <= 0) setPomodoroMode(state.pomo.mode);

  state.pomo.running = true;
  el('pomo-start').textContent = 'Running';
  el('pomo-card').classList.add('running');

  state.pomo.interval = setInterval(function() {
    state.pomo.time--;
    updatePomodoroDisplay();

    if (state.pomo.time <= 0) {
      clearInterval(state.pomo.interval);
      state.pomo.interval = null;
      state.pomo.running = false;
      el('pomo-start').textContent = 'Start';
      el('pomo-card').classList.remove('running');

      if (state.pomo.mode === 'focus') {
        state.pomo.sessions++;
        state.pomo.today += state.pomo.focusMin;
        state.pomo.week += state.pomo.focusMin;
        updatePomodoroStats();
        save();
        notifyPomodoro('Focus session complete!', 'Take a break.');
        logActivity('Pomodoro session completed');
      } else {
        notifyPomodoro('Break over!', 'Time to focus.');
      }
    }
  }, 1000);
}

function pausePomodoro() {
  if (!state.pomo.running) return;
  clearInterval(state.pomo.interval);
  state.pomo.interval = null;
  state.pomo.running = false;
  el('pomo-start').textContent = 'Resume';
  el('pomo-card').classList.remove('running');
}

function resetPomodoro() {
  if (state.pomo.interval) {
    clearInterval(state.pomo.interval);
    state.pomo.interval = null;
  }
  state.pomo.running = false;
  el('pomo-start').textContent = 'Start';
  el('pomo-card').classList.remove('running');
  setPomodoroMode(state.pomo.mode);
}

function updatePomodoroStats() {
  el('pomo-sessions').textContent = 'Sessions: ' + state.pomo.sessions;
  el('pomo-today').textContent = state.pomo.today + ' min';
  el('pomo-week').textContent = state.pomo.week + ' min';
  el('pomo-total').textContent = state.pomo.sessions;
}

function notifyPomodoro(title, body) {
  toast(title + '! ' + body, 'ok');

  // Flash page title
  var origTitle = document.title;
  var flashCount = 0;
  var flashInterval = setInterval(function() {
    document.title = flashCount % 2 === 0 ? '\u23F1 ' + title : origTitle;
    flashCount++;
    if (flashCount > 9) {
      clearInterval(flashInterval);
      document.title = origTitle;
    }
  }, 1000);

  // Request browser notification if permitted
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, { body: body });
  } else if ('Notification' in window && Notification.permission !== 'denied') {
    Notification.requestPermission();
  }
}

// ========================================
// Goals
// ========================================
function renderGoals() {
  var container = el('goal-list');

  if (state.goals.length === 0) {
    container.innerHTML = '<div class="empty-state"><div class="empty-icon">&#127919;</div><h3>No goals</h3><p>Set a goal and track progress.</p></div>';
    return;
  }

  container.innerHTML = state.goals.map(function(g) {
    var pct = Math.min(100, Math.max(0, g.progress || 0));
    var dueText = g.dueDate ? (isOverdue({ completed: false, dueDate: g.dueDate }) ? 'Overdue' : 'Due ' + fmtDate(g.dueDate)) : 'No deadline';

    return '<div class="goal-card">' +
      '<button class="goal-del" data-id="' + g.id + '">&times;</button>' +
      '<h4>' + esc(g.name) + '</h4>' +
      '<div class="goal-bar"><div class="goal-bar-fill" style="width:' + pct + '%"></div></div>' +
      '<div class="goal-meta">' +
        '<div class="goal-progress-btns">' +
          '<button class="goal-prog-btn goal-prog-minus" data-id="' + g.id + '" data-dir="-1">&minus;</button>' +
          '<span>' + pct + '%</span>' +
          '<button class="goal-prog-btn goal-prog-plus" data-id="' + g.id + '" data-dir="1">+</button>' +
        '</div>' +
        '<span>' + dueText + '</span>' +
      '</div>' +
    '</div>';
  }).join('');

  container.querySelectorAll('.goal-del').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var goal = state.goals.find(function(g) { return g.id === btn.dataset.id; });
      var name = goal ? goal.name : 'this goal';
      confirmAction('Delete goal "' + name + '"?', function() {
        state.goals = state.goals.filter(function(g) { return g.id !== btn.dataset.id; });
        save();
        renderGoals();
        toast('Goal deleted', 'info');
      });
    });
  });

  container.querySelectorAll('.goal-prog-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var goal = state.goals.find(function(g) { return g.id === btn.dataset.id; });
      if (!goal) return;
      var dir = parseInt(btn.dataset.dir) || 0;
      goal.progress = Math.max(0, Math.min(100, (goal.progress || 0) + dir * 10));
      save();
      renderGoals();
    });
  });
}

// ========================================
// Notes
// ========================================
function renderNotes() {
  var container = el('notes-list');

  if (state.notes.length === 0) {
    container.innerHTML = '<div class="empty-state"><div class="empty-icon">&#128221;</div><h3>No notes</h3><p>Write your first note.</p></div>';
    return;
  }

  container.innerHTML = state.notes.slice().reverse().map(function(n) {
    var dateStr = new Date(n.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    return '<div class="note-card">' +
      '<button class="note-del" data-id="' + n.id + '">&times;</button>' +
      '<h4>' + esc(n.title || 'Untitled') + '</h4>' +
      '<p>' + esc(n.body || '') + '</p>' +
      '<div class="note-date">' + dateStr + '</div>' +
    '</div>';
  }).join('');

  container.querySelectorAll('.note-del').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var note = state.notes.find(function(n) { return n.id === btn.dataset.id; });
      var name = note ? (note.title || 'Untitled') : 'this note';
      confirmAction('Delete note "' + name + '"?', function() {
        state.notes = state.notes.filter(function(n) { return n.id !== btn.dataset.id; });
        save();
        renderNotes();
        toast('Note deleted', 'info');
      });
    });
  });
}

// ========================================
// Focus Mode
// ========================================
function enterFocus() {
  el('focus-enter').style.display = 'none';
  el('focus-active').style.display = 'block';

  var active = state.tasks.filter(function(t) { return !t.completed; });
  el('focus-count').textContent = active.length + ' tasks remaining';

  el('focus-list').innerHTML = active.map(function(t) {
    return '<li><input type="checkbox" class="task-cb" data-id="' + t.id + '"><span style="flex:1">' + esc(t.title) + '</span></li>';
  }).join('');

  el('focus-list').querySelectorAll('.task-cb').forEach(function(cb) {
    cb.addEventListener('change', function() {
      toggleTask(cb.dataset.id);
      enterFocus();
    });
  });

  toast('Focus mode activated', 'info');
}

function exitFocus() {
  el('focus-enter').style.display = 'inline-block';
  el('focus-active').style.display = 'none';
}

// ========================================
// Achievements
// ========================================
function renderAchievements() {
  el('achieve-grid').innerHTML = ACHIEVEMENTS.map(function(a) {
    var unlocked = a.check(state);
    return '<div class="achieve-card ' + (unlocked ? 'unlocked' : 'locked') + '">' +
      '<div class="achieve-icon">' + a.icon + '</div>' +
      '<h4>' + a.name + '</h4>' +
      '<p>' + a.desc + '</p>' +
    '</div>';
  }).join('');
}

// ========================================
// Theme
// ========================================
function setTheme(name) {
  state.theme = name;
  document.documentElement.setAttribute('data-theme', name);
  save();

  $$('.theme-card').forEach(function(card) {
    card.classList.toggle('active', card.dataset.theme === name);
  });
}

// ========================================
// Clock
// ========================================
function updateClock() {
  var now = new Date();
  var timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  var dateStr = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  var clock = el('sidebar-clock');
  if (clock) clock.textContent = timeStr;

  var date = el('topbar-date');
  if (date) date.textContent = dateStr;
}

// ========================================
// Quotes
// ========================================
function nextQuote() {
  var q = QUOTES[state.quoteIdx % QUOTES.length];
  el('quote-text').textContent = q.t;
  el('quote-author').textContent = '\u2014 ' + q.a;
  state.quoteIdx++;
}

// ========================================
// Export / Import
// ========================================
function exportData() {
  var data = {
    tasks: state.tasks,
    habits: state.habits,
    goals: state.goals,
    notes: state.notes,
    completedCount: state.completedCount,
    streak: state.streak,
    pomoSessions: state.pomo.sessions,
    pomoFocusMin: state.pomo.focusMin,
    pomoShortMin: state.pomo.shortMin,
    pomoLongMin: state.pomo.longMin,
    activityLog: state.activityLog,
    theme: state.theme,
    exportedAt: new Date().toISOString()
  };
  var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = 'sfadhul-workspace-' + today() + '.json';
  a.click();
  URL.revokeObjectURL(url);
  toast('Data exported!', 'ok');
}

function importData(file) {
  var reader = new FileReader();
  reader.onload = function(e) {
    try {
      var d = JSON.parse(e.target.result);
      if (!d || typeof d !== 'object') { toast('Invalid file', 'err'); return; }

      if (Array.isArray(d.tasks)) state.tasks = d.tasks;
      if (Array.isArray(d.habits)) state.habits = d.habits;
      if (Array.isArray(d.goals)) state.goals = d.goals;
      if (Array.isArray(d.notes)) state.notes = d.notes;
      if (typeof d.completedCount === 'number') state.completedCount = d.completedCount;
      if (typeof d.streak === 'number') state.streak = d.streak;
      if (typeof d.pomoFocusMin === 'number') state.pomo.focusMin = d.pomoFocusMin;
      if (typeof d.pomoShortMin === 'number') state.pomo.shortMin = d.pomoShortMin;
      if (typeof d.pomoLongMin === 'number') state.pomo.longMin = d.pomoLongMin;
      if (Array.isArray(d.activityLog)) state.activityLog = d.activityLog;

      // Update settings inputs
      el('set-focus').value = state.pomo.focusMin;
      el('set-short').value = state.pomo.shortMin;
      el('set-long').value = state.pomo.longMin;

      save();
      renderTasks();
      updateDashboard();
      renderHabits();
      renderGoals();
      renderNotes();
      renderAchievements();
      renderKanban();
      toast('Data imported!', 'ok');
    } catch (err) {
      toast('Invalid file format', 'err');
    }
  };
  reader.readAsText(file);
}

// ========================================
// Command Palette
// ========================================
var cmdMatches = [];
var cmdIdx = -1;

function openCmd() {
  el('cmd-overlay').classList.add('active');
  el('cmd-input').value = '';
  el('cmd-results').innerHTML = '';
  cmdMatches = [];
  cmdIdx = -1;
  setTimeout(function() { el('cmd-input').focus(); }, 100);
}

function closeCmd() {
  el('cmd-overlay').classList.remove('active');
  cmdMatches = [];
  cmdIdx = -1;
}

function highlightCmdItem() {
  var items = el('cmd-results').querySelectorAll('.cmd-item');
  items.forEach(function(item, i) {
    item.classList.toggle('cmd-active', i === cmdIdx);
  });
  if (cmdIdx >= 0 && items[cmdIdx]) {
    items[cmdIdx].scrollIntoView({ block: 'nearest' });
  }
}

function selectCmdItem() {
  if (cmdIdx >= 0 && cmdMatches[cmdIdx]) {
    closeCmd();
    cmdMatches[cmdIdx].action();
  }
}

function runCommand(val) {
  var v = val.toLowerCase().trim();
  if (!v) { el('cmd-results').innerHTML = ''; cmdMatches = []; cmdIdx = -1; return; }

  var commands = [
    { name: 'Go to Dashboard', action: function() { openView('dashboard'); } },
    { name: 'Go to Tasks', action: function() { openView('tasks'); } },
    { name: 'Go to Calendar', action: function() { openView('calendar'); } },
    { name: 'Go to Kanban', action: function() { openView('kanban'); } },
    { name: 'Go to Habits', action: function() { openView('habits'); } },
    { name: 'Go to Pomodoro', action: function() { openView('pomodoro'); } },
    { name: 'Go to Goals', action: function() { openView('goals'); } },
    { name: 'Go to Notes', action: function() { openView('notes'); } },
    { name: 'Go to Focus', action: function() { openView('focus'); } },
    { name: 'Go to Achievements', action: function() { openView('achievements'); } },
    { name: 'Go to Settings', action: function() { openView('settings'); } },
    { name: 'Add Task', action: function() { openView('tasks'); setTimeout(function() { el('task-input').focus(); }, 100); } },
    { name: 'Toggle Theme', action: function() { setTheme(state.theme === 'dark' ? 'light' : 'dark'); } },
    { name: 'Export Data', action: function() { exportData(); } },
    { name: 'Start Pomodoro', action: function() { openView('pomodoro'); startPomodoro(); } },
    { name: 'Enter Focus Mode', action: function() { openView('focus'); setTimeout(enterFocus, 200); } },
    { name: 'Reset All Data', action: function() { confirmAction('Reset ALL data?', function() { localStorage.removeItem(STORAGE_KEY); location.reload(); }); } }
  ];

  cmdMatches = commands.filter(function(cmd) {
    return cmd.name.toLowerCase().includes(v);
  });

  cmdIdx = cmdMatches.length > 0 ? 0 : -1;

  el('cmd-results').innerHTML = cmdMatches.map(function(cmd, i) {
    return '<div class="cmd-item' + (i === 0 ? ' cmd-active' : '') + '" data-idx="' + i + '">' + esc(cmd.name) + '</div>';
  }).join('');

  el('cmd-results').querySelectorAll('.cmd-item').forEach(function(item) {
    item.addEventListener('click', function() {
      var idx = parseInt(item.dataset.idx);
      if (cmdMatches[idx]) {
        closeCmd();
        cmdMatches[idx].action();
      }
    });
  });
}

// ========================================
// Confirm Modal
// ========================================
function confirmAction(msg, cb) {
  el('confirm-text').textContent = msg;
  state.confirmCb = cb;
  el('modal-confirm').classList.add('active');
}

// ========================================
// Event Listeners
// ========================================
function bindEvents() {
  // Sidebar navigation
  $$('.nav-btn').forEach(function(btn) {
    btn.addEventListener('click', function() { openView(btn.dataset.view); });
  });

  // Mobile menu
  el('menu-btn').addEventListener('click', function() {
    el('sidebar').classList.add('open');
  });

  el('sidebar-close').addEventListener('click', function() {
    el('sidebar').classList.remove('open');
  });

  // Close sidebar on outside click (mobile)
  document.addEventListener('click', function(e) {
    var sidebar = el('sidebar');
    if (window.innerWidth <= 768 && sidebar.classList.contains('open') && !sidebar.contains(e.target) && e.target !== el('menu-btn')) {
      sidebar.classList.remove('open');
    }
  });

  // Theme toggle
  el('theme-toggle').addEventListener('click', function() {
    setTheme(state.theme === 'dark' ? 'light' : 'dark');
  });

  el('theme-grid').addEventListener('click', function(e) {
    var card = e.target.closest('.theme-card');
    if (card) setTheme(card.dataset.theme);
  });

  // Task form
  el('task-form').addEventListener('submit', function(e) {
    e.preventDefault();
    addTask(el('task-input').value, el('task-priority').value, el('task-category').value, el('task-date').value, el('task-recurring').value);
    el('task-input').value = '';
  });

  // Task list clicks
  el('task-list').addEventListener('click', function(e) {
    var item = e.target.closest('.task-item');
    if (!item) return;
    var id = item.dataset.id;

    // Checkbox
    if (e.target.classList.contains('task-cb')) {
      toggleTask(id);
      return;
    }

    // Action buttons
    var action = e.target.closest('[data-action]');
    if (action) {
      if (action.dataset.action === 'edit') openEditTask(id);
      if (action.dataset.action === 'delete') deleteTask(id);
    }
  });

  // Task search (debounced)
  el('task-search').addEventListener('input', debounce(function() {
    state.search = el('task-search').value;
    renderTasks();
  }, 200));

  // Task sort
  el('task-sort').addEventListener('change', function() {
    state.sort = el('task-sort').value;
    renderTasks();
  });

  // Task filters
  el('filter-row').addEventListener('click', function(e) {
    var btn = e.target.closest('.filter-btn');
    if (!btn) return;
    $$('.filter-btn').forEach(function(b) { b.classList.remove('active'); });
    btn.classList.add('active');
    state.filter = btn.dataset.filter;
    renderTasks();
  });

  // Clear completed
  el('clear-done-btn').addEventListener('click', clearCompleted);

  // Clear all
  el('clear-all-btn').addEventListener('click', function() {
    confirmAction('Delete ALL tasks?', function() {
      state.tasks = [];
      state.completedCount = 0;
      save();
      renderTasks();
      updateDashboard();
      renderKanban();
      toast('All tasks deleted', 'info');
    });
  });

  // Export / Import
  el('export-btn').addEventListener('click', exportData);
  el('import-input').addEventListener('change', function(e) {
    if (e.target.files[0]) importData(e.target.files[0]);
  });

  // Edit form
  el('edit-form').addEventListener('submit', function(e) {
    e.preventDefault();
    saveEditTask({
      title: el('edit-text').value,
      priority: el('edit-priority').value,
      category: el('edit-category').value,
      dueDate: el('edit-date').value,
      status: el('edit-status').value,
      recurring: el('edit-recurring').value
    });
  });

  el('edit-cancel').addEventListener('click', function() {
    el('modal-edit').classList.remove('active');
    state.editId = null;
  });

  el('modal-edit-close').addEventListener('click', function() {
    el('modal-edit').classList.remove('active');
    state.editId = null;
  });

  // Confirm modal
  el('confirm-yes').addEventListener('click', function() {
    el('modal-confirm').classList.remove('active');
    if (state.confirmCb) state.confirmCb();
    state.confirmCb = null;
  });

  el('confirm-cancel').addEventListener('click', function() {
    el('modal-confirm').classList.remove('active');
    state.confirmCb = null;
  });

  el('modal-confirm-close').addEventListener('click', function() {
    el('modal-confirm').classList.remove('active');
    state.confirmCb = null;
  });

  // Close modals on overlay click
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal-overlay')) {
      e.target.classList.remove('active');
      state.editId = null;
      state.confirmCb = null;
    }
  });

  // Calendar
  el('cal-prev').addEventListener('click', function() {
    state.calMonth--;
    if (state.calMonth < 0) { state.calMonth = 11; state.calYear--; }
    renderCalendar();
  });

  el('cal-next').addEventListener('click', function() {
    state.calMonth++;
    if (state.calMonth > 11) { state.calMonth = 0; state.calYear++; }
    renderCalendar();
  });

  el('cal-today').addEventListener('click', function() {
    var n = new Date();
    state.calYear = n.getFullYear();
    state.calMonth = n.getMonth();
    renderCalendar();
  });

  // Kanban drag and drop
  KANBAN_COLS.forEach(function(col) {
    var list = el('kl-' + col);
    if (!list) return;

    list.addEventListener('dragover', function(e) {
      e.preventDefault();
      list.classList.add('drag-over');
    });

    list.addEventListener('dragleave', function() {
      list.classList.remove('drag-over');
    });

    list.addEventListener('drop', function(e) {
      e.preventDefault();
      list.classList.remove('drag-over');
      var id = e.dataTransfer.getData('text/plain');
      var task = state.tasks.find(function(t) { return t.id === id; });
      if (!task) return;

      var wasCompleted = task.completed;
      if (col === 'done') {
        task.completed = true;
        task.status = 'done';
        if (!wasCompleted) state.completedCount++;
      } else {
        task.status = col;
        task.completed = false;
        if (wasCompleted) state.completedCount = Math.max(0, state.completedCount - 1);
      }

      save();
      renderKanban();
      renderTasks();
      updateDashboard();
    });
  });

  // Habits
  el('habit-add-btn').addEventListener('click', function() {
    el('habit-form-wrap').style.display = el('habit-form-wrap').style.display === 'none' ? 'block' : 'none';
  });

  el('habit-save').addEventListener('click', function() {
    var name = el('habit-input').value.trim();
    if (!name) return;
    state.habits.push({ id: uid(), name: name, days: [], createdAt: new Date().toISOString() });
    save();
    renderHabits();
    el('habit-input').value = '';
    el('habit-form-wrap').style.display = 'none';
    toast('Habit created!', 'ok');
    logActivity('Created habit: ' + name);
  });

  el('habit-cancel').addEventListener('click', function() {
    el('habit-form-wrap').style.display = 'none';
    el('habit-input').value = '';
  });

  // Pomodoro
  $$('.pomo-mode').forEach(function(btn) {
    btn.addEventListener('click', function() { setPomodoroMode(btn.dataset.mode); });
  });

  el('pomo-start').addEventListener('click', startPomodoro);
  el('pomo-pause').addEventListener('click', pausePomodoro);
  el('pomo-reset').addEventListener('click', resetPomodoro);

  // Goals
  el('goal-add-btn').addEventListener('click', function() {
    el('goal-form-wrap').style.display = el('goal-form-wrap').style.display === 'none' ? 'block' : 'none';
  });

  el('goal-save').addEventListener('click', function() {
    var name = el('goal-input').value.trim();
    if (!name) return;
    var progress = parseInt(el('goal-progress').value) || 0;
    progress = Math.max(0, Math.min(100, progress));
    state.goals.push({
      id: uid(),
      name: name,
      progress: progress,
      dueDate: el('goal-date').value || '',
      createdAt: new Date().toISOString()
    });
    save();
    renderGoals();
    el('goal-input').value = '';
    el('goal-progress').value = '0';
    el('goal-date').value = '';
    el('goal-form-wrap').style.display = 'none';
    toast('Goal created!', 'ok');
  });

  el('goal-cancel').addEventListener('click', function() {
    el('goal-form-wrap').style.display = 'none';
    el('goal-input').value = '';
  });

  // Notes
  el('note-form').addEventListener('submit', function(e) {
    e.preventDefault();
    var title = el('note-title').value.trim();
    var body = el('note-body').value.trim();
    if (!title && !body) return;
    state.notes.push({ id: uid(), title: title || 'Untitled', body: body, createdAt: new Date().toISOString() });
    save();
    renderNotes();
    el('note-title').value = '';
    el('note-body').value = '';
    toast('Note added!', 'ok');
  });

  // Focus
  el('focus-enter').addEventListener('click', enterFocus);
  el('focus-exit').addEventListener('click', exitFocus);

  // FAB
  el('fab-btn').addEventListener('click', function() {
    el('fab-btn').classList.toggle('open');
    el('fab-menu').classList.toggle('open');
  });

  $$('.fab-item').forEach(function(item) {
    item.addEventListener('click', function() {
      el('fab-btn').classList.remove('open');
      el('fab-menu').classList.remove('open');
      var action = item.dataset.fab;
      if (action === 'task') { openView('tasks'); setTimeout(function() { el('task-input').focus(); }, 100); }
      if (action === 'note') { openView('notes'); setTimeout(function() { el('note-title').focus(); }, 100); }
      if (action === 'pomo') { openView('pomodoro'); }
    });
  });

  // Close FAB menu on outside click
  document.addEventListener('click', function(e) {
    if (!e.target.closest('#fab-wrap') && el('fab-menu').classList.contains('open')) {
      el('fab-btn').classList.remove('open');
      el('fab-menu').classList.remove('open');
    }
  });

  // Command palette
  el('cmd-trigger').addEventListener('click', openCmd);

  el('cmd-input').addEventListener('input', function() {
    runCommand(el('cmd-input').value);
  });

  el('cmd-input').addEventListener('keydown', function(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (cmdMatches.length > 0) {
        cmdIdx = (cmdIdx + 1) % cmdMatches.length;
        highlightCmdItem();
      }
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (cmdMatches.length > 0) {
        cmdIdx = (cmdIdx - 1 + cmdMatches.length) % cmdMatches.length;
        highlightCmdItem();
      }
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      if (cmdIdx >= 0 && cmdMatches[cmdIdx]) {
        selectCmdItem();
      } else if (el('cmd-input').value.trim()) {
        var v = el('cmd-input').value.toLowerCase().trim();
        if (v.startsWith('add ')) {
          var text = v.slice(4).trim();
          if (text) {
            addTask(text, 'medium', 'Work', '', '');
            closeCmd();
            return;
          }
        }
        runCommand(el('cmd-input').value);
      }
      return;
    }
    if (e.key === 'Escape') {
      closeCmd();
      return;
    }
  });

  el('cmd-overlay').addEventListener('click', function(e) {
    if (e.target === el('cmd-overlay')) closeCmd();
  });

  // Settings
  el('settings-export').addEventListener('click', exportData);

  el('settings-import').addEventListener('change', function(e) {
    if (e.target.files[0]) importData(e.target.files[0]);
  });

  el('settings-reset').addEventListener('click', function() {
    confirmAction('Reset ALL data? This cannot be undone.', function() {
      localStorage.removeItem(STORAGE_KEY);
      location.reload();
    });
  });

  el('set-focus').addEventListener('change', function() {
    state.pomo.focusMin = Math.max(1, parseInt(el('set-focus').value) || 25);
    save();
    if (state.pomo.mode === 'focus') setPomodoroMode('focus');
  });

  el('set-short').addEventListener('change', function() {
    state.pomo.shortMin = Math.max(1, parseInt(el('set-short').value) || 5);
    save();
    if (state.pomo.mode === 'short') setPomodoroMode('short');
  });

  el('set-long').addEventListener('change', function() {
    state.pomo.longMin = Math.max(1, parseInt(el('set-long').value) || 15);
    save();
    if (state.pomo.mode === 'long') setPomodoroMode('long');
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', function(e) {
    // Ctrl+K or Cmd+K for command palette
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      if (el('cmd-overlay').classList.contains('active')) closeCmd();
      else openCmd();
      return;
    }

    if (e.key === 'Escape') {
      if (el('cmd-overlay').classList.contains('active')) { closeCmd(); return; }
      if (el('modal-edit').classList.contains('active')) { el('modal-edit').classList.remove('active'); state.editId = null; return; }
      if (el('modal-confirm').classList.contains('active')) { el('modal-confirm').classList.remove('active'); state.confirmCb = null; return; }
      if (el('fab-menu').classList.contains('open')) { el('fab-btn').classList.remove('open'); el('fab-menu').classList.remove('open'); return; }
      if (el('sidebar').classList.contains('open')) { el('sidebar').classList.remove('open'); return; }
    }
  });
}

// ========================================
// Initialization
// ========================================
function init() {
  load();

  // Set date
  el('task-date').value = today();

  // Set calendar to current month
  var now = new Date();
  state.calYear = now.getFullYear();
  state.calMonth = now.getMonth();

  // Apply theme
  setTheme(state.theme);

  // Settings inputs
  el('set-focus').value = state.pomo.focusMin;
  el('set-short').value = state.pomo.shortMin;
  el('set-long').value = state.pomo.longMin;

  // Init pomodoro
  setPomodoroMode('focus');
  updatePomodoroStats();

  // Render everything
  renderTasks();
  updateDashboard();
  renderTimeline();
  nextQuote();
  updateClock();

  // Bind all events
  bindEvents();

  // Start clock
  setInterval(updateClock, 1000);
  setInterval(nextQuote, 30000);
}

document.addEventListener('DOMContentLoaded', init);
