import React from 'react';
import { useOutletContext } from 'react-router-dom';
import ProgressGraph from '@/components/ProgressGraph';
import StatCards from '@/components/StatCards';
import { lastNDayKeys, todayStrIST, shortLabel, weekdayLabel } from '@/lib/dateUtils';
import { CATEGORIES, CATEGORY_ORDER } from '@/lib/categories';

export default function Progress() {
  const data = useOutletContext();
  const { stats, tasks, outreachForDate, setOutreachCount, setOutreachTarget } = data;

  // category breakdown (all time completed)
  const byCategory = CATEGORY_ORDER.map((c) => ({
    key: c,
    label: CATEGORIES[c].label,
    done: tasks.filter((t) => t.completed && t.category === c).length,
    total: tasks.filter((t) => t.category === c).length
  }));
  const maxCat = Math.max(1, ...byCategory.map((b) => b.total));

  // last 14 days table
  const last14 = lastNDayKeys(todayStrIST(), 14);
  const totalDone14 = last14.reduce((sum, d) => sum + (tasks.filter((t) => t.date === d && t.completed).length), 0);

  return (
    <div className="flex flex-col gap-4 lg:gap-6">
      <div>
        <h1 className="font-heading font-bold text-pri text-2xl">Progress & Stats</h1>
        <p className="text-sec text-sm mt-1">Your momentum at a glance.</p>
      </div>

      <StatCards
        stats={stats}
        outreachForDate={outreachForDate}
        setOutreachCount={setOutreachCount}
        setOutreachTarget={setOutreachTarget}
      />

      <ProgressGraph data={stats.last14} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Category breakdown */}
        <div className="bg-surface rounded-2xl border border-surface card-shadow p-5">
          <h2 className="font-heading font-bold text-pri text-lg mb-4">By Category</h2>
          <div className="flex flex-col gap-4">
            {byCategory.map((b) => (
              <div key={b.key}>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="flex items-center gap-2 text-pri font-medium">
                    <span className={`h-3 w-3 rounded-full bg-cat${b.key === 'outreach' ? 1 : b.key === 'skill' ? 2 : b.key === 'personal' ? 3 : 4}`} />
                    {b.label}
                  </span>
                  <span className="text-sec">{b.done}/{b.total} done</span>
                </div>
                <div className="h-2.5 rounded-full bg-app overflow-hidden">
                  <div
                    className="h-full rounded-full bg-appAccent"
                    style={{ width: `${b.total > 0 ? (b.done / b.total) * 100 : 0}%`, transition: 'width 0.6s ease' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Last 14 days table */}
        <div className="bg-surface rounded-2xl border border-surface card-shadow p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-bold text-pri text-lg">14-Day Log</h2>
            <span className="text-sm text-sec">{totalDone14} completed</span>
          </div>
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {last14.map((d) => {
              const count = tasks.filter((t) => t.date === d && t.completed).length;
              return (
                <div key={d} className="rounded-xl bg-app border border-surface p-1.5 sm:p-2 text-center">
                  <div className="text-[10px] text-sec">{weekdayLabel(d)}</div>
                  <div className="text-xs font-semibold text-pri">{shortLabel(d).split(' ')[1]}</div>
                  <div className="font-heading font-bold text-base sm:text-lg text-pri mt-0.5">{count}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}