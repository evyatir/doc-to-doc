// Outgoing email through Resend (https://resend.com/docs/api-reference).
// Only the survey email for now. RESEND_API_KEY unset = email is off: every
// call resolves to null and nothing is sent.
const API = process.env.RESEND_API_URL || 'https://api.resend.com'; // override = tests only
const FROM = process.env.EMAIL_FROM || 'Virginia from Doc. to Doc. <virginia@doctodocmentors.com>';
const REPLY_TO = process.env.EMAIL_REPLY_TO || 'Doctodocmentors@gmail.com';
const SITE = process.env.SITE_URL || 'https://doctodocmentors.com';
const TEAM = process.env.TEAM_EMAIL || 'Doctodocmentors@gmail.com';

async function resend(path, body) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  const res = await fetch(`${API}${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`Resend ${path} ${res.status}: ${data.message || ''}`);
  return data;
}

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// A personal note from Virginia: short text, one quiet button, her signature
// with photo. Kept light on purpose: heavy "newsletter" layouts get filed
// under Gmail's Promotions tab.
function surveyHtml(firstName, link) {
  const photo = `${SITE}/assets/email/virginia.jpg`;
  return `<!doctype html><html><body style="margin:0;padding:0;background:#ffffff">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:28px 20px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;font-family:Helvetica,Arial,sans-serif;color:#1f2a33;font-size:16px;line-height:1.6">
<tr><td>
<p style="margin:0 0 16px">Hi ${esc(firstName)},</p>
<p style="margin:0 0 16px">Thanks for booking your free introductory call. We're looking forward to meeting you.</p>
<p style="margin:0 0 24px">To make the most of our time together, could you answer two quick questions? It takes about 12 seconds.</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 28px"><tr><td style="border-radius:999px;background:#496677">
<a href="${link}" style="display:inline-block;padding:13px 26px;color:#ffffff;text-decoration:none;font-size:15px;font-weight:bold">Answer 2 quick questions &rarr;</a>
</td></tr></table>
<p style="margin:0 0 20px">See you soon,</p>
<table role="presentation" cellpadding="0" cellspacing="0"><tr>
<td style="padding-right:14px;vertical-align:top"><img src="${photo}" width="64" height="64" alt="Virginia Pincelli" style="display:block;border-radius:50%;width:64px;height:64px"></td>
<td style="vertical-align:top;font-size:14px;line-height:1.45">
<div style="font-size:16px;font-weight:bold;color:#1f2a33">Virginia Pincelli</div>
<div style="color:#496677">Doctor &middot; Mentor at Doc. to Doc.</div>
<div style="color:#6b7780">First Faculty of Medicine, Charles University, Prague</div>
<div style="margin-top:4px"><a href="${SITE}" style="color:#496677;text-decoration:none">doctodocmentors.com</a></div>
</td></tr></table>
</td></tr></table>
</td></tr></table></body></html>`;
}

// Sends the survey email right away, or `delayMin` minutes from now when
// SURVEY_DELAY_MIN is set. Resolves with the Resend email id (a scheduled one
// can be cancelled), or null when email is off.
export async function scheduleSurveyEmail({ to, name, bookingUid, delayMin = Number(process.env.SURVEY_DELAY_MIN) || 0 }) {
  const link = `${SITE}/survey?b=${encodeURIComponent(bookingUid)}`;
  const firstName = (name || '').trim().split(/\s+/)[0] || 'there';
  const data = await resend('/emails', {
    from: FROM,
    to: [to],
    reply_to: REPLY_TO,
    subject: 'Quick question before our call',
    html: surveyHtml(firstName, link),
    text: `Hi ${firstName},\n\nThanks for booking your free introductory call. We're looking forward to meeting you.\n\nTo make the most of our time together, could you answer two quick questions? It takes about 12 seconds:\n${link}\n\nSee you soon,\nVirginia Pincelli\nDoctor · Mentor at Doc. to Doc.\ndoctodocmentors.com`,
    ...(delayMin > 0 ? { scheduled_at: new Date(Date.now() + delayMin * 60000).toISOString() } : {}),
  });
  return data?.id || null;
}

// Tells the team a lead answered the survey. `lead` = the booking row, or
// null when the survey was opened without a booking link. Reply-To is the
// lead, so hitting Reply in Gmail answers them directly.
export async function sendSurveyAnswers({ lead, startYears, countries }) {
  const when = lead?.starts_at
    ? new Date(lead.starts_at).toLocaleString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Prague' }) + ' (Prague)'
    : null;
  const rows = [
    ['Lead', lead ? `${lead.name} <${lead.email}>` : 'Unknown (no booking link)'],
    ...(when ? [['Call', when]] : []),
    ['Wants to start', startYears.join(', ')],
    ['Hoping to study in', countries.join(', ')],
  ];
  return resend('/emails', {
    from: FROM,
    to: [TEAM],
    ...(lead?.email ? { reply_to: lead.email } : {}),
    subject: `Survey answers: ${lead?.name || 'a lead'}`,
    html: `<div style="font-family:Arial,Helvetica,sans-serif;color:#1f2a33;font-size:15px;line-height:1.6">
<p style="margin:0 0 12px"><b>${esc(lead?.name || 'A lead')}</b> answered the 12-second survey.</p>
<table cellpadding="6" style="border-collapse:collapse">${rows.map(([k, v]) => `<tr><td style="color:#6b7780;padding-right:16px">${esc(k)}</td><td>${esc(v)}</td></tr>`).join('')}</table>
<p style="margin:16px 0 0;color:#8a949b;font-size:12px">All calls: ${SITE}/admin</p></div>`,
    text: rows.map(([k, v]) => `${k}: ${v}`).join('\n'),
  });
}

export async function cancelEmail(id) {
  if (!id) return;
  await resend(`/emails/${encodeURIComponent(id)}/cancel`);
}
