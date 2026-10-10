import { guides, news, roadmapArticles, sets } from '../data/content';
import { deckGuides } from '../data/deck-guides';

const siteUrl = 'https://narutocardguide.com';

const urls = [
  '/',
  '/news/',
  '/cards-list/',
  '/beginner-guides/',
  '/deck-guides/',
  '/legal-notice-and-privacy/',
  ...sets.map((set) => `/cards-list/${set.slug}/`),
  ...guides.map((guide) => `/beginner-guides/${guide.slug}/`),
  ...deckGuides.map((guide) => `/deck-guides/${guide.slug}/`),
  ...[...news, ...roadmapArticles].map((article) => `/news/${article.slug}/`),
];

const escapeXml = (value: string) =>
  value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&apos;');

export function GET() {
  const body = urls
    .map((path) => `  <url><loc>${escapeXml(new URL(path, siteUrl).toString())}</loc></url>`)
    .join('\n');

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
  );
}
