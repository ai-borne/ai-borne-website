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

  public getFeaturedInsightPosts(limit: number = 3): IBlogPost[] {
    const allPosts = SiteDataStore.getPosts();
    const withBadge = allPosts.filter((p) => Boolean(p.metricBadge));
    if (withBadge.length >= limit) {
      return withBadge.slice(0, limit);
    }
    return allPosts.slice(0, limit);
  }
}

