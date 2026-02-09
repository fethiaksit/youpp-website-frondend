export type HeroSection = {
  type: "hero";
  data: {
    title: string;
    subtitle?: string;
    buttonText?: string;
    buttonHref?: string;
  };
};

export type CtaSection = {
  type: "cta";
  data: {
    title: string;
    buttonText?: string;
    buttonHref?: string;
  };
};

export type Section = HeroSection | CtaSection;

export type SiteResponse = {
  slug: string;
  updated: string;
  published?: boolean;
  content?: {
    sections?: Section[];
  };
};
