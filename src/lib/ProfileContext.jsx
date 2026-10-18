import React, { createContext, useContext, useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { displayNameOf, avatarOf } from '@/lib/profile';

const ProfileContext = createContext(null);

export function ProfileProvider({ children }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [saving, setSaving] = useState(false);

  // The auth context fetches the user once per session. We seed from it, but
  // only once per account: re-seeding on every auth render would clobber the
  // fresher profile this provider just saved (e.g. a removed photo).
  const seededFor = useRef(null);
  useEffect(() => {
    const id = user?.id || null;
    if (id && seededFor.current === id) return;
    seededFor.current = id;
    setProfile(user ? { ...user } : null);
  }, [user]);

  // One-time cleanup of local data written by earlier versions, so nothing can
  // carry over between accounts.
  useEffect(() => {
    try {
      localStorage.removeItem('aman_gemini_api_key');
      localStorage.removeItem('aman_tracker_cache');
    } catch { /* storage unavailable */ }
  }, []);

  const saveProfile = useCallback(async (patch) => {
    setSaving(true);
    try {
      await base44.auth.updateMe(patch);

      // Read the live profile back so every avatar reflects what the server
      // actually stored, then let the explicit patch win for the fields the
      // user just changed.
      let fresh = null;
      try {
        fresh = await base44.auth.me();
      } catch { /* fall back to the local merge below */ }

      setProfile((prev) => ({ ...(prev || {}), ...(fresh || {}), ...patch }));
      return true;
    } finally {
      setSaving(false);
    }
  }, []);

  // Used after an upload so the newest avatar is read from the account itself.
  const refreshProfile = useCallback(async () => {
    try {
      const fresh = await base44.auth.me();
      if (fresh) setProfile({ ...fresh });
    } catch { /* keep the current profile */ }
  }, []);

  const value = useMemo(() => ({
    profile,
    ready: !!profile,
    displayName: displayNameOf(profile),
    avatarUrl: avatarOf(profile),
    onboarded: profile ? !!profile.onboarded : true,
    email: (profile && profile.email) || '',
    saving,
    saveProfile,
    refreshProfile
  }), [profile, saving, saveProfile, refreshProfile]);

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used within ProfileProvider');
  return ctx;
}