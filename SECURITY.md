# Security Policy

## Reporting a vulnerability

Report suspected vulnerabilities privately to [founder@ai-borne.in](mailto:founder@ai-borne.in). Use the PGP key published at `/.well-known/pgp-key.txt` when encryption is appropriate. Do not include credentials, access tokens, or unnecessary personal data in a report.

Please include the affected URL or component, reproducible steps, expected and actual behavior, and any safe proof of concept. Do not publicly disclose an issue before coordination with AI-Borne.

## Scope and handling

This policy covers the AI-Borne website, its Cloudflare Pages Functions, and the deployment configuration in this repository. Reports are triaged for reproducibility, impact, and affected users. The reporter may receive follow-up questions or a resolution update; no response-time or remediation-time commitment is implied.

Do not test through denial of service, social engineering, automated high-volume traffic, or access to data that is not yours. Stop testing if you encounter personal data, secrets, or an unintended production effect.

## Maintainer incident checklist

1. Preserve relevant, redacted evidence and record the detection time.
2. Contain the issue: revoke or rotate affected credentials, disable the vulnerable path, or apply an edge rule as appropriate.
3. Assess exposed data and affected releases without copying sensitive request payloads into tickets or logs.
4. Deploy and verify the smallest safe remediation through the protected `main` branch and CI quality gate.
5. Document cause, remediation, and follow-up controls in the private incident record.

Deployment governance and the detailed on-call procedure are in `docs/incident-response.md` and `docs/deployment-security.md`.
