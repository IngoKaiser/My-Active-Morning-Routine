export const config = {
  runtime: 'edge',
};

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}

export default async function handler(req) {
  if (req.method === 'OPTIONS') return new Response(null, { status: 200, headers: CORS });
  if (req.method !== 'POST') return jsonResponse({ errorCode: 'METHOD_NOT_ALLOWED' }, 405);

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return jsonResponse({ errorCode: 'NO_API_KEY' }, 500);

  try {
    const { system, messages } = await req.json();

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6',
        max_tokens: 8000,
        stream: true,
        system: system || '',
        messages: messages || [],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      let errParsed = {};
      try { errParsed = JSON.parse(errText); } catch(e) {}
      const retryAfter = response.headers.get('retry-after');

      return jsonResponse({
        errorCode: response.status === 429 ? 'RATE_LIMIT'
          : response.status === 401 ? 'AUTH_FAILED'
          : response.status === 400 ? 'BAD_REQUEST'
          : response.status === 529 ? 'OVERLOADED'
          : response.status >= 500 ? 'SERVER_ERROR'
          : 'UNKNOWN',
        status: response.status,
        retryAfter: retryAfter ? parseInt(retryAfter) : null,
        detail: errParsed?.error?.message || null,
      }, response.status);
    }

    // Pass Anthropic's SSE stream directly to the client — no manual piping needed
    return new Response(response.body, {
      headers: {
        ...CORS,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (err) {
    console.error('Proxy error:', err);
    const isTimeout = err.name === 'TimeoutError' || err.message?.includes('timeout');
    return jsonResponse({
      errorCode: isTimeout ? 'TIMEOUT' : 'INTERNAL',
      detail: err.message,
    }, isTimeout ? 504 : 500);
  }
}
