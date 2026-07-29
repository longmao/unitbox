// @ts-check
import { defineConfig } from 'astro/config';

// Static site, no JS framework, vanilla JS islands for live widgets.
export default defineConfig({
  site: 'https://time-now.local',
  trailingSlash: 'ignore',
  build: {
    format: 'directory',
  },
  // Sitemap integration temporarily disabled due to a "@astrojs/sitemap"
  // crash on the catch-all dynamic routes ([...slug].astro). The build
  // emits HTML; XML sitemap can be post-processed via scripts/build-sitemap.mjs.
  integrations: [],
  vite: {
    ssr: {
      noExternal: ['luxon'],
    },
  },
});
