import React, { useRef, useState } from 'react';
import { useTheme } from '@/lib/theme';
import { useProfile } from '@/lib/ProfileContext';
import { base44 } from '@/api/base44Client';
import { clearTasksCache } from '@/hooks/useTasksData';
import {
  Sparkles, Pencil, Camera, Trash2, LogOut,
  MessageCircle, Check, X, Loader2, ChevronDown
} from 'lucide-react';
import Avatar from '@/components/Avatar';
import PhotoCropper from '@/components/PhotoCropper';
import ThemePicker, { THEME_ICONS } from '@/components/ThemePicker';
import { toast } from '@/components/ui/use-toast';
import { validateName, validatePhotoFile } from '@/lib/profile';

const WHATSAPP_URL =
  "https://wa.me/9199355128136?text=Hi%20Aman%2C%20I%20came%20from%20Aman%27s%20Daily%20Tracker.%20I%27d%20like%20to%20talk%20about%20it.";

const ABOUT_POINTS = [
  'Plan your workouts and daily tasks in one place',
  'Track your daily streak and weekly consistency',
  'Monitor your outreach and progress over time',
  'Use the floating companion for motivation and quick task creation',
  'Chat with the AI assistant to add tasks by just typing',
  'Works in light and dark mode',
  'Your data is private to your account'
];

