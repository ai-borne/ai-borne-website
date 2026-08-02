export interface IStringDictionary {
  nav: {
    home: string;
    apps: string;
    insights: string;
    support: string;
  };
  hero: {
    badge: string;
    tagline: string;
    mission: string;
    ctaExplore: string;
  };
  home: {
    featuredAppsTitle: string;
    featuredAppsSubtitle: string;
    insightsTitle: string;
    viewProductDetails: string;
    minRead: string;
  };
  payslipmax: {
    badge: string;
    privacyBannerLabel: string;
    keyFeaturesTitle: string;
  };
  support: {
    title: string;
    tagline: string;
    directContactTitle: string;
    directContactDesc: string;
    slaNotice: string;
    formTitle: string;
    emailLabel: string;
    emailPlaceholder: string;
    messageLabel: string;
    messagePlaceholder: string;
    sendButton: string;
    sendingButton: string;
    successMessage: string;
  };
  footer: {
    tagline: string;
    productsTitle: string;
    developerTitle: string;
    legalTitle: string;
    copyright: string;
  };
}

export class StringResources {
  private static readonly strings: IStringDictionary = {
    nav: {
      home: 'Home',
      apps: 'Apps',
      insights: 'Insights',
      support: 'Support',
    },
    hero: {
      badge: 'Indie Software Studio',
      tagline: 'Engineering Intelligent Apps, Automation & AI Solutions',
      mission: 'Empowering users with privacy-first, on-device intelligent tools and seamless automations.',
      ctaExplore: 'Explore PayslipMax',
    },
    home: {
      featuredAppsTitle: 'Featured Applications',
      featuredAppsSubtitle: 'Built with modern Kotlin Multiplatform & privacy-first architecture',
      insightsTitle: 'Latest Insights & Hacks',
      viewProductDetails: 'View Product Details →',
      minRead: 'min read',
    },
    payslipmax: {
      badge: 'Finance & Productivity',
      privacyBannerLabel: 'Privacy Guarantee:',
      keyFeaturesTitle: 'Key Capabilities & Features',
    },
    support: {
      title: 'Developer Support Center',
      tagline: 'We are here to assist with PayslipMax, application inquiries, or feedback.',
      directContactTitle: 'Direct Contact Info',
      directContactDesc: 'For official app support, store inquiries, or general feedback:',
      slaNotice: 'Response SLA: We typically respond to support inquiries within 24–48 hours.',
      formTitle: 'Send Support Message',
      emailLabel: 'Your Email Address',
      emailPlaceholder: 'name@domain.com',
      messageLabel: 'Message / Support Details',
      messagePlaceholder: 'How can we help you?',
      sendButton: 'Send Message',
      sendingButton: 'Sending...',
      successMessage: 'Thank you! Your message has been sent successfully.',
    },
    footer: {
      tagline: 'Engineering Intelligent Apps, Automation & AI Solutions.',
      productsTitle: 'Products',
      developerTitle: 'Developer & Insights',
      legalTitle: 'Store Compliance & Legal',
      copyright: 'AI-BORNE (ai-borne.in). All rights reserved.',
    },
  };

  public static getStrings(): IStringDictionary {
    return this.strings;
  }
}
