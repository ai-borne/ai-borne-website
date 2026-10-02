# Incident Response Runbook

## Trigger

Use this runbook for a suspected credential exposure, unauthorized deployment, abuse spike, CSP anomaly, authentication anomaly, or security report.

## First actions

1. Record time, detector, affected route or release, and only redacted evidence.
2. Contain with the least disruptive action: revoke the affected secret, disable the integration, or apply a narrowly scoped Cloudflare control.
3. Preserve deployment and edge-log metadata. Do not copy authorization headers, access tokens, contact messages, or email bodies into tickets.
4. Determine scope, affected versions, and whether data exposure is plausible.

## Recovery and follow-up

1. Implement the smallest safe fix on a protected branch; CI must pass `npm run quality` before deployment.
2. Rotate affected credentials and invalidate sessions or tokens when relevant.
3. Verify normal routes, API contract behavior, security headers, and operational event output.
4. Create a private post-incident record with timeline, impact, containment, fix, and prevention work. External notification decisions follow applicable obligations and verified facts.

## Rollback and validation

If containment requires a rollback, select the last known-good Cloudflare Pages deployment in the dashboard, record its release identifier, and restore it using the approved production procedure. Do not roll back by force-pushing or bypassing branch protection. After rollback, verify the canonical routes, API response contracts, HSTS/CSP headers, service-worker behavior, and the security reporting endpoint before closing containment.

## Monitoring and telemetry privacy

Monitor deployment status, availability, CSP-report rate-limit outcomes, and edge error trends using aggregated or redacted signals. Do not collect request bodies, authorization headers, access tokens, contact-message content, email addresses, or full URLs with query data in operational telemetry. Incident records should retain the minimum necessary release identifier, timestamp, route category, status, and remediation decision.
