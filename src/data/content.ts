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

type N01CardAsset = [id: string, filename: string, width: number, height: number];

const n01Cards: Card[] = (
  [
    ['N01-001', 'N01-001.jpg', 600, 831],
    ['N01-002', 'N01-002.jpg', 600, 806],
    ['N01-003', 'N01-003.jpg', 600, 807],
    ['N01-004', 'N01-004.jpg', 600, 838],
    ['N01-005', 'N01-005.jpg', 600, 884],
    ['N01-006', 'N01-006.jpg', 600, 857],
    ['N01-007', 'N01-007.jpg', 600, 838],
    ['N01-008', 'N01-008.jpg', 600, 838],
    ['N01-009', 'N01-009.jpg', 600, 831],
    ['N01-010', 'N01-010.jpg', 600, 853],
    ['N01-011', 'N01-011.jpg', 600, 838],
    ['N01-012', 'N01-012.jpg', 600, 826],
    ['N01-013', 'N01-013.jpg', 600, 838],
    ['N01-014', 'N01-014.jpg', 600, 835],
    ['N01-015', 'N01-015.jpg', 600, 838],
    ['N01-016', 'N01-016.jpg', 600, 831],
    ['N01-017', 'N01-017.jpg', 600, 834],
    ['N01-018', 'N01-018.jpg', 600, 837],
    ['N01-019', 'N01-019.jpg', 600, 850],
    ['N01-020', 'N01-020.jpg', 600, 835],
    ['N01-021', 'N01-021.jpg', 600, 832],
    ['N01-022', 'N01-022.jpg', 600, 830],
    ['SAMPLE-1', 'SAMPLE-1.jpg', 600, 838],
    ['SAMPLE-2', 'SAMPLE-2.jpg', 600, 838],
    ['SAMPLE-3', 'SAMPLE-3.jpg', 600, 838],
    ['SAMPLE-4', 'SAMPLE-4.jpg', 600, 838],
    ['SAMPLE-5', 'SAMPLE-5.jpg', 600, 838],
    ['SAMPLE-6', 'SAMPLE-6.jpg', 600, 838],
    ['SAMPLE-7', 'SAMPLE-7.jpg', 600, 838],
    ['SAMPLE-8', 'SAMPLE-8.jpg', 600, 838],
    ['SAMPLE-9', 'SAMPLE-9.jpg', 600, 838],
    ['SAMPLE-10', 'SAMPLE-10.jpg', 600, 838],
  ] satisfies N01CardAsset[]
).map(([id, filename, width, height]) => ({
  id,
  slug: id.toLowerCase(),
  name: id,
  setCode: 'N01',
  setName: 'N01',
  image: {
    src: `/Cards/N01/${filename}`,
    alt: `${id} card`,
    width,
    height,
  },
  confirmedFields: [],
  updatedAt: '2026-09-23',
  sourceLabel: 'NarutoCardGuide card archive',
  sourceUrl: '/cards-list/',
  printings: [],
  relatedNewsSlugs: [],
  relatedGuideSlugs: [],
}));

export const news: NewsArticle[] = [];
export const cards: Card[] = n01Cards;
export const guides: Guide[] = [
  {
    slug: 'complete-naruto-card-game-rules',
    title: 'Complete Naruto Card Game Rules',
    summary: 'A clear starting point for understanding the flow of a NARUTO CARD GAME match.',
    category: 'Rules',
    difficulty: 'Beginner',
    readingTime: '5 min read',
    verifiedAt: '2026-09-25',
    sections: [],
    officialResources: [],
    relatedCardIds: [],
    relatedGuideSlugs: ['how-to-read-cards', 'glossary-key-terms'],
    order: 1,
  },
  {
    slug: 'how-to-read-cards',
    title: 'How to read cards : Stats, Costs & Effects',
    summary: 'Learn where to find the key information on a card and how to read it at a glance.',
    category: 'Core Mechanics',
    difficulty: 'Beginner',
    readingTime: '4 min read',
    verifiedAt: '2026-09-25',
    sections: [],
    officialResources: [],
    relatedCardIds: [],
    relatedGuideSlugs: ['complete-naruto-card-game-rules', 'glossary-key-terms'],
    order: 2,
  },
  {
    slug: 'glossary-key-terms',
    title: 'Glossary : Key Terms & Keywords Explained',
    summary: 'A quick reference for the words and keywords you will encounter while learning the game.',
    category: 'Glossary',
    difficulty: 'Beginner',
    readingTime: '3 min read',
    verifiedAt: '2026-09-25',
    sections: [],
    officialResources: [],
    relatedCardIds: [],
    relatedGuideSlugs: ['complete-naruto-card-game-rules', 'how-to-read-cards'],
    order: 3,
  },
];
export const sets: CardSet[] = [
  {
    code: 'N01',
    slug: 'n01',
    name: 'N01',
    sourceLabel: 'NarutoCardGuide card archive',
    sourceUrl: '/cards-list/',
    cardIds: n01Cards.map((card) => card.id),
    relatedNewsSlugs: [],
  },
];

export const releaseMilestones = [
  {
    period: 'Summer 2027',
    title: 'NARUTO CARD GAME arrives',
    description: 'An exact release date has not been announced.',
  },
] as const;

export const navigation = [
  { label: 'Simulator', href: '/simulator/' },
  { label: 'News', href: '/news/' },
  { label: 'Cards List', href: '/cards-list/' },
  { label: 'Beginner Guides', href: '/beginner-guides/' },
] as const;
