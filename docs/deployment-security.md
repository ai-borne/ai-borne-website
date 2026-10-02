# Deployment Security Baseline

Configure GitHub `main` branch protection to require pull requests, the CI quality check, stale-review dismissal, and administrator enforcement. Restrict who can push, merge, or modify rules, and require review from the owners listed in `.github/CODEOWNERS` for deployment and security paths.

CI workflows use read-only permissions unless the scheduled publishing workflow needs `contents: write` to commit its generated, quality-gated content. All third-party actions are commit-SHA pinned. CI uses `npm ci --ignore-scripts`, runs `npm run quality`, retains the build artifact for one day, and deploys only the artifact produced by the successful `main` push workflow.

Keep Cloudflare deployment credentials scoped to the AI-Borne Pages project. Store them only as GitHub secrets, rotate them after suspected exposure, and never print them in workflow output.

## Cloudflare Pages production checklist

Before enabling or changing the production custom domain, verify in the Cloudflare dashboard that SSL/TLS encryption mode is **Full (strict)**, the minimum TLS version is appropriate for supported clients, and **Always Use HTTPS** is enabled. The repository supplies HSTS and other static security headers in `public/_headers`; verify the deployed HTTPS response carries them, because Pages Functions set their own API headers.

Deploy production only through the protected GitHub Actions `production` environment. Configure required reviewers and deployment-branch restrictions there when the organization needs approval before release. Do not enable a parallel Pages Git deployment for the same production branch: the workflow deploys the reviewed artifact produced by the quality gate.

Cloudflare Pages secrets belong in the Pages project secret store or GitHub Actions secrets, never in `wrangler.jsonc`, repository variables, browser-prefixed environment variables, build logs, or artifacts. Preview deployments must use separately scoped credentials and must not reuse production write credentials.

After a deployment, verify the canonical and `www` domain redirect policy, certificate status, HTTPS headers, API error behavior, and `/.well-known/security.txt`. Verify that source maps are absent from the published artifact and that `/sw.js` remains non-cacheable. Record only the release identifier, time, actor, and validation outcome in deployment records.
