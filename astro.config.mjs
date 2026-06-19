import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';

/* ------------------------- support for latex math ------------------------- */
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';

import preact from "@astrojs/preact";
import sitemap from '@astrojs/sitemap';

// Inject lazy-loading + async decoding on every <img> in rendered markdown.
// Project READMEs embed full-resolution remote screenshots as raw <img>, which
// otherwise load eagerly and block paint. Only sets attributes when absent so
// author-specified values win.
function rehypeImgAttrs() {
  // Raw HTML <img> in markdown (e.g. README screenshots) arrives as `raw`
  // nodes that bypass the element walk, so patch those strings too.
  const patchRawImgs = (html) =>
    html
      .replace(/<img\b(?![^>]*\sloading=)([^>]*?)>/gi, '<img loading="lazy"$1>')
      .replace(/<img\b(?![^>]*\sdecoding=)([^>]*?)>/gi, '<img decoding="async"$1>');
  return (tree) => {
    const walk = (node) => {
      if (node.type === 'element' && node.tagName === 'img') {
        node.properties = node.properties || {};
        if (node.properties.loading == null) node.properties.loading = 'lazy';
        if (node.properties.decoding == null) node.properties.decoding = 'async';
      } else if (
        node.type === 'raw' &&
        typeof node.value === 'string' &&
        node.value.includes('<img')
      ) {
        node.value = patchRawImgs(node.value);
      }
      if (node.children) node.children.forEach(walk);
    };
    walk(tree);
  };
}

function isLegacyRedirectUrl(page) {
  const { pathname } = new URL(page);
  return (
    pathname.startsWith('/log/') ||
    pathname.startsWith('/wiki/') ||
    pathname !== pathname.toLowerCase()
  );
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
  integrations: [
    preact(),
    // Legacy routes are 0-second meta-refresh redirect stubs. Keep them out of
    // the sitemap so crawlers are not handed thin redirecting URLs.
    sitemap({
      filter: (page) => !isLegacyRedirectUrl(page),
    }),
  ],
});
