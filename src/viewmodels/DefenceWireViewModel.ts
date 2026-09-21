import { IAppMetadata } from '../models/AppMetadata';
import { SiteDataStore } from '../store/SiteDataStore';

export class DefenceWireViewModel {
  public getAppDetails(): IAppMetadata {
    const app = SiteDataStore.getAppById('defencewire');
    if (!app) {
      throw new Error('DefenceWire app metadata not found');
    }
    return app;
  }
}
