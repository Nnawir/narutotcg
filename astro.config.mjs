// @ts-check
import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'node:url';

// https://astro.build/config
export default defineConfig({
  site: 'https://narutocardguide-resource.chessnnawir.chatgpt.site',
  trailingSlash: 'always',
  redirects: {
    '/actualites/': '/news/',
    '/cartes/': '/cards-list/',
  },
  vite: {
    resolve: {
      alias: {
        '@tcg-engines/naruto-cards': fileURLToPath(
          new URL('./vendor/tcg-engines/submodules/naruto/packages/cards/src/index.ts', import.meta.url),
        ),
      },
    },
  },
});
