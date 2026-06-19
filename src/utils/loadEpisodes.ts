import fs from "node:fs";
import path from "node:path";
import { parseEpisodesFromMarkdown, type Episode } from "./parseAudioshow";

/**
 * Load and parse all AudioShow episodes from markdown files.
 * Shared utility to avoid duplicating file-reading logic across pages.
 */
export function loadAllEpisodes(): Episode[] {
    const audioshowDir = path.join(process.cwd(), "src/content/audioshow");
    if (!fs.existsSync(audioshowDir)) {
        console.warn(`AudioShow directory not found: ${audioshowDir}`);
        return [];
    }

    const files = fs.readdirSync(audioshowDir).filter((f) => f.endsWith(".md"));

    const allEpisodes: Episode[] = [];
    for (const file of files) {
        const filePath = path.join(audioshowDir, file);
        try {
            const content = fs.readFileSync(filePath, "utf-8");
            const episodes = parseEpisodesFromMarkdown(content, file);
            allEpisodes.push(...episodes);
        } catch (error) {
            console.warn(`Skipping unreadable AudioShow file: ${filePath}`, error);
        }
    }

    return allEpisodes;
}
