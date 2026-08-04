import { IAppMetadata } from '../models/AppMetadata';
import { IBlogPost } from '../models/BlogPost';
import { MarkdownPostLoader } from '../services/MarkdownPostLoader';

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
    studioName: 'AI-Borne',
    domain: 'ai-borne.in',
    tagline: 'Engineering Intelligent Apps, Automation & AI Solutions',
    mission: 'Empowering users with privacy-first, on-device intelligent tools and seamless automations.',
    supportEmail: 'support@ai-borne.in',
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
    {
      id: 'ssbmax',
      name: 'SSBMax',
      tagline: 'AI-Powered SSB Test Automation & Officer Like Qualities (OLQ) Preparation',
      description: 'Automate Services Selection Board (SSB) tests including OIR, PPDT, TAT, WAT, SRT, GPE, and AI-driven mock interviews with instant OLQ feedback.',
      version: '1.0.0',
      category: 'Defense Prep & AI',
      privacyGuarantee: 'Encrypted AI Processing & Direct Multi-Agent Scoring Engine.',
      features: [
        {
          id: 'ssb-test-suite',
          title: 'Comprehensive SSB Test Suite',
          description: 'Practice Officer Intelligence Rating (OIR), PPDT, TAT, WAT, SRT, and GPE with timed practice sets.',
          icon: 'academic-cap',
        },
        {
          id: 'ai-mock-interview',
          title: 'AI-Driven Mock Interviews',
          description: 'Simulate real IO interviews with speech-to-text integration and instant feedback.',
          icon: 'microphone',
        },
        {
          id: 'olq-scoring',
          title: 'Officer Like Qualities (OLQ) Analysis',
          description: 'Track and evaluate your 15 OLQs through multi-agent scoring models.',
          icon: 'chart-bar',
        },
      ],
      appStoreUrl: '#',
      playStoreUrl: '#',
    },
    {
      id: 'yoga-of-eating',
      name: 'Yoga of Eating',
      tagline: 'Mindful Eating Journal & AI-Driven Wellness Companion',
      description: 'Transform your relationship with food through mindful meal logging, HealthKit sleep integration, and an interactive AI smiley companion.',
      version: '1.0.0',
      category: 'Health & Mindfulness',
      privacyGuarantee: 'Privacy-First Architecture with On-Device HealthKit Integration.',
      features: [
        {
          id: 'mindful-journal',
          title: 'Mindful Eating Journal',
          description: 'Log meals with emotional and sensory awareness to cultivate healthier habits.',
          icon: 'heart',
        },
        {
          id: 'ai-smiley',
          title: 'Reactive AI Smiley Companion',
          description: 'Real-time feedback and mood scoring driven by meal quality and daily habits.',
          icon: 'sparkles',
        },
        {
          id: 'healthkit-insights',
          title: 'HealthKit & Sleep Synthesis',
          description: 'Synthesize sleep and daily activity with nutrition to discover holistic wellness patterns.',
          icon: 'activity-ring',
        },
      ],
      appStoreUrl: '#',
      playStoreUrl: '#',
    },
    {
      id: 'action-station',
      name: 'ActionStation',
      tagline: 'AI-Powered Infinite Canvas & BASB Knowledge Synthesis Engine',
      description: 'An infinite whiteboard workspace built on Building a Second Brain (BASB / PARA Framework) to capture, connect, and synthesize ideas into actionable projects.',
      version: '1.0.0',
      category: 'Productivity & Knowledge',
      privacyGuarantee: 'Secure Cloud & Local Workspace Synchronization.',
      features: [
        {
          id: 'infinite-canvas',
          title: 'Infinite Visual Canvas',
          description: 'Drag-and-drop node graph (ReactFlow + TipTap) for seamless visual thinking and note-taking.',
          icon: 'view-boards',
        },
        {
          id: 'basb-para',
          title: 'BASB & PARA Methodology',
          description: 'Organize ideas into Projects, Areas, Resources, and Archives effortlessly.',
          icon: 'folder-open',
        },
        {
          id: 'gemini-synthesis',
          title: 'Gemini AI Synthesis',
          description: 'Clustering and AI-driven synthesis tools to transform raw notes into structured action plans.',
          icon: 'light-bulb',
        },
      ],
      appStoreUrl: '#',
      playStoreUrl: '#',
    },
  ];

  private static readonly fallbackPosts: IBlogPost[] = [
    {
      slug: 'privacy-first-local-pdf-parsing',
      title: 'Building Privacy-First PDF Parsing on Mobile Devices',
      summary: 'How we engineered zero-cloud, on-device financial document parsing for instant execution.',
      category: 'App Engineering',
      publishedDate: '2026-08-01',
      author: 'AI-Borne Team',
      readTimeMinutes: 5,
      contentMarkdown: 'Privacy in mobile financial applications is paramount. By parsing documents locally, user data never touches external servers.',
    },
    {
      slug: 'kotlin-multiplatform-automation-patterns',
      title: 'Kotlin Multiplatform Architecture for High Performance Apps',
      summary: 'Practical architectural patterns for sharing core business logic across iOS and Android.',
      category: 'Automation',
      publishedDate: '2026-07-28',
      author: 'AI-Borne Team',
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
    try {
      const loaded = MarkdownPostLoader.loadPosts();
      if (loaded.length > 0) {
        return loaded;
      }
    } catch {
      // Fallback if import.meta.glob is unavailable (e.g. non-Vite test environments)
    }
    return [...this.fallbackPosts];
  }

  public static getPostBySlug(slug: string): IBlogPost | undefined {
    return this.getPosts().find((post) => post.slug === slug);
  }
}
