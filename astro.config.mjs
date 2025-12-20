import { defineConfig } from 'astro/config';

/* ------------------------- support for latex math ------------------------- */
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';

import preact from "@astrojs/preact";

import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  markdown: {
    syntaxHighlight: 'prism',
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
    // syntaxHighlight: 'prism',
  },
  site: "http://audiofool.net",
  trailingSlash: 'always',
  integrations: [preact(), tailwind()]
});