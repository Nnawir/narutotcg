export type DeckGuide = {
  slug: string;
  title: string;
  leader: string;
  label: string;
  summary: string;
  image: { src: string; alt: string };
  difficulty: string;
  readingTime: string;
  intro: string;
  sections: Array<{ heading: string; paragraphs: string[]; bullets?: string[] }>;
};

export const deckGuides: DeckGuide[] = [
  {
    slug: 'naruto-uzumaki-rush',
    title: 'Naruto Uzumaki',
    leader: 'Naruto Uzumaki',
    label: 'First Tournament Guide',
    summary: 'A proactive list that turns early pressure into a clean, repeatable attack plan.',
    image: { src: '/Cards/N01/N01-001.jpg', alt: 'Naruto Uzumaki leader card' },
    difficulty: 'Beginner friendly',
    readingTime: '6 min read',
    intro: 'This guide covers the fundamentals of building and piloting a Naruto Uzumaki rush shell: establish an early board, keep your attacks efficient, and close the game before your opponent stabilizes.',
    sections: [
      {
        heading: 'The game plan',
        paragraphs: ['Prioritize a steady curve of Characters and use your Leader attacks to keep pressure on life. Your strongest turns are the ones where every Chakra and attack advances the same plan.'],
        bullets: ['Mulligan for an early Character and a reliable follow-up.', 'Attack in an order that keeps your strongest effects available.', 'Protect your life only when it preserves a decisive next turn.'],
      },
      {
        heading: 'Upgrades to look for',
        paragraphs: ['As your collection grows, add cards that improve your early consistency first, then choose tech cards for the matchups you expect most often.'],
      },
    ],
  },
  {
    slug: 'uchiha-control',
    title: 'Sasuke Uchiha',
    leader: 'Sasuke Uchiha',
    label: 'First Tournament Guide',
    summary: 'A patient control shell built around efficient trades, flexible Chakra, and powerful pivots.',
    image: { src: '/Cards/N01/N01-012.jpg', alt: 'Sasuke Uchiha leader card' },
    difficulty: 'Intermediate',
    readingTime: '7 min read',
    intro: 'Uchiha Control rewards careful sequencing. Learn when to trade resources, when to hold interaction, and how to turn a stable board into a winning attack over the final turns.',
    sections: [
      {
        heading: 'The game plan',
        paragraphs: ['Use the early game to develop without falling behind, then convert efficient effects into a board advantage. The deck becomes strongest when you make your opponent commit first.'],
        bullets: ['Keep hands with a curve and at least one flexible answer.', 'Sequence attacks around the removal and protection you can represent.', 'Save premium effects for the turn they change the race.'],
      },
      {
        heading: 'Upgrades to look for',
        paragraphs: ['Upgrade the interaction package first, then tune your late-game threats around the leaders and strategies showing up in the current format.'],
      },
    ],
  },
];
