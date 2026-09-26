import { audioImage as audioImageVariant, audioImageSrcset, isOptimizableAudioImage, isRemoteImage } from "./audioImages.mjs";

// Inject lazy-loading + async decoding on every <img> in rendered markdown.
// Project READMEs embed full-resolution remote screenshots as raw <img>, which
// otherwise load eagerly and block paint. Only sets attributes when absent so
// author-specified values win.
export function rehypeImgAttrs() {
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
      if (isRemoteImage(src) && !/\sreferrerpolicy=/i.test(patched)) {
        patched = patched.replace(/<img\b/i, '<img referrerpolicy="no-referrer"');
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
        if (isRemoteImage(src) && node.properties.referrerpolicy == null) {
          node.properties.referrerpolicy = 'no-referrer';
        }
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
