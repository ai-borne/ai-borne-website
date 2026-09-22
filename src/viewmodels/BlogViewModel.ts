import { IBlogPost } from '../models/BlogPost';
import { SiteDataStore } from '../store/SiteDataStore';

export class BlogViewModel {
  private categoryFilter: string | null = null;
  private searchQuery: string = '';

  public setCategoryFilter(category: string | null): void {
    this.categoryFilter = category;
  }

  public getCategoryFilter(): string | null {
    return this.categoryFilter;
  }

  public setSearchQuery(query: string): void {
    this.searchQuery = query.trim().toLowerCase();
  }

  public getSearchQuery(): string {
    return this.searchQuery;
  }

  public getCategories(): string[] {
    const canonicalOrder = ['App Engineering', 'Automation', 'AI', 'Tax Tech'];
    const allPosts = SiteDataStore.getPosts();
    const presentCategories = new Set(allPosts.map((p) => p.category));
    const ordered: string[] = [];

    for (const cat of canonicalOrder) {
      if (presentCategories.has(cat as any)) {
        ordered.push(cat);
        presentCategories.delete(cat as any);
      }
    }
    return [...ordered, ...Array.from(presentCategories).sort()];
  }

  public getFilterCount(category?: string | null): number {
    const allPosts = SiteDataStore.getPosts();
    if (category !== undefined) {
      if (!category) {
        return allPosts.length;
      }
      return allPosts.filter((p) => p.category === category).length;
    }
    return this.getPosts().length;
  }

  public getPosts(): IBlogPost[] {
    let posts = SiteDataStore.getPosts();

    if (this.categoryFilter) {
      posts = posts.filter((p) => p.category === this.categoryFilter);
    }

    if (this.searchQuery) {
      posts = posts.filter((p) => {
        const titleMatch = p.title.toLowerCase().includes(this.searchQuery);
        const summaryMatch = p.summary.toLowerCase().includes(this.searchQuery);
        const categoryMatch = p.category.toLowerCase().includes(this.searchQuery);
        const tagsMatch = p.tags
          ? p.tags.some((tag) => tag.toLowerCase().includes(this.searchQuery))
          : false;
        return titleMatch || summaryMatch || categoryMatch || tagsMatch;
      });
    }

    return posts;
  }
}

