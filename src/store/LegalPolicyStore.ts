import { ILegalPolicy } from '../models/LegalPolicy';

export class LegalPolicyStore {
  public static getPrivacyPolicy(): ILegalPolicy {
    return {
      title: 'Privacy Policy',
      lastUpdated: 'August 24, 2026',
      effectiveDate: 'August 24, 2026',
      contactEmail: 'support@ai-borne.in',
      sections: [
        {
          heading: '1. Overview & Commitment to Privacy',
          body: [
            'AI-Borne ("we", "our", or "us") is committed to protecting user privacy.',
            'Our flagship applications, including PayslipMax, operate on a privacy-first, on-device execution model. We do not sell, rent, or monetize your personal or financial data.',
          ],
        },
        {
          heading: '2. Information Processing & Zero Server Uploads',
          body: [
            '100% On-Device Processing: PDF documents, salary structures, earnings, deductions, and tax computations processed by PayslipMax are handled exclusively locally on your device.',
            'Zero Server Uploads: We do not upload or store your financial documents or payslips on external servers or cloud databases.',
            'Local Storage: App preferences, parsed history, and session settings are stored securely within your device\'s local application sandbox.',
          ],
        },
        {
          heading: '3. Third-Party Services & Analytics',
          body: [
            'In-App Subscriptions (RevenueCat): In-app purchases and subscription entitlements are securely validated using RevenueCat and official App Store / Google Play billing APIs. Financial document data is never shared with RevenueCat.',
            'Crash & Diagnostic Telemetry: Anonymous, non-personally identifiable diagnostic logs may be collected solely to resolve app crashes and ensure stability.',
          ],
        },
        {
          heading: '4. Data Retention & Device Permissions',
          body: [
            'Device Permissions: PayslipMax requires document/file access solely to open and parse PDF payslips selected by you.',
            'Retention: Local data persists only while the app is installed or until you clear application storage.',
          ],
        },
        {
          heading: '5. User Rights & Contact Information',
          body: [
            'You retain full ownership of your data at all times.',
            'For privacy inquiries or support requests, contact us at support@ai-borne.in.',
          ],
        },
      ],
    };
  }

  public static getTermsOfService(): ILegalPolicy {
    return {
      title: 'Terms of Service',
      lastUpdated: 'August 24, 2026',
      effectiveDate: 'August 24, 2026',
      contactEmail: 'support@ai-borne.in',
      sections: [
        {
          heading: '1. Agreement to Terms',
          body: [
            'By downloading, installing, or using AI-Borne applications, including PayslipMax, you agree to be bound by these Terms of Service and End User License Agreement (EULA).',
          ],
        },
        {
          heading: '2. Permitted Use & Intellectual Property',
          body: [
            'AI-Borne grants you a personal, non-exclusive, non-transferable license to use PayslipMax for personal and business productivity in accordance with standard store terms.',
            'You agree not to reverse engineer, decompile, or tamper with application binaries.',
          ],
        },
        {
          heading: '3. In-App Subscriptions, Billing & Cancellation',
          body: [
            'Subscriptions: Certain premium features may require a monthly, annual, or lifetime subscription.',
            'Auto-Renewal: Subscriptions automatically renew unless canceled at least 24 hours before the end of the current billing cycle.',
            'Management & Cancellations: You can manage or cancel your subscription at any time through your Apple ID Subscriptions or Google Play Account settings.',
          ],
        },
        {
          heading: '4. Disclaimer of Financial & Legal Advice',
          body: [
            'PayslipMax is an automated productivity tool designed to parse and organize payslip information.',
            'Parsed figures and calculations are provided for informational purposes only and do not constitute official financial, legal, or tax advice. Users should verify calculations against official records.',
          ],
        },
        {
          heading: '5. Limitation of Liability',
          body: [
            'AI-Borne provides applications "as is" without warranty of any kind. In no event shall AI-Borne be liable for any indirect or consequential damages resulting from app usage.',
          ],
        },
      ],
    };
  }

  public static getDataDeletionInstructions(): ILegalPolicy {
    return {
      title: 'Data & Account Deletion Request',
      lastUpdated: 'August 24, 2026',
      effectiveDate: 'August 24, 2026',
      contactEmail: 'support@ai-borne.in',
      sections: [
        {
          heading: '1. Local Device Data Deletion',
          body: [
            'AI-Borne applications like PayslipMax process and store documents locally on your device.',
            'To instantly and permanently erase all local payslip data and history, simply clear the application data/cache in your device Settings or uninstall the app.',
          ],
        },
        {
          heading: '2. Support Correspondence Deletion',
          body: [
            'To request deletion of any support email correspondence or feedback logs, send an email to support@ai-borne.in with the subject "Data Deletion Request".',
            'We confirm and process all deletion requests within 30 days of receipt.',
          ],
        },
      ],
    };
  }
}
