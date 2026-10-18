import React, { useState } from 'react';
import { Plus, X, Clock, Trash2, Check } from 'lucide-react';
import { CATEGORIES, CATEGORY_ORDER } from '@/lib/categories';
import { shortLabel } from '@/lib/dateUtils';

export default function TaskSection({ tasks, selectedDate, onAdd, onToggle, onDelete }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('outreach');
  const [time, setTime] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const dayTasks = tasks.filter((t) => t.date === selectedDate);
  const active = dayTasks.filter((t) => !t.completed);
  const done = dayTasks.filter((t) => t.completed);

  const reset = () => { setTitle(''); setCategory('outreach'); setTime(''); };

  const submit = async (e) => {
    e.preventDefault();
    if (!title.trim() || submitting) return;
    setSubmitting(true);
    try {
      await onAdd({ title, date: selectedDate, category, time });
      reset();
      setOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-surface rounded-2xl border border-surface card-shadow p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div>
          <h2 className="font-heading font-bold text-pri text-lg sm:text-xl">
            Tasks <span className="text-sec font-medium text-sm">· {shortLabel(selectedDate)}</span>
          </h2>
          <p className="text-sec text-xs mt-0.5">{active.length} pending · {done.length} done</p>
        </div>
        <button
          onClick={() => setOpen((o) => !o)}
          className="inline-flex items-center gap-2 bg-accent text-white rounded-full px-4 py-2 text-sm font-semibold hover:opacity-90 transition-opacity card-shadow"
        >
          <Plus className="h-4 w-4" /> Create Task
        </button>
      </div>

      {open && (
        <form onSubmit={submit} className="mb-4 p-4 rounded-2xl border border-surface bg-app slide-up">
          <div className="flex flex-col gap-3">
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What do you want to get done?"
              className="w-full bg-surface border border-surface rounded-xl px-4 py-2.5 text-pri outline-none focus:ring-2 focus:ring-appAccent"
            />
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="bg-surface border border-surface rounded-xl px-3 py-2.5 text-pri text-sm outline-none focus:ring-2 focus:ring-appAccent"
              >
                {CATEGORY_ORDER.map((c) => (
                  <option key={c} value={c}>{CATEGORIES[c].label}</option>
                ))}
              </select>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="bg-surface border border-surface rounded-xl px-3 py-2.5 text-pri text-sm outline-none focus:ring-2 focus:ring-appAccent"
              />
              <div className="flex gap-2 ml-auto">
                <button type="button" onClick={() => { setOpen(false); reset(); }} className="rounded-xl px-4 py-2.5 text-sm font-medium text-sec hover:bg-surface border border-surface">
                  Cancel
                </button>
                <button type="submit" disabled={submitting || !title.trim()} className="rounded-xl px-5 py-2.5 text-sm font-semibold bg-accent text-white hover:opacity-90 disabled:opacity-50">
                  {submitting ? 'Adding…' : 'Add'}
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {dayTasks.length === 0 && !open && (
        <div className="py-10 text-center">
          <div className="text-4xl mb-2">🗒️</div>
          <p className="text-sec text-sm">No tasks yet for this day. Create one to get rolling!</p>
        </div>
      )}

      <ul className="flex flex-col gap-2">
        {active.map((t) => (
          <TaskRow key={t.id} task={t} onToggle={onToggle} onDelete={onDelete} />
        ))}
      </ul>

      {done.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-px flex-1 bg-surface" />
            <span className="text-xs font-semibold text-sec uppercase tracking-wide">Completed</span>
            <div className="h-px flex-1 bg-surface" />
          </div>
          <ul className="flex flex-col gap-2">
            {done.map((t) => (
              <TaskRow key={t.id} task={t} onToggle={onToggle} onDelete={onDelete} />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function TaskRow({ task, onToggle, onDelete }) {
  const cat = CATEGORIES[task.category] || CATEGORIES.personal;
  return (
    <li
      className={`group flex items-center gap-3 rounded-xl bg-app border border-surface px-3 py-3 slide-up ${task.completed ? 'opacity-60' : ''}`}
      style={{ borderLeft: `4px solid var(--card-${task.category === 'outreach' ? 1 : task.category === 'skill' ? 2 : task.category === 'personal' ? 3 : 4})` }}
    >
      <button
        onClick={() => onToggle(task)}
        aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
        className={`h-6 w-6 shrink-0 rounded-md border-2 flex items-center justify-center transition-all ${
          task.completed ? 'bg-cat3 border-cat3 check-pop' : 'border-surface hover:border-appAccent'
        }`}
      >
        {task.completed && <Check className="h-4 w-4 text-pri" strokeWidth={3} />}
      </button>

      <span className={`flex-1 text-pri text-sm sm:text-base ${task.completed ? 'line-through' : ''}`}>
        {task.title}
      </span>

      {task.time && (
        <span className="hidden sm:flex items-center gap-1 text-xs text-sec">
          <Clock className="h-3.5 w-3.5" /> {task.time}
        </span>
      )}

      <span className={`text-xs font-medium px-2 py-1 rounded-full ${cat.dot} text-pri-soft`}>
        {cat.label}
      </span>

      <button
        onClick={() => onDelete(task.id)}
        aria-label="Delete task"
        className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity text-sec hover:text-red-500 p-1 shrink-0"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </li>
  );
}