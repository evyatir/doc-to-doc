// /privacy — the privacy policy, set in the site's own type and palette.
import React, { useEffect } from 'react';
import Consent, { openConsent } from './Consent.jsx';

const home = import.meta.env.BASE_URL;
const EMAIL = 'Doctodocmentors@gmail.com';

const s = {
  page: { maxWidth: '44rem', margin: '0 auto', padding: '40px 20px 80px', fontFamily: 'var(--font-current-sans)', lineHeight: 1.7 },
  back: { display: 'inline-flex', gap: 8, color: 'var(--orange)', borderBottom: '1px solid', paddingBlock: 4, fontSize: '.9rem' },
  h1: { fontFamily: 'var(--font-current-editorial, "Cormorant Garamond", Georgia, serif)', fontWeight: 400, fontSize: 'clamp(2.4rem, 7vw, 3.6rem)', lineHeight: 1.05, margin: '28px 0 8px' },
  h2: { fontFamily: 'var(--font-current-editorial, "Cormorant Garamond", Georgia, serif)', fontWeight: 400, fontSize: '1.75rem', lineHeight: 1.15, margin: '40px 0 10px', color: 'var(--bayoux)' },
  h3: { fontSize: '1rem', fontWeight: 500, margin: '22px 0 6px' },
  p: { margin: '0 0 12px' },
  ul: { margin: '0 0 12px', paddingLeft: '1.2em', listStyle: 'disc' },
  tableWrap: { overflowX: 'auto', margin: '8px 0 16px' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '.9rem', minWidth: 520 },
  th: { textAlign: 'left', fontWeight: 500, padding: '8px 12px 8px 0', borderBottom: '1px solid var(--brown)' },
  td: { padding: '8px 12px 8px 0', borderBottom: '1px solid var(--border)', verticalAlign: 'top' },
  link: { color: 'var(--orange)', textDecoration: 'underline', textUnderlineOffset: 3 },
  btn: { color: 'var(--orange)', textDecoration: 'underline', textUnderlineOffset: 3, background: 'none', border: 0, padding: 0, font: 'inherit', cursor: 'pointer' },
};

