import { defineConfig } from 'astro/config';

/* ------------------------- support for latex math ------------------------- */
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';

import preact from "@astrojs/preact";

// https://astro.build/config
export default defineConfig({
  markdown: {
		shikiConfig: {
			theme: "dracula",
			wrap: false,
		}
	},
  site: "http://audiofool.net",
  integrations: [
    preact(),
    mdx({
      remarkPlugins: [remarkMath],
      rehypePlugins: [rehypeKatex],
    }),
    image(),
    sitemap()
  ]
});