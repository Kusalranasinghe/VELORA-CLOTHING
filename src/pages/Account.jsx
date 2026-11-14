import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, LoaderCircle, LockKeyhole, LogOut, Mail, Shield, UserRound } from 'lucide-react';
import { isCustomerProfileComplete, useAuth } from '../context/AuthContext';

function getErrorMessage(error) {
  const messages = {
    'auth/invalid-email': 'Enter a valid email address.',
    'auth/weak-password': 'Choose a password with at least 8 characters.'
  };
  return messages[error.code] || error.message || 'We could not complete the request. Please try again.';
}

function safeReturnPath(value) {
  return value?.startsWith('/') && !value.startsWith('//') && !value.startsWith('/admin')
    ? value
    : '';
}

function AccountForm({ adminOnly = false }) {
  const { user, customerProfile, isAdmin, loading, authError, authConfigured, googleClientId, register, login, loginWithGoogle, updateCustomerProfile, logout } = useAuth();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    address: '',
    phone: '',
    nic: ''
  });
  const returnTo = safeReturnPath(searchParams.get('returnTo') || location.state?.returnTo);
  const profileComplete = isCustomerProfileComplete(customerProfile);

  useEffect(() => {
    if (!loading && user && adminOnly) {
      navigate(isAdmin ? '/admin' : '/account', { replace: true });
    } else if (!loading && user && !adminOnly && isAdmin) {
      navigate('/admin', { replace: true });
    } else if (!loading && user && !adminOnly && profileComplete && returnTo) {
      navigate(returnTo, { replace: true });
    }
  }, [adminOnly, isAdmin, loading, navigate, profileComplete, returnTo, user]);

  useEffect(() => {
    if (user && !adminOnly) {
      setForm((current) => ({
        ...current,
        name: customerProfile?.name || current.name || user.displayName || '',
        address: customerProfile?.address || '',
        phone: customerProfile?.phone || '',
        nic: customerProfile?.nic || ''
      }));
    }
  }, [adminOnly, customerProfile, user]);

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    setError('');
  };

  const finishSignIn = (accountAccess) => {
    if (accountAccess.isAdmin) {
      navigate('/admin', { replace: true });
      return;
    }
    if (!isCustomerProfileComplete(accountAccess.customerProfile)) {
      navigate(returnTo ? `/account?returnTo=${encodeURIComponent(returnTo)}` : '/account', { replace: true });
      return;
    }
    navigate(returnTo || '/account', { replace: true });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    setMessage('');

    try {
      if (user && !adminOnly) {
        await updateCustomerProfile(form);
        setMessage('Your delivery details have been saved.');
        if (returnTo) navigate(returnTo, { replace: true });
      } else if (mode === 'register' && !adminOnly) {
        const accountAccess = await register(form);
        finishSignIn(accountAccess);
      } else {
        const accountAccess = await login(form.email, form.password);
        finishSignIn(accountAccess);
      }
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setBusy(false);
    }
  };

  const handleGoogleCredential = async (credential) => {
    setBusy(true);
    setError('');
    try {
      const accountAccess = await loginWithGoogle(credential);
      finishSignIn(accountAccess);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setBusy(false);
    }
  };

  const handleLogout = async () => {
    setBusy(true);
    try {
      await logout();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[65vh] items-center justify-center">
        <LoaderCircle className="h-7 w-7 animate-spin text-velora-700" aria-label="Loading account" />
      </div>
    );
  }

  const heading = adminOnly
    ? 'Admin sign in'
    : user
      ? 'Complete your profile'
      : mode === 'register'
        ? 'Create your account'
        : 'Welcome back';

  return (
    <div className="min-h-[75vh] bg-[#f7f6f3] px-4 py-12 sm:py-16">
      <div className="mx-auto w-full max-w-[480px]">
        <Link to="/" className="mb-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-velora-600 transition-colors hover:text-velora-950">
          <ArrowLeft className="h-4 w-4" /> Back to VELORA
        </Link>

        <section className="rounded-2xl border border-velora-200 bg-white p-6 shadow-[0_20px_70px_rgba(15,23,42,0.08)] sm:p-9">
          <div className="mb-7 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#111111] text-white">
              {adminOnly ? <Shield className="h-5 w-5" /> : <UserRound className="h-5 w-5" />}
            </div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-velora-500">VELORA COLLECTION</p>
            <h1 className="mt-2 font-serif text-2xl font-bold text-velora-950">{heading}</h1>
            <p className="mt-2 text-sm leading-6 text-velora-500">
              {adminOnly
                ? 'Sign in with the Google or email account assigned admin access.'
                : user
                  ? 'Add your delivery details to continue shopping and place orders.'
                  : mode === 'register'
                    ? 'Create an account to save your delivery details and order securely.'
                    : 'Sign in to your account to continue with your order.'}
            </p>
          </div>

          {!authConfigured ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
              Google Sheets sign-in is not connected yet. Follow the setup steps in <code className="font-semibold">GOOGLE_SHEETS_AUTH_SETUP.md</code>, then restart the dev server.
            </div>
          ) : (
            <>
              {authError && (
                <p role="alert" className="mb-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm leading-6 text-rose-800">
                  {getErrorMessage({ message: authError })}
                </p>
              )}
              {user && !adminOnly && (
                <div className="mb-5 flex items-center justify-between rounded-xl bg-velora-50 px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-velora-900">{customerProfile?.name || user.displayName || user.email}</p>
                    <p className="truncate text-xs text-velora-500">{user.email}</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={busy}
                    className="ml-3 inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold text-velora-600 hover:text-rose-700 disabled:opacity-50"
                  >
                    <LogOut className="h-3.5 w-3.5" /> Sign out
                  </button>
                </div>
              )}

              {(!user || adminOnly) && (
                <>
                  {googleClientId && (
                    <>
                      <GoogleSignInButton
                        clientId={googleClientId}
                        disabled={busy}
                        onCredential={handleGoogleCredential}
                        onError={setError}
                      />
                      <div className="my-5 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-velora-400">
                        <span className="h-px flex-1 bg-velora-200" />
                        {adminOnly ? 'Admin account' : 'Or use email'}
                        <span className="h-px flex-1 bg-velora-200" />
                      </div>
                    </>
                  )}
                </>
              )}

              {(!user || adminOnly) && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {mode === 'register' && !adminOnly && (
                    <FormField label="Full name" name="name" value={form.name} onChange={handleChange} autoComplete="name" required />
                  )}
                  <FormField label="Gmail / Email" name="email" type="email" value={form.email} onChange={handleChange} autoComplete="email" required icon="mail" />
                  <FormField label="Password" name="password" type="password" value={form.password} onChange={handleChange} autoComplete={mode === 'register' ? 'new-password' : 'current-password'} minLength={8} maxLength={128} required icon="lock" />

                  {mode === 'register' && !adminOnly && (
                    <>
                      <FormField label="Delivery address" name="address" value={form.address} onChange={handleChange} autoComplete="street-address" required />
                      <div className="grid gap-4 sm:grid-cols-2">
                        <FormField label="Telephone number" name="phone" type="tel" value={form.phone} onChange={handleChange} autoComplete="tel" required />
                        <FormField label="NIC number" name="nic" value={form.nic} onChange={handleChange} autoComplete="off" required />
                      </div>
                      <p className="text-[11px] leading-5 text-velora-500">
                        Your NIC is stored in your private customer profile and is not included in order messages.
                      </p>
                    </>
                  )}

                  {error && <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium leading-5 text-rose-700">{error}</p>}

                  <button
                    type="submit"
                    disabled={busy}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#111111] px-5 py-3.5 text-xs font-bold uppercase tracking-[0.15em] text-white transition-colors hover:bg-velora-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <>{user ? 'Save details' : mode === 'register' && !adminOnly ? 'Create account' : 'Sign in'} <ArrowRight className="h-4 w-4" /></>}
                  </button>
                </form>
              )}

              {message && <p role="status" className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">{message}</p>}

              {!user && !adminOnly && (
                <p className="mt-5 text-center text-sm text-velora-600">
                  {mode === 'register' ? 'Already have an account?' : 'New to VELORA?'}{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode(mode === 'register' ? 'login' : 'register');
                      setError('');
                    }}
                    className="font-semibold text-velora-950 underline underline-offset-4"
                  >
                    {mode === 'register' ? 'Sign in' : 'Create account'}
                  </button>
                </p>
              )}

              {user && !adminOnly && profileComplete && (
                <Link to="/" className="mt-5 inline-flex w-full items-center justify-center text-xs font-semibold text-velora-600 hover:text-velora-950">
                  Continue shopping
                </Link>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}

function FormField({ label, name, type = 'text', value, onChange, icon, ...inputProps }) {
  const Icon = icon === 'mail' ? Mail : icon === 'lock' ? LockKeyhole : null;
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.13em] text-velora-700">{label}</span>
      <span className="relative block">
        {Icon && <Icon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-velora-400" />}
        <input
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          className={`w-full rounded-xl border border-velora-200 bg-white py-3 text-sm text-velora-950 outline-none transition-colors placeholder:text-velora-400 focus:border-velora-600 ${Icon ? 'pl-10 pr-4' : 'px-4'}`}
          {...inputProps}
        />
      </span>
    </label>
  );
}

function GoogleSignInButton({ clientId, disabled, onCredential, onError }) {
  const containerRef = useRef(null);
  const callbackRef = useRef(onCredential);
  const errorRef = useRef(onError);

  useEffect(() => {
    callbackRef.current = onCredential;
    errorRef.current = onError;
  }, [onCredential, onError]);

  useEffect(() => {
    let active = true;
    const renderGoogleButton = () => {
      if (!active || !containerRef.current || !window.google?.accounts?.id) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => {
          if (response.credential) callbackRef.current(response.credential);
          else errorRef.current('Google sign-in did not return a credential. Please try again.');
        }
      });
      window.google.accounts.id.renderButton(containerRef.current, {
        theme: 'outline',
        size: 'large',
        text: 'continue_with',
        shape: 'rectangular',
        width: Math.min(400, containerRef.current.clientWidth)
      });
    };

    if (window.google?.accounts?.id) {
      renderGoogleButton();
    } else {
      let script = document.getElementById('google-identity-services');
      if (!script) {
        script = document.createElement('script');
        script.id = 'google-identity-services';
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }
      script.addEventListener('load', renderGoogleButton);
      script.addEventListener('error', () => errorRef.current('Could not load Google sign-in. Check your internet connection and try again.'));
    }

    return () => {
      active = false;
    };
  }, [clientId]);

  return (
    <div
      ref={containerRef}
      aria-disabled={disabled}
      className={`flex min-h-11 justify-center overflow-hidden ${disabled ? 'pointer-events-none opacity-50' : ''}`}
    />
  );
}

export default function Account() {
  return <AccountForm />;
}

export function AdminLogin() {
  return <AccountForm adminOnly />;
}
