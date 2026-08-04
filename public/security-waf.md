# Cloudflare WAF & Security Hardening Configuration

This document specifies the mandatory Web Application Firewall (WAF) and Rate Limiting configurations for the **AI-Borne** static website and Cloudflare Pages API functions.

---

## 1. Cloudflare WAF Rate Limiting Rule

- **Rule Name**: `AI-Borne API Rate Limit`
- **Expression**: `http.request.uri.path starts_with "/api/"`
- **Rate Limit Window**: 1 minute (60 seconds)
- **Threshold**: 5 requests per IP address
- **Action**: Managed Challenge / Block
- **Response**: `HTTP 429 Too Many Requests`

---

## 2. Cloudflare Security Settings Checklist

| Setting | Recommended Value | Description |
| :--- | :--- | :--- |
| **SSL/TLS Encryption Mode** | Full (Strict) | Enforces TLS 1.3 between Cloudflare Edge and origin functions. |
| **Always Use HTTPS** | On | Redirects all HTTP requests to HTTPS with 301 Permanent Redirect. |
| **Bot Fight Mode** | On | Protects site from automated scrapers and malicious bots. |
| **Browser Integrity Check** | On | Evaluates HTTP headers for web crawler compliance. |
| **DNSSEC** | Enabled | Digitally signs DNS records to prevent DNS spoofing / cache poisoning. |
| **Automatic HTTPS Rewrites** | On | Rewrites HTTP asset links in HTML to HTTPS. |

---

## 3. Decap CMS Security Considerations

- **OAuth Endpoint**: `/api/auth` & `/api/callback`
- **CSRF State Enforcement**: Standard 32-hex `oauth_state` token stored in `HttpOnly` cookie.
- **Allowed Origins**: Strictly bound to `https://ai-borne.in` and `https://www.ai-borne.in`.
