// @ts-check
import { defineConfig } from 'astro/config';

// Static site, no JS framework, vanilla JS islands for live widgets.
//
// Sitemap is generated post-build by scripts/build-sitemap.mjs
// because @astrojs/sitemap 3.x has a compat issue with our catch-all
// route shape ([from]-to-[to].astro) under Astro 4 — it crashes at the
// build:done hook with "Cannot read properties of undefined (reading 'reduce')".
// The script walks dist/ and emits sitemap-0.xml + sitemap-index.xml directly.
export default defineConfig({
  site: 'https://unitbox.online',
  trailingSlash: 'ignore',
  build: {
    format: 'directory',
  },
  integrations: [],
  vite: {
    ssr: {
      noExternal: ['luxon'],
    },
  },
});
