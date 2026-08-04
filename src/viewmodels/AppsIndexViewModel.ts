import { IAppMetadata } from '../models/AppMetadata';
import { SiteDataStore } from '../store/SiteDataStore';

export class AppsIndexViewModel {
  public getAllApps(): IAppMetadata[] {
    return SiteDataStore.getApps();
  }
}
