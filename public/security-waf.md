# Cloudflare WAF & Security Hardening Configuration

This document specifies the mandatory Web Application Firewall (WAF), Bot Management, and DNS/Email transport security configurations for the **AI-Borne** platform (`ai-borne.in`) and Cloudflare Pages API functions.

---

## 1. Cloudflare WAF & OWASP Core Ruleset

### 1.1 Managed Ruleset (OWASP Core Ruleset)
- **Ruleset**: Cloudflare OWASP Core Ruleset
- **Sensitivity / Paranoia Level**: Level 1 (Default / Production Safe) or Level 2 (Enhanced API protection)
- **Anomaly Score Threshold**: 40 (Low Anomaly - Managed Challenge) / 60 (High Anomaly - Block)
- **Managed Actions**:
  - `SQL Injection (SQLi)`: Block / Managed Challenge
  - `Cross-Site Scripting (XSS)`: Block / Managed Challenge
  - `Remote Code Execution (RCE)`: Block
  - `HTTP Protocol Violations & Scanner Detection`: Managed Challenge

### 1.2 API Rate Limiting Rule
- **Rule Name**: `AI-Borne API Rate Limit`
- **Expression**: `http.request.uri.path starts_with "/api/"`
- **Rate Limit Window**: 1 minute (60 seconds)
- **Threshold**: 5 requests per IP address
- **Action**: Managed Challenge / Block
- **Response Status**: `HTTP 429 Too Many Requests`
- **Response Content-Type**: `application/json` with error payload:
  ```json
  {"error": "Too many requests. Please wait a moment before trying again."}
  ```

---

## 2. Cloudflare Turnstile Bot Defense

Cloudflare Turnstile provides privacy-preserving bot detection for public interactive endpoints (such as the Support Contact form).

### 2.1 Widget & Domain Configuration
- **Mode**: `Managed` (non-intrusive interactive fallback) or `Non-interactive`
- **Approved Hostnames**:
  - `ai-borne.in`
  - `www.ai-borne.in`
  - `localhost` (development testing)
- **Widget Integration**: Rendered via `<div class="cf-turnstile" data-sitekey="..."></div>` and loaded from `https://challenges.cloudflare.com/turnstile/v0/api.js`.

### 2.2 Server-Side Token Verification
- **Verification Endpoint**: `POST https://challenges.cloudflare.com/turnstile/v0/siteverify`
- **Payload Parameters**:
  - `secret`: Injected from Cloudflare Pages secret environment variable `TURNSTILE_SECRET_KEY`.
  - `response`: Token supplied by client in `turnstileToken` field.
  - `remoteip`: `request.headers.get('CF-Connecting-IP')`.
- **Validation Fallback**: If `TURNSTILE_SECRET_KEY` is not configured in staging/preview environments, the API functions gracefully bypass validation to avoid blocking legitimate development.

---

## 3. DNS Certificate Authority Authorization (CAA)

To prevent unauthorized certificate issuance across the domain and its subdomains, RFC 8659 CAA records must be provisioned in DNS:

| Type | Name | Flag | Tag | Value | Purpose |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **CAA** | `@` | 0 | `issue` | `"letsencrypt.org"` | Authorizes Let's Encrypt CA |
| **CAA** | `@` | 0 | `issue` | `"pki.goog"` | Authorizes Google Trust Services (Cloudflare Universal SSL) |
| **CAA** | `@` | 0 | `issuewild` | `";"` | Prohibits unauthorized wildcard certificates (or matches `issue`) |
| **CAA** | `@` | 0 | `iodef` | `"mailto:founder@ai-borne.in"` | Real-time incident reporting for policy violation attempts |

---

## 4. Email Transport Security (MTA-STS & TLS-RPT)

To eliminate downgrade attacks (STARTTLS stripping) and man-in-the-middle attacks on incoming email:

### 4.1 MTA-STS (SMTP Strict Transport Security - RFC 8461)
1. **DNS TXT Record**:
   - **Host**: `_mta-sts.ai-borne.in`
   - **Value**: `v=STSv1; id=202601010000Z;`
2. **HTTPS Policy Endpoint**:
   - Served securely at `https://mta-sts.ai-borne.in/.well-known/mta-sts.txt`
   - **Content**:
     ```text
     version: STSv1
     mode: enforce
     mx: aspmx.l.google.com
     mx: alt1.aspmx.l.google.com
     mx: alt2.aspmx.l.google.com
     mx: alt3.aspmx.l.google.com
     mx: alt4.aspmx.l.google.com
     max_age: 604800

     ```

### 4.2 TLS-RPT (SMTP TLS Reporting - RFC 8460)
- **Host**: `_smtp._tls.ai-borne.in`
- **Value**: `v=TLSRPTv1; rua=mailto:founder@ai-borne.in;`

### 4.3 Email Identity Defenses (SPF & DMARC)
- **SPF Record** (`@` TXT):
  `v=spf1 include:_spf.google.com include:spf.resend.com ~all`
- **DMARC Record** (`_dmarc.ai-borne.in` TXT):
  `v=DMARC1; p=reject; sp=reject; pct=100; rua=mailto:founder@ai-borne.in;`

---

## 5. Cloudflare Edge Security Settings Checklist

| Setting | Recommended Value | Description |
| :--- | :--- | :--- |
| **SSL/TLS Encryption Mode** | Full (Strict) | Enforces TLS 1.3 between Cloudflare Edge and origin functions. |
| **Always Use HTTPS** | On | Redirects all HTTP requests to HTTPS with 301 Permanent Redirect. |
| **Minimum TLS Version** | TLS 1.2 (TLS 1.3 preferred) | Deprecates TLS 1.0 and 1.1 to eliminate legacy cipher vulnerabilities. |
| **Bot Fight Mode** | On | Protects site from automated scrapers and malicious bots. |
| **Browser Integrity Check** | On | Evaluates HTTP headers for web crawler compliance. |
| **DNSSEC** | Enabled | Digitally signs DNS records to prevent DNS spoofing / cache poisoning. |
| **Automatic HTTPS Rewrites** | On | Rewrites HTTP asset links in HTML to HTTPS. |

---

## 6. Decap CMS & OAuth Security Considerations

- **OAuth Endpoints**: `/api/auth` & `/api/callback`
- **CSRF State Enforcement**: Standard 32-hex cryptographically random `oauth_state` token stored in `HttpOnly; SameSite=Lax; Secure` cookie.
- **Allowed Origins**: Strictly bound to `https://ai-borne.in`, `https://www.ai-borne.in`, and localhost preview origins.
- **Token Security**: Tokens transferred via postMessage only to verified origin; rendered response payload safely sanitized against Unicode/HTML injection.

