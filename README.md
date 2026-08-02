# Action Station Developer Website (`actionstation.in`)

Official developer studio website for **Action Station**, showcasing indie software development, AI deployments, automation insights, and flagship applications including **PayslipMax**. Built with **Vite + TypeScript + Vanilla CSS Tokens** adhering strictly to **MVVM**, **SOLID**, **DRY**, **SSOT**, and **TDD**.

---

## Technical Stack & Architecture

- **Build Engine**: Vite + TypeScript (Strict Type Checking)
- **Styling**: Vanilla CSS Custom Design Tokens (`tokens.css`, `layout.css`, `components.css`, `utils.css`)
- **Architecture**: MVVM (Model-View-ViewModel) + Single Source of Truth (`SiteDataStore.ts`, `LegalPolicyStore.ts`)
- **TDD Test Suite**: Vitest (`npx vitest run`)
- **Line Constraints**: All files < 300 lines, all functions < 50 lines

---

## Local Development & Testing

```bash
# Install dependencies
npm install

# Run Vitest TDD unit tests
npx vitest run

# Run local development server
npm run dev

# Build production static bundle
npm run build
```

---

## Deploying Live to Cloudflare Pages ($0/month)

### Method 1: Automatic GitHub Integration (Recommended)
1. Go to the [Cloudflare Dashboard](https://dash.cloudflare.com/) ➔ **Workers & Pages**.
2. Click **Create Application** ➔ **Pages** ➔ **Connect to Git**.
3. Select your repository: `sunilpawar-git/actionstation-website`.
4. Configure build settings:
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
5. Click **Save and Deploy**. Cloudflare will build and publish your site automatically every time you push code to GitHub!

### Method 2: Wrangler CLI Terminal Deployment
```bash
# Log in to Cloudflare
npx wrangler login

# Deploy static dist bundle
npx wrangler pages deploy dist --project-name actionstation
```

---

## Connecting Custom Domain (`actionstation.in`)

1. In your Cloudflare Pages project, go to **Custom Domains** ➔ **Add Custom Domain**.
2. Type `actionstation.in` and `www.actionstation.in`.
3. Update DNS records at your domain registrar (GoDaddy / Hostinger / Namecheap):
   - Add CNAME record for `@` pointing to `<your-project>.pages.dev`
   - Add CNAME record for `www` pointing to `<your-project>.pages.dev`
4. Cloudflare automatically issues a **free SSL (HTTPS) certificate**.

---

## Free Custom Email Routing (`support@actionstation.in`)

1. In Cloudflare Dashboard, select `actionstation.in` ➔ **Email Routing**.
2. Click **Enable Email Routing**.
3. Create a Destination Address: your personal Gmail address.
4. Create a Routing Rule:
   - **Custom Address**: `support@actionstation.in`
   - **Action**: Forward to your personal Gmail.
5. All emails sent to `support@actionstation.in` will now arrive in your personal inbox for free!

---

## App Store & Google Play Store Registration URLs

Use these live URLs when registering your app on the developer stores:

| Store Field | URL |
| :--- | :--- |
| **Developer Website** | `https://actionstation.in` |
| **Support URL** (Apple & Google) | `https://actionstation.in/support.html` |
| **Privacy Policy URL** (Apple & Google) | `https://actionstation.in/privacy-policy.html` |
| **Terms of Service URL** | `https://actionstation.in/terms.html` |
| **Account & Data Deletion URL** (Google Play) | `https://actionstation.in/data-deletion.html` |
| **Support Email** (Google Play) | `support@actionstation.in` |

---

## License

&copy; 2026 Action Station (`actionstation.in`). All rights reserved.
