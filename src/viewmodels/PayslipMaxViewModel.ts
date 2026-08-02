import { IAppMetadata } from '../models/AppMetadata';
import { SiteDataStore } from '../store/SiteDataStore';

export class PayslipMaxViewModel {
  public getAppDetails(): IAppMetadata {
    const app = SiteDataStore.getAppById('payslipmax');
    if (!app) {
      throw new Error('PayslipMax app metadata not found');
    }
    return app;
  }
}
