/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

import type { AudioPlayerState, AudioPlaylistItem, AudioTrack } from "./scripts/audio/types";

declare global {
    interface Window {
        __audioPlayerModuleLoaded?: boolean;
        __audioPlayerInit?: () => void | Promise<void>;
        __audioPlayerConfig?: { playlistUrl?: string };
        __audioPlayerState?: AudioPlayerState;
        __defaultAudioShowTrack?: AudioTrack;
        setAudioPlaylist?: (items: AudioPlaylistItem[], options?: { currentIndex?: number; currentUrl?: string }) => void;
        playTrack: (track: AudioTrack) => Promise<void>;
        toggleMusic: (playerType: string, url: string, event?: Event) => void;
    }
}
