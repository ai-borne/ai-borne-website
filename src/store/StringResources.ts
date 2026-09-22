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
    exploreAllInsights: string;
    readArticle: string;
    viewAllInsightsLink: string;
  };
  blog: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    filterAll: string;
    filterAppEngineering: string;
    filterAutomation: string;
    filterAi: string;
    filterTaxTech: string;
    readArticle: string;
    exploreAllPlaybooks: string;
    keyTakeawaysTitle: string;
    relatedPlaybooksTitle: string;
    emptyTitle: string;
    emptyDescription: string;
    backToAllArticles: string;
    showingCount: string;
    in30SecondsTitle: string;
    copyCode: string;
    copiedCode: string;
    breadcrumbAllInsights: string;
    articleNotFoundTitle: string;
    articleNotFoundDesc: string;
  };
  appsIndex: {
    title: string;
    subtitle: string;
  };
  payslipmax: {
    badge: string;
    privacyBannerLabel: string;
    keyFeaturesTitle: string;
    complianceTitle: string;
    privacyCardTitle: string;
    privacyCardDesc: string;
    termsCardTitle: string;
    termsCardDesc: string;
    deletionCardTitle: string;
    deletionCardDesc: string;
    readPolicyLink: string;
  };
  ssbmax: {
    badge: string;
    privacyBannerLabel: string;
    keyFeaturesTitle: string;
  };
  yogaOfEating: {
    badge: string;
    privacyBannerLabel: string;
    keyFeaturesTitle: string;
  };
  actionStation: {
    badge: string;
    privacyBannerLabel: string;
    keyFeaturesTitle: string;
  };
  defencewire: {
    badge: string;
    privacyBannerLabel: string;
    keyFeaturesTitle: string;
    launchButton: string;
  };
  securemax: {
    badge: string;
    privacyBannerLabel: string;
    keyFeaturesTitle: string;
    launchButton: string;
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
    invalidEmailError: string;
    emptyMessageError: string;
    networkError: string;
    botVerificationFailed: string;
    botVerificationPending: string;
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
      ctaExplore: 'Explore App Suite',
    },
    home: {
      featuredAppsTitle: 'Featured Applications',
      featuredAppsSubtitle: 'Built with modern Kotlin Multiplatform, SwiftUI, React & privacy-first AI architecture',
      insightsTitle: 'Latest Insights & Hacks',
      viewProductDetails: 'View Product Details →',
      minRead: 'min read',
      exploreAllInsights: 'Explore All Insights & Engineering Playbooks →',
      readArticle: 'Read Article →',
      viewAllInsightsLink: 'View all',
    },
    blog: {
      title: 'Insights & Engineering Playbooks',
      subtitle: 'Deep-dives into on-device parsing, multiplatform state machines, autonomous systems, and zero-trust engineering.',
      searchPlaceholder: 'Search playbooks by keyword, architecture, or tag...',
      filterAll: 'All Categories',
      filterAppEngineering: 'App Engineering',
      filterAutomation: 'Automation',
      filterAi: 'AI',
      filterTaxTech: 'Tax Tech',
      readArticle: 'Read Article →',
      exploreAllPlaybooks: 'Explore All Insights & Engineering Playbooks →',
      keyTakeawaysTitle: 'Key Engineering Takeaways',
      relatedPlaybooksTitle: 'Related Engineering Playbooks',
      emptyTitle: 'No engineering playbooks found',
      emptyDescription: 'Try adjusting your search query or switching category filters.',
      backToAllArticles: '← Back to All Articles',
      showingCount: 'Showing engineering playbooks',
      in30SecondsTitle: '⚡ In 30 Seconds',
      copyCode: 'Copy',
      copiedCode: 'Copied!',
      breadcrumbAllInsights: 'All Insights',
      articleNotFoundTitle: 'Article Not Found',
      articleNotFoundDesc: 'The article you are looking for does not exist or has been moved.',
    },
    appsIndex: {
      title: 'Our App Ecosystem',
      subtitle: 'Discover our privacy-first tools, AI automations, and intelligent platforms',
    },
    payslipmax: {
      badge: 'Finance & Productivity',
      privacyBannerLabel: 'Privacy Guarantee:',
      keyFeaturesTitle: 'Key Capabilities & Features',
      complianceTitle: 'Store Compliance & Legal',
      privacyCardTitle: 'Privacy Policy',
      privacyCardDesc: '100% on-device parsing. Zero cloud uploads of your personal documents or sensitive salary information.',
      termsCardTitle: 'Terms of Service',
      termsCardDesc: 'Standard App Store & Play Store terms, End User License Agreement (EULA), and transparent subscription management.',
      deletionCardTitle: 'Data Deletion & Retention',
      deletionCardDesc: 'Instant local data wiping on device cache clear, with dedicated 30-day support communication deletion SLA.',
      readPolicyLink: 'View Document →',
    },
    ssbmax: {
      badge: 'Defense Prep & AI',
      privacyBannerLabel: 'Security Guarantee:',
      keyFeaturesTitle: 'Key Capabilities & Features',
    },
    yogaOfEating: {
      badge: 'Health & Mindfulness',
      privacyBannerLabel: 'Privacy Guarantee:',
      keyFeaturesTitle: 'Key Capabilities & Features',
    },
    actionStation: {
      badge: 'Productivity & Knowledge',
      privacyBannerLabel: 'Architecture Highlight:',
      keyFeaturesTitle: 'Key Capabilities & Features',
    },
    defencewire: {
      badge: 'Defense & Strategic Intelligence',
      privacyBannerLabel: 'Intelligence Guarantee:',
      keyFeaturesTitle: 'Key Capabilities & Strategic Features',
      launchButton: 'Launch DefenceWire.in →',
    },
    securemax: {
      badge: 'Enterprise & Physical Security',
      privacyBannerLabel: 'Compliance Guarantee:',
      keyFeaturesTitle: 'Key Capabilities & Security Architecture',
      launchButton: 'Explore Security Platform →',
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
      invalidEmailError: 'Please enter a valid email address.',
      emptyMessageError: 'Support message details cannot be empty.',
      networkError: 'Failed to send message. Please try again later or email founder@ai-borne.in directly.',
      botVerificationFailed: 'Security check failed. Please refresh the page and try again.',
      botVerificationPending: 'Completing security verification...',
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
