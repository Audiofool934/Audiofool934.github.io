import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { legacyRedirects } from "../src/data/legacyRedirects.mjs";
import { isCaseSensitiveFilesystem, redirectsForFilesystem } from "../src/utils/legacyRoutes.mjs";

const dist = fileURLToPath(new URL("../dist/", import.meta.url));
const site = "https://audiofool.blog";
const files = await fs.readdir(dist, { recursive: true });
const htmlFiles = files.filter((file) => file.endsWith(".html"));
assert(htmlFiles.length > 0, "Build the site before checking routes");
const sitemap = (await Promise.all(files.filter((file) => /^sitemap.*\.xml$/.test(file))
    .map((file) => fs.readFile(path.join(dist, file), "utf8")))).join("\n");
assert(sitemap.includes("<loc>"), "Missing sitemap");
const sitemapUrls = new Set([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]));
const redirects = new Map();
const fileForRoute = (route) => path.join(dist, decodeURIComponent(route), route.endsWith("/") ? "index.html" : "");

function attrs(tag) {
    return Object.fromEntries([...tag.matchAll(/([\w-]+)\s*=\s*["']([^"']*)["']/g)]
        .map(([, key, value]) => [key.toLowerCase(), value.replaceAll("&amp;", "&")]));
}

for (const file of htmlFiles) {
    const html = await fs.readFile(path.join(dist, file), "utf8");
    const head = html.split("</head>")[0];
    const meta = [...head.matchAll(/<meta\b[^>]*>/gi)].map(([tag]) => attrs(tag));
    const refresh = meta.find((tag) => tag["http-equiv"]?.toLowerCase() === "refresh");
    if (!refresh) continue;
    const target = refresh.content?.match(/url\s*=\s*(.+)$/i)?.[1];
    assert(target, `${file}: redirect has no destination`);
    const url = new URL(target, site);
    const route = "/" + file.split(path.sep).join("/").replace(/index\.html$/, "");
    assert.notEqual(url.href, new URL(route, site).href, `${route}: redirect points to itself`);
    assert(meta.some((tag) => tag.name === "robots" && tag.content?.includes("noindex")), `${route}: redirects must be noindex`);
    const canonical = [...head.matchAll(/<link\b[^>]*>/gi)].map(([tag]) => attrs(tag)).find((tag) => tag.rel === "canonical");
    assert.equal(canonical?.href, url.href, `${route}: canonical must match its destination`);
    assert(!sitemapUrls.has(new URL(route, site).href), `${route}: redirect is in the sitemap`);
    if (url.origin === site) {
        const sourceFile = await fs.realpath(path.join(dist, file));
        const targetFile = await fs.realpath(fileForRoute(url.pathname));
        assert.notEqual(sourceFile, targetFile, `${route}: redirect overwrote its destination on this filesystem`);
        redirects.set(sourceFile, targetFile);
    }
}

for (const source of redirects.keys()) {
    const visited = new Set();
    let current = source;
    while (redirects.has(current)) {
        assert(!visited.has(current), `${source}: redirect cycle`);
        visited.add(current);
        current = redirects.get(current);
    }
}

// All canonical destinations must remain real pages, even where aliases share
// the same filesystem entry. Case-sensitive builds must also emit every alias.
for (const { to } of legacyRedirects) {
    const html = await fs.readFile(fileForRoute(to), "utf8");
    assert(html.includes('id="main-content"'), `${to}: canonical content was replaced`);
}
for (const { from } of redirectsForFilesystem(legacyRedirects, isCaseSensitiveFilesystem(dist))) {
    const filename = await fs.realpath(fileForRoute(`/${from}/`));
    assert(redirects.has(filename), `${from}: legacy redirect is missing`);
}
console.log(`${htmlFiles.length} HTML pages and ${redirects.size} internal redirects passed; no loops, missing targets, or sitemap redirects.`);
