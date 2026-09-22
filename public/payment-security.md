# PCI DSS v4.0 Payment Security & Client-Side Script Governance

This document establishes the mandatory architectural controls, client-side script governance, and tamper-detection mechanisms for **AI-Borne** (`ai-borne.in`) under **PCI DSS v4.0** (specifically **Requirement 6.4.3** and **Requirement 11.6.1**).

---

## 1. Scope & SAQ A Merchant Architecture

### 1.1 Scope Definition
AI-Borne operates exclusively under **PCI DSS Self-Assessment Questionnaire A (SAQ A)**:
- **Payment Method**: Fully outsourced hosted modal checkout / iframe elements provided by **Razorpay Software Private Limited** (PCI DSS Level 1 Service Provider).
- **Client Execution**: Payment forms and card entry elements are rendered entirely within isolated cross-origin iframes hosted on Razorpay's PCI DSS validated infrastructure (`https://api.razorpay.com`).
- **Zero Cardholder Data (CHD)**: AI-Borne web servers, serverless edge functions (`functions/api/`), client-side DOM, and browser storage **never receive, capture, process, transmit, or store** primary account numbers (PAN), cardholder names, expiration dates, or Sensitive Authentication Data (SAD such as CVV/CVC).

### 1.2 Zero CHD Policy & Storage Prohibition
Under no circumstances may any component of `ai-borne.in`:
1. Intercept or bind event listeners to input elements containing payment card credentials.
2. Persist payment details in `localStorage`, `sessionStorage`, `IndexedDB`, Web SQL, or cookies.
3. Transmit card numbers or security codes through API endpoints (such as `/api/contact` or analytics).
4. Log payment card data in serverless telemetry or client-side consoles.

---

## 2. PCI DSS v4.0 Requirement 6.4.3 — Script Governance & Integrity

Requirement 6.4.3 mandates that all payment page scripts loaded and executed in the consumer's browser are managed:
1. Authorized by technical leadership with written business justification.
2. Verified for cryptographic integrity before execution.
3. Maintained in an active, regularly audited inventory.

### 2.1 Authorized Script Inventory

| Script Identifier / URL | Provider / Vendor | Business & Technical Justification | Integrity Verification Mechanism | Approval Status |
| :--- | :--- | :--- | :--- | :--- |
| `https://checkout.razorpay.com/v1/checkout.js` | Razorpay Software Private Ltd. | Invokes hosted payment modal, orchestrates customer payment intent, and securely returns payment verification token. | Subresource Integrity (SRI) SHA-384 / SHA-256 hash pinning; Scoped Content-Security-Policy (`script-src https://checkout.razorpay.com`). | Authorized |
| `https://challenges.cloudflare.com/turnstile/v0/api.js` | Cloudflare, Inc. | Privacy-preserving bot challenge defense preventing automated checkout attacks and fraud. | Scoped origin pin (`script-src https://challenges.cloudflare.com`); strict Content-Security-Policy. | Authorized |
| `/assets/*.js` (Internal SPA Bundles) | AI-Borne Platform | Core application logic, routing, UI rendering, and view models. | Vite build-time content-addressable SHA-256 asset hashing; Served strictly from `'self'`. | Authorized |

### 2.2 Script Integrity & Execution Policy
1. **Subresource Integrity (SRI)**: Any dynamic script tag injecting third-party payment scripts must include the `integrity` hash and `crossorigin="anonymous"` attributes.
2. **Prohibition of Dynamic Injection**: Inline scripts (`'unsafe-inline'`), arbitrary code evaluation (`'unsafe-eval'`), and dynamic script tag injection outside the authorized inventory are strictly prohibited by CSP.
3. **No Unaudited Tag Managers**: Centralized tag managers (e.g., Google Tag Manager) and marketing ad trackers are banned from pages hosting payment flows to prevent unauthorized third-party script injection.

---

## 3. PCI DSS v4.0 Requirement 11.6.1 — Tamper Detection & Header Monitoring

Requirement 11.6.1 mandates a change- and tamper-detection mechanism to alert personnel to unauthorized modifications (including script tampering, DOM injection, and HTTP header alterations) to payment pages.

### 3.1 Content Security Policy (CSP) & Scoped Directives
To isolate and guard payment execution surfaces, the HTTP transport policy enforces strict scoping:

```http
Content-Security-Policy:
  default-src 'self';
  script-src 'self' https://checkout.razorpay.com https://challenges.cloudflare.com;
  frame-src https://api.razorpay.com https://challenges.cloudflare.com;
  connect-src 'self' https://api.razorpay.com https://lumberjack.razorpay.com;
  img-src 'self' data: https://*.githubusercontent.com https://challenges.cloudflare.com https://cdn.razorpay.com;
  frame-ancestors 'none';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  report-uri /api/csp-report;
  report-to csp-endpoint;
```

### 3.2 Real-Time Tamper Alerting Pipeline
1. **CSP Reporting Endpoint (`/api/csp-report`)**:
   - Browser engines automatically dispatch tamper / violation telemetry whenever an unauthorized script injection, malicious DOM modification, or unapproved frame creation occurs.
   - The Cloudflare Pages edge function (`functions/api/csp-report.ts`) inspects the violation report, sanitizes the payload, enforces rate limiting, and surfaces security telemetry.
2. **Reverse Proxy Header Enforcement**:
   - HTTP response headers are set at the Cloudflare Edge (`public/_headers` and `functions/api/utils/apiSecurityHeaders.ts`) with `nosniff`, `DENY` framing, and strict `Referrer-Policy`.
3. **Synthetic Script & DOM Integrity Verification**:
   - Automated CI/CD guardrail test suites (`tests/SriGuardrails.test.ts` and `tests/SecurityGuardrails.test.ts`) assert that all external dependencies are pinned, authenticated, and free from unauthorized origins.

---

## 4. Incident Response & Skimming Attack Playbook

In the event that the edge reporting function or monitoring detects an unauthorized script execution or CSP violation on payment surfaces:
1. **Automated Containment**: Cloudflare WAF immediately blocks malicious script sources via dynamic rate limiting and managed challenges.
2. **Triage**: Security response reviews report telemetry (`blocked-uri`, `violated-directive`, `source-file`).
3. **Escalation**: If malicious code injection (Magecart / client-side e-skimming) is confirmed, the payment surface is placed into maintenance mode, Razorpay credentials are rotated, and affected payment sessions are invalidated.
4. **Disclosure**: Incident is documented and reported to acquiring banks and payment card brands as required by PCI DSS regulations.

---

## 5. Audit & Compliance Cadence

| Activity | Frequency | Responsible Role | Verification Method |
| :--- | :--- | :--- | :--- |
| **Script Inventory Review** | Quarterly & on release | Security Lead | Validation against `public/payment-security.md` and codebase |
| **SRI & CSP Guardrail Tests** | Every CI build | Automated CI/CD | `npx vitest run tests/SriGuardrails.test.ts tests/SecurityGuardrails.test.ts` |
| **SAQ A Self-Assessment** | Annually | Executive Leadership | Formal PCI DSS SAQ A attestation of compliance |
| **CSP Telemetry Review** | Weekly | Platform Engineering | Audit of edge function logs from `/api/csp-report` |
