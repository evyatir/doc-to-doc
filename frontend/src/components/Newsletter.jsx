import React, { useState } from 'react';
import { KEYS } from '@client/config';
import { postNewsletter } from '../api.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState('idle'); // idle | error | done

  const submit = () => {
    if (!EMAIL_RE.test(email)) { setState('error'); return; }
    // Fire-and-forget: the success state must not depend on the backend
    // being configured (degraded mode is a supported deployment).
    postNewsletter(email).catch(() => {});
    if (KEYS.newsletterEndpoint) {
      fetch(KEYS.newsletterEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      }).catch(() => {});
    }
    setState('done');
  };

  if (state === 'done') {
    return <div className="newsletter"><p>Thanks for subscribing. Talk soon!</p></div>;
  }
  return (
    <div className="newsletter">
      <h2>Join our newsletter for the best sales!</h2>
      <div className="newsletter-row">
        <input
          type="email"
          value={email}
          placeholder="Enter your email here…"
          aria-label="Email address"
          onChange={(e) => { setEmail(e.target.value); setState('idle'); }}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
        />
        <button className="btn" onClick={submit}>Join us!</button>
      </div>
      {state === 'error' && <p className="err" role="alert">Please enter a valid email.</p>}
    </div>
  );
}
