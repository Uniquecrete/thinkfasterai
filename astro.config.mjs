import { defineConfig } from 'astro/config';

import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  site: 'https://thinkfasterai.com',
  integrations: [],

  markdown: {
    shikiConfig: {
      theme: 'github-dark',
    },
  },

  output: "hybrid",
  adapter: cloudflare()
});