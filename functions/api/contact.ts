interface ContactRequestBody {
  email?: string;
  message?: string;
  turnstileToken?: string;
}

interface Env {
  RESEND_API_KEY?: string;
  CF_TURNSTILE_SECRET_KEY?: string;
}

const MAX_PAYLOAD_BYTES = 10 * 1024; // 10 KB limit
const ALLOWED_ORIGINS = [
  'https://ai-borne.in',
  'https://www.ai-borne.in',
];

export async function onRequestOptions(context: { request: Request }): Promise<Response> {
  const origin = getAllowedOrigin(context.request);
  return new Response(null, {
    status: 204,
    headers: getResponseHeaders(origin),
  });
}

export async function onRequestPost(context: { request: Request; env: Env; waitUntil?: (promise: Promise<any>) => void }): Promise<Response> {
  const { request, env } = context;
  const origin = getAllowedOrigin(request);
  const headers = getResponseHeaders(origin);

  // Method check
  if (request.method !== 'POST') {
    return new Response(
      JSON.stringify({ success: false, error: 'Method Not Allowed' }),
      { status: 405, headers }
    );
  }

  // Content-Type validation
  const contentType = request.headers.get('Content-Type') || '';
  if (!contentType.toLowerCase().includes('application/json')) {
    return new Response(
      JSON.stringify({ success: false, error: 'Unsupported Content-Type. Must be application/json.' }),
      { status: 415, headers }
    );
  }

  // Payload size validation
  const contentLengthHeader = request.headers.get('Content-Length');
  if (contentLengthHeader && parseInt(contentLengthHeader, 10) > MAX_PAYLOAD_BYTES) {
    return new Response(
      JSON.stringify({ success: false, error: 'Payload exceeds maximum allowed limit (10KB).' }),
      { status: 413, headers }
    );
  }

  try {
    const rawText = await request.text();
    if (new TextEncoder().encode(rawText).length > MAX_PAYLOAD_BYTES) {
      return new Response(
        JSON.stringify({ success: false, error: 'Payload exceeds maximum allowed limit (10KB).' }),
        { status: 413, headers }
      );
    }

    const body: ContactRequestBody = JSON.parse(rawText);
    const email = body.email?.trim() || '';
    const message = body.message?.trim() || '';

    if (!email || !isValidEmail(email)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid email address format.' }),
        { status: 400, headers }
      );
    }

    if (!message || message.length < 5) {
      return new Response(
        JSON.stringify({ success: false, error: 'Support message must be at least 5 characters long.' }),
        { status: 400, headers }
      );
    }

    if (env?.CF_TURNSTILE_SECRET_KEY) {
      const isBotCleared = await verifyTurnstileToken(
        env.CF_TURNSTILE_SECRET_KEY,
        body.turnstileToken || '',
        request.headers.get('CF-Connecting-IP') || ''
      );
      if (!isBotCleared) {
        return new Response(
          JSON.stringify({ success: false, error: 'Bot verification failed. Please try again.' }),
          { status: 403, headers }
        );
      }
    }

    const apiKey = env?.RESEND_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Email gateway configuration missing. Please email support@ai-borne.in directly.',
        }),
        { status: 500, headers }
      );
    }

    // Call Resend API to deliver support message directly to Google Workspace inbox
    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: 'AI-Borne Support <support@ai-borne.in>',
        to: ['support@ai-borne.in'],
        reply_to: email,
        subject: `[AI-Borne Web Support] New message from ${email}`,
        html: `
          <div style="font-family: system-ui, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h2 style="color: #0f172a; margin-top: 0;">New Support Inquiry</h2>
            <p style="font-size: 14px; color: #475569;"><strong>From:</strong> ${escapeHtml(email)}</p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
            <p style="font-size: 15px; color: #1e293b; white-space: pre-wrap;">${escapeHtml(message)}</p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
            <small style="color: #94a3b8;">Sent automatically via AI-Borne Studio Web Center</small>
          </div>
        `,
      }),
    });

    const resendData: any = await resendRes.json().catch(() => ({}));

    if (!resendRes.ok) {
      return new Response(
        JSON.stringify({
          success: false,
          error: resendData.message || 'Failed to deliver support email. Please email support@ai-borne.in directly.',
        }),
        { status: 500, headers }
      );
    }

    // Asynchronously dispatch auto-confirmation email to customer (non-blocking)
    context.waitUntil?.(
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          from: 'AI-Borne Support <support@ai-borne.in>',
          to: [email],
          reply_to: 'support@ai-borne.in',
          subject: '[AI-Borne Support] We received your message',
          html: `
            <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; color: #0f172a;">
              <div style="margin-bottom: 20px;">
                <h1 style="color: #6366f1; font-size: 24px; font-weight: 800; margin: 0;">AI-BORNE</h1>
                <p style="color: #64748b; font-size: 13px; margin-top: 4px;">Developer Support Center</p>
              </div>
              <h2 style="font-size: 18px; color: #1e293b; margin-top: 0;">Thank you for reaching out!</h2>
              <p style="font-size: 15px; color: #334155; line-height: 1.6;">
                We have received your support inquiry. The <strong>AI-Borne</strong> team typically responds within <strong>24–48 hours</strong>.
              </p>
              <div style="background-color: #f8fafc; border-left: 4px solid #6366f1; padding: 16px; margin: 20px 0; border-radius: 6px;">
                <p style="font-size: 12px; color: #64748b; margin: 0 0 8px 0; font-weight: 600; text-transform: uppercase;">Your Message Copy:</p>
                <p style="font-size: 14px; color: #1e293b; margin: 0; white-space: pre-wrap;">${escapeHtml(message)}</p>
              </div>
              <p style="font-size: 14px; color: #475569;">
                If you have additional details to add, simply reply directly to this email.
              </p>
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
              <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 0;">
                &copy; 2026 AI-Borne Studio (<a href="https://ai-borne.in" style="color: #6366f1; text-decoration: none;">ai-borne.in</a>). All rights reserved.
              </p>
            </div>
          `,
        }),
      }).catch(() => {})
    );

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Thank you! Your message has been sent successfully.',
      }),
      { status: 200, headers }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to connect to email gateway. Please email support@ai-borne.in directly.',
      }),
      { status: 500, headers }
    );
  }
}

function getAllowedOrigin(request: Request): string | null {
  const reqOrigin = request.headers.get('Origin') || '';
  if (!reqOrigin) return null;

  if (ALLOWED_ORIGINS.includes(reqOrigin.toLowerCase())) {
    return reqOrigin;
  }

  // Allow localhost origins for dev environment
  if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(reqOrigin.toLowerCase())) {
    return reqOrigin;
  }

  return null;
}

function getResponseHeaders(origin: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'X-Content-Type-Options': 'nosniff',
  };

  if (origin) {
    headers['Access-Control-Allow-Origin'] = origin;
  }

  return headers;
}

function isValidEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

async function verifyTurnstileToken(secret: string, token: string, remoteIp: string): Promise<boolean> {
  if (!token) return false;
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret, response: token, remoteip: remoteIp }),
    });
    const outcome: any = await res.json().catch(() => ({}));
    return !!outcome.success;
  } catch {
    return false;
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
