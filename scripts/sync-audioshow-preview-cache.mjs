import fs from "node:fs";
import path from "node:path";

const CONTENT_DIR = path.join(process.cwd(), "src/content/audioshow");
const CACHE_FILE = path.join(process.cwd(), "src/data/audioshow-preview-cache.json");

function readJson(file) {
    if (!fs.existsSync(file)) return {};
    return JSON.parse(fs.readFileSync(file, "utf-8"));
}

function extractAppleBackedEpisodes() {
    const files = fs.readdirSync(CONTENT_DIR).filter((file) => file.endsWith(".md"));
    const entries = [];

    for (const file of files) {
        const markdown = fs.readFileSync(path.join(CONTENT_DIR, file), "utf-8");
        const sections = markdown.split(/(?=###\s*📻\s*Audioshow\s*-\s*EP_\d+)/i);

        for (const section of sections) {
            const epMatch = section.match(/###\s*📻\s*Audioshow\s*-\s*EP_(\d+)/i);
            const onclickMatch = section.match(/onclick="toggleMusic\([^,]+,\s*'([^']+)'\)"/i);
            const previewMatch = section.match(/(?:^|\n)(?:Audio Preview|Preview Audio)\s*\n\s*(https?:\/\/\S+)/i);

            if (!epMatch || !onclickMatch || previewMatch) continue;

            const appleUrl = onclickMatch[1];
            if (!appleUrl.includes("music.apple.com")) continue;

            const trackId = appleUrl.match(/[?&]i=(\d+)/)?.[1];
            if (!trackId) continue;

            entries.push({
                episode: Number(epMatch[1]),
                appleUrl,
                trackId,
            });
        }
    }

    return entries.sort((a, b) => a.episode - b.episode);
}

async function lookupPreview(entry) {
    const response = await fetch(`https://itunes.apple.com/lookup?id=${entry.trackId}&country=us`);
    const text = await response.text();
    const data = JSON.parse(text);
    const info = data.results?.[0];
    if (!info?.previewUrl) return null;

    return {
        previewUrl: info.previewUrl,
        title: info.trackName,
        artist: info.artistName,
        artwork: info.artworkUrl100?.replace("100x100", "300x300"),
    };
}

const cache = readJson(CACHE_FILE);
const entries = extractAppleBackedEpisodes();
const missing = entries.filter((entry) => !cache[entry.appleUrl]);

let resolved = 0;
for (const entry of missing) {
    try {
        const preview = await lookupPreview(entry);
        if (preview) {
            cache[entry.appleUrl] = preview;
            resolved += 1;
            console.log(`[audioshow-preview-cache] EP_${entry.episode}: resolved ${preview.title}`);
        } else {
            console.warn(`[audioshow-preview-cache] EP_${entry.episode}: no preview found for ${entry.appleUrl}`);
        }
    } catch (error) {
        console.warn(`[audioshow-preview-cache] EP_${entry.episode}: lookup failed for ${entry.appleUrl}: ${error.message}`);
    }
}

fs.mkdirSync(path.dirname(CACHE_FILE), { recursive: true });
fs.writeFileSync(CACHE_FILE, `${JSON.stringify(cache, null, 2)}\n`);

const stillMissing = entries.filter((entry) => !cache[entry.appleUrl]);
console.log(`[audioshow-preview-cache] cached ${Object.keys(cache).length}/${entries.length} Apple-backed legacy entries; resolved ${resolved} new entr${resolved === 1 ? "y" : "ies"}`);

if (stillMissing.length > 0) {
    console.warn("[audioshow-preview-cache] missing entries:");
    for (const entry of stillMissing) {
        console.warn(`  EP_${entry.episode}: ${entry.appleUrl}`);
    }
}
