import type { AudioTrack, AudioTrackType } from "./types.ts";

export interface ResolvedAudioTrack {
    url: string;
    title: string;
    artist: string;
    artwork?: string;
}

interface AudioProvider {
    name: string;
    resolve: (track: AudioTrack, signal?: AbortSignal) => Promise<ResolvedAudioTrack>;
}

export const providers: Record<AudioTrackType, AudioProvider> = {
    apple: {
        name: "Apple Music",
        async resolve(track, signal) {
            const url = new URL(track.url);
            const id = track.id || url.searchParams.get("i") || url.pathname.match(/\/(\d+)\/?$/)?.[1];
            if (!id || !/^\d+$/.test(id)) throw new Error("Invalid Apple Music ID");

            const response = await fetch(`https://itunes.apple.com/lookup?id=${id}`, { signal });
            if (!response.ok) throw new Error(`iTunes API error: ${response.status}`);
            const data = await response.json();
            const info = data.results?.[0];
            if (!info || typeof info.previewUrl !== "string" || !info.previewUrl) {
                throw new Error("Track preview unavailable");
            }
            return {
                url: info.previewUrl,
                title: typeof info.trackName === "string" ? info.trackName : track.title || "Unknown Track",
                artist: typeof info.artistName === "string" ? info.artistName : track.artist || "Apple Music",
                artwork: track.artwork || (typeof info.artworkUrl100 === "string"
                    ? info.artworkUrl100.replace("100x100", "300x300") : undefined),
            };
        },
    },
    local: {
        name: "Local Audio",
        async resolve(track) {
            return {
                url: track.url,
                title: track.title || "Unknown Track",
                artist: track.artist || "AudioShow",
                artwork: track.artwork,
            };
        },
    },
};
