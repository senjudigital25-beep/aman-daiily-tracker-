import React, { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/lib/theme';
import { getGreeting, formatClock, formatFullDate } from '@/lib/dateUtils';
import { useProfile } from '@/lib/ProfileContext';

export default function TopBar({ stats }) {
  const { mode, toggleTheme } = useTheme();
  const { displayName } = useProfile();
  const [clock, setClock] = useState(() => formatClock());
  const [dateStr, setDateStr] = useState(() => formatFullDate());
  const [greeting, setGreeting] = useState(() => getGreeting(displayName));

  useEffect(() => {
    setGreeting(getGreeting(displayName));
  }, [displayName]);

  // The clock only ticks while the tab is visible — no background work.
  useEffect(() => {
    let id = null;
    const tick = () => {
      setClock(formatClock());
      setDateStr(formatFullDate());
      setGreeting(getGreeting(displayName));
    };
    const start = () => {
      if (id) clearInterval(id);
      id = setInterval(tick, 1000);
    };
    const stop = () => {
      if (id) clearInterval(id);
      id = null;
    };
    const onVisibility = () => {
      if (document.hidden) stop();
      else { tick(); start(); }
    };

    if (!document.hidden) start();
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      stop();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [displayName]);

  const status = `${stats.todaysDone}/${stats.todaysTotal} tasks done today · 🔥 ${stats.streak}-day streak`;

  return (
    <header className="sticky top-0 z-30 bg-app-blur backdrop-blur-md border-b border-surface">
      <div className="px-4 sm:px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          <h1 className="font-heading text-xl sm:text-2xl font-bold text-pri leading-tight truncate">
            {greeting}
          </h1>
          <p className="text-sec text-sm mt-0.5 truncate">{status}</p>
        </div>

        <div className="flex items-center gap-3 sm:gap-5 ml-auto">
          <div className="text-right hidden sm:block">
            <div className="font-heading font-bold text-pri text-lg sm:text-xl tabular-nums tracking-tight">
              {clock}
            </div>
            <div className="text-sec text-xs">{dateStr}</div>
          </div>
          <div className="sm:hidden font-heading font-bold text-pri text-base tabular-nums">{clock}</div>

          <button
            onClick={toggleTheme}
            aria-label={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="h-11 w-11 rounded-full bg-surface border border-surface flex items-center justify-center card-shadow transition-colors hover:bg-appAccentSoft"
          >
            {mode === 'dark' ? (
              <Sun key="sun" className="h-5 w-5 text-pri theme-icon-in" />
            ) : (
              <Moon key="moon" className="h-5 w-5 text-pri theme-icon-in" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}