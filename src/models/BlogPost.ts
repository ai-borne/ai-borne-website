export type BlogCategory = 'App Engineering' | 'Automation' | 'AI' | 'Tax Tech';

export interface IBlogPost {
  slug: string;
  title: string;
  summary: string;
  category: BlogCategory;
  publishedDate: string;
  author: string;
  readTimeMinutes: number;
  contentMarkdown: string;
  metricBadge?: string;
  tags?: string[];
  difficulty?: 'Intermediate' | 'Advanced';
}

