// Applicant sign-up / login: email+password, or "Sign in with Google" when
// KEYS.googleClientId is set (blank -> button just doesn't render, same
// pattern as every other optional integration in config).
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BRAND, KEYS } from '@client/config';
import { useSeo } from '../seo.js';
import { useToast } from '../components/Toast.jsx';
import { ApiError } from '../api.js';
import { signup, login, loginWithGoogle, isSignedIn, logout, fetchMe } from '../clientAuth.js';

function GoogleButton({ onCredential }) {
  const ref = useRef(null);
  const clientId = KEYS.googleClientId;

  useEffect(() => {
    if (!clientId) return;
    let cancelled = false;

    function render() {
      if (cancelled || !window.google || !ref.current) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (resp) => onCredential(resp.credential),
      });
      window.google.accounts.id.renderButton(ref.current, {
        theme: 'outline',
        size: 'large',
        width: 320,
      });
    }

    if (window.google?.accounts?.id) {
      render();
    } else {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.onload = render;
      document.head.appendChild(script);
    }
    return () => { cancelled = true; };
  }, [clientId, onCredential]);

  if (!clientId) return null;
  return <div ref={ref} style={{ display: 'flex', justifyContent: 'center', margin: '16px 0' }} />;
}

export default function SignUp() {
  useSeo('Sign Up', `Create your ${BRAND.name} account`);
  const navigate = useNavigate();
  const toast = useToast();
  const [mode, setMode] = useState('signup'); // 'signup' | 'login'
  const [values, setValues] = useState({ name: '', email: '', phone: '', password: '' });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [account, setAccount] = useState(undefined); // undefined = loading, null = signed out

  useEffect(() => {
    if (!isSignedIn()) { setAccount(null); return; }
    fetchMe().then(setAccount).catch(() => { logout(); setAccount(null); });
  }, []);

  const set = (k) => (e) => setValues((v) => ({ ...v, [k]: e.target.value }));

  const handleCredential = async (credential) => {
    setBusy(true);
    try {
      await loginWithGoogle(credential);
      toast('Signed in with Google');
      navigate('/');
    } catch {
      toast('Google sign-in failed, please try again');
    } finally {
      setBusy(false);
    }
  };

  const submit = async () => {
    const errs = {};
    if (mode === 'signup' && !values.name.trim()) errs.name = 'Required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errs.email = 'Enter a valid email';
    if (mode === 'signup' && !values.phone.trim()) errs.phone = "Required — so we can call you back";
    if (!values.password) errs.password = 'Required';
    else if (mode === 'signup' && values.password.length < 8) errs.password = 'At least 8 characters';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setBusy(true);
    try {
      if (mode === 'signup') {
        await signup({ name: values.name.trim(), email: values.email.trim(), phone: values.phone.trim(), password: values.password });
        toast('Account created');
      } else {
        await login(values.email.trim(), values.password);
        toast('Signed in');
      }
      navigate('/');
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 409) setErrors({ email: 'An account with this email already exists' });
        else if (err.status === 401) setErrors({ password: 'Invalid email or password' });
        else if (err.status === 503) toast('Sign-up is not available yet — please use the contact form instead');
        else setErrors(err.body?.fields ? Object.fromEntries(Object.entries(err.body.fields).map(([k, v]) => [k, v[0]])) : {});
      }
    } finally {
      setBusy(false);
    }
  };

  const onEnter = (e) => e.key === 'Enter' && submit();

  if (account === undefined) return <main className="page" style={{ maxWidth: 480 }} />;

  if (account) {
    return (
      <main className="page" style={{ maxWidth: 480 }}>
        <h1 className="page-h1">Your Account</h1>
        <p style={{ marginTop: 16 }}>Signed in as <b>{account.name}</b> ({account.email}).</p>
        <button className="btn" style={{ marginTop: 24 }} onClick={() => { logout(); setAccount(null); }}>
          Sign out
        </button>
      </main>
    );
  }

  return (
    <main className="page" style={{ maxWidth: 480 }}>
      <h1 className="page-h1">{mode === 'signup' ? 'Create Your Account' : 'Welcome Back'}</h1>
      <p style={{ marginTop: 12 }}>
        {mode === 'signup'
          ? 'Sign up to start with a mentor — leave your phone number and we will call you back.'
          : 'Log in to your Doc. to Doc. account.'}
      </p>

      <GoogleButton onCredential={handleCredential} />

      <div className="form-grid" role="group" aria-label={mode === 'signup' ? 'Sign up form' : 'Log in form'} style={{ marginTop: 16 }}>
        {mode === 'signup' && (
          <div className="field" style={{ marginTop: 0 }}>
            <label htmlFor="su-name">Full Name</label>
            <input id="su-name" value={values.name} onChange={set('name')} onKeyDown={onEnter} autoComplete="name" />
            {errors.name && <p className="err" role="alert">{errors.name}</p>}
          </div>
        )}
        <div className="field" style={{ marginTop: 0 }}>
          <label htmlFor="su-email">Email</label>
          <input id="su-email" type="email" value={values.email} onChange={set('email')} onKeyDown={onEnter} autoComplete="email" />
          {errors.email && <p className="err" role="alert">{errors.email}</p>}
        </div>
        {mode === 'signup' && (
          <div className="field" style={{ marginTop: 0 }}>
            <label htmlFor="su-phone">Phone — we'll call you back</label>
            <input id="su-phone" type="tel" value={values.phone} onChange={set('phone')} onKeyDown={onEnter} autoComplete="tel" />
            {errors.phone && <p className="err" role="alert">{errors.phone}</p>}
          </div>
        )}
        <div className="field" style={{ marginTop: 0 }}>
          <label htmlFor="su-password">Password</label>
          <input id="su-password" type="password" value={values.password} onChange={set('password')} onKeyDown={onEnter} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} />
          {errors.password && <p className="err" role="alert">{errors.password}</p>}
        </div>
        <button className="btn btn-commerce" disabled={busy} onClick={submit}>
          {mode === 'signup' ? 'Sign Up' : 'Log In'}
        </button>
      </div>

      <p style={{ marginTop: 20, textAlign: 'center' }}>
        {mode === 'signup' ? 'Already have an account? ' : 'New here? '}
        <button className="btn-link" onClick={() => { setMode(mode === 'signup' ? 'login' : 'signup'); setErrors({}); }}>
          {mode === 'signup' ? 'Log in' : 'Sign up'}
        </button>
      </p>
    </main>
  );
}
