// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://narutocardguide-resource.chessnnawir.chatgpt.site',
  trailingSlash: 'always',
  redirects: {
    '/actualites/': '/news/',
    '/cartes/': '/cards-list/',
  },
});
