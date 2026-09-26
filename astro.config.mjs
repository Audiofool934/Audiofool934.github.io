import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';

/* ------------------------- support for latex math ------------------------- */
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';

import sitemap from '@astrojs/sitemap';
import { rehypeImgAttrs } from './src/utils/rehypeImages.mjs';
import { legacyRedirects } from './src/data/legacyRedirects.mjs';

const legacyRedirectPaths = new Set(legacyRedirects.map(({ from }) => `/${from}/`));

function isLegacyRedirectUrl(page) {
  const { pathname } = new URL(page);
  return (
    legacyRedirectPaths.has(pathname) ||
    pathname.startsWith('/log/') ||
    pathname.startsWith('/wiki/') ||
    pathname !== pathname.toLowerCase()
  );
}

const redirectOnlyTimelinePaths = new Set([
  '/timeline/2026-05-13-ai-music-taste-note/',
  '/timeline/2026-05-14-dj-claw-radio-agent-note/',
  '/timeline/2026-05-14-openclaw-runtime-note/',
  '/timeline/2026-05-25-process-native-ai-music/',
  '/timeline/2026-05-26-agentic-essay/',
  '/timeline/2026-06-19-free-myself-from-claude/',
]);

function isRedirectOnlyTimelineUrl(page) {
  const { pathname } = new URL(page);
  return redirectOnlyTimelinePaths.has(pathname);
}

// https://astro.build/config
export default defineConfig({
  markdown: {
    syntaxHighlight: 'prism',
    processor: unified({
      remarkPlugins: [remarkMath],
      rehypePlugins: [rehypeKatex, rehypeImgAttrs],
    }),
  },
  site: "https://audiofool.blog",
  trailingSlash: 'always',
  vite: {
    build: {
      // Keep unused KaTeX fonts out of the render-blocking stylesheet.
      assetsInlineLimit: (filePath) => /KaTeX_.*\.(woff2?|ttf)$/.test(filePath) ? false : undefined,
    },
  },
  integrations: [
    // Legacy routes are 0-second meta-refresh redirect stubs. Keep them out of
    // the sitemap so crawlers are not handed thin redirecting URLs.
    sitemap({
      filter: (page) => !isLegacyRedirectUrl(page) && !isRedirectOnlyTimelineUrl(page),
    }),
  ],
});
