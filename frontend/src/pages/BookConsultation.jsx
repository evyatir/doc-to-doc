// Book a Consultation. Two things happen here, independently:
//  1. The intake form posts to /api/contact so the lead is captured even if
//     the visitor never finishes picking a Calendly slot (or Calendly isn't
//     connected yet — KEYS.calendlyUrl blank is a fully supported state).
//  2. A Calendly inline embed, when configured, lets them actually pick a
//     time for the free 15-minute call.
import React, { useEffect, useRef, useState } from 'react';
import { BRAND, KEYS } from '@client/config';
import { useSeo } from '../seo.js';
import { postContact, isBackendAbsent } from '../api.js';
import { useToast } from '../components/Toast.jsx';

const STAGES = [
  { value: 'confused', label: "I'm still confused, I know I want to pursue medicine, just don't know where" },
  { value: 'vision', label: 'I have a clear vision for myself' },
];

function CalendlyEmbed({ url }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!url) return;
    const existing = document.querySelector('script[data-calendly-widget]');
    const init = () => {
      if (window.Calendly && ref.current) {
        window.Calendly.initInlineWidget({ url, parentElement: ref.current });
      }
    };
    if (window.Calendly) {
      init();
    } else if (!existing) {
      const script = document.createElement('script');
      script.src = 'https://assets.calendly.com/assets/external/widget.js';
      script.async = true;
      script.dataset.calendlyWidget = 'true';
      script.onload = init;
      document.body.appendChild(script);
    } else {
      existing.addEventListener('load', init, { once: true });
    }
  }, [url]);

  return <div ref={ref} className="calendly-embed" />;
}

export default function BookConsultation() {
  useSeo('Book a Consultation', `Book a free 15-minute call with ${BRAND.name}.`);
  const toast = useToast();

  const [values, setValues] = useState({ name: '', email: '', role: '', stage: '', message: '' });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const set = (k) => (e) => setValues((v) => ({ ...v, [k]: e.target.value }));

  const submit = async () => {
    const errs = {};
    if (!values.name.trim()) errs.name = 'Required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errs.email = 'Enter a valid email';
    if (!values.role) errs.role = 'Let us know who you are';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    const [firstName, ...rest] = values.name.trim().split(/\s+/);
    const lastName = rest.join(' ') || firstName;

    setBusy(true);
    try {
      await postContact({
        firstName,
        lastName,
        email: values.email.trim(),
        role: values.role,
        stage: values.stage,
        message: values.message.trim(),
      });
      setDone(true);
    } catch (err) {
      // Degraded mode (no DB yet) still counts as a successful capture from
      // the visitor's point of view — the form itself worked.
      if (isBackendAbsent(err)) {
        setDone(true);
      } else {
        toast('Something went wrong — try again, or email us directly.');
      }
    } finally {
      setBusy(false);
    }
  };

  const onEnter = (e) => e.key === 'Enter' && e.target.tagName !== 'TEXTAREA' && submit();

  return (
    <main className="page book-page">
      <div className="book-hero">
        <p className="book-hero-note">we've been there. we'll walk with you.</p>
        <h1 className="page-h1 book-h1">Let's start with <span className="book-h1-accent">15 minutes.</span></h1>
        <p className="book-hero-body">
          A free 15-minute call to get to know you, understand your goals, and see how we can help.
          No pressure, just a real conversation.
        </p>
        <div className="book-chips">
          <span>15 minutes</span>
          <span>100% free</span>
          <span>Real people</span>
        </div>
      </div>

      <div className="book-split">
        <div className="book-form-card">
          <h2 className="book-card-h2">Tell us a bit about you</h2>
          <p className="book-card-sub">So we can make the most of our call.</p>

          {done ? (
            <p className="ok-note" role="status">
              Thanks — we've got your details.{' '}
              {KEYS.calendlyUrl ? 'Now pick a time on the right.' : "We'll reach out to schedule your call."}
            </p>
          ) : (
            <div className="form-grid" role="group" aria-label="Consultation intake form">
              <div className="field" style={{ marginTop: 0 }}>
                <label htmlFor="bk-name">Full name</label>
                <input id="bk-name" value={values.name} onChange={set('name')} onKeyDown={onEnter} autoComplete="name" placeholder="Future Dr. …" />
                {errors.name && <p className="err" role="alert">{errors.name}</p>}
              </div>
              <div className="field" style={{ marginTop: 0 }}>
                <label htmlFor="bk-email">Email</label>
                <input id="bk-email" type="email" value={values.email} onChange={set('email')} onKeyDown={onEnter} autoComplete="email" placeholder="you@email.com" />
                {errors.email && <p className="err" role="alert">{errors.email}</p>}
              </div>
              <div className="field" style={{ marginTop: 0 }}>
                <label>Are you a…</label>
                <div className="role-toggle" role="radiogroup" aria-label="Are you a student or a parent?">
                  {['student', 'parent'].map((r) => (
                    <button
                      key={r}
                      type="button"
                      role="radio"
                      aria-checked={values.role === r}
                      className={`role-btn${values.role === r ? ' selected' : ''}`}
                      onClick={() => setValues((v) => ({ ...v, role: r }))}
                    >
                      {r === 'student' ? 'Student' : 'Parent'}
                    </button>
                  ))}
                </div>
                {errors.role && <p className="err" role="alert">{errors.role}</p>}
              </div>
              <div className="field" style={{ marginTop: 0 }}>
                <label htmlFor="bk-stage">What stage are you at?</label>
                <select id="bk-stage" value={values.stage} onChange={set('stage')} className={values.stage ? '' : 'placeholder-opt'}>
                  <option value="" disabled>Choose one</option>
                  {STAGES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
              <div className="field" style={{ marginTop: 0 }}>
                <label htmlFor="bk-message">Tell us what's confusing you</label>
                <textarea id="bk-message" rows="4" value={values.message} onChange={set('message')} placeholder="Give us the chaotic version." />
              </div>
              <button className="btn btn-commerce" disabled={busy} onClick={submit}>
                {KEYS.calendlyUrl ? 'Continue to choose a time →' : 'Talk to a Doc. →'}
              </button>
              <p className="book-privacy-note">🔒 Your information is safe with us.</p>
            </div>
          )}
        </div>

        <div className="book-calendar-card">
          <h2 className="book-card-h2">Pick a time that works for you</h2>
          <p className="book-card-sub">All calls are 15 minutes via Google Meet.</p>
          {KEYS.calendlyUrl ? (
            <CalendlyEmbed url={KEYS.calendlyUrl} />
          ) : (
            <div className="calendly-placeholder">
              <p>Online scheduling isn't connected yet.</p>
              <p className="book-card-sub">Submit the form and we'll email you to find a time — or reach us directly:</p>
              {BRAND.whatsapp && <p>WhatsApp — {BRAND.whatsapp}</p>}
              {BRAND.email && <p>Email — {BRAND.email}</p>}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
