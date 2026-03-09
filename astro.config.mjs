import { defineConfig } from 'astro/config';

/* ------------------------- support for latex math ------------------------- */
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';

import preact from "@astrojs/preact";
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  markdown: {
    syntaxHighlight: 'prism',
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
  },
  site: "https://audiofool.blog",
  trailingSlash: 'always',
  integrations: [preact(), sitemap()]
});