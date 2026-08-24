import { IAppMetadata, IComplianceCard } from '../models/AppMetadata';
import { SiteDataStore } from '../store/SiteDataStore';
import { StringResources } from '../store/StringResources';

export class PayslipMaxViewModel {
  public getAppDetails(): IAppMetadata {
    const app = SiteDataStore.getAppById('payslipmax');
    if (!app) {
      throw new Error('PayslipMax app metadata not found');
    }
    return app;
  }

  public getComplianceCards(): IComplianceCard[] {
    const strings = StringResources.getStrings();
    return [
      {
        id: 'privacy-policy',
        title: strings.payslipmax.privacyCardTitle,
        description: strings.payslipmax.privacyCardDesc,
        url: '/privacy-policy.html',
      },
      {
        id: 'terms-of-service',
        title: strings.payslipmax.termsCardTitle,
        description: strings.payslipmax.termsCardDesc,
        url: '/terms.html',
      },
      {
        id: 'data-deletion',
        title: strings.payslipmax.deletionCardTitle,
        description: strings.payslipmax.deletionCardDesc,
        url: '/data-deletion.html',
      },
    ];
  }
}
