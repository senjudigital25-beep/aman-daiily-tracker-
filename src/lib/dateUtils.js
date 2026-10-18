// All "today" references use IST (Asia/Kolkata) per spec.

const IST_TZ = 'Asia/Kolkata';

export function istNow() {
  // Returns a Date adjusted to IST wall-clock for greeting/date logic.
  const now = new Date();
  // Convert to IST parts
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: IST_TZ,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false, weekday: 'long'
  }).formatToParts(now);
  const get = (t) => parts.find(p => p.type === t)?.value;
  const y = get('year'), m = get('month'), d = get('day');
  const hour = get('hour') === '24' ? '00' : get('hour');
  return {
    dateStr: `${y}-${m}-${d}`,
    hour: parseInt(hour, 10),
    minute: parseInt(get('minute'), 10),
    second: parseInt(get('second'), 10),
    weekday: get('weekday'),
    jsDate: new Date(`${y}-${m}-${d}T${hour}:${get('minute')}:${get('second')}`)
  };
}

export function todayStrIST() {
  return istNow().dateStr;
}

// The greeting follows the viewer's own clock (the app is multi-user); task
// dates stay on IST, which the tracker's day boundaries are built on.
export function getGreeting(name) {
  const who = String(name || "").trim() || "there";
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return `Good morning, ${who} ☀️`;
  if (hour >= 12 && hour < 17) return `Good afternoon, ${who}`;
  if (hour >= 17 && hour < 21) return `Good evening, ${who} 🌆`;
  return `Still grinding, ${who}? 🌙`;
}

export function formatClock() {
  const { hour, minute, second } = istNow();
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(hour)}:${pad(minute)}:${pad(second)}`;
}

export function formatFullDate() {
  const now = new Date();
  return new Intl.DateTimeFormat('en-US', {
    timeZone: IST_TZ,
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  }).format(now);
}

export function dateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseDateKey(key) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function isSameDay(keyA, keyB) {
  return keyA === keyB;
}

export function addDays(key, n) {
  const d = parseDateKey(key);
  d.setDate(d.getDate() + n);
  return dateKey(d);
}

// Monday-based week start
export function startOfWeekKey(key) {
  const d = parseDateKey(key);
  const day = d.getDay(); // 0 Sun .. 6 Sat
  const diff = day === 0 ? 6 : day - 1;
  d.setDate(d.getDate() - diff);
  return dateKey(d);
}

export function daysElapsedThisWeek(key) {
  const start = parseDateKey(startOfWeekKey(key));
  const today = parseDateKey(key);
  const diffMs = today.setHours(0,0,0,0) - start.setHours(0,0,0,0);
  return Math.floor(diffMs / 86400000) + 1; // includes today
}

export function lastNDayKeys(key, n) {
  const keys = [];
  for (let i = n - 1; i >= 0; i--) {
    keys.push(addDays(key, -i));
  }
  return keys;
}

export function shortLabel(key) {
  const d = parseDateKey(key);
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(d);
}

export function weekdayLabel(key) {
  const d = parseDateKey(key);
  return new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(d);
}