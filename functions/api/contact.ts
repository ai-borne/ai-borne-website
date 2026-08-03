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
        from: 'AI-Borne Support <onboarding@resend.dev>',
        to: ['founder@ai-borne.in'],
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
