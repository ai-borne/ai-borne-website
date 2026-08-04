interface Env {
  GITHUB_CLIENT_ID: string;
}

export async function onRequestGet(context: { request: Request; env: Env }): Promise<Response> {
  const { GITHUB_CLIENT_ID } = context.env;

  if (!GITHUB_CLIENT_ID) {
    return new Response('GITHUB_CLIENT_ID is not configured in Cloudflare environment variables.', { status: 500 });
  }

  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  const state = Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');

  const redirectUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&scope=repo,user&state=${state}`;

  const headers = new Headers();
  headers.set('Location', redirectUrl);
  headers.set('Set-Cookie', `oauth_state=${state}; HttpOnly; Secure; SameSite=Lax; Path=/api; Max-Age=600`);

  return new Response(null, {
    status: 302,
    headers,
  });
};

