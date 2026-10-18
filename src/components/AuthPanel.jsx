import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Lock, User, Loader2, LogIn, UserPlus } from 'lucide-react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import AuthLayout from '@/components/AuthLayout';
import GoogleIcon from '@/components/GoogleIcon';
import { toast } from '@/components/ui/use-toast';
import { safeReturnTo } from '@/lib/authReturnTo';
import { friendlyAuthError, validateEmail, validatePassword } from '@/lib/authErrors';
import { validateName } from '@/lib/profile';

function FieldError({ message }) {
  if (!message) return null;
  return <p className="text-xs text-destructive mt-1">{message}</p>;
}

export default function AuthPanel({ initialTab = 'login' }) {
  const [tab, setTab] = useState(initialTab);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  const returnTo = safeReturnTo();

  const switchTab = (next) => {
    setTab(next);
    setError('');
    setFieldErrors({});
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const next = {
      email: validateEmail(email),
      password: password ? '' : 'Please enter your password.',
    };
    setFieldErrors(next);
    if (next.email || next.password) return;

    setError('');
    setLoading(true);
    try {
      await base44.auth.loginViaEmailPassword(email.trim(), password);
      window.location.href = returnTo;
    } catch (err) {
      setError(friendlyAuthError(err, 'login'));
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    const next = {
      name: validateName(name),
      email: validateEmail(email),
      password: validatePassword(password),
      confirm: password && confirmPassword && password !== confirmPassword ? 'Passwords do not match.' : '',
    };
    setFieldErrors(next);
    if (next.name || next.email || next.password || next.confirm) return;

    setError('');
    setLoading(true);
    try {
      await base44.auth.register({ email: email.trim(), password });
      setShowOtp(true);
    } catch (err) {
      setError(friendlyAuthError(err, 'signup'));
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (loading) return;
    setError('');
    setLoading(true);
    try {
      const result = await base44.auth.verifyOtp({ email: email.trim(), otpCode });
      if (result?.access_token) base44.auth.setToken(result.access_token);
      // The name collected at sign-up becomes the profile name; onboarding
      // step 1 simply confirms it. A failure here must not block sign-in.
      try {
        await base44.auth.updateMe({ display_name: name.trim() });
      } catch {
        /* profile can still be set during onboarding */
      }
      window.location.href = returnTo;
    } catch (err) {
      setError(friendlyAuthError(err, 'signup'));
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    try {
      await base44.auth.resendOtp(email.trim());
      toast({ title: 'Code sent', description: 'Check your email for the new code.' });
    } catch (err) {
      setError(friendlyAuthError(err, 'signup'));
    }
  };

  const handleGoogle = () => {
    base44.auth.loginWithProvider('google', returnTo);
  };

  if (showOtp) {
    return (
      <AuthLayout
        icon={Mail}
        title="Verify your email"
        subtitle={`We sent a code to ${email}`}
      >
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>
        )}
        <div className="flex justify-center mb-6">
          <InputOTP
            maxLength={6}
            value={otpCode}
            onChange={setOtpCode}
            autoFocus
            autoComplete="one-time-code"
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>
        <Button
          className="w-full h-12 font-medium"
          onClick={handleVerify}
          disabled={loading || otpCode.length < 6}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Verifying...
            </>
          ) : (
            'Verify'
          )}
        </Button>
        <p className="text-center text-sm text-muted-foreground mt-4">
          Didn't receive the code?{' '}
          <button onClick={handleResend} className="text-primary font-medium hover:underline">
            Resend
          </button>
        </p>
      </AuthLayout>
    );
  }

  const isLogin = tab === 'login';

  return (
    <AuthLayout
      icon={isLogin ? LogIn : UserPlus}
      title={isLogin ? 'Welcome back' : 'Create your account'}
      subtitle={isLogin ? 'Log in to your tracker' : 'Sign up to get started'}
    >
      <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-muted mb-6" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={isLogin}
          onClick={() => switchTab('login')}
          className={`h-10 rounded-lg text-sm font-medium transition-colors ${
            isLogin ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Log in
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={!isLogin}
          onClick={() => switchTab('signup')}
          className={`h-10 rounded-lg text-sm font-medium transition-colors ${
            !isLogin ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Sign up
        </button>
      </div>

      <Button
        variant="outline"
        className="w-full h-12 text-sm font-medium"
        onClick={handleGoogle}
        type="button"
      >
        <GoogleIcon className="w-5 h-5 mr-2" />
        Continue with Google
      </Button>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-3 text-muted-foreground">or</span>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>
      )}

      {isLogin ? (
        <form onSubmit={handleLogin} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="login-email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
              <Input
                id="login-email"
                type="email"
                autoComplete="email"
                autoFocus
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
            <FieldError message={fieldErrors.email} />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="login-password">Password</Label>
              <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
              <Input
                id="login-password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
            <FieldError message={fieldErrors.password} />
          </div>

          <Button type="submit" className="w-full h-12 font-medium" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Logging in...
              </>
            ) : (
              'Log in'
            )}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleSignup} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="signup-name">Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
              <Input
                id="signup-name"
                autoComplete="name"
                autoFocus
                maxLength={30}
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
            <FieldError message={fieldErrors.name} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="signup-email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
              <Input
                id="signup-email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
            <FieldError message={fieldErrors.email} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="signup-password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
              <Input
                id="signup-password"
                type="password"
                autoComplete="new-password"
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
            <FieldError message={fieldErrors.password} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="signup-confirm">Confirm password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
              <Input
                id="signup-confirm"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
            <FieldError message={fieldErrors.confirm} />
          </div>

          <Button type="submit" className="w-full h-12 font-medium" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating account...
              </>
            ) : (
              'Create account'
            )}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}