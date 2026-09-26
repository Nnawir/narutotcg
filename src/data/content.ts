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
  bullets?: string[];
  steps?: string[];
  table?: { headers: string[]; rows: string[][] };
  links?: Array<{ label: string; href: string }>;
  subsections?: Array<{
    heading: string;
    paragraphs?: string[];
    bullets?: string[];
    steps?: string[];
    table?: { headers: string[]; rows: string[][] };
  }>;
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
    sections: [
      {
        id: 'introduction',
        heading: 'Who this guide is for',
        paragraphs: [
          'This guide is for someone who has never played the NARUTO CARD GAME. It explains the parts of a game that Bandai has publicly described so far, so you can understand the game’s purpose and the role of its main cards.',
          'The game is still in development. Bandai has not yet published a complete English rulebook covering every phase, timing window, or combat procedure. Any point marked “not yet confirmed” must be checked against a future official rules release.',
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
          'Each player builds a deck around one Leader card. Your goal is to reduce your opponent’s Leader Life to 0. Bandai’s official overview identifies this as the win condition currently confirmed for the game.',
          'Characters form the front line of the battle. They can battle opposing Characters or the opposing Leader, while some Characters can also use Ninjutsu by paying Chakra. The complete rules for declaring and resolving an attack have not yet been published.',
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
            ['1 Leader', 'The card your deck is built around. Its color determines the cards you can use, and it has Life.'],
            ['50-card main deck', 'The main deck contains the cards you play during the game. Official materials identify Character and EX Character cards as part of the game’s card types.'],
            ['5 Chakra cards', 'Used as costs for Support effects such as Ninjutsu.'],
            ['1 Summon card', 'Required to play Character cards onto the battlefield.'],
          ],
        },
        links: [
          { label: 'Browse the Cards List', href: '/cards-list/' },
          { label: 'Learn how to read cards', href: '/beginner-guides/how-to-read-cards/' },
        ],
      },
      {
        id: 'card-types-and-zones',
        heading: 'The card types and main areas',
        paragraphs: [
          'NARUTO CARD GAME currently uses five card types.',
        ],
        table: {
          headers: ['Card type', 'What is confirmed'],
          rows: [
            ['Leader', 'Your deck is built around this card. Its color determines which cards you can use, and its Life is the target of the game.'],
            ['Character', 'Characters form your front line and can battle opposing Characters or a Leader. Some can activate Ninjutsu by paying Chakra.'],
            ['EX Character', 'A powerful Character that can be played after specific play conditions are met.'],
            ['Chakra', 'A resource card used to activate Support effects such as Ninjutsu.'],
            ['Summon', 'A card required to play Character cards onto the battlefield.'],
          ],
        },
        links: [
          { label: 'See the future card-reading guide', href: '/beginner-guides/how-to-read-cards/' },
          { label: 'Check the glossary', href: '/beginner-guides/glossary-key-terms/' },
        ],
      },
      {
        id: 'turn-structure',
        heading: 'How a turn works',
        paragraphs: [
          'Both players open on 5 cards. Only the player going second may mulligan, and only once. A turn then has two phases: Draw and Main.',
        ],
        subsections: [
          {
            heading: 'Draw phase',
            paragraphs: [
              'On turn one, the player going first draws 1 card and the player going second draws 2 cards. From then on, each player draws 2 cards per turn.',
            ],
          },
          {
            heading: 'Main phase',
            paragraphs: [
              'During the Main phase, you can deploy Characters, activate Jutsu by paying Chakra, and attack. There is no separate battle phase and no refresh step.',
            ],
          },
          {
            heading: 'Deploying Characters',
            bullets: [
              'Normal deployment happens once per turn by resting your Summon card. That single card limits how quickly a board can develop.',
              'Deployment via an EX Character or a card effect does not use the Summon card, so it is additional deployment beyond the normal limit.',
              'A Character cannot attack on the turn it is deployed unless it has [Rush].',
            ],
          },
          {
            heading: 'How battle resolves',
            paragraphs: [
              'Characters carry two different attack values, and which one applies depends on what you attack.',
            ],
            table: {
              headers: ['Value', 'Used when'],
              rows: [
                ['DMG', 'Attacking the opposing Leader, reducing its Life.'],
                ['POW', 'Attacking a rested Character, reducing its HP.'],
              ],
            },
            steps: [
              'Declare the attack. The attacking Character rests.',
              'Resolve the damage step by subtracting your value from the target.',
              'A Character reduced to 0 HP goes to the trash.',
              'A Leader reduced to 0 Life loses the game.',
            ],
            bullets: [
              'You may only attack Characters that are already rested. Standing Characters cannot be targeted, so resting to attack is what exposes the attacking Character.',
            ],
          },
          {
            heading: 'Activate Support effects with Chakra',
            paragraphs: [
              'Use Chakra to activate Support effects such as Jutsu. These effects can be used during the Main phase according to their printed conditions and costs.',
            ],
          },
        ],
      },
      {
        id: 'cards-and-resources',
        heading: 'Playing cards and using resources',
        paragraphs: [
          'The Summon card and Chakra cards have different jobs. The official overview says that the Summon card is required to play Character cards, while Chakra cards are used to activate Support effects such as Ninjutsu.',
          'In the public material, some Characters also activate Ninjutsu by paying a required Chakra cost. EX Characters are played after specific play conditions are met. The exact cost icons, payment procedure, timing rules, and whether other cards can be played outside the normal sequence are not yet confirmed.',
          'For a visual explanation of printed values, costs, and effects, continue with the dedicated card-reading guide. The glossary is available whenever a game term needs a short definition.',
        ],
        links: [
          { label: 'How to read cards: Stats, Costs & Effects', href: '/beginner-guides/how-to-read-cards/' },
          { label: 'Glossary', href: '/beginner-guides/glossary-key-terms/' },
        ],
      },
      {
        id: 'attacks-and-combat',
        heading: 'Attacks and combat',
        paragraphs: [
          'Bandai’s announcement confirms that Characters can battle opposing Characters or the opposing Leader. The official overview also shows that Support cards such as Ninjutsu can be used to stop attacks.',
          'The complete combat sequence is not yet confirmed. Bandai has not yet published the official order for choosing an attacker, choosing a target, declaring a defense, comparing printed values, applying damage, or handling a Character that leaves the field. This guide intentionally does not fill those gaps with rules from another game.',
        ],
        callout: {
          label: 'What to wait for',
          text: 'Look for Bandai’s future rulebook or tutorial material before treating any detailed attack, defense, damage, or response sequence as final.',
        },
      },
      {
        id: 'how-to-win',
        heading: 'How to win',
        paragraphs: [
          'The currently confirmed win condition is to reduce your opponent’s Leader Life to 0. Bandai has not yet published a complete list of alternative victory or loss conditions, such as what happens when a deck is empty or when a player cannot draw.',
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
