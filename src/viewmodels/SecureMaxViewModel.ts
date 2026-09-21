import { IAppMetadata } from '../models/AppMetadata';
import { SiteDataStore } from '../store/SiteDataStore';

export class SecureMaxViewModel {
  public getAppDetails(): IAppMetadata {
    const app = SiteDataStore.getAppById('securemax');
    if (!app) {
      throw new Error('SecureMax app metadata not found');
    }
    return app;
  }
}
