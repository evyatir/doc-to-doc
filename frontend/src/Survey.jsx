// /survey — two-question follow-up sent by email ~10 minutes after a lead
// books an intro call. Set in the site's type and palette. Not wired yet:
// submit() only logs; the backend (and matching the answers to the booking,
// via ?b=<cal booking uid>) comes later.
import React, { useState } from 'react';
import { useSeo } from './seo.js';

const home = import.meta.env.BASE_URL;

// The next three intakes (medical school starts in September), then "later".
const thisYear = new Date().getFullYear();
const firstIntake = new Date().getMonth() >= 8 ? thisYear + 1 : thisYear;
const YEARS = [firstIntake, firstIntake + 1, firstIntake + 2].map(String).concat('Later / not sure yet');

const COUNTRIES = ['Czech Republic', 'Poland', 'Hungary', 'Italy', 'Romania', 'Bulgaria', 'Slovakia', 'Another European country', 'I’m not sure yet'];

const STEPS = [
  { key: 'startYear', title: 'In what year would you like to start medical school?', options: YEARS },
  { key: 'country', title: 'Where are you hoping to study medicine?', options: COUNTRIES },
];

async function submit(answers) {
  const booking = new URLSearchParams(window.location.search).get('b');
  // TODO(backend): POST { booking, ...answers } to the API.
  console.info('[survey] answers', { booking, ...answers });
}

function Choice({ label, selected, onSelect }) {
  return (
    <button type="button" role="radio" aria-checked={selected} className={`sv-choice ${selected ? 'is-on' : ''}`} onClick={onSelect}>
      <span className="sv-dot" aria-hidden="true" />
      <span>{label}</span>
    </button>
  );
}

export default function Survey() {
  useSeo('A quick question', 'Help us prepare for your introductory call');
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const current = STEPS[step];
  const value = current && answers[current.key];
  const last = step === STEPS.length - 1;

  const next = async () => {
    if (!value) return;
    if (!last) return setStep(step + 1);
    setBusy(true);
    await submit(answers);
    setDone(true);
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
            <p className="sv-mark">✓</p>
            <h1 className="sv-title">Thank you.</h1>
            <p className="sv-lead">That helps us make your introductory call as useful as possible. See you soon.</p>
            <a className="sv-link" href={home}>Back to Doc. to Doc.</a>
          </div>
        ) : (
          <>
            <div className="sv-progress" aria-label={`Question ${step + 1} of ${STEPS.length}`}>
              <span>{step + 1} of {STEPS.length}</span>
              <div className="sv-bar"><div style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} /></div>
            </div>
            <p className="sv-eyebrow">BEFORE WE MEET</p>
            <h1 className="sv-title">{current.title}</h1>
            <div className="sv-grid" role="radiogroup" aria-label={current.title}>
              {current.options.map((o) => (
                <Choice key={o} label={o} selected={value === o}
                  onSelect={() => setAnswers({ ...answers, [current.key]: o })} />
              ))}
            </div>
            <div className="sv-actions">
              {step > 0
                ? <button type="button" className="sv-link" onClick={() => setStep(step - 1)}>← Back</button>
                : <span />}
              <button type="button" className="sv-next" disabled={!value || busy} onClick={next}>
                {last ? (busy ? 'Sending…' : 'Send') : 'Next'}
              </button>
            </div>
          </>
        )}
      </section>
      <p className="sv-foot">Takes under a minute · Doc. to Doc.</p>
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
.sv-title{font-family:"Cormorant Garamond",Georgia,serif;font-weight:400;font-size:clamp(1.9rem,4.6vw,2.6rem);line-height:1.08;margin-bottom:28px}
.sv-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.sv-choice{display:flex;align-items:center;gap:18px;min-height:64px;padding:14px 22px;background:#fff;border:1px solid #e6e1d9;border-radius:22px;font:inherit;font-size:1.05rem;color:#1f2a33;text-align:left;cursor:pointer;transition:border-color .15s,box-shadow .15s,transform .1s}
.sv-choice:hover{border-color:#b9c6cd}
.sv-choice:active{transform:scale(.99)}
.sv-choice:focus-visible{outline:2px solid #496677;outline-offset:2px}
.sv-choice.is-on{border-color:#496677;box-shadow:0 0 0 1px #496677 inset}
.sv-dot{flex:0 0 auto;width:24px;height:24px;border-radius:50%;border:2px solid #dcd7cf;position:relative;transition:border-color .15s}
.sv-choice.is-on .sv-dot{border-color:#496677}
.sv-choice.is-on .sv-dot::after{content:"";position:absolute;inset:4px;border-radius:50%;background:#496677}
.sv-actions{display:flex;justify-content:space-between;align-items:center;margin-top:28px}
.sv-next{background:#496677;color:#fff;border:0;border-radius:999px;padding:14px 34px;font:inherit;font-size:1rem;cursor:pointer;transition:opacity .15s}
.sv-next:disabled{opacity:.35;cursor:default}
.sv-link{background:none;border:0;padding:0;font:inherit;font-size:.95rem;color:#496677;cursor:pointer;text-decoration:underline;text-underline-offset:3px}
.sv-done{text-align:center;padding:24px 0 8px}
.sv-mark{font-size:2.2rem;color:#496677}
.sv-lead{max-width:30rem;margin:0 auto 22px;line-height:1.6;color:#3d4a53}
.sv-foot{margin-top:18px;font-size:.78rem;color:#8a949b}
@media (max-width:600px){.sv-card{padding:26px 18px 20px;border-radius:22px}.sv-grid{grid-template-columns:1fr}.sv-choice{min-height:56px;font-size:1rem}}
`;
