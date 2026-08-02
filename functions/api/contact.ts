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
        JSON.stringify({ success: false, error: 'Invalid email address provided.' }),
        { status: 400, headers }
      );
    }

    if (!message || message.length < 5) {
      return new Response(
        JSON.stringify({ success: false, error: 'Support message must be at least 5 characters long.' }),
        { status: 400, headers }
      );
    }

    // Serverless log trace for verified incoming support messages
    console.log(`[Cloudflare Pages Contact API] New support message from ${email}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Support message received successfully. We will respond within 24-48 hours.',
      }),
      { status: 200, headers }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: 'Malformed request payload.' }),
      { status: 400, headers }
    );
  }
}

function isValidEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}
