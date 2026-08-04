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
  appsIndex: {
    title: string;
    subtitle: string;
  };
  payslipmax: {
    badge: string;
    privacyBannerLabel: string;
    keyFeaturesTitle: string;
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
    },
    appsIndex: {
      title: 'Our App Ecosystem',
      subtitle: 'Discover our privacy-first tools, AI automations, and intelligent platforms',
    },
    payslipmax: {
      badge: 'Finance & Productivity',
      privacyBannerLabel: 'Privacy Guarantee:',
      keyFeaturesTitle: 'Key Capabilities & Features',
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
      networkError: 'Failed to send message. Please try again later or email support@ai-borne.in directly.',
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
