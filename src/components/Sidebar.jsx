import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BarChart3, Settings as SettingsIcon, Info } from 'lucide-react';
import Avatar from '@/components/Avatar';
import { useProfile } from '@/lib/ProfileContext';

export const NAV = [
  { to: '/', label: 'Dashboard', shortLabel: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/progress', label: 'Progress', shortLabel: 'Progress', icon: BarChart3, end: false },
  { to: '/settings', label: 'Settings', shortLabel: 'Settings', icon: SettingsIcon, end: false },
  { to: '/about', label: 'About This Dashboard', shortLabel: 'About', icon: Info, end: false }
];

// Desktop sidebar only — mobile uses the bottom nav bar.
export default function Sidebar() {
  const { displayName, avatarUrl } = useProfile();

  return (
    <nav className="hidden lg:flex lg:flex-col items-stretch gap-1 p-3 bg-surface rounded-2xl border border-surface card-shadow h-[calc(100vh-2rem)] sticky top-4">
      <div className="flex items-center gap-2 px-2 py-3 mb-2">
        <Avatar src={avatarUrl} name={displayName} className="h-9 w-9" textClassName="text-sm" />
        <span className="font-heading font-bold text-pri text-sm leading-tight break-words">
          {displayName ? `${displayName}'s Tracker` : 'Your Tracker'}
        </span>
      </div>

      {NAV.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 min-h-[44px] rounded-xl text-sm font-medium transition-all ${
              isActive
                ? 'bg-accent text-on-accent card-shadow'
                : 'text-sec hover:bg-appAccentSoft hover:text-pri'
            }`
          }
        >
          <Icon className="h-5 w-5 shrink-0" />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}