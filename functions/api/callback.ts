interface Env {
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
}

export async function onRequestGet(context: { request: Request; env: Env }): Promise<Response> {
  const { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } = context.env;
  const url = new URL(context.request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');

  if (!code) {
    return new Response('Missing authorization code from GitHub', { status: 400 });
  }

  if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
    return new Response('GITHUB_CLIENT_ID or GITHUB_CLIENT_SECRET is missing from Cloudflare environment.', { status: 500 });
  }

  // OAuth CSRF state verification
  const cookieHeader = context.request.headers.get('Cookie') || '';
  const cookieMatch = cookieHeader.match(/oauth_state=([^;]+)/);
  const cookieState = cookieMatch ? cookieMatch[1] : null;

  if (!state || !cookieState || state !== cookieState) {
    return new Response('Invalid or missing OAuth state token (CSRF check failed).', { status: 403 });
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
      return new Response(`OAuth Token Exchange Error: ${data.error_description || 'Invalid authorization code'}`, { status: 401 });
    }

    // Safely encode token and provider to prevent HTML script tag breakout
    const safePostMessageContent = JSON.stringify({
      token,
      provider: 'github',
    }).replace(/</g, '\\u003c').replace(/>/g, '\\u003e');

    const targetOrigin = url.origin;

    const scriptHtml = `
      <!DOCTYPE html>
      <html>
        <head><title>Decap CMS Authentication</title></head>
        <body>
          <p>Authorizing with Decap CMS...</p>
          <script>
            (function() {
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
                window.opener.postMessage(
                  'authorization:github:success:${safePostMessageContent}',
                  e.origin
                );
              }

              window.addEventListener("message", receiveMessage, false);

              if (window.opener && !window.opener.closed) {
                window.opener.postMessage("authorizing:github", "${targetOrigin}");
              }
            })();
          </script>
        </body>
      </html>
    `;

    const headers = new Headers();
    headers.set('Content-Type', 'text/html;charset=UTF-8');
    headers.set('X-Frame-Options', 'DENY');
    headers.set('X-Content-Type-Options', 'nosniff');
    headers.set('Content-Security-Policy', "default-src 'none'; script-src 'unsafe-inline'");
    headers.set('Set-Cookie', 'oauth_state=; HttpOnly; Secure; SameSite=Lax; Path=/api; Max-Age=0');

    return new Response(scriptHtml, { headers });
  } catch (err: any) {
    return new Response(`Server Error: ${err.message}`, { status: 500 });
  }
}
