import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { preview } from "astro";
import { chromium } from "playwright";

// Real production pages and HTMLAudioElement playback, with deterministic
// provider responses and silent audio instead of third-party availability.
const artifacts = new URL("../.local/browser-check/", import.meta.url);
await mkdir(artifacts, { recursive: true });
const sampleRate = 8000;
const audio = Buffer.alloc(44 + sampleRate * 2 * 30);
audio.write("RIFF", 0); audio.writeUInt32LE(audio.length - 8, 4); audio.write("WAVEfmt ", 8);
audio.writeUInt32LE(16, 16); audio.writeUInt16LE(1, 20); audio.writeUInt16LE(1, 22);
audio.writeUInt32LE(sampleRate, 24); audio.writeUInt32LE(sampleRate * 2, 28);
audio.writeUInt16LE(2, 32); audio.writeUInt16LE(16, 34);
audio.write("data", 36); audio.writeUInt32LE(audio.length - 44, 40);

const server = await preview({ root: fileURLToPath(new URL("../", import.meta.url)), server: { host: "127.0.0.1", port: 0 }, logLevel: "error" });
const base = `http://127.0.0.1:${server.port}`;
let browser;
let page;
try {
    browser = await chromium.launch();
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, colorScheme: "dark", reducedMotion: "reduce" });
    const errors = [];
    context.on("page", (opened) => opened.on("pageerror", (error) => errors.push(error.message)));
    await context.addInitScript(() => {
        document.addEventListener("astro:page-load", () => {
            window.__qaPageLoads = (window.__qaPageLoads || 0) + 1;
        });
    });
    await context.route("**/*", async (route) => {
        const request = route.request();
        const url = new URL(request.url());
        if (url.hostname === "itunes.apple.com") {
            return route.fulfill({ json: { results: [{ previewUrl: `${base}/__qa-audio.wav`, trackName: "Preview fixture", artistName: "Test artist" }] } });
        }
        if (request.resourceType() === "media" || url.pathname === "/__qa-audio.wav") {
            return route.fulfill({ contentType: "audio/wav", body: audio });
        }
        if (url.origin === base) return route.continue();
        return route.abort();
    });
    page = await context.newPage();
    page.setDefaultTimeout(15000);

    async function navigate(href) {
        const before = await page.evaluate(() => window.__qaPageLoads);
        await page.locator(`a[href="${href}"]:visible`).first().click();
        await page.waitForFunction(({ href, before }) => location.pathname === href && window.__qaPageLoads > before, { href, before });
    }
    async function assertNoOverflow() {
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `Page overflow: ${page.url()}`);
    }
    async function screenshot(name) {
        await page.evaluate(async () => {
            await document.fonts.ready;
            await Promise.all(Array.from(document.images).filter((image) => {
                const rect = image.getBoundingClientRect();
                return image.getAttribute("src") && rect.width && rect.bottom > 0 && rect.top < innerHeight;
            }).map((image) => image.decode().catch(() => {})));
        });
        await page.screenshot({ path: fileURLToPath(new URL(name, artifacts)), fullPage: false, animations: "disabled" });
    }

    await page.goto(`${base}/timeline/`);
    await page.waitForFunction(() => window.__audioPlayerState?.initialized && window.__qaPageLoads);
    await page.evaluate(() => {
        window.__qaAudio = document.querySelector("#main-audio-element");
        window.__qaPlayCalls = [];
        const play = window.playTrack;
        window.playTrack = (track) => { window.__qaPlayCalls.push(track.url); return play(track); };
    });
    // This exact navigation used to replace the shared player with a legacy iframe.
    for (const batch of ["2-ep_1-50", "6-ep_201-250"]) {
        await navigate(`/audioshow/${batch}/`);
        const artwork = page.locator(".audioshow-image[data-audio-url]").first();
        await artwork.waitFor();
        const url = await artwork.getAttribute("data-audio-url");
        const before = await page.evaluate(() => window.__qaPlayCalls.length);
        await artwork.press("Enter");
        await page.waitForFunction((url) => window.__audioPlayerState?.track?.url === url && window.__audioPlayerState.isPlaying, url);
        assert.equal(await page.evaluate(() => window.__qaPlayCalls.length), before + 1);
        assert(await page.evaluate(() => window.__qaAudio === document.querySelector("#main-audio-element")));
        assert.equal(await page.locator("#apple-music-player").count(), 0);
        await navigate("/timeline/");
    }
    console.log("PASS batch navigation, keyboard playback, and persistent audio element");

    for (let visit = 0; visit < 3; visit++) {
        await navigate("/audioshow/");
        const before = await page.evaluate(() => window.__qaPlayCalls.length);
        await page.locator("[data-track]").first().click();
        await page.waitForFunction((before) => window.__qaPlayCalls.length > before, before);
        assert.equal(await page.evaluate(() => window.__qaPlayCalls.length), before + 1, "Duplicate playback handler after navigation");
        await navigate("/projects/");
    }
    console.log("PASS repeated AudioShow visits bind one playback handler");

    // Hold an Apple lookup while a newer direct track is selected.
    let releaseLookup;
    let lookupStarted;
    const started = new Promise((resolve) => { lookupStarted = resolve; });
    const release = new Promise((resolve) => { releaseLookup = resolve; });
    await page.route("**/lookup?id=111111", async (route) => {
        lookupStarted();
        await release;
        await route.fulfill({ json: { results: [{ previewUrl: `${base}/__qa-audio.wav?old`, trackName: "Stale track" }] } }).catch(() => {});
    });
    await page.evaluate(() => { window.__qaPending = window.playTrack({ type: "apple", url: "https://music.apple.com/us/song/111111" }); });
    await Promise.race([started, new Promise((_, reject) => setTimeout(() => reject(new Error("Lookup never started")), 15000).unref())]);
    await page.evaluate(async (base) => {
        await window.playTrack({ type: "local", url: `${base}/__qa-audio.wav?new`, title: "Newest track" });
    }, base);
    releaseLookup();
    await page.evaluate(() => window.__qaPending);
    assert.equal(await page.locator("#player-track-name").textContent(), "Newest track");
    assert((await page.locator("#main-audio-element").getAttribute("src")).endsWith("?new"));
    console.log("PASS newer selections win over pending provider requests");

    await page.route("**/lookup?id=222222", (route) => route.fulfill({ json: { results: [] } }));
    await page.evaluate(() => window.playTrack({ type: "apple", id: "222222", url: "https://music.apple.com/us/song/fixture", title: "Retry fixture" }));
    assert.equal(await page.locator("#player-artist-name").textContent(), "Playback failed");
    assert.equal(await page.locator("#player-play-btn").isEnabled(), true);
    await page.unroute("**/lookup?id=222222");
    await page.locator("#player-play-btn").click();
    await page.waitForFunction(() => window.__audioPlayerState?.isPlaying);
    assert.equal(await page.evaluate(() => window.__audioPlayerState.track.url), "https://music.apple.com/us/song/fixture");
    console.log("PASS failed previews remain retryable and retain their authored identity");

    await page.evaluate(async (base) => {
        const tracks = [1, 2, 3].map((n) => ({ type: "local", url: `${base}/__qa-audio.wav?queue=${n}`, title: `Queue ${n}` }));
        await window.playTrack({ ...tracks[0], _playlist: tracks, _plIdx: 0 });
    }, base);
    await page.waitForFunction(() => document.querySelector("#main-audio-element").duration > 0);
    await page.locator("#player-next-btn").click();
    await page.waitForFunction(() => window.__audioPlayerState?.track?.title === "Queue 2" && window.__audioPlayerState.isPlaying);
    await page.locator("#player-prev-btn").click();
    await page.waitForFunction(() => window.__audioPlayerState?.track?.title === "Queue 1" && window.__audioPlayerState.isPlaying);
    await page.locator("#player-seek-container").press("ArrowRight");
    await page.waitForFunction(() => document.querySelector("#main-audio-element").currentTime >= 5);
    await page.locator("#player-shuffle-btn").click();
    assert.equal(await page.locator("#player-shuffle-btn").getAttribute("aria-pressed"), "true");
    await page.locator("#player-next-btn").click();
    await page.waitForFunction(() => window.__audioPlayerState?.track?.title !== "Queue 1");
    await page.locator("#player-play-btn").click();
    await page.waitForFunction(() => !window.__audioPlayerState?.isPlaying);
    console.log("PASS queue navigation, keyboard seek, shuffle, and pause");

    await navigate("/gallery/");
    await page.locator('[data-gallery-view="featured"]').click();
    await page.locator('[data-gallery-subject="Night Sky"]').click();
    const selection = await page.locator(".gallery-item:visible").count();
    assert(selection > 0);
    assert(await page.locator(".gallery-item:visible").evaluateAll((items) => items.every((item) => item.dataset.featured === "true" && item.dataset.category === "Night Sky")));
    await page.locator("#gallery-sort-order").selectOption("oldest");
    const dates = await page.locator(".gallery-item:visible").evaluateAll((items) => items.map((item) => JSON.parse(document.getElementById(item.dataset.metaId).textContent).date));
    assert.deepEqual(dates, [...dates].sort());
    const card = page.locator(".gallery-item:visible").first();
    await card.press("Enter");
    await page.waitForFunction(() => document.querySelector("#gallery-modal").style.opacity === "1");
    await page.waitForFunction(() => document.querySelector("#modal-image").naturalWidth > 0);
    assert((await page.locator("#modal-counter-mobile").textContent()).includes(String(selection)));
    await screenshot("gallery-desktop-viewer.png");
    await page.keyboard.press("Escape");
    assert(await card.evaluate((item) => item === document.activeElement));
    await page.locator("#gallery-filter-reset").click();
    assert.equal(await page.locator(".gallery-item:visible").count(), await page.locator(".gallery-item").count());
    await assertNoOverflow();
    await screenshot("gallery-desktop-dark.png");
    await page.locator("#theme-toggle").click();
    assert.equal(await page.evaluate(() => document.documentElement.classList.contains("dark")), false);
    await screenshot("gallery-desktop-light.png");
    await navigate("/projects/");
    await navigate("/gallery/");
    assert.equal(await page.evaluate(() => document.documentElement.classList.contains("dark")), false);
    console.log("PASS gallery filter composition, sorting, keyboard viewer, focus return, and theme persistence");

    await page.setViewportSize({ width: 390, height: 844 });
    await assertNoOverflow();
    await screenshot("gallery-mobile-light.png");
    await page.locator("#theme-toggle-mobile").click();
    await screenshot("gallery-mobile-dark.png");
    await page.locator(".gallery-item:visible").first().press("Enter");
    await page.waitForFunction(() => document.querySelector("#gallery-modal").style.opacity === "1");
    await page.waitForFunction(() => document.querySelector("#modal-image").naturalWidth > 0);
    await screenshot("gallery-mobile-viewer.png");
    await page.keyboard.press("Escape");
    await page.goto(`${base}/notes/policy-gradient/`);
    await page.waitForFunction(() => window.__qaPageLoads && document.querySelector(".katex"));
    await assertNoOverflow();
    const scrolling = await page.locator(".post-content table, .post-content .katex-display").evaluateAll((elements) => elements.filter((el) => el.scrollWidth > el.clientWidth + 1).map((el) => {
        el.scrollLeft = 30;
        return el.scrollLeft > 0;
    }));
    assert(scrolling.length > 0 && scrolling.every(Boolean), "Wide math and tables must scroll inside their containers");
    await screenshot("math-mobile-dark.png");
    console.log("PASS mobile layouts and contained math/table scrolling");
    assert.deepEqual(errors, [], "Uncaught browser errors");
    console.log(`Browser checks passed. Screenshots: ${fileURLToPath(artifacts)}`);
} catch (error) {
    if (page && !page.isClosed()) await page.screenshot({ path: fileURLToPath(new URL("failure.png", artifacts)) }).catch(() => {});
    throw error;
} finally {
    try { await browser?.close(); } finally { await server.stop(); }
}
