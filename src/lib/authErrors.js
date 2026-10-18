// Turns whatever the auth SDK throws into something a person can act on.
// Raw provider codes are never surfaced.

export function friendlyAuthError(err, mode = 'login') {
  const raw = String((err && (err.message || err.error || err.detail)) || '').toLowerCase();

  if (!raw) return 'Something went wrong. Please try again.';

  if (
    raw.includes('network') ||
    raw.includes('failed to fetch') ||
    raw.includes('timeout') ||
    raw.includes('offline')
  ) {
    return "Couldn't reach the server. Check your connection and try again.";
  }

  if (raw.includes('already') || raw.includes('exists') || raw.includes('in use') || raw.includes('taken')) {
    return 'An account with this email already exists. Try logging in instead.';
  }

  if (raw.includes('rate') || raw.includes('too many')) {
    return 'Too many attempts. Please wait a moment and try again.';
  }

  if (raw.includes('weak') || raw.includes('too short') || raw.includes('at least')) {
    return 'Password must be at least 8 characters.';
  }

  if (raw.includes('not verified') || raw.includes('unverified') || raw.includes('not confirmed')) {
    return "Your email isn't verified yet. We sent you a code — enter it to continue.";
  }

  if (raw.includes('expired')) {
    return 'That link or code has expired. Please request a new one.';
  }

  if (
    raw.includes('invalid') ||
    raw.includes('incorrect') ||
    raw.includes('credentials') ||
    raw.includes('wrong') ||
    raw.includes('not found') ||
    raw.includes('unauthorized')
  ) {
    return mode === 'signup'
      ? 'We could not create your account with those details. Please check and try again.'
      : 'Email or password is incorrect.';
  }

  return mode === 'signup'
    ? 'We could not create your account. Please try again.'
    : 'We could not log you in. Please try again.';
}

export function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(value || '').trim());
}

export function validateEmail(value) {
  if (!String(value || '').trim()) return 'Please enter your email.';
  if (!isValidEmail(value)) return 'Please enter a valid email address.';
  return '';
}

export function validatePassword(value) {
  if (!String(value || '')) return 'Please enter your password.';
  if (String(value).length < 8) return 'Password must be at least 8 characters.';
  return '';
}