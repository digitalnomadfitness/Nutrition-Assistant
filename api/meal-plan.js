// Secure proxy to the Anthropic API for the AI meal planner.
// - Validates the site password (sent in the x-dnf-pw header) before doing anything.
// - Calls Anthropic with the API key from environment variables (never exposed to the browser).

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 1. Verify the password
  const expected = process.env.SITE_PASSWORD;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!expected || !apiKey) {
    return res.status(500).json({ error: 'Server is not fully configured. Missing SITE_PASSWORD or ANTHROPIC_API_KEY.' });
  }

  const submitted = String(req.headers['x-dnf-pw'] || '');
  if (submitted !== expected) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // 2. Pull the prompt from the request
  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  const prompt = (body && body.prompt) ? String(body.prompt) : '';
  if (!prompt) {
    return res.status(400).json({ error: 'Missing prompt' });
  }

  // 3. Call Anthropic
  try {
    const apiRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await apiRes.json();

    if (!apiRes.ok) {
      const msg = (data && data.error && data.error.message) ? data.error.message : 'Upstream error from Anthropic.';
      return res.status(apiRes.status).json({ error: msg });
    }

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to reach Anthropic. Please try again in a moment.' });
  }
}
