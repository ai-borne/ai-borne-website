import { IAppMetadata } from '../models/AppMetadata';
import { SiteDataStore } from '../store/SiteDataStore';

export class YogaOfEatingViewModel {
  public getAppDetails(): IAppMetadata {
    const app = SiteDataStore.getAppById('yoga-of-eating');
    if (!app) {
      throw new Error('Yoga of Eating app metadata not found');
    }
    return app;
  }
}
