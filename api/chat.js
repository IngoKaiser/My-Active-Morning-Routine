// Vercel Serverless Function timeout (Hobby: max 60s, Pro: max 300s)
export const config = {
  maxDuration: 60,
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ errorCode: 'METHOD_NOT_ALLOWED' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ errorCode: 'NO_API_KEY' });

  try {
    const { system, messages } = req.body;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 8000,
        system: system || '',
        messages: messages || [],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      let errParsed = {};
      try { errParsed = JSON.parse(errText); } catch(e) {}
      const retryAfter = response.headers.get('retry-after');

      console.error('Anthropic API error:', response.status, errText);

      return res.status(response.status).json({
        errorCode: response.status === 429 ? 'RATE_LIMIT'
          : response.status === 401 ? 'AUTH_FAILED'
          : response.status === 400 ? 'BAD_REQUEST'
          : response.status === 529 ? 'OVERLOADED'
          : response.status >= 500 ? 'SERVER_ERROR'
          : 'UNKNOWN',
        status: response.status,
        retryAfter: retryAfter ? parseInt(retryAfter) : null,
        detail: errParsed?.error?.message || null,
      });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    console.error('Proxy error:', err);

    const isTimeout = err.name === 'TimeoutError' || err.message?.includes('timeout') || err.message?.includes('FUNCTION_INVOCATION_TIMEOUT');
    const isNetwork = err.message?.includes('fetch') || err.message?.includes('ECONNREFUSED') || err.message?.includes('network');

    return res.status(isTimeout ? 504 : 500).json({
      errorCode: isTimeout ? 'TIMEOUT' : isNetwork ? 'NETWORK' : 'INTERNAL',
      detail: err.message,
    });
  }
}
