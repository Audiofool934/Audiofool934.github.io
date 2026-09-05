import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { gzipSync } from "node:zlib";

// Check actual production output. Review budgets deliberately as the archive grows.
const dist = new URL("../dist/", import.meta.url);
const budgets = [
  ["index.html", 8],
  ["notes/policy-gradient/index.html", 16],
  ["audioshow/index.html", 13],
  ["audioshow/archive/index.html", 65],
  ["audioshow/crates/route-88/index.html", 17],
  ["gallery/index.html", 18],
  ["audioshow/playlist.json", 25],
];

function checkSize(label, bytes, limitKiB) {
  const size = bytes / 1024;
  assert(size <= limitKiB, `${label}: ${size.toFixed(1)} KiB exceeds ${limitKiB} KiB gzip budget`);
  console.log(`${label}: ${size.toFixed(1)} / ${limitKiB} KiB gzip`);
}

for (const [file, limit] of budgets) {
  const content = await fs.readFile(new URL(file, dist));
  checkSize(file, gzipSync(content).length, limit);
}

const assetNames = await fs.readdir(new URL("_astro/", dist));
const scripts = await Promise.all(assetNames.filter((file) => file.endsWith(".js"))
  .map((file) => fs.readFile(new URL(`_astro/${file}`, dist))));
checkSize("All JavaScript assets (not all loaded on each page)", scripts.reduce((sum, script) => sum + gzipSync(script).length, 0), 26);

const home = await fs.readFile(new URL("index.html", dist), "utf8");
assert(!home.includes("KaTeX_") && !home.includes("katex.min."), "Non-math pages must not load KaTeX");
const math = await fs.readFile(new URL("notes/policy-gradient/index.html", dist), "utf8");
const mathCss = math.match(/href="(\/_astro\/katex[^\"]+\.css)"/);
assert(mathCss, "Math stylesheet must be a local, versioned build asset");
assert(!math.includes("cdn.jsdelivr.net/npm/katex"), "Math must not depend on a remote stylesheet");
const css = await fs.readFile(new URL(mathCss[1].slice(1), dist), "utf8");
checkSize("KaTeX stylesheet", gzipSync(css).length, 5);
assert(!css.includes("data:"), "Keep unused math fonts out of the render-blocking stylesheet");
const fontUrls = [...css.matchAll(/url\(["']?([^\s)'\"]+)/g)].map((match) => match[1]);
assert(fontUrls.length > 0, "Math stylesheet must reference its fonts");
for (const url of new Set(fontUrls)) {
  assert(!/^https?:/.test(url), `Math font must be local: ${url}`);
  const file = url.startsWith("/") ? url.slice(1) : path.posix.join(path.posix.dirname(mathCss[1]).slice(1), url);
  await fs.access(new URL(file, dist));
}
console.log("Performance budgets and local math assets passed.");
