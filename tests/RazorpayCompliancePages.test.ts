/**
 * Razorpay activation needs, on every site: Privacy, Terms, a standalone Refund & Cancellation
 * page and a Contact page with an email -- all linked from the footer.
 * The refund page must not invent terms: each product's own policy governs its refunds.
 */
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { LegalPolicyStore } from '../src/store/LegalPolicyStore';
import { FooterComponent } from '../src/views/FooterComponent';
import { CONTACT_DETAILS } from '../src/store/ContactDetails';

const root = path.resolve(__dirname, '..');
const text = (p: { sections: { heading: string; body: string[] }[] }) =>
  p.sections.flatMap((s) => [s.heading, ...s.body]).join(' ');

describe('contact details SSOT', () => {
  it('holds the owner email', () => {
    expect(CONTACT_DETAILS.email).toBe('founder@ai-borne.in');
  });
});

describe('Refund & Cancellation policy', () => {
  const refund = LegalPolicyStore.getRefundPolicy();

  it('is titled and contactable', () => {
    expect(refund.title).toBe('Refund & Cancellation Policy');
    expect(refund.contactEmail).toBe(CONTACT_DETAILS.email);
  });

  it('points to each paid product\'s own policy instead of inventing terms', () => {
    const content = text(refund);
    expect(content).toContain('https://www.actionstation.in/refund');
    expect(content).toContain('https://ssbmax.ai');
    expect(content).not.toContain('ssbmax.in');
  });
});

describe('Contact page', () => {
  const contact = LegalPolicyStore.getContactPage();

  it('carries email', () => {
    expect(contact.title).toBe('Contact Us');
    expect(contact.contactEmail).toBe(CONTACT_DETAILS.email);
  });
});

describe('footer legal links', () => {
  const html = FooterComponent.render();
  it.each(['/privacy-policy.html', '/terms.html', '/refund-policy.html', '/contact.html'])('links %s', (href) => {
    expect(html).toContain(`href="${href}"`);
  });
});

describe('pages are built and discoverable', () => {
  it.each([['refund-policy.html', 'refund'], ['contact.html', 'contact']])('%s exists and boots legal.ts', (file) => {
    const html = fs.readFileSync(path.join(root, file), 'utf8');
    expect(html).toContain('/src/ts/legal.ts');
  });

  it.each(['refund-policy.html', 'contact.html'])('%s is a vite input and in the sitemap', (file) => {
    expect(fs.readFileSync(path.join(root, 'vite.config.ts'), 'utf8')).toContain(file);
    expect(fs.readFileSync(path.join(root, 'public/sitemap.xml'), 'utf8')).toContain(`https://ai-borne.in/${file}`);
  });
});
