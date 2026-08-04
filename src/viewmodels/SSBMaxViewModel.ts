import { IAppMetadata } from '../models/AppMetadata';
import { SiteDataStore } from '../store/SiteDataStore';

export class SSBMaxViewModel {
  public getAppDetails(): IAppMetadata {
    const app = SiteDataStore.getAppById('ssbmax');
    if (!app) {
      throw new Error('SSBMax app metadata not found');
    }
    return app;
  }
}
