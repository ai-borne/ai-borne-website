interface ContactRequestBody {
  email?: string;
  message?: string;
}

interface Env {
  RESEND_API_KEY?: string;
}

export async function onRequestPost(context: { request: Request; env: Env }): Promise<Response> {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  try {
    const body: ContactRequestBody = await context.request.json();
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

    const apiKey = context.env?.RESEND_API_KEY;

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

function isValidEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
