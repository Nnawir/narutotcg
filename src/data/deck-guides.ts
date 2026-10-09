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
  decklist: Array<{ cardId: string; copies: number }>;
  sections: Array<{ heading: string; paragraphs: string[]; bullets?: string[] }>;
};

export const deckGuides: DeckGuide[] = [
  {
    slug: 'naruto-uzumaki-demo-deck',
    title: 'Naruto Uzumaki Demo Deck',
    leader: 'Naruto Uzumaki',
    label: 'First Tournament Guide',
    summary: 'A proactive list that turns early pressure into a clean, repeatable attack plan.',
    image: { src: '/Cards/N01/N01-001.webp', alt: 'Naruto Uzumaki leader card' },
    difficulty: 'Beginner friendly',
    readingTime: '6 min read',
    intro: 'This guide covers the fundamentals of building and piloting a Naruto Uzumaki rush shell: establish an early board, keep your attacks efficient, and close the game before your opponent stabilizes.',
    decklist: [
      { cardId: 'N01-001', copies: 1 },
      { cardId: 'N01-002', copies: 3 },
      { cardId: 'N01-004', copies: 3 },
      { cardId: 'N01-006', copies: 3 },
      { cardId: 'N01-007', copies: 3 },
      { cardId: 'N01-008', copies: 3 },
      { cardId: 'N01-009', copies: 3 },
      { cardId: 'N01-005', copies: 3 },
      { cardId: 'N01-003', copies: 3 },
      { cardId: 'N01-011', copies: 3 },
      { cardId: 'N01-018', copies: 3 },
    ],
    sections: [],
  },
];
