// /survey — the 12-second survey, emailed right after a lead books an
// intro call (backend/email.js). ?b=<cal booking uid> ties the answers to the
// booking; they show next to the call in /admin.
import React, { useEffect, useState } from 'react';
import { useSeo } from './seo.js';

const home = import.meta.env.BASE_URL;

// The next three intakes (medical school starts in September), then "later".
const thisYear = new Date().getFullYear();
const firstIntake = new Date().getMonth() >= 8 ? thisYear + 1 : thisYear;
const YEARS = [firstIntake, firstIntake + 1, firstIntake + 2].map(String).concat('Later / not sure yet');

const COUNTRIES = ['Czech Republic', 'Poland', 'Hungary', 'Italy', 'Romania', 'Bulgaria', 'Slovakia', 'Another European country', 'I’m not sure yet'];

// Both questions take several answers. The "not sure" option is exclusive:
// picking it clears the others, and picking anything else clears it.
const STEPS = [
  { key: 'startYears', title: 'In what year would you like to start medical school?', options: YEARS, unsure: YEARS.at(-1) },
  { key: 'countries', title: 'Where are you hoping to study medicine?', options: COUNTRIES, unsure: COUNTRIES.at(-1) },
];

function toggle(list, option, unsure) {
  if (list.includes(option)) return list.filter((o) => o !== option);
  if (option === unsure) return [option];
  return list.filter((o) => o !== unsure).concat(option);
}

const API_BASE = import.meta.env.VITE_API_URL || '';

const BOOKING = new URLSearchParams(window.location.search).get('b');
// One answer per booking (the server enforces it); without a booking link,
// one per browser.
const DONE_KEY = `dtd-survey-${BOOKING || 'direct'}`;
const doneHere = () => { try { return localStorage.getItem(DONE_KEY) === '1'; } catch { return false; } };
const markDone = () => { try { localStorage.setItem(DONE_KEY, '1'); } catch { /* private mode */ } };

async function submit(answers) {
  const booking = BOOKING;
  const res = await fetch(`${API_BASE}/api/survey`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ booking, ...answers }),
  });
  if (res.status === 409) return 'already';
  if (!res.ok) throw new Error(`survey ${res.status}`);
  return 'saved';
}

// Stethoscope drawn in on load (the tubing traces itself, then the chest
// piece settles), as in the questionnaire Evyatar liked.
function Stethoscope({ className = '' }) {
  return (
    <svg className={`sv-steth ${className}`} viewBox="0 0 120 120" width="120" height="120" aria-hidden="true">
      <g fill="none" stroke="#3a4249" strokeLinecap="round" strokeLinejoin="round">
        <path className="sv-steth-metal" d="M30 14 C26 30 26 44 36 52 M58 14 C62 30 62 44 52 52" stroke="#9aa4ab" strokeWidth="3" />
        <circle cx="30" cy="12" r="3.2" fill="#3a4249" stroke="none" />
        <circle cx="58" cy="12" r="3.2" fill="#3a4249" stroke="none" />
        <path className="sv-steth-tube" pathLength="1" d="M36 52 C40 60 48 60 52 52 M44 58 C44 76 40 92 52 100 C64 108 80 98 76 84 C73 74 62 78 66 88 C69 95 80 96 86 90" strokeWidth="4.5" />
      </g>
      <g className="sv-steth-head">
        <circle cx="90" cy="88" r="11" fill="#5d666d" />
        <circle cx="90" cy="88" r="7.5" fill="#c9d0d4" />
        <circle cx="90" cy="88" r="3" fill="#8b959b" />
      </g>
    </svg>
  );
}

function Choice({ label, selected, onSelect }) {
  return (
    <button type="button" role="checkbox" aria-checked={selected} className={`sv-choice ${selected ? 'is-on' : ''}`} onClick={onSelect}>
      <span className="sv-box" aria-hidden="true">
        <svg viewBox="0 0 16 16" width="14" height="14"><path d="M3 8.5l3.2 3L13 4.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </span>
      <span>{label}</span>
    </button>
  );
}

