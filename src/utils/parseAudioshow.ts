/**
 * AudioShow Episode Parser
 * Parses markdown files to extract individual episode data
 */

export interface Episode {
    number: number;
    quote: string;
    songTitle: string;
    artist: string;
    album: string;
    year: number;
    composer?: string;
    imageUrl?: string;
    appleMusicUrl?: string;
    sourceFile: string;
}

/**
 * Parse a single episode section from markdown
 */
function parseEpisodeSection(section: string, sourceFile: string): Episode | null {
    // Match episode number from header: ### 📻 Audioshow - EP_X
    const headerMatch = section.match(/###\s*📻\s*Audioshow\s*-\s*EP_(\d+)/i);
    if (!headerMatch) return null;

    const number = parseInt(headerMatch[1], 10);
    if (isNaN(number)) return null;

    // Extract content after the header
    const content = section.slice(headerMatch.index! + headerMatch[0].length).trim();
    const lines = content.split('\n').map(l => l.trim()).filter(l => l.length > 0);

    // Parse quote (first non-empty line, usually in quotes)
    let quote = '';
    let lineIndex = 0;

    // Quote might span multiple lines, collect until we hit a line without quotes
    const quoteLines: string[] = [];
    while (lineIndex < lines.length) {
        const line = lines[lineIndex];
        // If it starts with a quote or continues a multi-line quote
        if (line.startsWith('"') || (quoteLines.length > 0 && !line.startsWith('-') && !line.startsWith('<'))) {
            quoteLines.push(line.replace(/^"|"$/g, '').replace(/\s{2,}$/g, ''));
            lineIndex++;
            // Check if this line ends the quote
            if (line.endsWith('"')) break;
        } else if (line === '[Instrumental]') {
            quoteLines.push('[Instrumental]');
            lineIndex++;
            break;
        } else {
            break;
        }
    }
    quote = quoteLines.join('\n').trim();

    // Next line should be song title
    const songTitle = lines[lineIndex] || '';
    lineIndex++;

    // Parse metadata lines (start with -)
    const metaLines: string[] = [];
    while (lineIndex < lines.length && lines[lineIndex].startsWith('-')) {
        metaLines.push(lines[lineIndex].slice(1).trim());
        lineIndex++;
    }

    const artist = metaLines[0] || '';
    const album = metaLines[1] || '';
    const year = parseInt(metaLines[2] || '0', 10);
    const composer = metaLines[3] || undefined;

    // Parse image tag for imageUrl and appleMusicUrl
    let imageUrl: string | undefined;
    let appleMusicUrl: string | undefined;

    const imgMatch = section.match(/<img[^>]*src="([^"]+)"[^>]*>/i);
    if (imgMatch) {
        imageUrl = imgMatch[1];
    }

    const onclickMatch = section.match(/onclick="toggleMusic\([^,]+,\s*'([^']+)'\)"/i);
    if (onclickMatch) {
        appleMusicUrl = onclickMatch[1];
    }

    return {
        number,
        quote,
        songTitle,
        artist,
        album,
        year,
        composer,
        imageUrl,
        appleMusicUrl,
        sourceFile,
    };
}

/**
 * Parse all episodes from raw markdown content
 */
export function parseEpisodesFromMarkdown(markdown: string, sourceFile: string): Episode[] {
    const episodes: Episode[] = [];

    // Split by episode headers
    const sections = markdown.split(/(?=###\s*📻\s*Audioshow\s*-\s*EP_\d+)/i);

    for (const section of sections) {
        const episode = parseEpisodeSection(section, sourceFile);
        if (episode && episode.number > 0) {
            episodes.push(episode);
        }
    }

    return episodes;
}

/**
 * @deprecated Not used - episode reading is done directly in Astro components
 * Get all episodes from all audioshow markdown files
 */
export async function getAllEpisodes(): Promise<Episode[]> {
    return [];
}

/**
 * Sort episodes by number descending (most recent first)
 */
export function sortEpisodesDesc(episodes: Episode[]): Episode[] {
    return [...episodes].sort((a, b) => b.number - a.number);
}

/**
 * Get the N most recent episodes
 */
export function getRecentEpisodes(episodes: Episode[], count: number = 10): Episode[] {
    return sortEpisodesDesc(episodes).slice(0, count);
}

/**
 * Group episodes by ranges (1-50, 51-100, etc.)
 */
export function groupEpisodesByRange(episodes: Episode[], rangeSize: number = 50): Record<string, Episode[]> {
    const groups: Record<string, Episode[]> = {};

    for (const ep of episodes) {
        const rangeStart = Math.floor((ep.number - 1) / rangeSize) * rangeSize + 1;
        const rangeEnd = rangeStart + rangeSize - 1;
        const key = `${rangeStart}-${rangeEnd}`;

        if (!groups[key]) {
            groups[key] = [];
        }
        groups[key].push(ep);
    }

    // Sort episodes within each group
    for (const key in groups) {
        groups[key].sort((a, b) => a.number - b.number);
    }

    return groups;
}
