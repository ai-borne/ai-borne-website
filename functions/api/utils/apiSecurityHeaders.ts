export const ALLOWED_API_ORIGINS = [
  'https://ai-borne.in',
  'https://www.ai-borne.in',
];

/**
 * Validates request Origin against enterprise allowlist and local development origins.
 */
export function getAllowedOrigin(request: Request | string | null | undefined): string | null {
  if (!request) return null;
  const origin = typeof request === 'string' ? request : request.headers.get('Origin') || '';
  if (!origin) return null;
  const lower = origin.toLowerCase();
  if (ALLOWED_API_ORIGINS.includes(lower)) {
    return origin;
  }
  if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(lower)) {
    return origin;
  }
  return null;
}

/**
 * Generates enterprise zero-trust response headers for serverless API edge routes.
 * Enforces strict anti-caching, HSTS, frame restriction, and least-privilege CSP.
 */
export function getSecureApiResponseHeaders(
  origin?: string | null,
  customHeaders?: Record<string, string>
): Record<string, string> {
  const headers: Record<string, string> = {
    'Cache-Control': 'no-store, no-cache, must-revalidate, private',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'no-referrer',
    'Cross-Origin-Resource-Policy': 'same-origin',
    'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none';",
    ...customHeaders,
  };

  if (origin) {
    headers['Access-Control-Allow-Origin'] = origin;
  }

  return headers;
}
