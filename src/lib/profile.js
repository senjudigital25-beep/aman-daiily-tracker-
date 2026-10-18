// Helpers for reading the signed-in user's profile. The profile lives on the
// built-in User entity, so everything here is a plain read of fields Base44
// already keeps for us — never a second source of truth.

export function displayNameOf(user) {
  if (!user) return '';
  const name = user.display_name || user.full_name || (user.email ? String(user.email).split('@')[0] : '');
  return String(name || '').trim();
}

export function avatarOf(user) {
  return (user && user.avatar_url) || '';
}

export function isOnboarded(user) {
  return !!(user && user.onboarded);
}

// First letter used by the default avatar when no photo has been uploaded.
export function initialOf(name) {
  const n = String(name || '').trim();
  return n ? n[0].toUpperCase() : '?';
}

// Same rules as onboarding: a name is required and capped at 30 characters.
export function validateName(raw) {
  const name = String(raw || '').trim();
  if (!name) return 'Please enter a name.';
  if (name.length > 30) return 'Keep it to 30 characters or fewer.';
  return '';
}

export const ACCEPTED_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

export function validatePhotoFile(file) {
  if (!file) return 'Please choose a photo.';
  if (!ACCEPTED_PHOTO_TYPES.includes(file.type)) return 'Please choose a JPG, PNG, or WebP image.';
  if (file.size > MAX_PHOTO_BYTES) return 'That photo is larger than 5MB. Please choose a smaller one.';
  return '';
}