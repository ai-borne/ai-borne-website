import { ISiteConfig, SiteDataStore } from '../store/SiteDataStore';
import { IAppMetadata } from '../models/AppMetadata';
import { IBlogPost } from '../models/BlogPost';

export class HomeViewModel {
  public getConfig(): ISiteConfig {
    return SiteDataStore.getConfig();
  }

  public getFeaturedApps(): IAppMetadata[] {
    return SiteDataStore.getApps();
  }

  public getRecentPosts(limit: number = 3): IBlogPost[] {
    return SiteDataStore.getPosts().slice(0, limit);
  }
}
