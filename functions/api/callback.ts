import { SlidingWindowRateLimiter } from '../../src/utils/RateLimiter';
import { getSecureApiResponseHeaders } from './utils/apiSecurityHeaders';

interface Env {
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
}

// 10 requests per 5 minutes per IP
export const callbackRateLimiter = new SlidingWindowRateLimiter(5 * 60 * 1000, 10);

export const STATIC_DECAP_SCRIPT = `(function() {
  var allowedOrigins = [
    'https://ai-borne.in',
    'https://www.ai-borne.in'
  ];

  function isOriginAllowed(origin) {
    if (!origin) return false;
    if (allowedOrigins.indexOf(origin) !== -1) return true;
    if (/^http:\\/\\/(localhost|127\\.0\\.0\\.1)(:\\d+)?$/.test(origin)) return true;
    return false;
  }

  function receiveMessage(e) {
    if (!isOriginAllowed(e.origin)) {
      console.warn("Unauthorized origin rejected:", e.origin);
      return;
    }
    if (!window.opener || window.opener.closed) {
      console.warn("Opener window not available or closed");
      return;
    }
    var dataEl = document.getElementById("decap-auth");
    var payload = dataEl ? dataEl.textContent : "";
    window.opener.postMessage(
      'authorization:github:success:' + payload,
      e.origin
    );
  }

  window.addEventListener("message", receiveMessage, false);

  if (window.opener && !window.opener.closed) {
    window.opener.postMessage("authorizing:github", window.location.origin);
  }
})();`;

export async function calculateScriptSha256(content: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(content));
  const bytes = new Uint8Array(digest);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export async function onRequestGet(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;
  const clientIp = request.headers.get('CF-Connecting-IP') || request.headers.get('x-forwarded-for') || '127.0.0.1';
  const rateLimit = callbackRateLimiter.isAllowed(clientIp);

  if (!rateLimit.allowed) {
    return new Response('Too many requests. Please try again later.', {
      status: 429,
      headers: getSecureApiResponseHeaders(null, {
        'Retry-After': Math.ceil(rateLimit.resetMs / 1000).toString(),
      }),
    });
  }

  const { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } = env;
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');

  if (!code) {
    return new Response('Missing authorization code from GitHub', {
      status: 400,
      headers: getSecureApiResponseHeaders(),
    });
  }

  if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
    return new Response('GITHUB_CLIENT_ID or GITHUB_CLIENT_SECRET is missing from Cloudflare environment.', {
      status: 500,
      headers: getSecureApiResponseHeaders(),
    });
  }

  // OAuth CSRF state verification
  const cookieHeader = request.headers.get('Cookie') || '';
  const cookieMatch = cookieHeader.match(/oauth_state=([^;]+)/);
  const cookieState = cookieMatch ? cookieMatch[1] : null;

  if (!state || !cookieState || state !== cookieState) {
    return new Response('Invalid or missing OAuth state token (CSRF check failed).', {
      status: 403,
      headers: getSecureApiResponseHeaders(),
    });
  }

  try {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'User-Agent': 'AI-Borne-CMS',
      },
      body: JSON.stringify({
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
      }),
    });

    const data: any = await response.json();
    const token = data.access_token;

    if (!token) {
      return new Response(`OAuth Token Exchange Error: ${data.error_description || 'Invalid authorization code'}`, {
        status: 401,
        headers: getSecureApiResponseHeaders(),
      });
    }

    const safePostMessageContent = JSON.stringify({
      token,
      provider: 'github',
    }).replace(/</g, '\\u003c').replace(/>/g, '\\u003e');

    const scriptHash = await calculateScriptSha256(STATIC_DECAP_SCRIPT);

    const scriptHtml = `<!DOCTYPE html>
<html>
  <head><title>Decap CMS Authentication</title></head>
  <body>
    <p>Authorizing with Decap CMS...</p>
    <script id="decap-auth" type="application/json">${safePostMessageContent}</script>
    <script>${STATIC_DECAP_SCRIPT}</script>
  </body>
</html>`;

    const headers = new Headers(
      getSecureApiResponseHeaders(null, {
        'Content-Type': 'text/html;charset=UTF-8',
        'Content-Security-Policy': `default-src 'none'; script-src 'sha256-${scriptHash}'`,
      })
    );
    headers.set('Set-Cookie', 'oauth_state=; HttpOnly; Secure; SameSite=Lax; Path=/api; Max-Age=0');

    return new Response(scriptHtml, { headers });
  } catch (err: any) {
    return new Response(`Server Error: ${err.message}`, {
      status: 500,
      headers: getSecureApiResponseHeaders(),
    });
  }
}
