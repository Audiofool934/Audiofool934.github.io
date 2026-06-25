export type AudioTrackType = "apple" | "local";

export interface AudioPlaylistItem {
    n?: number;
    number?: number;
    t?: string;
    title?: string;
    a?: string;
    artist?: string;
    url: string;
    img?: string;
    artwork?: string;
    type?: AudioTrackType;
}

export interface AudioTrack {
    type: AudioTrackType;
    url: string;
    id?: string;
    title?: string;
    artist?: string;
    artwork?: string;
    _playlist?: AudioPlaylistItem[];
    _plIdx?: number;
}

export interface NormalizedAudioTrack {
    n: number;
    t: string;
    a: string;
    url: string;
    img: string;
    type: AudioTrackType;
}

export interface AudioPlayerState {
    initialized: boolean;
    track: AudioTrack | null;
    isPlaying: boolean;
    currentTime: number;
    playlistIndex: number;
    playlistPos: number;
    shuffleMode: boolean;
    shuffledOrder: number[] | null;
}
