/**
 * Privacy-preserving operational security telemetry for edge routes.
 * Event names are a closed set so request-controlled data cannot enter logs.
 */
export type SecurityEventName =
  | 'api_rate_limited'
  | 'auth_failure'
  | 'cors_denied'
  | 'csp_report_rejected'
  | 'turnstile_failure'
  | 'upstream_delivery_failure'
  | 'unexpected_server_error';

export type SecurityEventOutcome = 'blocked' | 'failed' | 'rejected';

export function emitSecurityEvent(
  event: SecurityEventName,
  outcome: SecurityEventOutcome,
  status: number,
): void {
  // Deliberately omit message bodies, headers, IPs, tokens, emails, and error objects.
  console.warn(JSON.stringify({ event, outcome, status }));
}
