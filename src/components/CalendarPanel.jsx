import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { dateKey, parseDateKey, todayStrIST } from '@/lib/dateUtils';

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function CalendarPanel({ selectedDate, onSelectDate, datesWithTasks }) {
  const today = todayStrIST();
  const [viewMonth, setViewMonth] = useState(() => {
    const d = parseDateKey(selectedDate || today);
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();

  const firstDay = new Date(year, month, 1);
  let startWeekday = firstDay.getDay(); // 0 Sun
  startWeekday = startWeekday === 0 ? 6 : startWeekday - 1; // Monday-based
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

  const monthLabel = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(viewMonth);

  const goPrev = () => setViewMonth(new Date(year, month - 1, 1));
  const goNext = () => setViewMonth(new Date(year, month + 1, 1));

  return (
    <div className="bg-surface rounded-2xl border border-surface card-shadow p-4 sm:p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading font-bold text-pri text-base sm:text-lg">{monthLabel}</h3>
        <div className="flex items-center gap-1">
          <button onClick={goPrev} aria-label="Previous month" className="h-8 w-8 rounded-lg flex items-center justify-center text-sec hover:bg-appAccentSoft hover:text-pri transition-colors">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button onClick={goNext} aria-label="Next month" className="h-8 w-8 rounded-lg flex items-center justify-center text-sec hover:bg-appAccentSoft hover:text-pri transition-colors">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAYS.map((w, i) => (
          <div key={i} className="text-center text-xs font-medium text-sec py-1">{w}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (!d) return <div key={`e${i}`} />;
          const key = dateKey(d);
          const isToday = key === today;
          const isSelected = key === selectedDate;
          const hasTasks = datesWithTasks && datesWithTasks.has(key);
          const isFuture = key > today;
          return (
            <button
              key={key}
              onClick={() => onSelectDate(key)}
              className={`relative aspect-square rounded-xl text-sm font-medium transition-all flex items-center justify-center
                ${isSelected ? 'bg-accent text-on-accent card-shadow' : isFuture ? 'text-sec-soft hover:bg-appAccentSoft' : 'text-pri hover:bg-appAccentSoft'}
                ${isToday && !isSelected ? 'ring-2 ring-accent' : ''}
              `}
            >
              {d.getDate()}
              {hasTasks && (
                <span className={`absolute bottom-1 h-1.5 w-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-accent'}`} />
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-surface flex items-center gap-4 text-xs text-sec">
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-accent" /> has tasks</span>
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full ring-2 ring-accent" /> today</span>
      </div>
    </div>
  );
}