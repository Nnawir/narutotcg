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
  publishedAt?: string;
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

export type TimelineItem = {
  id: string;
  title: string;
  summary: string;
  type: 'Official news' | 'Event' | 'Roadmap';
  /** ISO date used only to place the item. `dateLabel` is the official wording shown to visitors. */
  date: string;
  dateLabel: string;
  sourceUrl: string;
  articleSlug?: string;
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
  bullets?: string[];
  steps?: string[];
  table?: GuideTable;
  image?: { src: string; alt: string };
  statBlocks?: Array<{
    label: string;
    image: { src: string; alt: string };
    stats: Array<{ name: string; description: string }>;
  }>;
  cards?: Array<{ text: string; image: { src: string; alt: string } }>;
  links?: Array<{ label: string; href: string }>;
  subsections?: Array<{
    id?: string;
    heading: string;
    paragraphs?: string[];
    bullets?: string[];
    steps?: string[];
    table?: GuideTable;
  }>;
};

type GuideTable = {
  headers: string[];
  rows: string[][];
  images?: Array<Array<{ src: string; alt: string } | undefined>>;
  examples?: Array<{ label: string; image: { src: string; alt: string } } | undefined>;
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

export const news: NewsArticle[] = [
  {
    slug: 'spiel-essen-2026-event-information',
    title: 'SPIEL Essen Event Information',
    summary: 'Bandai announced NARUTO CARD GAME Tutorial Sessions at SPIEL Essen in Germany.',
    category: 'Events',
    publishedAt: '2026-09-04',
    sourceLabel: 'NARUTO CARD GAME Official Website — SPIEL Essen Event Information',
    sourceUrl: 'https://www.naruto-cardgame.com/en/news/spielessen-2026.php',
    featured: true,
    confirmedFacts: [
      'SPIEL Essen runs from October 22 to 25, 2026.',
      'The event is at Messe Essen, Germany.',
      'Bandai lists a NARUTO CARD GAME Tutorial Session.',
    ],
    sections: [
      {
        heading: 'What is happening',
        paragraphs: [
          'NARUTO CARD GAME is scheduled to appear at SPIEL Essen, taking place from October 22 to 25, 2026. Bandai lists the event at Messe Essen in Essen, Germany.',
          'The announced activity is a Tutorial Session, giving visitors an opportunity to learn how to play. Participation is free, but admission to SPIEL Essen is required.',
        ],
      },
      {
        heading: 'Tutorial Session',
        paragraphs: [
          'Bandai has not yet published the procedure for taking part in the SPIEL Essen Tutorial Sessions. Demo decks will not be available to take home.',
          'Each person may participate in one Tutorial Session during SPIEL Essen. Participants registered to the NARUTO TCG UPDATES CHANNEL on BANDAI TCG+ and who complete the event survey may receive the listed participation gift.',
        ],
      },
      {
        heading: 'Gifts and merchandise',
        paragraphs: [
          'Bandai lists the CP-001 Chakra Card for Tutorial Session participants and a Logo Sticker giveaway for people who follow an official social channel or register to the NARUTO TCG UPDATES CHANNEL.',
          'The NARUTO CARD GAME Official Playmat, marked as arriving in 2027, is also listed at a $35 MSRP plus tax. Purchase details will be announced later, and quantities are limited each day.',
        ],
      },
    ],
    relatedCardIds: [],
    relatedGuideSlugs: [],
  },
  {
    slug: 'paris-games-week-2026-event-information',
    title: 'Paris Games Week Event Information',
    summary: 'Bandai announced NARUTO CARD GAME Tutorial Sessions at Paris Games Week in France.',
    category: 'Events',
    publishedAt: '2026-09-04',
    sourceLabel: 'NARUTO CARD GAME Official Website — Paris Games Week Event Information',
    sourceUrl: 'https://www.naruto-cardgame.com/en/news/parisgamesweek-2026.php',
    featured: false,
    confirmedFacts: [
      'Paris Games Week runs from October 22 to 25, 2026.',
      'The event is at Paris Expo Porte de Versailles, France.',
      'Bandai lists a NARUTO CARD GAME Tutorial Session.',
    ],
    sections: [
      {
        heading: 'What is happening',
        paragraphs: [
          'NARUTO CARD GAME is scheduled to appear at Paris Games Week from October 22 to 25, 2026, at Paris Expo Porte de Versailles in Paris, France.',
          'Bandai has announced free Tutorial Sessions at the show. Visitors will still need Paris Games Week admission to access the activities.',
        ],
      },
      {
        heading: 'Tutorial Session',
        paragraphs: [
          'Information on how to participate in the Tutorial Sessions has not yet been announced by Bandai. Demo decks will not be available to take home.',
          'One Tutorial Session is permitted per person during Paris Games Week. The CP-001 Chakra Card is listed for eligible participants registered to the NARUTO TCG UPDATES CHANNEL on BANDAI TCG+ who complete the event survey.',
        ],
      },
      {
        heading: 'What else is listed',
        paragraphs: [
          'A Logo Sticker is listed for people who follow an official NARUTO CARD GAME social channel or register to the NARUTO TCG UPDATES CHANNEL.',
          'Bandai also lists the NARUTO CARD GAME Official Playmat, arriving in 2027, at a $35 MSRP plus tax. It is limited to one per person and available in limited daily quantities; purchase information is still to come.',
        ],
      },
    ],
    relatedCardIds: [],
    relatedGuideSlugs: [],
  },
  {
    slug: 'lucca-comics-games-2026-event-information',
    title: 'Lucca Comics & Games Event Information',
    summary: 'Bandai announced NARUTO CARD GAME Tutorial Sessions at Lucca Comics & Games in Italy.',
    category: 'Events',
    publishedAt: '2026-09-04',
    sourceLabel: 'NARUTO CARD GAME Official Website — Lucca Comics & Games Event Information',
    sourceUrl: 'https://www.naruto-cardgame.com/en/news/lucca-2026.php',
    featured: false,
    confirmedFacts: [
      'Lucca Comics & Games runs from October 28 to November 1, 2026.',
      'The event is at Piazza Santa Maria, Lucca, Italy.',
      'Bandai lists a NARUTO CARD GAME Tutorial Session.',
    ],
    sections: [
      {
        heading: 'What is happening',
        paragraphs: [
          'NARUTO CARD GAME is scheduled to appear at Lucca Comics & Games from October 28 to November 1, 2026. The Bandai announcement names Piazza Santa Maria in Lucca, Italy as the location.',
          'The event will include free Tutorial Sessions. Entry to Lucca Comics & Games is required to join the activities.',
        ],
      },
      {
        heading: 'Tutorial Session',
        paragraphs: [
          'Bandai has not yet announced participation details for the Lucca Tutorial Sessions, and demo decks will not be available to take home.',
          'A visitor may participate in one Tutorial Session during the event. Eligible participants registered to the NARUTO TCG UPDATES CHANNEL on BANDAI TCG+ who complete the event survey are listed to receive the CP-001 Chakra Card.',
        ],
      },
      {
        heading: 'Merchandise',
        paragraphs: [
          'The official announcement lists the NARUTO CARD GAME Official Playmat as arriving in 2027, with a $35 MSRP plus tax. Bandai says purchase information will be announced later.',
          'The Playmat is limited to one item per person and is available in limited quantities each day. Bandai notes that event contents may change without notice.',
        ],
      },
    ],
    relatedCardIds: [],
    relatedGuideSlugs: [],
  },
  {
    slug: 'bandai-card-games-fest-london-2027',
    title: 'BANDAI CARD GAMES Fest 26-27 in LONDON has been announced.',
    summary: 'Bandai announced a London BANDAI CARD GAMES Fest with a NARUTO CARD GAME Tutorial Session.',
    category: 'Events',
    publishedAt: '2026-08-28',
    sourceLabel: 'NARUTO CARD GAME Official Website — BANDAI CARD GAMES Fest 26-27 in LONDON',
    sourceUrl: 'https://www.naruto-cardgame.com/en/news/bcgfes26-27-london.php',
    featured: false,
    confirmedFacts: [
      'The event dates are January 15 to 17, 2027.',
      'The venue is ExCeL London.',
      'Bandai lists a Tutorial Session as a main event.',
    ],
    sections: [
      {
        heading: 'Event details',
        paragraphs: [
          'BANDAI CARD GAMES Fest 26-27 in London is scheduled for January 15 to 17, 2027 at ExCeL London, Hall 1–11. The venue address is Royal Victoria Dock, 1 Western Gateway, London E16 1XL.',
          'Bandai lists a pre-registration tournament ticket as required for admission. The event page also cautions that details may be changed or cancelled without notice.',
        ],
      },
      {
        heading: 'NARUTO CARD GAME activity',
        paragraphs: [
          'The official event information lists a Tutorial Session among the main events. It is the NARUTO CARD GAME activity currently confirmed for the London Fest.',
          'Additional event commemorative items are marked as coming soon; no further NARUTO CARD GAME event format or participation details are published on the announcement page at this time.',
        ],
      },
      {
        heading: 'Before attending',
        paragraphs: [
          'Bandai directs attendees to read the BANDAI CARD GAMES Official Events Disclaimer before joining. The official Fest site remains the reference for later updates and registration information.',
        ],
      },
    ],
    relatedCardIds: [],
    relatedGuideSlugs: [],
  },
  {
    slug: 'new-york-comic-con-2026-event-information',
    title: 'New York Comic Con 2026 Event Information',
    summary: 'NARUTO CARD GAME Tutorial Sessions, merchandise information and a NARUTO panel are announced for New York Comic Con.',
    category: 'Events',
    publishedAt: '2026-08-07',
    sourceLabel: 'NARUTO CARD GAME Official Website — New York Comic Con 2026 Event Information',
    sourceUrl: 'https://www.naruto-cardgame.com/en/news/nycc-2026.php',
    featured: false,
    confirmedFacts: [
      'New York Comic Con runs from October 8 to 11, 2026.',
      'The NARUTO CARD GAME booth is #2705 at the Javits Center.',
      'Bandai lists Tutorial Sessions and the NARUTO: What’s Next? panel on October 10.',
    ],
    sections: [
      {
        heading: 'Event details',
        paragraphs: [
          'NARUTO CARD GAME is scheduled to appear at New York Comic Con from October 8 to 11, 2026. Bandai lists Booth #2705 at the Javits Center, 429 11th Avenue, New York, NY.',
          'New York Comic Con admission is required for the activities. The NARUTO CARD GAME Tutorial Sessions are free, but a session ticket is required.',
        ],
      },
      {
        heading: 'Tutorial Sessions',
        paragraphs: [
          'Tutorial Session tickets will be distributed each morning on a first-come, first-served basis at the BANDAI Namco Naruto Booth #3001. Bandai notes that the Tutorial Sessions themselves take place at the separate BANDAI CARD GAMES Booth #2705.',
          'Demo decks will not be available to take home. One Tutorial Session is allowed per person during the event. Eligible participants registered to the NARUTO TCG UPDATES CHANNEL on BANDAI TCG+ who complete the survey are listed to receive a CP-001 Chakra Card and a Logo Sticker.',
        ],
      },
      {
        heading: 'Merchandise and panel',
        paragraphs: [
          'A retail ticket is required for the NARUTO CARD GAME Official Playmat, marked as arriving in 2027 with a $35 MSRP plus tax. Retail tickets are scheduled to be distributed each morning at Booth #2705, subject to limited daily quantities.',
          'Bandai also lists the NARUTO: What’s Next? panel for Saturday, October 10 at the Empire Stage on North-Level 5. The panel is announced to include updates on NARUTO, the NARUTO CARD GAME and other projects.',
        ],
      },
    ],
    relatedCardIds: [],
    relatedGuideSlugs: [],
  },
  {
    slug: 'pax-aus-2026-event-information',
    title: 'PAX Aus 2026 Event Information',
    summary: 'Bandai announced NARUTO CARD GAME Tutorial Sessions at PAX Aus in Melbourne.',
    category: 'Events',
    publishedAt: '2026-08-07',
    sourceLabel: 'NARUTO CARD GAME Official Website — PAX Aus 2026 Event Information',
    sourceUrl: 'https://www.naruto-cardgame.com/en/news/paxaus-2026.php',
    featured: false,
    confirmedFacts: [
      'PAX Aus runs from October 9 to 11, 2026.',
      'The event takes place at the Melbourne Convention and Exhibition Centre.',
      'Tutorial Session registration is announced through TCG+ on a first-come, first-served basis.',
    ],
    sections: [
      {
        heading: 'Event details',
        paragraphs: [
          'NARUTO CARD GAME is scheduled to appear at PAX Aus from October 9 to 11, 2026 at the Melbourne Convention and Exhibition Centre in South Wharf, Victoria.',
          'PAX Aus admission is required for the activities. Bandai lists the NARUTO CARD GAME Tutorial Sessions as free.',
        ],
      },
      {
        heading: 'Tutorial Session registration',
        paragraphs: [
          'Bandai says registration takes place through TCG+ and opens on a first-come, first-served basis at 11:00 AM AEST on Sunday, September 20. Players may register for a maximum of one event.',
          'Demo decks will not be available to take home. The page warns that attempts to bypass the one-event limit may result in exclusion from the demo events.',
        ],
      },
      {
        heading: 'Gifts and Playmat raffle',
        paragraphs: [
          'Tutorial Session participants are listed to receive a CP-001 Chakra Card and a Logo Sticker, subject to the stated TCG+ registration and survey conditions. All participants are also entered into a raffle for a chance to purchase a Playmat.',
          'Bandai says the raffle takes place after the final Tutorial Session each day. The NARUTO CARD GAME Official Playmat is marked as arriving in 2027 with a $35 MSRP plus tax, and is limited to one per person in limited daily quantities.',
        ],
      },
    ],
    relatedCardIds: [],
    relatedGuideSlugs: [],
  },
];

export const roadmapArticles: NewsArticle[] = [
  {
    slug: 'tutorial-sessions-roadmap',
    title: 'Tutorial Sessions: October 2026 to early 2027',
    summary: 'Bandai’s official roadmap confirms Tutorial Sessions at events around the world from October 2026 into early 2027.',
    category: 'Official News',
    sourceLabel: 'NARUTO CARD GAME Official Website — Roadmap',
    sourceUrl: 'https://www.naruto-cardgame.com/en/welcome/',
    featured: false,
    confirmedFacts: [
      'The roadmap schedules Tutorial Sessions from October 2026 into early 2027.',
      'Bandai says Tutorial Sessions will be held at events around the world.',
      'The roadmap does not give one shared registration process or a final complete event list.',
    ],
    sections: [
      {
        heading: 'What the roadmap confirms',
        paragraphs: [
          'Bandai’s NARUTO CARD GAME roadmap lists Tutorial Sessions from October 2026 into early 2027. It says these sessions will be held at events around the world.',
          'The roadmap identifies New York Comic Con, PAX Aus, SPIEL Essen, Paris Games Week and Lucca Comics & Games among its upcoming event schedule. Individual event announcements provide the currently available local details.',
        ],
      },
      {
        heading: 'What is not announced yet',
        paragraphs: [
          'Bandai has not published a single global registration process, a complete worldwide list of Tutorial Sessions, or the full early-2027 schedule on the roadmap page.',
          'Participation requirements can differ by event. Check the corresponding NarutoCardGuide event article for the details currently confirmed for that location.',
        ],
      },
      {
        heading: 'Next roadmap information',
        paragraphs: [
          'Bandai states that more new information will be revealed at New York Comic Con. Further event announcements are also expected.',
        ],
      },
    ],
    relatedCardIds: [],
    relatedGuideSlugs: [],
  },
];

export const timelineItems: TimelineItem[] = [
  ...news
    .filter((article): article is NewsArticle & { publishedAt: string } => Boolean(article.publishedAt))
    .map((article) => ({
    id: `news-${article.slug}`,
    title: article.title,
    summary: article.summary,
    type: 'Official news' as const,
    date: article.publishedAt,
    dateLabel: article.publishedAt,
    sourceUrl: article.sourceUrl,
    articleSlug: article.slug,
  })),
  {
    id: 'nycc-2026',
    title: 'New York Comic Con 2026',
    summary:
      'Tutorial Sessions are listed by Bandai; the official roadmap says new information will be revealed here.',
    type: 'Event',
    date: '2026-10-08',
    dateLabel: 'October 8–11, 2026',
    sourceUrl: 'https://www.naruto-cardgame.com/en/news/nycc-2026.php',
    articleSlug: 'new-york-comic-con-2026-event-information',
  },
  {
    id: 'pax-aus-2026',
    title: 'PAX Aus 2026',
    summary: 'Bandai lists NARUTO CARD GAME Tutorial Sessions at PAX Aus in Melbourne.',
    type: 'Event',
    date: '2026-10-09',
    dateLabel: 'October 9–11, 2026',
    sourceUrl: 'https://www.naruto-cardgame.com/en/news/paxaus-2026.php',
    articleSlug: 'pax-aus-2026-event-information',
  },
  {
    id: 'tutorial-sessions',
    title: 'Tutorial Sessions',
    summary: 'The official roadmap schedules Tutorial Sessions from October 2026 into early 2027.',
    type: 'Roadmap',
    date: '2026-10-01',
    dateLabel: 'October 2026–early 2027',
    sourceUrl: 'https://www.naruto-cardgame.com/en/welcome/',
    articleSlug: 'tutorial-sessions-roadmap',
  },
  {
    id: 'spiel-essen-2026',
    title: 'SPIEL Essen 2026',
    summary: 'NARUTO CARD GAME Tutorial Sessions at Messe Essen, Germany.',
    type: 'Event',
    date: '2026-10-22',
    dateLabel: 'October 22–25, 2026',
    sourceUrl: 'https://www.naruto-cardgame.com/en/news/spielessen-2026.php',
    articleSlug: 'spiel-essen-2026-event-information',
  },
  {
    id: 'paris-games-week-2026',
    title: 'Paris Games Week 2026',
    summary: 'NARUTO CARD GAME Tutorial Sessions at Paris Expo Porte de Versailles, France.',
    type: 'Event',
    date: '2026-10-22',
    dateLabel: 'October 22–25, 2026',
    sourceUrl: 'https://www.naruto-cardgame.com/en/news/parisgamesweek-2026.php',
    articleSlug: 'paris-games-week-2026-event-information',
  },
  {
    id: 'lucca-2026',
    title: 'Lucca Comics & Games 2026',
    summary: 'NARUTO CARD GAME Tutorial Sessions in Lucca, Italy.',
    type: 'Event',
    date: '2026-10-28',
    dateLabel: 'October 28–November 1, 2026',
    sourceUrl: 'https://www.naruto-cardgame.com/en/news/lucca-2026.php',
    articleSlug: 'lucca-comics-games-2026-event-information',
  },
  {
    id: 'london-2027',
    title: 'BANDAI CARD GAMES Fest 26-27 London',
    summary: 'Bandai lists a NARUTO CARD GAME Tutorial Session at ExCeL London.',
    type: 'Event',
    date: '2027-01-15',
    dateLabel: 'January 15–17, 2027',
    sourceUrl: 'https://www.naruto-cardgame.com/en/news/bcgfes26-27-london.php',
    articleSlug: 'bandai-card-games-fest-london-2027',
  },
  {
    id: 'worldwide-release',
    title: 'Worldwide Release',
    summary: 'Bandai has confirmed a simultaneous worldwide release; an exact date has not been announced.',
    type: 'Roadmap',
    date: '2027-06-21',
    dateLabel: 'Summer 2027',
    sourceUrl: 'https://www.naruto-cardgame.com/en/welcome/',
  },
];
const specialCards: Card[] = [
  {
    id: 'C-001',
    slug: 'c-001',
    name: 'C-001',
    setCode: 'CHAKRA',
    setName: 'Chakra Cards',
    image: {
      src: '/Cards/Chakra cards/C-001.jpg',
      alt: 'C-001 card',
      width: 640,
      height: 894,
    },
    confirmedFields: [],
    updatedAt: '2026-09-29',
    sourceLabel: 'NarutoCardGuide card archive',
    sourceUrl: '/cards-list/',
    printings: [],
    relatedNewsSlugs: [],
    relatedGuideSlugs: [],
  },
  {
    id: 'CP-001',
    slug: 'cp-001',
    name: 'CP-001',
    setCode: 'CHAKRA',
    setName: 'Chakra Cards',
    image: {
      src: '/Cards/Chakra cards/CP-001.jpg',
      alt: 'CP-001 card',
      width: 600,
      height: 833,
    },
    confirmedFields: [],
    updatedAt: '2026-09-29',
    sourceLabel: 'NarutoCardGuide card archive',
    sourceUrl: '/cards-list/',
    printings: [],
    relatedNewsSlugs: [],
    relatedGuideSlugs: [],
  },
  {
    id: 'S-001',
    slug: 's-001',
    name: 'S-001',
    setCode: 'SUMMON',
    setName: 'Summon Cards',
    image: {
      src: '/Cards/Summon cards/S-001.jpg',
      alt: 'S-001 card',
      width: 640,
      height: 894,
    },
    confirmedFields: [],
    updatedAt: '2026-09-29',
    sourceLabel: 'NarutoCardGuide card archive',
    sourceUrl: '/cards-list/',
    printings: [],
    relatedNewsSlugs: [],
    relatedGuideSlugs: [],
  },
];

export const cards: Card[] = [...n01Cards, ...specialCards];
export const guides: Guide[] = [
  {
    slug: 'complete-naruto-card-game-rules',
    title: 'Complete Naruto Card Game Rules',
    summary: 'A clear starting point for understanding the flow of a NARUTO CARD GAME match.',
    category: 'Rules',
    difficulty: 'Beginner',
    readingTime: '5 min read',
    verifiedAt: '2026-09-25',
    image: {
      src: '/assets/visuals/complete-rules-guide-cards.png',
      alt: 'Chakra, Naruto Leader, and Summon cards arranged in a dark vermilion composition',
      width: 1664,
      height: 936,
    },
    sections: [
      {
        id: 'introduction',
        heading: 'Who this guide is for',
        paragraphs: [
          'This guide is for someone who has never played the NARUTO CARD GAME. It explains the parts of a game that Bandai has publicly described so far, so you can understand the game’s purpose and the role of its main cards.',
          'The game is still in development. Bandai has not yet published a complete English rulebook covering every phase, timing window, or combat procedure.',
        ],
        callout: {
          label: 'Update note',
          text: 'This article is based on the official NARUTO CARD GAME website and Bandai’s July 29, 2026 announcement. It will be updated when Bandai publishes more complete rules.',
        },
      },
      {
        id: 'the-goal',
        heading: 'The goal of the game',
        paragraphs: [
          'Each player builds a deck around one Leader card. Your goal is to reduce your opponent’s Leader Life to 0. When the opposing Leader reaches 0 Life, you win the game.',
          'Characters form the front line of the battle. They can battle opposing Characters or the opposing Leader, while some Characters can also use Ninjutsu by paying Chakra.',
        ],
      },
      {
        id: 'what-you-need',
        heading: 'What you need to play',
        paragraphs: [
          'The official materials currently describe the following cards for each player. The 50-card main deck is separate from the Leader, Chakra cards, and Summon card.',
        ],
        table: {
          headers: ['Cards', 'Confirmed role'],
          rows: [
            [
              '1 Leader',
              'The card your deck is built around. Its color determines the cards you can use, and it has Life.',
            ],
            [
              '50-card main deck',
              'The main deck contains the cards you play during the game. Official materials identify Character and EX Character cards as part of the game’s card types.',
            ],
            ['5 Chakra cards', 'Used as costs for Support effects such as Ninjutsu.'],
            ['1 Summon card', 'Required to play Character cards onto the battlefield.'],
          ],
        },
        image: {
          src: '/assets/visuals/board.png',
          alt: 'Schematic NARUTO CARD GAME play area showing the Character, Support, Leader, Deck, Trash, Summon, and Chakra areas',
        },
        links: [{ label: "Click here to view the game's Cards List.", href: '/cards-list/' }],
      },
      {
        id: 'card-types-and-zones',
        heading: 'The card types and main areas',
        paragraphs: ['NARUTO CARD GAME currently uses five card types.'],
        cards: [
          {
            text: 'Leader : Your deck is built around this card. Its color determines which cards you can use, and its Life is the target of the game.',
            image: { src: '/Cards/N01/N01-001.jpg', alt: 'Leader card example' },
          },
          {
            text: 'Characters : Characters form your front line and can battle opposing Characters or a Leader. Some can activate Ninjutsu by paying Chakra.',
            image: { src: '/Cards/N01/N01-009.jpg', alt: 'Character card example' },
          },
          {
            text: 'EX Character : A powerful Character that can be played after specific play conditions are met.',
            image: { src: '/Cards/N01/N01-005.jpg', alt: 'EX Character card example' },
          },
          {
            text: 'Chakra : A resource card used to activate Support effects such as Ninjutsu.',
            image: { src: '/Cards/Chakra cards/C-001.png', alt: 'Chakra card example' },
          },
          {
            text: 'Summon : A card required to play Character cards onto the battlefield.',
            image: { src: '/Cards/Summon cards/S-001.png', alt: 'Summon card example' },
          },
        ],
        links: [
          {
            label: 'Master the game’s key terms by visiting the Glossary.',
            href: '/beginner-guides/glossary-key-terms/',
          },
        ],
      },
      {
        id: 'turn-structure',
        heading: 'How a turn works',
        paragraphs: [
          'Both players open on 5 cards. Only the player going second may mulligan, and only once. A turn begins with a Refresh phase, followed by Draw and Main phases, and ends with an End phase.',
        ],
        subsections: [
          {
            id: 'refresh-phase',
            heading: 'Refresh phase',
            paragraphs: [
              'At the beginning of the turn, return cards in Rest Mode to Active Mode by straightening them.',
            ],
          },
          {
            id: 'draw-phase',
            heading: 'Draw phase',
            paragraphs: [
              'On turn one, the player going first draws 1 card and the player going second draws 2 cards. From then on, each player draws 2 cards per turn.',
            ],
          },
          {
            id: 'main-phase',
            heading: 'Main phase',
            paragraphs: [
              'During the Main phase, you can deploy Characters, activate Jutsu by paying Chakra, activate Leader effects, and attack.',
            ],
          },
          {
            id: 'end-phase',
            heading: 'End phase',
            paragraphs: [
              'Once all effects and attacks from the Main phase have been completed, you can pass the turn to your opponent.',
            ],
          },
        ],
      },
      {
        id: 'cards-and-resources',
        heading: 'Main phase actions in detail',
        paragraphs: [],
        subsections: [
          {
            id: 'deploying-characters',
            heading: '1) Deploying Characters',
            bullets: [
              'Normal deployment happens once per turn by resting your Summon card. That single card limits how quickly a board can develop.',
              'Deployment via an EX Character or a card effect does not use the Summon card, so it is additional deployment beyond the normal limit.',
              'A Character cannot attack on the turn it is deployed unless it has [[RUSH]].',
            ],
          },
          {
            id: 'deploy-support-cards',
            heading: '2) Deploy Support cards and activate their effects with Chakra cards',
            bullets: [
              'Deploy it normally to the field as a Character (and set it face-down in the Support area).',
              'Use Chakra to activate Support effects. These effects can be used during the Main phase according to their printed conditions and costs.',
              'Costs are paid by flipping Chakra face-down.',
            ],
          },
          {
            id: 'leader-and-recovery-effects',
            heading: '3) Play your Leader effect and Recovery effect to restore Chakra',
            bullets: [
              'Your Leader possesses its own unique effect that you can activate.',
              'Your Leader possesses the [[RECOVERY]] ability, which rests the Leader to flip all of your CHAKRA face-up from the second turn onward. Resting it that way costs you your attack for the turn. The Leader chooses each turn between attacking the opponent and recovering Chakra.',
            ],
          },
          {
            id: 'how-battle-resolves',
            heading: '4) How battle resolves',
            paragraphs: [
              'Characters carry two different attack values, and which one applies depends on what you attack.',
            ],
            bullets: [
              'You may attack the Leader to reduce its Life depending on the DMG of the cards you are using.',
              'You may only attack Characters that are already rested. Standing Characters cannot be targeted.',
            ],
            steps: [
              'Declare the attack. The attacking Character rests.',
              'Resolve the damage step by subtracting your POW value from the target.',
              'The defending player may activate an effect with the [[DURING_ATTACK]] timing to resolve that effect.',
              'A Character reduced to 0 HP goes to the trash.',
              'A Leader reduced to 0 Life loses the game.',
            ],
            table: {
              headers: ['Value', 'Used when'],
              rows: [
                ['DMG', 'Attacking the opposing Leader, reducing its Life.'],
                ['POW', 'Attacking a rested Character, reducing its HP.'],
              ],
            },
          },
        ],
        links: [
          {
            label: 'Visit the Glossary to learn the game’s key terms.',
            href: '/beginner-guides/glossary-key-terms/',
          },
        ],
      },
    ],
    officialResources: [
      {
        label: 'Bandai — Official How to Play Guide (accessed September 26, 2026)',
        url: 'https://www.naruto-cardgame.com/en/',
      },
    ],
    relatedCardIds: [],
    relatedGuideSlugs: ['glossary-key-terms'],
    order: 1,
  },
  {
    slug: 'glossary-key-terms',
    title: 'Glossary : Card Stats, Keywords & Game Vocabulary Explained',
    summary: 'A quick reference for the words and keywords you will encounter while learning the game.',
    category: 'Glossary',
    difficulty: 'Beginner',
    readingTime: '3 min read',
    verifiedAt: '2026-09-25',
    image: {
      src: '/assets/visuals/glossary-keywords-guide.png',
      alt: 'Keyword badges arranged in a dark glossary-themed composition',
      width: 1774,
      height: 887,
    },
    sections: [
      {
        id: 'card-stats',
        heading: 'Card Stats',
        paragraphs: [
          'Card stats are the numbers printed on a card that describe its role and strength in the game. Leaders and Characters share DMG and POW values, but their third stat serves a different purpose.',
        ],
        statBlocks: [
          {
            label: 'For Leader',
            image: {
              src: '/Cards/N01/N01-012.jpg',
              alt: 'Leader card example for explaining DMG, POW, and Life statistics',
            },
            stats: [
              {
                name: 'DMG (Damage)',
                description:
                  'The amount of Life this card removes when it attacks the opposing Leader. Revealed Leaders currently show values from 1 to 3.',
              },
              {
                name: 'POW (Power)',
                description: 'The amount of HP this card removes when it attacks a rested Character.',
              },
              {
                name: 'LIFE',
                description:
                  "A Leader's remaining health. Reducing the opposing Leader's Life to 0 wins the game; revealed Leaders start with 15.",
              },
            ],
          },
          {
            label: 'For Character',
            image: {
              src: '/Cards/N01/N01-006.jpg',
              alt: 'Character card example for explaining DMG, POW, and HP statistics',
            },
            stats: [
              {
                name: 'DMG (Damage)',
                description:
                  'The amount of Life this card removes when it attacks the opposing Leader. Revealed Leaders currently show values from 1 to 3.',
              },
              {
                name: 'POW (Power)',
                description: 'The amount of HP this card removes when it attacks a rested Character.',
              },
              {
                name: 'HP (Hit points)',
                description: "A Character's remaining health. When its HP reaches 0, it goes to the trash.",
              },
            ],
          },
        ],
      },
      {
        id: 'keywords',
        heading: 'Keywords',
        paragraphs: [
          'Keywords are bracketed markers in card text that indicate when an ability can be used and what event or condition triggers it.',
        ],
        table: {
          headers: ['KEYWORDS', 'CONFIRMED ROLE'],
          rows: [
            ['Activate: Main', 'An ability the controller may use during their own Main phase.'],
            [
              'During Your Main',
              'A timing marker that limits a Support effect to the controller’s own Main phase.',
            ],
            [
              "During Your Opponent's Attack",
              "A reactive timing window that lets an effect resolve during the opponent's attack.",
            ],
            ['Once Per Turn', 'A restriction that limits a repeatable ability to one use per turn.'],
            ['On Summon', 'A timing marker for an effect that resolves as the card enters the field.'],
            ['Quick', 'A Support timing that summons the card as part of resolving its effect.'],
            [
              'Recovery',
              'A resource-recovery ability that lets a Leader rest to turn all of its Chakra face-up.',
            ],
            [
              'Rush',
              'An ability that allows this card to attack during the same turn it is played. On revealed cards, this keyword is printed in full.',
            ],
            [
              'Summon Requirements',
              'A requirement that must be paid before an EX Character can enter play, using your own Characters in the trash. Revealed EX Characters also state that they cannot be summoned normally.',
            ],
            [
              'Support Activated',
              'A response that triggers when an opponent activates a Support effect and negates that activation.',
            ],
            ['When Attacking', 'A trigger that resolves when the card declares an attack.'],
            ['Your Turn', 'A restriction that limits a triggered ability to the controller’s own turn.'],
          ],
          images: [
            [{ src: '/assets/keywords/activate-main.png', alt: 'Activate: Main keyword' }, undefined],
            [{ src: '/assets/keywords/during-your-main.png', alt: 'During Your Main keyword' }, undefined],
            [
              {
                src: "/assets/keywords/during-your-opponent's-attack.png",
                alt: "During Your Opponent's Attack keyword",
              },
              undefined,
            ],
            [{ src: '/assets/keywords/once-per-turn.png', alt: 'Once Per Turn keyword' }, undefined],
            [{ src: '/assets/keywords/on-summon.png', alt: 'On Summon keyword' }, undefined],
            [{ src: '/assets/keywords/quick.png', alt: 'Quick keyword' }, undefined],
            [{ src: '/assets/keywords/recovery.png', alt: 'Recovery keyword' }, undefined],
            [{ src: '/assets/keywords/rush.png', alt: 'Rush keyword' }, undefined],
            [
              { src: '/assets/keywords/summon-requirements.png', alt: 'Summon Requirements keyword' },
              undefined,
            ],
            [{ src: '/assets/keywords/support-activated.png', alt: 'Support Activated keyword' }, undefined],
            [{ src: '/assets/keywords/when-attacking.png', alt: 'When Attacking keyword' }, undefined],
            [{ src: '/assets/keywords/your-turn.png', alt: 'Your Turn keyword' }, undefined],
          ],
        },
        links: [
          {
            label: 'See these keywords in action on the Cards List.',
            href: '/cards-list/',
          },
        ],
      },
      {
        id: 'game-vocabulary',
        heading: 'Game Vocabulary',
        paragraphs: [
          'Game vocabulary covers the wider terminology used for resources, play areas, actions, and concepts found in card text and Bandai’s official descriptions.',
        ],
        table: {
          headers: ['VOCABULARY', 'CONFIRMED ROLE'],
          rows: [
            [
              'Chakra',
              "The game's resource pool: exactly five Chakra cards per deck, starting face-up. Paying a cost flips one face-down, and it does not refresh automatically at the start of a turn. A Leader's [[RECOVERY]] ability is the way to restore it, at the cost of that Leader's attack.",
            ],
            ['Jutsu', 'A technique activated by a Character card by paying a Chakra cost.'],
            ['K.O.', 'Removing a Character from the field.'],
            [
              'Negate',
              'To cancel an effect before it resolves, preventing its instructions from taking effect.',
            ],
            [
              'Rested',
              'A card turned sideways is rested. Attacking rests the attacker, and resting the Leader is how Chakra is restored. Characters can only be attacked while they are already rested.',
            ],
            [
              'Summon this card / Summon up to',
              'An instruction that puts the named card, or up to the stated number of cards, onto the field when its conditions and costs are met.',
            ],
            [
              'Support [X Chakras]',
              'A named Jutsu printed on a Character and activated from hand by paying X Chakra at the specified timing.',
            ],
            [
              'Trait',
              "The type line under a card's name. Traits include elements such as Wind, Fire, Lightning, and Water. Disciplines include elements such as Taijutsu, Illusion, and Special. Affiliations include elements such as Hidden Leaf Village, Uchiha Clan, Akatsuki, Team 7, and The Taka.",
            ],
            [
              'Trash',
              'The discard pile. EX Character Summon Requirements can place your own Characters there, and some effects can summon cards back from it.',
            ],
          ],
          examples: [
            {
              label: 'Chakra card',
              image: { src: '/Cards/Chakra cards/C-001.png', alt: 'Chakra card example' },
            },
            {
              label: 'Shikamaru Nara N01-008',
              image: { src: '/Cards/N01/N01-008.jpg', alt: 'Shikamaru Nara N01-008 card example' },
            },
            {
              label: 'Hinata Hyuga N01-018',
              image: { src: '/Cards/N01/N01-018.jpg', alt: 'Hinata Hyuga N01-018 card example' },
            },
            {
              label: 'Shisui Uchiha N01-016',
              image: { src: '/Cards/N01/N01-016.jpg', alt: 'Shisui Uchiha N01-016 card example' },
            },
            {
              label: 'Orochimaru N01-017',
              image: { src: '/Cards/N01/N01-017.jpg', alt: 'Orochimaru N01-017 card example' },
            },
            {
              label: 'Naruto Uzumaki N01-003',
              image: { src: '/Cards/N01/N01-003.jpg', alt: 'Naruto Uzumaki N01-003 card example' },
            },
            {
              label: 'Naruto Uzumaki N01-004',
              image: { src: '/Cards/N01/N01-004.jpg', alt: 'Naruto Uzumaki N01-004 card example' },
            },
            {
              label: 'Itachi Uchiha N01-013',
              image: { src: '/Cards/N01/N01-013.jpg', alt: 'Itachi Uchiha N01-013 card example' },
            },
            {
              label: 'Gamabunta N01-005',
              image: { src: '/Cards/N01/N01-005.jpg', alt: 'Gamabunta N01-005 card example' },
            },
          ],
        },
      },
    ],
    officialResources: [],
    relatedCardIds: [],
    relatedGuideSlugs: ['complete-naruto-card-game-rules'],
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
  { label: 'News', href: '/news/' },
  { label: 'Deck Guides', href: '/deck-guides/' },
  { label: 'Cards List', href: '/cards-list/' },
  { label: 'Beginner Guides', href: '/beginner-guides/' },
] as const;
