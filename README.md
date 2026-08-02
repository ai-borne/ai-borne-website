# AI-Borne Developer Website (`ai-borne.in`)

A modern, production-grade indie software studio website for **AI-Borne**, built with Vanilla TypeScript, HTML5, CSS Variables, Vite, and MVVM architecture.

Features privacy-first product showcase for **PayslipMax**, Developer Insights, Support Center, and store compliance documents (Privacy Policy, Terms of Service, Account & Data Deletion).

---

## Technical Architecture & Design Patterns

* **Single Source of Truth (SSOT)**: `SiteDataStore.ts`, `LegalPolicyStore.ts`, and `StringResources.ts` act as central data repositories.
* **MVVM Architecture**: Clean separation of ViewModels (`HomeViewModel`, `PayslipMaxViewModel`, `BlogViewModel`, `SupportViewModel`, `ThemeViewModel`) and Views (`HeaderComponent`, `FooterComponent`).
* **Test-Driven Development (TDD)**: Comprehensive unit testing suite built with `vitest`.
* **Zero Hardcoded Strings**: All UI copy resolved via `StringResources.ts` SSOT store.
* **Dynamic Dark/Light/System Theme Engine**: `ThemeService.ts` and `ThemeViewModel.ts` with `localStorage` persistence and 0-flicker head script.

---

## Getting Started & Local Development

### Prerequisites
* Node.js v18+
* npm v9+

### Installation
```bash
npm install
```

### Running Local Development Server
```bash
npm run dev
```

### Running Test Suite
```bash
npm run test
```

### Production Build
```bash
npm run build
```

---

## Deployment to Cloudflare Pages

1. Log into **Cloudflare Dashboard** ➔ **Workers & Pages**.
2. Click **Create Application** ➔ **Pages** ➔ **Connect to Git**.
3. Select your repository: `ai-borne/actionstation-website`.
4. Build Settings:
   * **Framework Preset**: None (Vite)
   * **Build Command**: `npm run build`
   * **Build Output Directory**: `dist`
5. Click **Save and Deploy**.

### CLI Re-deployment
```bash
npx wrangler pages deploy dist --project-name ai-borne
```

---

## Connecting Custom Domain (`ai-borne.in`)

1. In Cloudflare Pages project settings, navigate to **Custom Domains**.
2. Type `ai-borne.in` and `www.ai-borne.in`.
3. Cloudflare will automatically configure CNAME records in DNS.

---

## Free Custom Email Routing (`support@ai-borne.in`)

1. In Cloudflare Dashboard, select `ai-borne.in` ➔ **Email Routing**.
2. Enable Email Routing (auto-configure MX records).
3. Under **Routes**, click **Create Address**:
   - **Custom Address**: `support@ai-borne.in`
   - **Action**: Send to `your.email@domain.com`
5. All emails sent to `support@ai-borne.in` will now arrive in your personal inbox for free!

---

## App Store & Play Store URL Compliance

| Store Field | URL / Email | Status |
| :--- | :--- | :--- |
| **Developer Website** | `https://ai-borne.in` | Live |
| **Support URL** (Apple & Google) | `https://ai-borne.in/support.html` | Live |
| **Privacy Policy URL** (Apple & Google) | `https://ai-borne.in/privacy-policy.html` | Live |
| **Terms of Service URL** | `https://ai-borne.in/terms.html` | Live |
| **Account & Data Deletion URL** (Google Play) | `https://ai-borne.in/data-deletion.html` | Live |
| **Support Email** (Google Play) | `support@ai-borne.in` | Live |

---

&copy; 2026 AI-Borne (`ai-borne.in`). All rights reserved.
