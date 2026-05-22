import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://thinkfasterai.com',
  integrations: [],
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
    },
  },
});
