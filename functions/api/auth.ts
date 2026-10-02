import { SlidingWindowRateLimiter } from '../../src/utils/RateLimiter';
import { getSecureApiResponseHeaders } from './utils/apiSecurityHeaders';
import { ApiStringResources } from './ApiStringResources';
import { emitSecurityEvent } from './utils/securityEvents';

interface Env {
  GITHUB_CLIENT_ID: string;
}

// 10 requests per 5 minutes per IP
export const authRateLimiter = new SlidingWindowRateLimiter(5 * 60 * 1000, 10);

export async function onRequestGet(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;
  const clientIp = request.headers.get('CF-Connecting-IP') || request.headers.get('x-forwarded-for') || '127.0.0.1';
  const rateLimit = authRateLimiter.isAllowed(clientIp);

  if (!rateLimit.allowed) {
    emitSecurityEvent('api_rate_limited', 'blocked', 429);
    return new Response(ApiStringResources.rateLimited, {
      status: 429,
      headers: getSecureApiResponseHeaders(null, {
        'Retry-After': Math.ceil(rateLimit.resetMs / 1000).toString(),
      }),
    });
  }

  const { GITHUB_CLIENT_ID } = env;
  if (!GITHUB_CLIENT_ID) {
    emitSecurityEvent('auth_failure', 'failed', 500);
    return new Response(ApiStringResources.authClientIdMissing, {
      status: 500,
      headers: getSecureApiResponseHeaders(),
    });
  }

  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  const state = Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');

  const redirectUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&scope=repo,user&state=${state}`;

  const headers = new Headers(getSecureApiResponseHeaders());
  headers.set('Location', redirectUrl);
  headers.set('Set-Cookie', `oauth_state=${state}; HttpOnly; Secure; SameSite=Lax; Path=/api; Max-Age=600`);

  return new Response(null, {
    status: 302,
    headers,
  });
}
