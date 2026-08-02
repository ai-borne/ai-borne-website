import { IAppMetadata } from '../models/AppMetadata';
import { IBlogPost } from '../models/BlogPost';

export interface ISiteConfig {
  studioName: string;
  domain: string;
  tagline: string;
  mission: string;
  supportEmail: string;
  githubUrl: string;
}

export class SiteDataStore {
  private static readonly config: ISiteConfig = {
    studioName: 'Action Station',
    domain: 'actionstation.in',
    tagline: 'Engineering Intelligent Apps, Automation & AI Solutions',
    mission: 'Empowering users with privacy-first, on-device intelligent tools and seamless automations.',
    supportEmail: 'support@actionstation.in',
    githubUrl: 'https://github.com/sunilpawar-git',
  };

  private static readonly apps: IAppMetadata[] = [
    {
      id: 'payslipmax',
      name: 'PayslipMax',
      tagline: 'Smart On-Device Salary & PDF Payslip Parser',
      description: 'Automatically extract, analyze, and manage salary breakdowns from PDF payslips with 100% privacy guarantee. No server uploads.',
      version: '1.0.0',
      category: 'Finance & Productivity',
      privacyGuarantee: '100% On-Device Processing. Zero Cloud Data Transfer.',
      features: [
        {
          id: 'pdf-parser',
          title: 'Automated PDF Parsing',
          description: 'Extract earnings, deductions, allowances, and tax withholding instantly.',
          icon: 'document-text',
        },
        {
          id: 'privacy-first',
          title: 'Zero Cloud Storage',
          description: 'Your sensitive financial documents never leave your phone or laptop.',
          icon: 'shield-check',
        },
        {
          id: 'tax-insights',
          title: 'Salary & Tax Breakdown',
          description: 'Visualize net vs gross pay and track monthly compensation trends.',
          icon: 'chart-bar',
        },
      ],
      appStoreUrl: '#',
      playStoreUrl: '#',
    },
  ];

  private static readonly posts: IBlogPost[] = [
    {
      slug: 'privacy-first-local-pdf-parsing',
      title: 'Building Privacy-First PDF Parsing on Mobile Devices',
      summary: 'How we engineered zero-cloud, on-device financial document parsing for instant execution.',
      category: 'App Engineering',
      publishedDate: '2026-08-01',
      author: 'Action Station Team',
      readTimeMinutes: 5,
      contentMarkdown: 'Privacy in mobile financial applications is paramount. By parsing documents locally, user data never touches external servers.',
    },
    {
      slug: 'kotlin-multiplatform-automation-patterns',
      title: 'Kotlin Multiplatform Architecture for High Performance Apps',
      summary: 'Practical architectural patterns for sharing core business logic across iOS and Android.',
      category: 'Automation',
      publishedDate: '2026-07-28',
      author: 'Action Station Team',
      readTimeMinutes: 7,
      contentMarkdown: 'Kotlin Multiplatform allows sharing business logic across iOS, Android, and Desktop seamlessly.',
    },
  ];

  public static getConfig(): ISiteConfig {
    return { ...this.config };
  }

  public static getApps(): IAppMetadata[] {
    return [...this.apps];
  }

  public static getAppById(id: string): IAppMetadata | undefined {
    return this.apps.find((app) => app.id === id);
  }

  public static getPosts(): IBlogPost[] {
    return [...this.posts];
  }

  public static getPostBySlug(slug: string): IBlogPost | undefined {
    return this.posts.find((post) => post.slug === slug);
  }
}
