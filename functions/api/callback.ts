interface Env {
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } = context.env;
  const url = new URL(context.request.url);
  const code = url.searchParams.get('code');

  if (!code) {
    return new Response('Missing authorization code from GitHub', { status: 400 });
  }

  if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
    return new Response('GITHUB_CLIENT_ID or GITHUB_CLIENT_SECRET is missing from Cloudflare environment.', { status: 500 });
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

    const postMessageContent = JSON.stringify({
      token,
      provider: 'github',
    });

    const scriptHtml = `
      <!DOCTYPE html>
      <html>
        <head><title>Decap CMS Authentication</title></head>
        <body>
          <p>Authorizing with Decap CMS...</p>
          <script>
            (function() {
              function receiveMessage(e) {
                console.log("receiveMessage", e);
                window.opener.postMessage(
                  'authorization:github:success:${postMessageContent}',
                  e.origin
                );
              }
              window.addEventListener("message", receiveMessage, false);
              window.opener.postMessage("authorizing:github", "*");
            })();
          </script>
        </body>
      </html>
    `;

    return new Response(scriptHtml, {
      headers: {
        'Content-Type': 'text/html;charset=UTF-8',
      },
    });
  } catch (err: any) {
    return new Response(`Server Error: ${err.message}`, { status: 500 });
  }
};
