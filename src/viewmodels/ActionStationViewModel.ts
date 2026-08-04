import { IAppMetadata } from '../models/AppMetadata';
import { SiteDataStore } from '../store/SiteDataStore';

export class ActionStationViewModel {
  public getAppDetails(): IAppMetadata {
    const app = SiteDataStore.getAppById('action-station');
    if (!app) {
      throw new Error('ActionStation app metadata not found');
    }
    return app;
  }
}
