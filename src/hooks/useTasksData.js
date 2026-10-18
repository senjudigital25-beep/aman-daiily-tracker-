import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { todayStrIST, lastNDayKeys, startOfWeekKey, addDays } from '@/lib/dateUtils';

const DEFAULT_OUTREACH_TARGET = 10;
const PAGE_SIZE = 500;
const RELOAD_DEBOUNCE_MS = 400;

// In-memory cache so switching tabs or dates is instant. Scoped to a user id
// and wiped on logout, so one account can never see another's data.
const cache = { userId: null, tasks: null, outreach: null };

export function clearTasksCache() {
  cache.userId = null;
  cache.tasks = null;
  cache.outreach = null;
}

export function useTasksData() {
  const { user } = useAuth();
  const userId = user?.id || '';

  const cached = cache.userId === userId && userId ? cache : null;

  const [tasks, setTasks] = useState(() => cached?.tasks || []);
  const [outreach, setOutreach] = useState(() => cached?.outreach || []);
  const [loading, setLoading] = useState(() => !cached);
  const [error, setError] = useState('');

  const reloadTimer = useRef(null);
  const dirty = useRef(false);

  const refresh = useCallback(async (silent = false) => {
    if (!userId) return;
    if (!silent) setLoading(true);
    try {
      // Both tables load together in one pass — never one request per widget —
      // and every query is scoped to the signed-in user.
      const [taskPage, outreachPage] = await Promise.all([
        base44.entities.Task.filter(
          { created_by_id: userId },
          { sort: '-created_date', limit: PAGE_SIZE }
        ),
        base44.entities.DailyOutreach.filter(
          { created_by_id: userId },
          { sort: '-created_date', limit: PAGE_SIZE }
        ),
      ]);
      const nextTasks = taskPage.items || [];
      const nextOutreach = outreachPage.items || [];
      cache.userId = userId;
      cache.tasks = nextTasks;
      cache.outreach = nextOutreach;
      setTasks(nextTasks);
      setOutreach(nextOutreach);
      setError('');
    } catch {
      if (!silent) setError('We could not load your dashboard.');
    } finally {
      if (!silent) setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Realtime updates refetch through the server filter, so another account's
  // records can never arrive here. Skipped while the tab is hidden.
  useEffect(() => {
    if (!userId) return undefined;

    const scheduleReload = () => {
      if (document.hidden) {
        dirty.current = true;
        return;
      }
      if (reloadTimer.current) clearTimeout(reloadTimer.current);
      reloadTimer.current = setTimeout(() => refresh(true), RELOAD_DEBOUNCE_MS);
    };

    const onVisibility = () => {
      if (!document.hidden && dirty.current) {
        dirty.current = false;
        refresh(true);
      }
    };

    const unsubTasks = base44.entities.Task.subscribe(scheduleReload);
    const unsubOutreach = base44.entities.DailyOutreach.subscribe(scheduleReload);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      if (reloadTimer.current) clearTimeout(reloadTimer.current);
      document.removeEventListener('visibilitychange', onVisibility);
      unsubTasks?.();
      unsubOutreach?.();
    };
  }, [userId, refresh]);

  const addTask = useCallback(async ({ title, date, category, time }) => {
    const created = await base44.entities.Task.create({
      title: String(title || '').trim(),
      date,
      category,
      time: time || '',
      completed: false,
      userId
    });
    if (cache.userId === userId && cache.tasks) cache.tasks = [created, ...cache.tasks];
    return created;
  }, [userId]);

  const toggleTask = useCallback(async (task) => {
    const updated = await base44.entities.Task.update(task.id, { completed: !task.completed });
    if (cache.userId === userId && cache.tasks) {
      cache.tasks = cache.tasks.map((t) => (t.id === task.id ? { ...t, completed: !task.completed } : t));
    }
    return updated;
  }, [userId]);

  const deleteTask = useCallback(async (id) => {
    const result = await base44.entities.Task.delete(id);
    if (cache.userId === userId && cache.tasks) {
      cache.tasks = cache.tasks.filter((t) => t.id !== id);
    }
    return result;
  }, [userId]);

  const outreachForDate = useCallback((date) => {
    const rec = outreach.find((r) => r.date === date);
    return {
      count: rec ? rec.count : 0,
      target: rec ? rec.target : DEFAULT_OUTREACH_TARGET,
      recordId: rec ? rec.id : null
    };
  }, [outreach]);

  const setOutreachCount = useCallback(async (date, count) => {
    const existing = outreach.find((r) => r.date === date);
    const safe = Math.max(0, Math.min(999, Number(count) || 0));
    if (existing) {
      await base44.entities.DailyOutreach.update(existing.id, { count: safe });
    } else {
      await base44.entities.DailyOutreach.create({
        date, count: safe, target: DEFAULT_OUTREACH_TARGET, userId
      });
    }
  }, [outreach, userId]);

  const setOutreachTarget = useCallback(async (date, target) => {
    const existing = outreach.find((r) => r.date === date);
    const safe = Math.max(1, Math.min(999, Number(target) || 1));
    if (existing) {
      await base44.entities.DailyOutreach.update(existing.id, { target: safe });
    } else {
      await base44.entities.DailyOutreach.create({ date, count: 0, target: safe, userId });
    }
  }, [outreach, userId]);

  // ---- Derived stats ----
  const stats = useMemo(() => {
    const today = todayStrIST();
    const todays = tasks.filter((t) => t.date === today);
    const todaysDone = todays.filter((t) => t.completed).length;
    const todaysTotal = todays.length;

    const completedDates = new Set();
    tasks.forEach((t) => { if (t.completed) completedDates.add(t.date); });

    // current streak: consecutive days ending today (or yesterday if today is
    // not done yet) with at least one completed task.
    let streak = 0;
    let cursor = today;
    if (!completedDates.has(today)) {
      cursor = addDays(today, -1);
    }
    while (completedDates.has(cursor)) {
      streak += 1;
      cursor = addDays(cursor, -1);
    }

    // weekly consistency: days this week with >=1 completed / days elapsed
    const weekStart = startOfWeekKey(today);
    const elapsed = [];
    let c = weekStart;
    while (c <= today) {
      elapsed.push(c);
      c = addDays(c, 1);
    }
    const weekDaysWithTasks = elapsed.filter((d) => completedDates.has(d)).length;
    const weeklyPct = elapsed.length > 0 ? Math.round((weekDaysWithTasks / elapsed.length) * 100) : 0;

    const last14 = lastNDayKeys(today, 14).map((d) => ({
      date: d,
      count: tasks.filter((t) => t.date === d && t.completed).length
    }));

    const datesWithTasks = new Set(tasks.map((t) => t.date));

    return {
      today,
      todaysDone,
      todaysTotal,
      streak,
      weeklyPct,
      last14,
      datesWithTasks,
      completedDates
    };
  }, [tasks]);

  return {
    tasks, loading, error,
    refresh,
    addTask, toggleTask, deleteTask,
    outreachForDate, setOutreachCount, setOutreachTarget,
    stats
  };
}