import { IBlogPost } from '../models/BlogPost';
import { SiteDataStore } from '../store/SiteDataStore';

export class BlogViewModel {
  private categoryFilter: string | null = null;
  private searchQuery: string = '';

  public setCategoryFilter(category: string | null): void {
    this.categoryFilter = category;
  }

  public setSearchQuery(query: string): void {
    this.searchQuery = query.trim().toLowerCase();
  }

  public getPosts(): IBlogPost[] {
    let posts = SiteDataStore.getPosts();

    if (this.categoryFilter) {
      posts = posts.filter((p) => p.category === this.categoryFilter);
    }

    if (this.searchQuery) {
      posts = posts.filter(
        (p) =>
          p.title.toLowerCase().includes(this.searchQuery) ||
          p.summary.toLowerCase().includes(this.searchQuery)
      );
    }

    return posts;
  }
}