function Table({ head, rows }) {
  return (
    <div style={s.tableWrap}>
      <table style={s.table}>
        <thead><tr>{head.map((h) => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
        <tbody>{rows.map((r) => <tr key={r[0]}>{r.map((c, i) => <td key={i} style={s.td}>{c}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}

export default function Privacy() {
  useEffect(() => {
    document.title = 'Privacy policy — Doc. to Doc.';
    window.scrollTo(0, 0);
  }, []);
  const mail = <a style={s.link} href={`mailto:${EMAIL}`}>{EMAIL}</a>;

  return (
    <>
      <main id="main" style={s.page}>
        <a href={home} style={s.back}>← Doc. to Doc.</a>
        <h1 style={s.h1}>Privacy policy</h1>
        <p style={{ ...s.p, color: 'var(--bayoux)' }}>Effective 10 October 2026</p>
        <p style={s.p}>This policy explains what personal data Doc. to Doc. collects on doctodocmentors.com, why, and what you can do about it. It is short because we collect very little.</p>

        <h2 style={s.h2}>Who we are</h2>
        <p style={s.p}>Doc. to Doc. is a mentoring service for people applying to medical school in Europe. The team is based in Prague, Czech Republic.</p>
        <ul style={s.ul}>
          <li><b>Data controller:</b> Gal Yahav, <a style={s.link} href="mailto:galidoyahav@gmail.com">galidoyahav@gmail.com</a></li>
          <li><b>Privacy questions:</b> {mail}</li>
        </ul>

        <h2 style={s.h2}>What we collect</h2>
        <h3 style={s.h3}>When you book a call</h3>
        <p style={s.p}>The booking calendar shows our free times and lets you book a free 30-minute introductory call. We receive the time you choose, your name, your email address, your time zone, and anything you write about where you are in your journey. Bookings are handled by Cal.com, which checks our calendar and sends the invitation to you and to us. The call itself takes place on Google Meet, and the invitation contains the Meet link. We also keep a copy of each booking in our own database so we can follow up.</p>
        <h3 style={s.h3}>The 12-second survey</h3>
        <p style={s.p}>About 10 minutes after you book, we email you a two-question survey: when you would like to start medical school and where you hope to study. Answering is optional. Your answers are stored with your booking so we can prepare for the call. The email is sent through Resend.</p>
        <h3 style={s.h3}>When you email us</h3>
        <p style={s.p}>We receive what you choose to send, usually your name and email address and your question. Your message reaches us through Gmail.</p>
        <h3 style={s.h3}>When you browse the site, only if you accept cookies</h3>
        <p style={s.p}>We use Google Analytics 4 to understand how visitors find and use the site. It runs only after you click <b>Accept</b> on the cookie banner. It records pages viewed, approximate location (country or city), device and browser, how you reached the site, and clicks on the booking button, our email address and our Instagram link.</p>
        <p style={s.p}>Google Analytics 4 does not store IP addresses. We do not use it for advertising: ad storage, ad personalisation and ad data sharing are always off. If you click <b>Decline</b> or make no choice, no analytics cookies are set. Google may still receive basic cookieless signals, such as that a page loaded, with no identifier that links visits together.</p>
        <h3 style={s.h3}>What our hosting providers see</h3>
        <p style={s.p}>Like any website, the servers that deliver this site receive technical data such as your IP address and browser type in order to send you the page.</p>

        <h2 style={s.h2}>Cookies and local storage</h2>
        <Table head={['Name', 'Purpose', 'When', 'Kept for']} rows={[
          ['_ga', 'Google Analytics: tells visits from the same browser apart', 'Only after you accept', '2 years'],
          ['_ga_<ID>', 'Google Analytics: keeps session state', 'Only after you accept', '2 years'],
          ['dtd-consent (local storage)', 'Remembers your Accept or Decline choice', 'After you choose', 'Until you clear browser data'],
        ]} />
        <p style={s.p}>You can change your choice at any time: <button type="button" style={s.btn} onClick={openConsent}>open cookie settings</button>. Withdrawing consent does not affect data collected while consent was given.</p>

        <h2 style={s.h2}>Why we use your data</h2>
        <Table head={['Purpose', 'Legal basis (GDPR)']} rows={[
          ['Booking and holding your introductory call, replying to your email', 'Steps at your request before an agreement (Art. 6(1)(b)) and our legitimate interest in answering enquiries (Art. 6(1)(f))'],
          ['Mentoring you, if you become a client', 'Performance of our agreement (Art. 6(1)(b))'],
          ['Website analytics', 'Your consent (Art. 6(1)(a))'],
        ]} />

        <h2 style={s.h2}>Who processes data for us</h2>
        <p style={s.p}>We do not sell your data or share it for anyone’s marketing. These providers process data on our behalf:</p>
        <Table head={['Provider', 'What for']} rows={[
          ['Google LLC / Google Ireland Ltd', 'Google Analytics, Gmail, Google Calendar and Google Meet (video calls)'],
          ['Cal.com, Inc.', 'Booking calendar and call invitations'],
          ['Resend, Inc.', 'Sending the survey email (EU region)'],
          ['Render Services, Inc.', 'Our booking records server'],
          ['Neon, Inc.', 'Our booking records database (EU, Frankfurt)'],
          ['GitHub, Inc.', 'Website hosting (GitHub Pages)'],
          ['Cloudflare, Inc.', 'Domain name and DNS'],
        ]} />
        <p style={s.p}>Some of these providers are in the United States. Transfers rely on the EU-US Data Privacy Framework, for which they are certified, and on the European Commission’s Standard Contractual Clauses where applicable.</p>

        <h2 style={s.h2}>How long we keep data</h2>
        <ul style={s.ul}>
          <li><b>Analytics:</b> 14 months, after which Google deletes it.</li>
          <li><b>Bookings:</b> as long as needed to hold the call and follow up, and no later than 24 months after our last contact.</li>
          <li><b>Emails:</b> as long as needed to answer you and, if you become a client, for the mentoring. We delete correspondence no later than 24 months after our last contact, unless the law requires longer.</li>
        </ul>

        <h2 style={s.h2}>Your rights</h2>
        <p style={s.p}>Under the GDPR you can access, correct or delete your data, restrict or object to how we use it, receive it in a portable format, and withdraw consent for analytics at any time. Email {mail} and we will reply within one month.</p>
        <p style={s.p}>You can also complain to the Czech Office for Personal Data Protection (ÚOOÚ) at <a style={s.link} href="https://uoou.gov.cz" target="_blank" rel="noopener noreferrer">uoou.gov.cz</a>, or to the authority in your own EU country.</p>

        <h2 style={s.h2}>Children</h2>
        <p style={s.p}>Our services are for people aged 16 and over. If you are younger, please ask a parent or guardian to contact us with you.</p>

        <h2 style={s.h2}>Links and changes</h2>
        <p style={s.p}>Our site links to Instagram, where Instagram’s own privacy policy applies. If we change this policy, we will update the date at the top of this page.</p>
      </main>
      <Consent />
    </>
  );
}
