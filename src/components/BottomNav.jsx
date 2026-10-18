import React from 'react';
import { NavLink } from 'react-router-dom';
import { NAV } from '@/components/Sidebar';

// Mobile-only navigation. Sits above the floating companion (which keeps a
// larger bottom inset on small screens). Every tap target is at least 56px tall.
export default function BottomNav() {
  return (
    <nav
      aria-label="Main"
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-surface border-t border-surface card-shadow"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-stretch px-1">
        {NAV.map(({ to, shortLabel, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-0.5 flex-1 min-h-[56px] min-w-[44px] py-1.5 rounded-xl text-[11px] font-medium transition-colors ${
                isActive ? 'text-accent-ink' : 'text-sec'
              }`
            }
          >
            <Icon className="h-5 w-5" />
            <span>{shortLabel}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}