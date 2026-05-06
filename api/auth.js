// Validates the access password against the SITE_PASSWORD environment variable.
// Returns { ok: true } on match, 401 with { ok: false } otherwise.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const expected = process.env.SITE_PASSWORD;
  if (!expected) {
    return res.status(500).json({ ok: false, error: 'Server is missing SITE_PASSWORD configuration.' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  const submitted = (body && body.pw) ? String(body.pw) : '';

  // Constant-time-ish comparison
  if (submitted.length !== expected.length) {
    return res.status(401).json({ ok: false });
  }
  let diff = 0;
  for (let i = 0; i < submitted.length; i++) {
    diff |= submitted.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  if (diff !== 0) {
    return res.status(401).json({ ok: false });
  }

  return res.status(200).json({ ok: true });
}