export default function Survey() {
  useSeo('12-second survey', 'Help us prepare for your introductory call');
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(doneHere() ? 'already' : false);
  const [error, setError] = useState('');

  // Already answered from another device? Ask the server. This also wakes
  // the API (Render free tier sleeps) while they read the first question.
  useEffect(() => {
    const url = BOOKING ? `${API_BASE}/api/survey/${encodeURIComponent(BOOKING)}` : `${API_BASE}/api/health`;
    fetch(url).then((r) => r.json()).then((d) => { if (d.answered) setDone('already'); }).catch(() => {});
  }, []);

  const current = STEPS[step];
  const picked = (current && answers[current.key]) || [];
  const last = step === STEPS.length - 1;

  const next = async () => {
    if (!picked.length) return;
    if (!last) return setStep(step + 1);
    setBusy(true);
    setError('');
    try {
      setDone(await submit(answers));
      markDone();
    } catch {
      // Render's free tier can take ~50 s to wake; a retry usually works.
      setError('That didn’t go through. Please try again in a moment.');
      setBusy(false);
    }
  };

  return (
    <main className="sv-page">
      <style>{css}</style>
      <a href={home} className="sv-brand">
        <img src={`${home}assets/logo-header.webp`} width="562" height="409" alt="Doc. to Doc." />
      </a>

      <section className="sv-card" aria-live="polite">
        {done ? (
          <div className="sv-done">
            <Stethoscope className="is-done" />
            <h1 className="sv-title">{done === 'already' ? 'Already answered.' : 'Thank you.'}</h1>
            <p className="sv-lead">{done === 'already'
              ? 'We already have your answers, so there’s nothing more to do. See you on the call.'
              : 'That helps us make your introductory call as useful as possible. See you soon.'}</p>
            <a className="sv-link" href={home}>Back to Doc. to Doc.</a>
          </div>
        ) : (
          <>
            <div className="sv-progress" aria-label={`Question ${step + 1} of ${STEPS.length}`}>
              <span>{step + 1} of {STEPS.length}</span>
              <div className="sv-bar"><div style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} /></div>
            </div>
            <div className="sv-head">
              <p className="sv-eyebrow">12-SECOND SURVEY</p>
              {step === 0 && <Stethoscope />}
            </div>
            <h1 className="sv-title">{current.title}</h1>
            <p className="sv-hint">Choose all that apply.</p>
            <div className="sv-grid" role="group" aria-label={current.title}>
              {current.options.map((o) => (
                <Choice key={o} label={o} selected={picked.includes(o)}
                  onSelect={() => setAnswers({ ...answers, [current.key]: current.options.filter((x) => toggle(picked, o, current.unsure).includes(x)) })} />
              ))}
            </div>
            <div className="sv-actions">
              {step > 0
                ? <button type="button" className="sv-link" onClick={() => setStep(step - 1)}>← Back</button>
                : <span />}
              <button type="button" className="sv-next" disabled={!picked.length || busy} onClick={next}>
                {last ? (busy ? 'Sending…' : 'Send') : 'Next'}
              </button>
            </div>
            {error && <p className="sv-error" role="alert">{error}</p>}
          </>
        )}
      </section>
      <p className="sv-foot">12-second survey · Doc. to Doc.</p>
    </main>
  );
}

