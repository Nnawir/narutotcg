export type ImageAsset = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

export const newsCategories = ['Official News', 'Card Reveals', 'Products', 'Events', 'Rules'] as const;

export type NewsCategory = (typeof newsCategories)[number];

export type NewsArticle = {
  slug: string;
  title: string;
  summary: string;
  category: NewsCategory;
  publishedAt: string;
  updatedAt?: string;
  sourceLabel: string;
  sourceUrl: string;
  featured: boolean;
  image?: ImageAsset;
  confirmedFacts: string[];
  sections: Array<{ heading: string; paragraphs: string[] }>;
  relatedCardIds: string[];
  relatedGuideSlugs: string[];
};

export type CardPrinting = {
  id: string;
  label: string;
  image?: ImageAsset;
  sourceLabel?: string;
  sourceUrl?: string;
};

export type Card = {
  id: string;
  slug: string;
  name: string;
  setCode: string;
  setName: string;
  image: ImageAsset;
  confirmedFields: Array<{ label: string; value: string }>;
  revealedAt?: string;
  updatedAt: string;
  sourceLabel: string;
  sourceUrl: string;
  printings: CardPrinting[];
  relatedNewsSlugs: string[];
  relatedGuideSlugs: string[];
};

export type GuideSection = {
  id: string;
  heading: string;
  paragraphs: string[];
  callout?: { label: string; text: string };
};

export type Guide = {
  slug: string;
  title: string;
  summary: string;
  category: 'Start Here' | 'Rules' | 'Core Mechanics' | 'First Deck' | 'Glossary';
  difficulty: string;
  readingTime: string;
  verifiedAt: string;
  image?: ImageAsset;
  sections: GuideSection[];
  officialResources: Array<{ label: string; url: string }>;
  relatedCardIds: string[];
  relatedGuideSlugs: string[];
  order: number;
};

export type CardSet = {
  code: string;
  slug: string;
  name: string;
  releaseInformation?: string;
  sourceLabel: string;
  sourceUrl: string;
  cardIds: string[];
  relatedNewsSlugs: string[];
};

// Production content stays empty until an authoritative source confirms it.
// Add records here without changing page or component code.
export const news: NewsArticle[] = [];
export const cards: Card[] = [];
export const guides: Guide[] = [];
export const sets: CardSet[] = [];

export const releaseMilestones = [
  {
    period: 'Summer 2027',
    title: 'NARUTO CARD GAME arrives',
    description: 'An exact release date has not been announced.',
  },
] as const;

export const navigation = [
  { label: 'News', href: '/news/' },
  { label: 'Cards List', href: '/cards-list/' },
  { label: 'Beginner Guides', href: '/beginner-guides/' },
] as const;
