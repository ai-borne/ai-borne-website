export interface IAppFeature {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface IComplianceCard {
  id: string;
  title: string;
  description: string;
  url: string;
  badge?: string;
}

export interface IAppMetadata {
  id: string;
  name: string;
  tagline: string;
  description: string;
  version: string;
  category: string;
  privacyGuarantee: string;
  features: IAppFeature[];
  appStoreUrl?: string;
  playStoreUrl?: string;
}
