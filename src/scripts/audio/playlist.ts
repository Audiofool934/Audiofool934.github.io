import type { AudioPlayerState, AudioPlaylistItem, AudioTrack, NormalizedAudioTrack } from "./types.ts";

export function normalizePlaylist(items: AudioPlaylistItem[]): NormalizedAudioTrack[] {
    if (!Array.isArray(items)) return [];
    return items
        .map(function (item, index) {
            var url = item.url;
            if (!url) return null;
            return {
                n: item.n || item.number || index + 1,
                t: item.t || item.title || "Untitled",
                a: item.a || item.artist || "AudioShow",
                url: url,
                img: item.img || item.artwork || "",
                type:
                    item.type ||
                    (url.includes("music.apple.com") ? "apple" : "local"),
            };
        })
        .filter((item): item is NormalizedAudioTrack => item !== null);
}

export function findPlaylistIndexByUrl(list: NormalizedAudioTrack[], url: string) {
    for (var i = 0; i < list.length; i++) {
        if (list[i].url === url) return i;
    }
    return -1;
}

export function generateShuffledOrder(length: number) {
    const order: number[] = [];
    for (var i = 0; i < length; i++) order.push(i);
    for (var j = length - 1; j > 0; j--) {
        var swapIndex = Math.floor(Math.random() * (j + 1));
        var tmp = order[j];
        order[j] = order[swapIndex];
        order[swapIndex] = tmp;
    }
    return order;
}

export function getPlaylistTrack(list: NormalizedAudioTrack[], index: number): AudioTrack | null {
    var ep = list[index];
    if (!ep) return null;
    return {
        type: ep.type,
        url: ep.url,
        title: ep.t,
        artist: ep.a,
        artwork: ep.img,
        _plIdx: index,
    };
}

export function resolveIndex(list: NormalizedAudioTrack[], state: AudioPlayerState, offset: number) {
    var len = list.length;
    if (len === 0) return -1;
    var currentPos = state.playlistPos >= 0 ? state.playlistPos : -1;
    var nextPos = currentPos + offset;
    if (nextPos >= len) nextPos = 0;
    if (nextPos < 0) nextPos = len - 1;
    if (state.shuffleMode && state.shuffledOrder) {
        return state.shuffledOrder[nextPos];
    }
    return nextPos;
}

export function findPos(state: AudioPlayerState, plIdx: number) {
    if (state.shuffleMode && state.shuffledOrder) {
        for (var i = 0; i < state.shuffledOrder.length; i++) {
            if (state.shuffledOrder[i] === plIdx) return i;
        }
    }
    return plIdx;
}
