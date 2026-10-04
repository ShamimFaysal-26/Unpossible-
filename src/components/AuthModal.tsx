import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import {
  signInWithGoogle,
  signInWithEmail,
  signUpWithEmail,
  sendResetPassword
} from '../services/authService';
import {
  X,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Smartphone
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, currentUser } = useFinance();

  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const resetFormState = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(false);
  };

  const handleGoogleSignIn = async () => {
    resetFormState();
    setIsLoading(true);
    try {
      await signInWithGoogle();
      setIsAuthModalOpen(false);
    } catch (err: any) {
      console.warn('Google sign-in error:', err);
      if (err?.code === 'auth/popup-closed-by-user') {
        setErrorMessage('Sign-in popup was closed before completing. Please try again.');
      } else if (err?.code === 'auth/popup-blocked') {
        setErrorMessage('Popup was blocked by your browser. Please allow popups or use email sign-in.');
      } else {
        setErrorMessage(err?.message || 'Failed to authenticate with Google.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetFormState();

    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    setIsLoading(true);

    try {
      if (mode === 'reset') {
        await sendResetPassword(email.trim());
        setSuccessMessage(`Password reset link sent to ${email.trim()}. Check your inbox.`);
        setIsLoading(false);
        return;
      }

      if (password.length < 6) {
        setErrorMessage('Password must be at least 6 characters long.');
        setIsLoading(false);
        return;
      }

      if (mode === 'signup') {
        await signUpWithEmail(email.trim(), password, displayName.trim() || undefined);
      } else {
        await signInWithEmail(email.trim(), password);
      }

      setIsAuthModalOpen(false);
    } catch (err: any) {
      console.warn('Email auth error:', err);
      let msg = err?.message || 'Authentication failed. Please check credentials.';
      if (err?.code === 'auth/user-not-found' || err?.code === 'auth/invalid-credential') {
        msg = 'Invalid email or password. Please verify and try again.';
      } else if (err?.code === 'auth/email-already-in-use') {
        msg = 'This email is already registered. Please click "Sign In" instead.';
      } else if (err?.code === 'auth/weak-password') {
        msg = 'Password should be at least 6 characters long.';
      } else if (err?.code === 'auth/operation-not-allowed') {
        msg = 'Email sign-in is pending activation in Firebase console. Please use Google Sign-In above!';
      }
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {mode === 'signup'
                  ? 'Create Your FinSathi Account'
                  : mode === 'reset'
                  ? 'Reset Your Password'
                  : 'Sign In to FinSathi'}
              </h2>
              <p className="text-xs text-slate-500">
                {mode === 'signup'
                  ? 'Sync your financial ledger across all your devices'
                  : mode === 'reset'
                  ? 'Receive a recovery link via email'
                  : 'Access your synchronized cloud finances'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 text-xs">
          {/* Status Message */}
          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Mode Switcher Tabs */}
          {mode !== 'reset' && (
            <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-lg text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  resetFormState();
                }}
                className={`py-1.5 rounded-md transition-all ${
                  mode === 'signin'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  resetFormState();
                }}
                className={`py-1.5 rounded-md transition-all ${
                  mode === 'signup'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Create Account
              </button>
            </div>
          )}

          {/* 1-Click Google Sign In */}
          {mode !== 'reset' && (
            <div>
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-300 hover:border-slate-400 text-slate-700 font-semibold rounded-xl shadow-2xs transition-all active:scale-[0.99] disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-slate-400 font-semibold tracking-wider text-[10px]">
                    Or with email credentials
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'signup' && (
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Your Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Alex Morgan"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium text-xs text-slate-900"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium text-xs text-slate-900"
                />
              </div>
            </div>

            {mode !== 'reset' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-semibold text-slate-700">
                    Password *
                  </label>
                  {mode === 'signin' && (
                    <button
                      type="button"
                      onClick={() => {
                        setMode('reset');
                        resetFormState();
                      }}
                      className="text-[11px] text-emerald-600 hover:text-emerald-700 font-medium hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium text-xs text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 p-0.5"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-2xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>
                  {mode === 'signup'
                    ? 'Create Free Account'
                    : mode === 'reset'
                    ? 'Send Password Reset Link'
                    : 'Sign In'}
                </span>
              )}
            </button>
          </form>

          {/* Reset password return switch */}
          {mode === 'reset' && (
            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  resetFormState();
                }}
                className="text-xs text-slate-600 hover:text-slate-900 font-semibold"
              >
                &larr; Back to Sign In
              </button>
            </div>
          )}

          {/* Guest / Device info note */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <Smartphone className="w-3.5 h-3.5 text-slate-400" />
              <span>Or stay in anonymous guest mode</span>
            </span>
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(false)}
              className="font-semibold text-slate-700 hover:text-slate-900 underline"
            >
              Continue as Guest
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
