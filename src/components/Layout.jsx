import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { Loader2, RefreshCw } from 'lucide-react';
import TopBar from '@/components/TopBar';
import Sidebar from '@/components/Sidebar';
import BottomNav from '@/components/BottomNav';
import PetCompanion from '@/components/PetCompanion';
import ThemeBackdrop from '@/components/ThemeBackdrop';
import { useTasksData } from '@/hooks/useTasksData';
import { useProfile } from '@/lib/ProfileContext';
import { useTheme } from '@/lib/theme';
import { normalizeThemeKey } from '@/lib/themes';

function ShellSpinner() {
  return (
    <div className="min-h-screen bg-app flex items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-accent" />
    </div>
  );
}

export default function Layout() {
  const data = useTasksData();
  const { profile, ready, onboarded } = useProfile();
  const { setTheme } = useTheme();
  const appliedTheme = useRef(null);

  // The account's saved theme is applied once the profile is known. Values
  // saved before the seven-theme picker existed are mapped to their new keys.
  useEffect(() => {
    const key = normalizeThemeKey(profile?.theme);
    if (key && appliedTheme.current !== key) {
      appliedTheme.current = key;
      setTheme(key);
    }
  }, [profile, setTheme]);

  if (!ready) return <ShellSpinner />;
  if (!onboarded) return <Navigate to="/onboarding" replace />;

  return (
    <div className="min-h-screen">
      <ThemeBackdrop />

      <div className="relative z-10">
        <TopBar stats={data.stats} />
        <div className="max-w-[1400px] mx-auto px-3 sm:px-4 lg:px-6 py-4 lg:py-6 pb-24 lg:pb-6">
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
            <div className="shrink-0">
              <Sidebar />
            </div>
            <main className="flex-1 min-w-0">
              {data.error && (
                <div className="mb-4 flex items-center gap-3 rounded-2xl border border-surface bg-surface px-4 py-3 card-shadow">
                  <p className="flex-1 text-sm text-pri">{data.error}</p>
                  <button
                    onClick={() => data.refresh()}
                    className="inline-flex items-center gap-1.5 rounded-full bg-accent text-on-accent px-4 py-2 text-sm font-semibold hover:opacity-90 transition-opacity"
                  >
                    <RefreshCw className="h-3.5 w-3.5" /> Retry
                  </button>
                </div>
              )}
              <Outlet context={data} />
            </main>
          </div>
        </div>
        <BottomNav />
      </div>

      <PetCompanion data={data} />
    </div>
  );
}