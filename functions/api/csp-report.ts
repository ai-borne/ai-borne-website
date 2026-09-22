import { SlidingWindowRateLimiter } from '../../src/utils/RateLimiter';

// 20 reports per minute per IP (60,000 ms sliding window)
export const cspReportRateLimiter = new SlidingWindowRateLimiter(60 * 1000, 20);

const MAX_PAYLOAD_BYTES = 4096; // 4 KB limit
const ALLOWED_CONTENT_TYPES = [
  'application/csp-report',
  'application/json',
  'application/reports+json',
];

const SECURE_HEADERS: Record<string, string> = {
  'Cache-Control': 'no-store, no-cache, must-revalidate',
  'X-Content-Type-Options': 'nosniff',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function onRequestOptions(): Promise<Response> {
  return new Response(null, {
    status: 204,
    headers: SECURE_HEADERS,
  });
}

export async function onRequestPost(context: { request: Request }): Promise<Response> {
  const { request } = context;

  // Rate Limiting (20 reports per minute per IP)
  const clientIp =
    request.headers.get('CF-Connecting-IP') ||
    request.headers.get('x-forwarded-for') ||
    '127.0.0.1';
  const rateLimit = cspReportRateLimiter.isAllowed(clientIp);
  if (!rateLimit.allowed) {
    return new Response(null, {
      status: 429,
      headers: {
        ...SECURE_HEADERS,
        'Retry-After': Math.ceil(rateLimit.resetMs / 1000).toString(),
      },
    });
  }

  // Content-Type enforcement
  const contentType = (request.headers.get('Content-Type') || '').toLowerCase();
  const isAllowedType = ALLOWED_CONTENT_TYPES.some((type) => contentType.includes(type));
  if (!isAllowedType) {
    return new Response(null, { status: 415, headers: SECURE_HEADERS });
  }

  // Payload size validation via Content-Length header
  const contentLength = request.headers.get('Content-Length');
  if (contentLength && parseInt(contentLength, 10) > MAX_PAYLOAD_BYTES) {
    return new Response(null, { status: 413, headers: SECURE_HEADERS });
  }

  try {
    const rawText = await request.text();
    if (new TextEncoder().encode(rawText).length > MAX_PAYLOAD_BYTES) {
      return new Response(null, { status: 413, headers: SECURE_HEADERS });
    }

    // Safely parse JSON - zero reflection, log sanitized telemetry
    const reportData = JSON.parse(rawText);
    if (reportData && typeof reportData === 'object') {
      const directive = Array.isArray(reportData)
        ? reportData[0]?.body?.effectiveDirective || reportData[0]?.type
        : reportData['csp-report']?.['effective-directive'] ||
          reportData['csp-report']?.['violated-directive'];

      if (directive && typeof directive === 'string') {
        const sanitized = directive.slice(0, 50).replace(/[^a-zA-Z0-9_-]/g, '');
        console.warn(`[CSP Violation Report] Directive: ${sanitized}`);
      }
    }

    return new Response(null, { status: 204, headers: SECURE_HEADERS });
  } catch {
    return new Response(null, { status: 400, headers: SECURE_HEADERS });
  }
}

export async function onRequest(context: { request: Request }): Promise<Response> {
  if (context.request.method === 'OPTIONS') {
    return onRequestOptions();
  }
  if (context.request.method === 'POST') {
    return onRequestPost(context);
  }
  return new Response(null, {
    status: 405,
    headers: { ...SECURE_HEADERS, Allow: 'POST, OPTIONS' },
  });
}