const css = `
.sv-page{min-height:100vh;background:radial-gradient(120% 80% at 50% 0%,#f7f5f1 0%,#efece6 60%,#e9eef0 100%);display:flex;flex-direction:column;align-items:center;padding:28px 16px 40px;font-family:"DM Sans",Arial,sans-serif;color:#1f2a33}
.sv-brand img{width:96px;height:auto;mix-blend-mode:multiply}
.sv-card{width:100%;max-width:760px;margin-top:24px;background:rgba(255,255,255,.55);border:1px solid #e6e1d9;border-radius:28px;padding:36px 36px 28px;box-shadow:0 24px 60px rgba(31,42,51,.06)}
.sv-progress{display:flex;align-items:center;gap:14px;font-size:.8rem;color:#6b7780;margin-bottom:28px}
.sv-bar{flex:1;height:4px;border-radius:4px;background:#e6e1d9;overflow:hidden}
.sv-bar div{height:100%;background:#496677;border-radius:4px;transition:width .35s ease}
.sv-eyebrow{font-family:"Archivo Black","DM Sans",sans-serif;font-size:.78rem;letter-spacing:.02em;color:#496677;margin-bottom:12px}
.sv-title{font-family:"Cormorant Garamond",Georgia,serif;font-weight:400;font-size:clamp(1.9rem,4.6vw,2.6rem);line-height:1.08;margin-bottom:10px}
.sv-hint{font-size:.9rem;color:#6b7780;margin-bottom:24px}
.sv-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.sv-choice{display:flex;align-items:center;gap:18px;min-height:64px;padding:14px 22px;background:#fff;border:1px solid #e6e1d9;border-radius:22px;font:inherit;font-size:1.05rem;color:#1f2a33;text-align:left;cursor:pointer;transition:border-color .15s,box-shadow .15s,transform .1s}
.sv-choice:hover{border-color:#b9c6cd}
.sv-choice:active{transform:scale(.99)}
.sv-choice:focus-visible{outline:2px solid #496677;outline-offset:2px}
.sv-choice.is-on{border-color:#496677;box-shadow:0 0 0 1px #496677 inset}
.sv-box{flex:0 0 auto;width:24px;height:24px;border-radius:7px;border:2px solid #dcd7cf;display:grid;place-items:center;color:transparent;transition:background .15s,border-color .15s}
.sv-choice.is-on .sv-box{background:#496677;border-color:#496677;color:#fff}
.sv-actions{display:flex;justify-content:space-between;align-items:center;margin-top:28px}
.sv-next{background:#496677;color:#fff;border:0;border-radius:999px;padding:14px 34px;font:inherit;font-size:1rem;cursor:pointer;transition:opacity .15s}
.sv-next:disabled{opacity:.35;cursor:default}
.sv-link{background:none;border:0;padding:0;font:inherit;font-size:.95rem;color:#496677;cursor:pointer;text-decoration:underline;text-underline-offset:3px}
.sv-error{margin-top:14px;color:#a0352b;font-size:.9rem;text-align:right}
.sv-done{text-align:center;padding:24px 0 8px}
.sv-head{display:flex;justify-content:space-between;align-items:flex-end;gap:12px;margin-bottom:6px}
.sv-steth{flex:0 0 auto;width:76px;height:76px;margin:-30px -8px 4px 0}
.sv-steth.is-done{width:110px;height:110px;margin:0 auto 4px;display:block}
.sv-steth-tube{stroke-dasharray:1;stroke-dashoffset:1;animation:sv-draw 1.4s .2s ease-out forwards}
.sv-steth-metal{opacity:0;animation:sv-fade .5s .1s ease-out forwards}
.sv-steth-head{transform-origin:90px 88px;transform:scale(0);animation:sv-pop .45s 1.3s cubic-bezier(.3,1.6,.5,1) forwards}
@keyframes sv-draw{to{stroke-dashoffset:0}}
@keyframes sv-fade{to{opacity:1}}
@keyframes sv-pop{to{transform:scale(1)}}
@media (prefers-reduced-motion:reduce){.sv-steth-tube,.sv-steth-metal,.sv-steth-head{animation:none;stroke-dashoffset:0;opacity:1;transform:none}}
.sv-lead{max-width:30rem;margin:0 auto 22px;line-height:1.6;color:#3d4a53}
.sv-foot{margin-top:18px;font-size:.78rem;color:#8a949b}
@media (max-width:600px){.sv-card{padding:26px 18px 20px;border-radius:22px}.sv-grid{grid-template-columns:1fr}.sv-choice{min-height:56px;font-size:1rem}}
`;
