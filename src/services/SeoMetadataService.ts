import { IBlogPost } from '../models/BlogPost';
import { SiteDataStore } from '../store/SiteDataStore';

export interface ISchemaTechArticle {
  '@context': string;
  '@type': string;
  headline: string;
  description: string;
  author: {
    '@type': string;
    name: string;
    url?: string;
  };
  publisher: {
    '@type': string;
    name: string;
    url: string;
    logo: {
      '@type': string;
      url: string;
    };
  };
  datePublished: string;
  dateModified: string;
  mainEntityOfPage: string;
  keywords: string;
  articleSection: string;
  proficiencyLevel: string;
}

export interface IMetaTagEntry {
  name?: string;
  property?: string;
  content: string;
}

export class SeoMetadataService {
  private static readonly DEFAULT_AUTHOR = 'Sunil Pawar';
  private static readonly AUTHOR_URL = 'https://github.com/sunilpawar-git';

  public static generateTechArticleSchema(post: IBlogPost): ISchemaTechArticle {
    const config = SiteDataStore.getConfig();
    const domain = config.domain;
    const postUrl = `https://${domain}/blog/post.html?slug=${encodeURIComponent(post.slug)}`;
    const logoUrl = `https://${domain}/assets/logo-icon-dark.png`;

    const keywords = post.tags && post.tags.length > 0
      ? post.tags.join(', ')
      : `${post.category}, AI-Borne, Engineering`;

    return {
      '@context': 'https://schema.org',
      '@type': 'TechArticle',
      headline: post.title,
      description: post.summary,
      author: {
        '@type': 'Person',
        name: !post.author || post.author.includes('AI-Borne') ? this.DEFAULT_AUTHOR : post.author,
        url: this.AUTHOR_URL,
      },
      publisher: {
        '@type': 'Organization',
        name: config.studioName,
        url: `https://${domain}`,
        logo: {
          '@type': 'ImageObject',
          url: logoUrl,
        },
      },
      datePublished: post.publishedDate,
      dateModified: post.publishedDate,
      mainEntityOfPage: postUrl,
      keywords,
      articleSection: post.category,
      proficiencyLevel: post.difficulty || 'Advanced',
    };
  }

  public static getMetaTagDefinitions(post: IBlogPost): IMetaTagEntry[] {
    const config = SiteDataStore.getConfig();
    const domain = config.domain;
    const postUrl = `https://${domain}/blog/post.html?slug=${encodeURIComponent(post.slug)}`;
    const pageTitle = `${post.title} — AI-Borne Insights`;
    const logoUrl = `https://${domain}/assets/logo-icon-dark.png`;

    return [
      { name: 'description', content: post.summary },
      { property: 'og:title', content: pageTitle },
      { property: 'og:description', content: post.summary },
      { property: 'og:type', content: 'article' },
      { property: 'og:url', content: postUrl },
      { property: 'og:site_name', content: config.studioName },
      { property: 'og:image', content: logoUrl },
      { property: 'article:published_time', content: post.publishedDate },
      { property: 'article:author', content: this.DEFAULT_AUTHOR },
      { property: 'article:section', content: post.category },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: pageTitle },
      { name: 'twitter:description', content: post.summary },
      { name: 'twitter:image', content: logoUrl },
    ];
  }

  public static applyPostMetadata(
    post: IBlogPost,
    doc: Document = typeof document !== 'undefined' ? document : (null as any)
  ): void {
    if (!doc || !doc.head) return;

    doc.title = `${post.title} — AI-Borne Insights`;

    const metaTags = this.getMetaTagDefinitions(post);
    for (const tagDef of metaTags) {
      const selector = tagDef.name
        ? `meta[name="${tagDef.name}"]`
        : `meta[property="${tagDef.property}"]`;
      let metaEl = doc.querySelector<HTMLMetaElement>(selector);

      if (!metaEl) {
        metaEl = doc.createElement('meta');
        if (tagDef.name) {
          metaEl.setAttribute('name', tagDef.name);
        } else if (tagDef.property) {
          metaEl.setAttribute('property', tagDef.property);
        }
        doc.head.appendChild(metaEl);
      }
      metaEl.setAttribute('content', tagDef.content);
    }

    const schema = this.generateTechArticleSchema(post);
    let scriptEl = doc.getElementById('schema-tech-article') as HTMLScriptElement | null;
    if (!scriptEl) {
      scriptEl = doc.createElement('script');
      scriptEl.id = 'schema-tech-article';
      scriptEl.setAttribute('id', 'schema-tech-article');
      scriptEl.type = 'application/ld+json';
      scriptEl.setAttribute('type', 'application/ld+json');
      doc.head.appendChild(scriptEl);
    }
    scriptEl.textContent = JSON.stringify(schema, null, 2);
  }
}
