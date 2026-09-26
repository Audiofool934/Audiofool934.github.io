import assert from "node:assert/strict";
import { test } from "node:test";
import { normalizePlaylist, findPlaylistIndexByUrl, generateShuffledOrder, getPlaylistTrack, resolveIndex, findPos } from "../src/scripts/audio/playlist.ts";
import { providers } from "../src/scripts/audio/providers.ts";

const tracks = normalizePlaylist([
    { url: "https://music.apple.com/us/song/123", title: "First" },
    { url: "/second.mp3", title: "Second" },
    { url: "/third.mp3", title: "Third" },
]);
const state = { initialized: true, track: null, isPlaying: false, currentTime: 0, playlistIndex: 2, playlistPos: 2, shuffleMode: false, shuffledOrder: null };

test("queues wrap at either end, and an unqueued track can enter the queue", () => {
    assert.equal(resolveIndex(tracks, state, 1), 0);
    assert.equal(resolveIndex(tracks, { ...state, playlistPos: 0 }, -1), 2);
    assert.equal(resolveIndex(tracks, { ...state, playlistPos: -1 }, 1), 0);
    assert.equal(resolveIndex([], state, 1), -1);
    assert.equal(findPlaylistIndexByUrl(tracks, "/second.mp3"), 1);
    assert.equal(getPlaylistTrack(tracks, 1)._plIdx, 1);
    assert.equal(getPlaylistTrack(tracks, 3), null);
});

test("shuffle visits every track once and preserves index/position mapping", () => {
    for (const length of [0, 1, 3, 224]) {
        const order = generateShuffledOrder(length);
        assert.deepEqual([...order].sort((a, b) => a - b), Array.from({ length }, (_, i) => i));
    }
    const shuffled = { ...state, shuffleMode: true, shuffledOrder: [2, 0, 1], playlistPos: 0 };
    assert.equal(resolveIndex(tracks, shuffled, 1), 0);
    assert.equal(resolveIndex(tracks, shuffled, -1), 1);
    assert.equal(findPos(shuffled, 1), 2);
});

test("playlists accept both compact feed and authored track metadata", () => {
    const normalized = normalizePlaylist([
        { n: 4, t: "Compact", a: "Artist", url: "/preview.mp3", img: "/cover.webp" },
        { number: 5, title: "Full", artist: "Other", url: "https://music.apple.com/us/song/123", artwork: "/other.webp" },
        { url: "" },
    ]);
    assert.equal(normalized.length, 2);
    assert.deepEqual(normalized.map(({ n, type }) => [n, type]), [[4, "local"], [5, "apple"]]);
    assert.equal(normalized[1].img, "/other.webp");
});

test("Apple lookups use song IDs, preserve curated artwork, and expose unavailable previews", async (t) => {
    const calls = [];
    t.mock.method(globalThis, "fetch", async (url, options) => {
        calls.push({ url, options });
        return Response.json({ results: [{ previewUrl: "https://example.com/preview.m4a", trackName: "Resolved", artistName: "Artist", artworkUrl100: "https://example.com/100x100.jpg" }] });
    });
    const controller = new AbortController();
    const resolved = await providers.apple.resolve({ type: "apple", url: "https://music.apple.com/us/album/456?i=123", artwork: "/curated.webp" }, controller.signal);
    assert.equal(calls[0].url, "https://itunes.apple.com/lookup?id=123");
    assert.equal(calls[0].options.signal, controller.signal);
    assert.equal(resolved.url, "https://example.com/preview.m4a");
    assert.equal(resolved.artwork, "/curated.webp");
    await providers.apple.resolve({ type: "apple", url: "https://music.apple.com/us/song/789" });
    assert.equal(calls[1].url, "https://itunes.apple.com/lookup?id=789");
    await assert.rejects(providers.apple.resolve({ type: "apple", url: "https://music.apple.com/no-id" }), /Invalid Apple Music ID/);
    globalThis.fetch.mock.mockImplementation(async () => Response.json({ results: [] }));
    await assert.rejects(providers.apple.resolve({ type: "apple", url: "https://music.apple.com/us/song/123" }), /preview unavailable/);
});

test("direct audio keeps its URL and authored metadata", async () => {
    assert.deepEqual(await providers.local.resolve({ type: "local", url: "/song.mp3", title: "Song", artist: "Artist" }), {
        url: "/song.mp3", title: "Song", artist: "Artist", artwork: undefined,
    });
});
