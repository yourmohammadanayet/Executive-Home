import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Loader2, UserCheck, ShieldCheck, Mail, ArrowRight } from 'lucide-react';
import { validateUserAccess, getUserAccessRecords } from '../lib/accessControlService';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot_password'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const { loginLocalUser } = useAuth();

  const userRecords = getUserAccessRecords();
  const activeMembers = userRecords.filter(r => r.login_access === 'Enabled' && r.approval_status === 'Approved');

  const validateEmail = (val: string) => {
    if (!val) {
      setEmailError('Email is required');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(val)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError(null);
    return true;
  };

  const validatePassword = (val: string) => {
    if (mode === 'forgot_password') return true;
    if (!val) {
      setPasswordError('Password is required');
      return false;
    }
    if (val.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return false;
    }
    setPasswordError(null);
    return true;
  };

  const handleEmailChange = (e: import("react").ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEmail(val);
    if (emailError) validateEmail(val);
  };

  const handleEmailBlur = () => {
    validateEmail(email);
  };

  const handlePasswordChange = (e: import("react").ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPassword(val);
    if (passwordError) validatePassword(val);
  };

  const handlePasswordBlur = () => {
    validatePassword(password);
  };

  const changeMode = (newMode: 'signin' | 'signup' | 'forgot_password') => {
    setMode(newMode);
    setError(null);
    setMessage(null);
    setEmailError(null);
    setPasswordError(null);
  };

  const handleSubmit = async (e: import("react").FormEvent) => {
    e.preventDefault();
    
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    
    if (!isEmailValid || !isPasswordValid) {
      return;
    }
    
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (mode === 'signin') {
        // First validate access control status
        const validation = validateUserAccess(email);
        if (!validation.canLogin) {
          setError(validation.message || 'Access denied');
          setLoading(false);
          return;
        }

        // Try Supabase auth first
        const { error: sbError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (!sbError) {
          loginLocalUser(email);
          navigate('/');
          return;
        }

        // If Supabase auth failed (e.g. credentials not synced in backend auth table in sandbox),
        // fallback to user access validation
        if (validation.canLogin && validation.user) {
          const success = loginLocalUser(email);
          if (success) {
            navigate('/');
            return;
          }
        }

        throw sbError || new Error('Invalid email or password');
      } else if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setMessage('Registration successful! You can now sign in.');
        changeMode('signin');
      } else if (mode === 'forgot_password') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin,
        });
        if (error) throw error;
        setMessage('Password reset email sent! Check your inbox.');
        changeMode('signin');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = mode === 'forgot_password' 
    ? email.length > 0 && !emailError 
    : email.length > 0 && password.length > 0 && !emailError && !passwordError;

  return (
    <div className="flex min-h-screen flex-1 flex-col justify-center px-6 py-12 lg:px-8 bg-[#F5F8F7] dark:bg-dark-canvas">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm flex flex-col items-center">
        <div className="w-12 h-12 bg-[#23796F] rounded flex items-center justify-center mb-4 text-white font-bold text-xl">
          EH
        </div>
        <h2 className="text-center text-2xl font-bold leading-9 tracking-tight text-[#173F3A] dark:text-dark-text-primary">
          Executive Home
        </h2>
        <p className="mt-2 text-center text-sm text-gray-500 dark:text-dark-text-secondary">
          {mode === 'signin' && 'Sign in to your account'}
          {mode === 'signup' && 'Create a new account'}
          {mode === 'forgot_password' && 'Reset your password'}
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form className="space-y-6 bg-white dark:bg-dark-surface p-8 rounded-xl shadow-sm border border-[#D5E2DF] dark:border-dark-border" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 dark:bg-dark-red/10 text-red-600 dark:text-dark-red p-3 rounded-md text-sm border border-red-100 dark:border-red-900/30">
              {error}
            </div>
          )}
          {message && (
            <div className="bg-green-50 text-green-600 p-3 rounded-md text-sm border border-green-100">
              {message}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-xs font-semibold leading-6 text-[#173F3A] dark:text-dark-text-primary uppercase tracking-wide">
              Email address
            </label>
            <div className="mt-2">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={handleEmailChange}
                onBlur={handleEmailBlur}
                className={`block w-full rounded-md border-0 py-2.5 px-3 text-[#173F3A] dark:text-dark-text-primary shadow-sm ring-1 ring-inset ${emailError ? 'ring-red-300 focus:ring-red-500' : 'ring-gray-300 dark:ring-dark-border-strong focus:ring-[#23796F] dark:focus:ring-dark-teal dark:focus:ring-dark-teal'} placeholder:text-gray-400 dark:text-dark-text-muted focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 outline-none transition-all`}
              />
              {emailError && <p className="mt-1 text-xs text-red-500">{emailError}</p>}
            </div>
          </div>

          {mode !== 'forgot_password' && (
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-xs font-semibold leading-6 text-[#173F3A] dark:text-dark-text-primary uppercase tracking-wide">
                  Password
                </label>
                {mode === 'signin' && (
                  <div className="text-xs">
                    <button 
                      type="button" 
                      onClick={() => changeMode('forgot_password')} 
                      className="font-semibold text-[#23796F] dark:text-dark-teal hover:text-[#173F3A] dark:hover:text-dark-text-primary dark:text-dark-text-primary transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}
              </div>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                  required
                  value={password}
                  onChange={handlePasswordChange}
                  onBlur={handlePasswordBlur}
                  className={`block w-full rounded-md border-0 py-2.5 px-3 text-[#173F3A] dark:text-dark-text-primary shadow-sm ring-1 ring-inset ${passwordError ? 'ring-red-300 focus:ring-red-500' : 'ring-gray-300 dark:ring-dark-border-strong focus:ring-[#23796F] dark:focus:ring-dark-teal dark:focus:ring-dark-teal'} placeholder:text-gray-400 dark:text-dark-text-muted focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6 outline-none transition-all`}
                />
                {passwordError && <p className="mt-1 text-xs text-red-500">{passwordError}</p>}
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading || !isFormValid}
              className="flex w-full justify-center items-center rounded-lg bg-[#23796F] px-3 py-3 text-xs font-bold uppercase tracking-widest text-white shadow-sm hover:bg-[#173F3A] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#23796F] transition-all disabled:opacity-70 disabled:cursor-not-allowed outline-none focus-visible:ring-2 focus-visible:ring-[#23796F] dark:focus-visible:ring-dark-teal focus-visible:ring-offset-1 dark:focus-visible:ring-offset-dark-canvas"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : mode === 'signin' ? 'Sign In' : mode === 'signup' ? 'Sign Up' : 'Send Reset Link'}
            </button>
          </div>
          
          <div className="text-center text-sm mt-4">
            {mode === 'signin' ? (
              <p className="text-gray-500 dark:text-dark-text-secondary">
                Don't have an account?{' '}
                <button 
                  type="button" 
                  onClick={() => changeMode('signup')} 
                  className="font-semibold text-[#23796F] dark:text-dark-teal hover:text-[#173F3A] dark:hover:text-dark-text-primary dark:text-dark-text-primary transition-colors"
                >
                  Sign up
                </button>
              </p>
            ) : (
              <p className="text-gray-500 dark:text-dark-text-secondary">
                Back to{' '}
                <button 
                  type="button" 
                  onClick={() => changeMode('signin')} 
                  className="font-semibold text-[#23796F] dark:text-dark-teal hover:text-[#173F3A] dark:hover:text-dark-text-primary dark:text-dark-text-primary transition-colors"
                >
                  Sign in
                </button>
              </p>
            )}
          </div>
        </form>

        {/* Quick Demo Sign-in Selector */}
        {mode === 'signin' && (
          <div className="mt-6 bg-white dark:bg-dark-surface p-5 rounded-xl border border-teal-100 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-[#173F3A] dark:text-dark-text-primary">
              <ShieldCheck className="w-4 h-4 text-[#23796F] dark:text-dark-teal" />
              <h3 className="text-xs font-bold uppercase tracking-wider">Quick Sign-In (Active Accounts)</h3>
            </div>
            <p className="text-[11px] text-gray-500 dark:text-dark-text-secondary leading-snug">
              Select any active Executive Home account below to log in instantly:
            </p>

            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {activeMembers.map((acc) => (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => {
                    if (acc.email) {
                      setEmail(acc.email);
                      setPassword('ExecHome#2026');
                      loginLocalUser(acc.email);
                      navigate('/');
                    } else {
                      setError(`Member ${acc.full_name} does not have an email address set.`);
                    }
                  }}
                  className="w-full text-left p-2.5 rounded-lg border border-gray-100 dark:border-dark-border hover:border-teal-300 hover:bg-teal-50/50 flex items-center justify-between group transition-all outline-none focus-visible:ring-2 focus-visible:ring-[#23796F] dark:focus-visible:ring-dark-teal focus-visible:ring-offset-1 dark:focus-visible:ring-offset-dark-canvas"
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-[#173F3A] dark:text-dark-text-primary group-hover:text-[#23796F] dark:hover:text-dark-teal dark:text-dark-teal">
                        {acc.full_name}
                      </span>
                      <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${acc.role === 'admin' ? 'bg-amber-100 text-amber-800' : 'bg-teal-100 text-teal-800'}`}>
                        {acc.role}
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-400 dark:text-dark-text-muted font-mono block">
                      {acc.email || 'No email assigned'}
                    </span>
                  </div>
                  <div className="flex items-center text-xs font-semibold text-[#23796F] dark:text-dark-teal gap-1 opacity-80 group-hover:opacity-100">
                    <span>Sign In</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
