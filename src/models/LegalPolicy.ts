export interface ILegalSection {
  heading: string;
  body: string[];
}

export interface ILegalPolicy {
  title: string;
  lastUpdated: string;
  effectiveDate: string;
  contactEmail: string;
  contactPhone?: string;
  contactAddress?: readonly string[];
  sections: ILegalSection[];
}
