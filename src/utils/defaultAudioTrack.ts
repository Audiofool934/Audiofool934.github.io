import { loadAllEpisodes } from "./loadEpisodes";
import { sortEpisodesDesc } from "./parseAudioshow";

export interface DefaultAudioTrack {
    type: "apple" | "local";
    url: string;
    title: string;
    artist: string;
    artwork: string;
}

export function getDefaultAudioTrack(): DefaultAudioTrack | null {
    try {
        const latest = sortEpisodesDesc(loadAllEpisodes())[0];
        if (!latest?.appleMusicUrl) return null;
        return {
            type: latest.appleMusicUrl.includes("music.apple.com") ? "apple" : "local",
            url: latest.appleMusicUrl,
            title: latest.songTitle,
            artist: latest.artist,
            artwork: latest.imageUrl || "/images/placeholder-album.svg",
        };
    } catch (error) {
        console.error("Failed to load default track:", error);
        return null;
    }
}
