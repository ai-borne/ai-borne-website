interface ContactRequestBody {
  email?: string;
  message?: string;
}

export async function onRequestPost(context: { request: Request }): Promise<Response> {
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

    const incomingOrigin = context.request.headers.get('Origin') || context.request.headers.get('origin') || 'https://ai-borne.in';
    const incomingReferer = context.request.headers.get('Referer') || context.request.headers.get('referer') || `${incomingOrigin}/support.html`;

    // Forward support request to FormSubmit targeting support@ai-borne.in directly
    const dispatchRes = await fetch('https://formsubmit.co/ajax/support@ai-borne.in', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Referer': incomingReferer,
        'Origin': incomingOrigin,
      },
      body: JSON.stringify({
        email: email,
        message: message,
        _subject: `[AI-Borne Web Support] New message from ${email}`,
        _template: 'table',
      }),
    });

    const dispatchData: any = await dispatchRes.json().catch(() => ({}));

    if (!dispatchRes.ok || dispatchData.success === 'false' || dispatchData.success === false) {
      const rawError = dispatchData.message || '';
      const isRateLimited =
        dispatchRes.status === 429 ||
        rawError.toLowerCase().includes('rate limit') ||
        rawError.toLowerCase().includes('activation') ||
        rawError.toLowerCase().includes('web server');

      const userErrorMsg = isRateLimited
        ? 'Automated email service is currently rate-limited or pending activation. Please email support@ai-borne.in directly.'
        : rawError || 'Failed to dispatch email. Please email support@ai-borne.in directly.';

      return new Response(
        JSON.stringify({
          success: false,
          error: userErrorMsg,
          isRateLimited,
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
        isRateLimited: true,
      }),
      { status: 500, headers }
    );
  }
}

function isValidEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}
