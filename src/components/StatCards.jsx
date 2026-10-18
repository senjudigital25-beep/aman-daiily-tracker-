import React, { useEffect, useRef, useState } from 'react';
import { TrendingUp, CheckCircle2 } from 'lucide-react';
import { useTheme } from '@/lib/theme';
import { StreakIcon, OutreachIcon, ForestOutreach } from '@/components/StatCardIcons';

function Ring({ pct }) {
  const r = 26;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  return (
    <svg viewBox="0 0 64 64" className="-rotate-90 w-11 h-11 sm:w-16 sm:h-16">
      <circle
        cx="32"
        cy="32"
        r={r}
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.22"
        strokeWidth="6"
      />
      <circle
        cx="32"
        cy="32"
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 0.6s ease' }}
      />
    </svg>
  );
}

// Shared shell so every card carries the same themed surface and text colours.
function Card({ tone, children }) {
  return (
    <div className={`${tone} relative overflow-hidden rounded-2xl p-3.5 sm:p-5 card-shadow slide-up text-card-ink`}>
      {children}
    </div>
  );
}

export default function StatCards({ stats, outreachForDate, setOutreachCount, setOutreachTarget }) {
  const { theme } = useTheme();
  const { todaysDone, todaysTotal, streak, weeklyPct, today } = stats;
  const todayOutreach = outreachForDate(today);

  const [streakPulse, setStreakPulse] = useState(false);
  const prevStreak = useRef(streak);
  useEffect(() => {
    if (streak > prevStreak.current) {
      setStreakPulse(true);
      const id = setTimeout(() => setStreakPulse(false), 800);
      return () => clearTimeout(id);
    }
    prevStreak.current = streak;
  }, [streak]);

  const taskPct = todaysTotal > 0 ? Math.round((todaysDone / todaysTotal) * 100) : 0;

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
      {/* Card 1 - Today's tasks */}
      <Card tone="bg-cat1">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-card-ink-soft">Today's Tasks</p>
            <div className="mt-1 font-heading font-bold text-2xl sm:text-4xl leading-none">
              {todaysDone}<span className="text-xl text-card-ink-soft">/{todaysTotal}</span>
            </div>
          </div>
          <div className="relative">
            <Ring pct={taskPct} />
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">{taskPct}%</span>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-1.5 text-sm text-card-ink-soft">
          <CheckCircle2 className="h-4 w-4" /> {todaysDone === todaysTotal && todaysTotal > 0 ? 'All done — nice!' : 'Keep going'}
        </div>
      </Card>

      {/* Card 2 - Streak */}
      <Card tone="bg-cat2">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-card-ink-soft">Current Streak</p>
            <div className={`mt-1 font-heading font-bold text-2xl sm:text-4xl leading-none ${streakPulse ? 'streak-pulse' : ''}`}>
              {streak} <span className="text-2xl">🔥</span>
            </div>
          </div>
          <div className="h-12 w-12 rounded-xl bg-black/5 dark:bg-white/10 flex items-center justify-center">
            <StreakIcon theme={theme} className="h-6 w-6" />
          </div>
        </div>
        <div className="mt-3 text-sm text-card-ink-soft">consecutive days hit</div>
      </Card>

      {/* Card 3 - Weekly consistency */}
      <Card tone="bg-cat3">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-card-ink-soft">Weekly Consistency</p>
            <div className="mt-1 font-heading font-bold text-2xl sm:text-4xl leading-none">{weeklyPct}%</div>
          </div>
          <div className="h-12 w-12 rounded-xl bg-black/5 dark:bg-white/10 flex items-center justify-center">
            <TrendingUp className="h-6 w-6 arrow-bounce" />
          </div>
        </div>
        <div className="mt-3 h-2 rounded-full bg-black/10 dark:bg-white/15 overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{ width: `${weeklyPct}%`, background: 'currentColor', transition: 'width 0.6s ease' }}
          />
        </div>
      </Card>

      {/* Card 4 - Outreach */}
      <Card tone="bg-cat4">
        {theme.key === 'forest' && <ForestOutreach />}

        <div className="relative flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-card-ink-soft">Outreach / Skool</p>
            <div className="mt-1 font-heading font-bold text-2xl sm:text-4xl leading-none">
              {todayOutreach.count}<span className="text-xl text-card-ink-soft">/{todayOutreach.target}</span>
            </div>
          </div>
          {theme.key !== 'forest' && (
            <div className="h-12 w-12 rounded-xl bg-black/5 dark:bg-white/10 flex items-center justify-center">
              <OutreachIcon theme={theme} className="h-6 w-6" />
            </div>
          )}
        </div>

        <div className="relative mt-3 flex flex-wrap items-center gap-2">
          <button
            onClick={() => setOutreachCount(today, todayOutreach.count - 1)}
            className="h-10 w-10 sm:h-8 sm:w-8 rounded-lg bg-black/10 dark:bg-white/15 hover:bg-black/20 dark:hover:bg-white/25 font-bold text-lg leading-none flex items-center justify-center transition-colors"
            aria-label="Decrease outreach"
          >−</button>
          <input
            type="number"
            value={todayOutreach.count}
            min={0}
            onChange={(e) => setOutreachCount(today, e.target.value)}
            className="w-10 sm:w-14 bg-transparent text-center font-bold text-lg outline-none border-b border-black/10 dark:border-white/20 focus:border-black/40 dark:focus:border-white/50"
          />
          <button
            onClick={() => setOutreachCount(today, todayOutreach.count + 1)}
            className="h-10 w-10 sm:h-8 sm:w-8 rounded-lg bg-black/10 dark:bg-white/15 hover:bg-black/20 dark:hover:bg-white/25 font-bold text-lg leading-none flex items-center justify-center transition-colors"
            aria-label="Increase outreach"
          >+</button>
          <button
            onClick={() => {
              const v = prompt('Set daily outreach target', todayOutreach.target);
              if (v != null && !isNaN(v)) setOutreachTarget(today, v);
            }}
            className="ml-auto text-xs text-card-ink-soft underline underline-offset-2 hover:opacity-80"
          >edit goal</button>
        </div>
      </Card>
    </div>
  );
}