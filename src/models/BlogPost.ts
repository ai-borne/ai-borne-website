export interface IBlogPost {
  slug: string;
  title: string;
  summary: string;
  category: 'App Engineering' | 'Automation' | 'AI' | 'Tax Tech';
  publishedDate: string;
  author: string;
  readTimeMinutes: number;
  contentMarkdown: string;
}
