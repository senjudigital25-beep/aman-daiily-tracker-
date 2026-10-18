import React, { useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { ArrowRight, Loader2, Camera } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import Avatar from '@/components/Avatar';
import PhotoCropper from '@/components/PhotoCropper';
import { useProfile } from '@/lib/ProfileContext';
import { validateName, validatePhotoFile } from '@/lib/profile';

export default function Onboarding() {
  const { displayName, avatarUrl, onboarded, ready, saveProfile } = useProfile();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [name, setName] = useState(displayName || '');
  const [nameError, setNameError] = useState('');
  const [saving, setSaving] = useState(false);

  const [photoFile, setPhotoFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInput = useRef(null);

  const finish = async (patch) => {
    await saveProfile({ ...patch, onboarded: true });
    navigate('/', { replace: true });
  };

  if (!ready) {
    return (
      <div className="min-h-screen bg-app flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-accent" />
      </div>
    );
  }

  if (onboarded && !saving) return <Navigate to="/" replace />;

  const handleContinue = async () => {
    const err = validateName(name);
    setNameError(err);
    if (err) return;
    setSaving(true);
    try {
      await saveProfile({ display_name: name.trim() });
      setStep(2);
    } catch {
      setNameError('Could not save your name. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handlePick = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const err = validatePhotoFile(file);
    if (err) {
      setUploadError(err);
      return;
    }
    setUploadError('');
    setPhotoFile(file);
  };

  const handleSavePhoto = async (file) => {
    setUploading(true);
    setUploadError('');
    try {
      const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
      setPhotoFile(null);
      await finish({ avatar_url: file_url });
    } catch {
      setUploadError("Couldn't upload your photo, please try again");
    } finally {
      setUploading(false);
    }
  };

  const handleSkip = async () => {
    setSaving(true);
    setUploadError('');
    try {
      await finish({});
    } catch {
      setUploadError("Couldn't save your profile, please try again");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-app flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <Avatar src={avatarUrl} name={name || displayName} className="h-20 w-20" textClassName="text-3xl" />
          </div>
          <p className="text-sec text-xs font-medium tracking-wide uppercase">
            Step {step} of 2
          </p>
        </div>

        <div className="bg-surface rounded-3xl border border-surface card-shadow p-6 sm:p-8 slide-up">
          {step === 1 ? (
            <>
              <h1 className="font-heading font-bold text-pri text-2xl">What should we call you?</h1>
              <p className="text-sec text-sm mt-2 mb-6">
                This is the name we'll use to greet you.
              </p>

              <label htmlFor="onboarding-name" className="sr-only">Your name</label>
              <input
                id="onboarding-name"
                autoFocus
                maxLength={30}
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleContinue(); } }}
                placeholder="Your name"
                className="w-full min-h-[48px] bg-app border border-surface rounded-xl px-4 text-pri outline-none focus:border-appAccent"
              />
              {nameError && <p className="text-xs text-destructive mt-2">{nameError}</p>}

              <button
                onClick={handleContinue}
                disabled={saving}
                className="mt-6 w-full min-h-[48px] rounded-xl bg-accent text-white font-semibold inline-flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                Continue
              </button>
            </>
          ) : (
            <>
              <h1 className="font-heading font-bold text-pri text-2xl">Add a profile photo</h1>
              <p className="text-sec text-sm mt-2 mb-6">
                Your photo appears in the sidebar and on your companion.
              </p>

              <input
                ref={fileInput}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handlePick}
                className="hidden"
              />

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => fileInput.current?.click()}
                  disabled={saving || uploading}
                  className="w-full min-h-[48px] rounded-xl bg-accent text-white font-semibold inline-flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                  <Camera className="h-4 w-4" />
                  Choose photo
                </button>
                <button
                  onClick={handleSkip}
                  disabled={saving || uploading}
                  className="w-full min-h-[48px] rounded-xl bg-app border border-surface text-sec font-medium hover:bg-appAccentSoft disabled:opacity-50 transition-colors"
                >
                  {saving ? 'Saving…' : 'Skip for now'}
                </button>
              </div>

              {uploadError && !photoFile && (
                <div className="mt-4 p-3 rounded-xl bg-destructive/10 text-destructive text-sm">
                  {uploadError}
                </div>
              )}

              <p className="text-sec text-xs mt-4 text-center">JPG, PNG or WebP · up to 5MB</p>
            </>
          )}
        </div>
      </div>

      {photoFile && (
        <PhotoCropper
          file={photoFile}
          busy={uploading}
          error={uploadError}
          onCancel={() => { setPhotoFile(null); setUploadError(''); }}
          onSave={handleSavePhoto}
        />
      )}
    </div>
  );
}