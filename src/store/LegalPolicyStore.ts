import { ILegalPolicy } from '../models/LegalPolicy';

export class LegalPolicyStore {
  public static getPrivacyPolicy(): ILegalPolicy {
    return {
      title: 'Privacy Policy',
      lastUpdated: 'August 2, 2026',
      effectiveDate: 'August 2, 2026',
      contactEmail: 'support@actionstation.in',
      sections: [
        {
          heading: '1. Overview & Commitment to Privacy',
          body: [
            'Action Station ("we", "our", or "us") is dedicated to protecting user privacy.',
            'Our flagship apps, including PayslipMax, process document data locally on your device. We do not transmit, collect, or sell your personal financial documents.',
          ],
        },
        {
          heading: '2. Information We Collect',
          body: [
            'Local Storage: All document metadata, parsed salary figures, and settings are stored strictly in local device storage.',
            'Zero Server Uploads: PDF files and financial documents parsed inside our applications are processed in-memory and on local storage on your device.',
            'Support Communications: If you email support@actionstation.in, we use your message solely to assist with your inquiry.',
          ],
        },
        {
          heading: '3. Analytics and Crash Reporting',
          body: [
            'We do not track user identities or collect sensitive personal data through telemetry.',
            'Aggregated diagnostic metrics (if enabled) are strictly non-identifiable and used to maintain app stability.',
          ],
        },
        {
          heading: '4. Third-Party Access',
          body: [
            'We do not sell, trade, or share user data with any third parties or advertisers.',
          ],
        },
        {
          heading: '5. Contact Information',
          body: [
            'For any privacy questions or data deletion requests, contact us at support@actionstation.in.',
          ],
        },
      ],
    };
  }

  public static getTermsOfService(): ILegalPolicy {
    return {
      title: 'Terms of Service',
      lastUpdated: 'August 2, 2026',
      effectiveDate: 'August 2, 2026',
      contactEmail: 'support@actionstation.in',
      sections: [
        {
          heading: '1. Agreement to Terms',
          body: [
            'By downloading, accessing, or using applications built by Action Station, you agree to be bound by these Terms.',
          ],
        },
        {
          heading: '2. Permitted Use',
          body: [
            'Our apps are provided for personal and professional productivity. You agree not to reverse engineer or tamper with app binary files.',
          ],
        },
        {
          heading: '3. Disclaimer of Warranties',
          body: [
            'Applications are provided "as is" without warranty of any kind. Users remain responsible for verifying parsed financial metrics against original documents.',
          ],
        },
      ],
    };
  }

  public static getDataDeletionInstructions(): ILegalPolicy {
    return {
      title: 'Data & Account Deletion Request',
      lastUpdated: 'August 2, 2026',
      effectiveDate: 'August 2, 2026',
      contactEmail: 'support@actionstation.in',
      sections: [
        {
          heading: '1. Local Device Data Deletion',
          body: [
            'Action Station applications store data locally on your device.',
            'To immediately delete all local data, clear the app data/cache in your device Settings or uninstall the app from your device.',
          ],
        },
        {
          heading: '2. Requesting Support Communication Deletion',
          body: [
            'To request deletion of any support email correspondence, send an email to support@actionstation.in with the subject "Data Deletion Request".',
            'We process all valid deletion requests within 30 days.',
          ],
        },
      ],
    };
  }
}
