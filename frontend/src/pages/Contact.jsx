// Contact page. Per spec §8 the form is NOT a <form> element (divs + click
// handlers) — inputs stay real and labeled, Enter submits, so keyboard and AT
// behavior is preserved.
import React, { useState } from 'react';
import { BRAND } from '@client/config';
import { useSeo } from '../seo.js';
import { postContact } from '../api.js';
import Img from '../components/Img.jsx';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Contact() {
  useSeo('Contact', `Get in touch with ${BRAND.name}`);
  const [values, setValues] = useState({ first: '', last: '', email: '', phone: '', msg: '', news: false });
  const [errors, setErrors] = useState({});
  const [done, setDone] = useState(false);

  const set = (k) => (e) =>
    setValues((v) => ({ ...v, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const submit = () => {
    const errs = {};
    if (!values.first.trim()) errs.first = 'Required';
    if (!values.last.trim()) errs.last = 'Required';
    if (!EMAIL_RE.test(values.email)) errs.email = 'Enter a valid email';
    if (!values.phone.trim()) errs.phone = 'Required';
    if (!values.msg.trim()) errs.msg = 'Required';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    // Fire-and-forget: success state stays local so the page keeps working
    // when the backend is absent (degraded mode).
    postContact({
      firstName: values.first.trim(),
      lastName: values.last.trim(),
      email: values.email.trim(),
      phone: values.phone.trim(),
      message: values.msg.trim(),
      wantsNewsletter: values.news,
    }).catch(() => {});
    setDone(true);
  };
  const onEnter = (e) => e.key === 'Enter' && e.target.tagName !== 'TEXTAREA' && submit();

  return (
    <main>
      <div className="band band-hero-doc">
        <Img className="band-img" src="" alt="" label="Contact" />
        <div className="band-label">
          <h1 className="doc-h1">Contact Us</h1>
        </div>
      </div>

      <div className="page">
        <div className="contact-block">
          {BRAND.whatsapp && <p>WhatsApp — {BRAND.whatsapp}</p>}
          {BRAND.email && <p>Mail — {BRAND.email}</p>}
          {BRAND.address && <p>Address — {BRAND.address}</p>}
        </div>

        <h2 className="page-h1" style={{ fontSize: 'var(--fs-newsletter)' }}>
          We Want To Hear From You!
        </h2>

        {done ? (
          <p className="ok-note" role="status">Thanks for submitting! We'll get back to you soon.</p>
        ) : (
          <div className="form-grid" role="group" aria-label="Contact form">
            <div className="form-2col">
              <div className="field" style={{ marginTop: 0 }}>
                <label htmlFor="c-first">First Name</label>
                <input id="c-first" value={values.first} onChange={set('first')} onKeyDown={onEnter} autoComplete="given-name" />
                {errors.first && <p className="err" role="alert">{errors.first}</p>}
              </div>
              <div className="field" style={{ marginTop: 0 }}>
                <label htmlFor="c-last">Last Name</label>
                <input id="c-last" value={values.last} onChange={set('last')} onKeyDown={onEnter} autoComplete="family-name" />
                {errors.last && <p className="err" role="alert">{errors.last}</p>}
              </div>
            </div>
            <div className="form-2col">
              <div className="field" style={{ marginTop: 0 }}>
                <label htmlFor="c-email">Email</label>
                <input id="c-email" type="email" value={values.email} onChange={set('email')} onKeyDown={onEnter} autoComplete="email" />
                {errors.email && <p className="err" role="alert">{errors.email}</p>}
              </div>
              <div className="field" style={{ marginTop: 0 }}>
                <label htmlFor="c-phone">Phone — we'll call you back</label>
                <input id="c-phone" type="tel" value={values.phone} onChange={set('phone')} onKeyDown={onEnter} autoComplete="tel" />
                {errors.phone && <p className="err" role="alert">{errors.phone}</p>}
              </div>
            </div>
            <div className="field" style={{ marginTop: 0 }}>
              <label htmlFor="c-msg">Leave us a message...</label>
              <textarea id="c-msg" rows="5" value={values.msg} onChange={set('msg')} />
              {errors.msg && <p className="err" role="alert">{errors.msg}</p>}
            </div>
            <label className="checkline" htmlFor="c-news">
              <input id="c-news" type="checkbox" checked={values.news} onChange={set('news')} />
              I want to subscribe to the newsletter.
            </label>
            <button className="btn btn-commerce" onClick={submit}>Submit</button>
          </div>
        )}
      </div>
    </main>
  );
}