function Section({ children }) {
  return (
    <div className="bg-surface rounded-2xl border border-surface card-shadow p-5">
      {children}
    </div>
  );
}

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const { displayName, avatarUrl, email, saveProfile } = useProfile();

  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(displayName || '');
  const [nameError, setNameError] = useState('');
  const [busy, setBusy] = useState('');

  const [photoFile, setPhotoFile] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const [aboutOpen, setAboutOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const fileInput = useRef(null);

  const ThemeIcon = THEME_ICONS[theme.icon] || Sparkles;

  const startEditName = () => {
    setNameDraft(displayName || '');
    setNameError('');
    setEditingName(true);
  };

  const saveName = async () => {
    const err = validateName(nameDraft);
    setNameError(err);
    if (err) return;
    setBusy('name');
    try {
      await saveProfile({ display_name: nameDraft.trim() });
      setEditingName(false);
      toast({ title: 'Name updated' });
    } catch {
      setNameError('Could not save your name. Please try again.');
    } finally {
      setBusy('');
    }
  };

  const handlePick = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const err = validatePhotoFile(file);
    if (err) {
      toast({ title: err, variant: 'destructive' });
      return;
    }
    setUploadError('');
    setPhotoFile(file);
  };

  const handleSavePhoto = async (file) => {
    setBusy('photo');
    setUploadError('');
    try {
      const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
      // Saving re-reads the live profile, so the new photo replaces the old one
      // in the sidebar, the companion and the chat header at the same moment.
      await saveProfile({ avatar_url: file_url });
      setPhotoFile(null);
      toast({ title: 'Photo updated' });
    } catch {
      setUploadError("Couldn't upload your photo, please try again");
    } finally {
      setBusy('');
    }
  };

  const removePhoto = async () => {
    setBusy('photo');
    try {
      // Clears the field on the account itself; the saved patch wins over any
      // cached copy, so every avatar drops back to the initial right away.
      await saveProfile({ avatar_url: '' });
      toast({ title: 'Photo removed' });
    } catch {
      toast({ title: "Couldn't remove your photo. Please try again.", variant: 'destructive' });
    } finally {
      setBusy('');
    }
  };

  const applyTheme = async (key) => {
    setPickerOpen(false);
    setTheme(key);
    try {
      await saveProfile({ theme: key });
    } catch {
      toast({ title: "Couldn't save your theme preference.", variant: 'destructive' });
    }
  };

  const logOut = () => {
    clearTasksCache();
    try {
      localStorage.removeItem('aman_gemini_api_key');
      localStorage.removeItem('aman_tracker_cache');
    } catch { /* storage unavailable */ }
    base44.auth.logout('/login');
  };

  return (
    <div className="flex flex-col gap-4 lg:gap-6 max-w-2xl">
      <div>
        <h1 className="font-heading font-bold text-pri text-2xl">Settings</h1>
        <p className="text-sec text-sm mt-1">Make it yours.</p>
      </div>

      {/* Profile */}
      <Section>
        <div className="flex items-start gap-4">
          <Avatar src={avatarUrl} name={displayName} className="h-16 w-16" textClassName="text-xl" />
          <div className="min-w-0 flex-1">
            {editingName ? (
              <div>
                <label htmlFor="settings-name" className="sr-only">Display name</label>
                <input
                  id="settings-name"
                  autoFocus
                  maxLength={30}
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') { e.preventDefault(); saveName(); }
                    if (e.key === 'Escape') setEditingName(false);
                  }}
                  className="w-full min-h-[44px] bg-app border border-surface rounded-xl px-3 text-pri outline-none focus:border-appAccent"
                />
                {nameError && <p className="text-xs text-destructive mt-1.5">{nameError}</p>}
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={saveName}
                    disabled={busy === 'name'}
                    className="inline-flex items-center gap-1.5 min-h-[44px] px-4 rounded-xl bg-accent text-on-accent text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
                  >
                    {busy === 'name' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    Save
                  </button>
                  <button
                    onClick={() => setEditingName(false)}
                    className="inline-flex items-center gap-1.5 min-h-[44px] px-4 rounded-xl bg-app border border-surface text-sec text-sm font-medium hover:bg-appAccentSoft transition-colors"
                  >
                    <X className="h-4 w-4" /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className="font-heading font-bold text-pri text-lg truncate">
                  {displayName || 'Your name'}
                </p>
                <p className="text-sec text-sm truncate">{email}</p>
                <button
                  onClick={startEditName}
                  className="mt-2 inline-flex items-center gap-1.5 min-h-[44px] text-sm font-medium text-accent-ink hover:underline"
                >
                  <Pencil className="h-3.5 w-3.5" /> Edit name
                </button>
              </>
            )}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-surface flex flex-wrap gap-2">
          <input
            ref={fileInput}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handlePick}
            className="hidden"
          />
          <button
            onClick={() => fileInput.current?.click()}
            disabled={busy === 'photo'}
            className="inline-flex items-center gap-2 min-h-[44px] px-4 rounded-xl bg-app border border-surface text-pri text-sm font-medium hover:bg-appAccentSoft disabled:opacity-50 transition-colors"
          >
            <Camera className="h-4 w-4" /> Change photo
          </button>
          {avatarUrl && (
            <button
              onClick={removePhoto}
              disabled={busy === 'photo'}
              className="inline-flex items-center gap-2 min-h-[44px] px-4 rounded-xl bg-app border border-surface text-sec text-sm font-medium hover:bg-appAccentSoft disabled:opacity-50 transition-colors"
            >
              <Trash2 className="h-4 w-4" /> Remove photo
            </button>
          )}
        </div>
        {uploadError && !photoFile && (
          <p className="text-xs text-destructive mt-2">{uploadError}</p>
        )}
      </Section>

      {/* Theme */}
      <Section>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-accent-soft flex items-center justify-center text-accent-ink shrink-0">
              <ThemeIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-pri font-medium">Theme</p>
              <p className="text-sec text-xs">Currently {theme.name}</p>
            </div>
          </div>
          <button
            onClick={() => setPickerOpen(true)}
            className="min-h-[44px] bg-accent text-on-accent rounded-full px-5 text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Choose a theme
          </button>
        </div>
      </Section>

      {/* About */}
      <Section>
        <button
          onClick={() => setAboutOpen((v) => !v)}
          aria-expanded={aboutOpen}
          className="w-full flex items-center justify-between gap-3 text-left min-h-[44px]"
        >
          <span className="font-heading font-bold text-pri text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-accent-ink" /> About this dashboard
          </span>
          <ChevronDown className={`h-5 w-5 text-sec transition-transform ${aboutOpen ? 'rotate-180' : ''}`} />
        </button>
        {aboutOpen && (
          <ul className="mt-4 flex flex-col gap-2.5 slide-up">
            {ABOUT_POINTS.map((point) => (
              <li key={point} className="flex items-start gap-2.5 text-sm text-sec">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {/* Contact */}
      <Section>
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noreferrer"
          className="w-full inline-flex items-center justify-center gap-2 min-h-[48px] rounded-xl bg-accent-soft text-accent-ink font-semibold hover:opacity-90 transition-opacity"
        >
          <MessageCircle className="h-4 w-4" /> Message Aman
        </a>
      </Section>

      {/* Log out */}
      <button
        onClick={logOut}
        className="w-full inline-flex items-center justify-center gap-2 min-h-[48px] rounded-2xl bg-red-500/10 text-red-500 font-semibold hover:bg-red-500/20 transition-colors"
      >
        <LogOut className="h-4 w-4" /> Log out
      </button>

      {photoFile && (
        <PhotoCropper
          file={photoFile}
          busy={busy === 'photo'}
          error={uploadError}
          onCancel={() => { setPhotoFile(null); setUploadError(''); }}
          onSave={handleSavePhoto}
        />
      )}

      <ThemePicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={applyTheme}
      />
    </div>
  );
}