export type AudioShowCrateTrack = {
    number: number;
    section: string;
    title: string;
    artists: string;
    album: string;
    year: string;
    spotifyUrl: string;
    audioPreviewUrl: string;
    cover: string;
};

export type AudioShowCrate = {
    slug: string;
    number: string;
    title: string;
    premise: string;
    curatorNote: string;
    cover: string;
    socialImage?: string;
    spotifyUrl: string;
    trackCount: number;
    duration: string;
    updated: string;
    tags: string[];
    sections: { title: string; note: string }[];
    tracks: AudioShowCrateTrack[];
};
