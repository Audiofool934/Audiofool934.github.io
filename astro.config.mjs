import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';

/* ------------------------- support for latex math ------------------------- */
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';

import preact from "@astrojs/preact";
import sitemap from '@astrojs/sitemap';

const audioImagePrefix = '/images/audioshow/';
const generatedAudioImagePrefix = '/images/audioshow/_generated/';

function encodePath(pathname) {
  return pathname
    .split('/')
    .map((segment, index) => (index === 0 ? segment : encodeURIComponent(segment).replace(/'/g, '%27')))
    .join('/');
}

function isOptimizableAudioImage(src) {
  return (
    typeof src === 'string' &&
    src.startsWith(audioImagePrefix) &&
    !src.startsWith(generatedAudioImagePrefix) &&
    /\.(webp|png|jpe?g)$/i.test(src)
  );
}

function audioImageVariant(src, width) {
  const extensionIndex = src.lastIndexOf('.');
  const relative = src.slice(audioImagePrefix.length, extensionIndex);
  return encodePath(`${generatedAudioImagePrefix}${relative}-${width}.webp`);
}

function audioImageSrcset(src, widths) {
  return widths.map((width) => `${audioImageVariant(src, width)} ${width}w`).join(', ');
}

// Inject lazy-loading + async decoding on every <img> in rendered markdown.
// Project READMEs embed full-resolution remote screenshots as raw <img>, which
// otherwise load eagerly and block paint. Only sets attributes when absent so
// author-specified values win.
function rehypeImgAttrs() {
  // Raw HTML <img> in markdown (e.g. README screenshots) arrives as `raw`
  // nodes that bypass the element walk, so patch those strings too.
  const patchRawImgs = (html) =>
    html.replace(/<img\b[^>]*>/gi, (img) => {
      let patched = img;
      const src = patched.match(/\ssrc=(["'])(.*?)\1/i)?.[2];
      if (isOptimizableAudioImage(src)) {
        patched = patched.replace(/\ssrc=(["'])(.*?)\1/i, ` src="${audioImageVariant(src, 320)}"`);
        if (!/\ssrcset=/i.test(patched)) {
          patched = patched.replace(
            /<img\b/i,
            `<img srcset="${audioImageSrcset(src, [96, 320])}"`,
          );
        }
        if (!/\ssizes=/i.test(patched)) {
          patched = patched.replace(/<img\b/i, '<img sizes="(max-width: 640px) 45vw, 256px"');
        }
      }
      if (!/\sloading=/i.test(patched)) {
        patched = patched.replace(/<img\b/i, '<img loading="lazy"');
      }
      if (!/\sdecoding=/i.test(patched)) {
        patched = patched.replace(/<img\b/i, '<img decoding="async"');
      }
      return patched;
    });
  return (tree) => {
    const walk = (node) => {
      if (node.type === 'element' && node.tagName === 'img') {
        node.properties = node.properties || {};
        const src = node.properties.src;
        if (isOptimizableAudioImage(src)) {
          node.properties.src = audioImageVariant(src, 320);
          if (node.properties.srcset == null) {
            node.properties.srcset = audioImageSrcset(src, [96, 320]);
          }
          if (node.properties.sizes == null) {
            node.properties.sizes = '(max-width: 640px) 45vw, 256px';
          }
        }
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
