import fs from "node:fs";
import path from "node:path";
import { parseEpisodesFromMarkdown, type Episode } from "./parseAudioshow";

/**
 * Load and parse all AudioShow episodes from markdown files.
 * Shared utility to avoid duplicating file-reading logic across pages.
 */
export function loadAllEpisodes(): Episode[] {
    const audioshowDir = path.join(process.cwd(), "src/content/audioshow");
    const files = fs.readdirSync(audioshowDir).filter((f) => f.endsWith(".md"));

    const allEpisodes: Episode[] = [];
    for (const file of files) {
        const filePath = path.join(audioshowDir, file);
        const content = fs.readFileSync(filePath, "utf-8");
        const episodes = parseEpisodesFromMarkdown(content, file);
        allEpisodes.push(...episodes);
    }

    return allEpisodes;
}
