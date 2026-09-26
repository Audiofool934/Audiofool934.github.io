import type { AudioPlayerState, AudioPlaylistItem, AudioTrack, NormalizedAudioTrack } from "./audio/types";
import { normalizePlaylist, findPlaylistIndexByUrl, generateShuffledOrder, getPlaylistTrack, resolveIndex, findPos } from "./audio/playlist";
import { desktopArtwork, preloadNeighborArtwork } from "./audio/artwork";
import { getElements, bindPlayerControls, renderPlayer } from "./audio/view";
import { providers } from "./audio/providers";

// Persistent AudioShow player. The module is bundled once by Astro; playlist
// data is fetched separately so every page does not inline the full queue.
(function () {
    if (window.__audioPlayerModuleLoaded) {
        window.__audioPlayerInit?.();
        return;
    }
    window.__audioPlayerModuleLoaded = true;

    var playlistUrl =
        window.__audioPlayerConfig?.playlistUrl || "/audioshow/playlist.json";
    var defaultPlaylist: NormalizedAudioTrack[] = [];
    var activePlaylist: NormalizedAudioTrack[] = defaultPlaylist;
    var playlistPromise: Promise<NormalizedAudioTrack[]> | null = null;
    let playbackRequest = 0;
    let providerRequest: AbortController | null = null;
    // One listener survives route changes; DOM bindings below are replaced.
    desktopArtwork.addEventListener("change", syncUIWithState);

    function syncUIWithState() {
        const state = window.__audioPlayerState;
        if (!state) return;
        renderPlayer(state);
        preloadNeighborArtwork(state, getActivePlaylist());
    }

    function fetchDefaultPlaylist() {
        if (defaultPlaylist.length) return Promise.resolve(defaultPlaylist);
        if (playlistPromise) return playlistPromise;

        playlistPromise = fetch(playlistUrl)
            .then(function (resp) {
                if (!resp.ok) {
                    throw new Error("Playlist fetch failed: " + resp.status);
                }
                return resp.json();
            })
            .then(function (payload) {
                defaultPlaylist = normalizePlaylist(
                    payload.tracks || payload.playlist || payload,
                );
                if (!activePlaylist.length) activePlaylist = defaultPlaylist;
                return defaultPlaylist;
            })
            .catch(function (error) {
                console.error("AudioShow playlist unavailable:", error);
                defaultPlaylist = [];
                if (!activePlaylist.length) activePlaylist = defaultPlaylist;
                playlistPromise = null;
                return defaultPlaylist;
            });

        return playlistPromise;
    }

    function getActivePlaylist() {
        return activePlaylist && activePlaylist.length
            ? activePlaylist
            : defaultPlaylist;
    }

    function setActivePlaylist(items: AudioPlaylistItem[], options?: { currentIndex?: number; currentUrl?: string }) {
        var normalized = normalizePlaylist(items);
        activePlaylist = normalized.length ? normalized : defaultPlaylist;

        var state = window.__audioPlayerState;
        if (!state) return;

        var currentIndex =
            options && typeof options.currentIndex === "number"
                ? options.currentIndex
                : -1;
        if (currentIndex < 0 && options && options.currentUrl) {
            currentIndex = findPlaylistIndexByUrl(
                activePlaylist,
                options.currentUrl,
            );
        }

        if (currentIndex >= 0 && currentIndex < activePlaylist.length) {
            state.playlistIndex = currentIndex;
            state.playlistPos = findPos(state, currentIndex);
        } else if (state.playlistIndex >= activePlaylist.length) {
            state.playlistIndex = 0;
            state.playlistPos = 0;
        }

        if (state.shuffleMode) {
            state.shuffledOrder = generateShuffledOrder(activePlaylist.length);
            if (state.playlistIndex >= 0) {
                var currentInShuffle = state.shuffledOrder.indexOf(
                    state.playlistIndex,
                );
                if (currentInShuffle > 0) {
                    var tmp = state.shuffledOrder[0];
                    state.shuffledOrder[0] =
                        state.shuffledOrder[currentInShuffle];
                    state.shuffledOrder[currentInShuffle] = tmp;
                }
                state.playlistPos = findPos(state, state.playlistIndex);
            }
        }
    }

    window.setAudioPlaylist = function (items, options) {
        setActivePlaylist(items, options || {});
        syncUIWithState();
    };

    function reportPlaybackFailure(error: unknown) {
        if (error instanceof DOMException && error.name === "NotAllowedError") {
            return;
        }
        console.error("Playback failed:", error);
    }

    function ensureState(): AudioPlayerState {
        if (!window.__audioPlayerState) {
            window.__audioPlayerState = {
                initialized: false,
                track: null,
                isPlaying: false,
                currentTime: 0,
                playlistIndex: 0,
                playlistPos: 0,
                shuffleMode: false,
                shuffledOrder: null,
            };
        }
        return window.__audioPlayerState;
    }

    function seedInitialTrack() {
        var state = ensureState();
        if (state.initialized) return;

        var list = getActivePlaylist();
        if (!state.track && list.length > 0) {
            var initialIndex = Math.floor(Math.random() * list.length);
            var first = getPlaylistTrack(getActivePlaylist(), initialIndex);
            if (first) {
                state.track = {
                    title: first.title,
                    artist: first.artist,
                    artwork: first.artwork,
                    url: first.url,
                    type: first.type,
                };
                state.playlistIndex = initialIndex;
                state.playlistPos = initialIndex;
            }
        } else if (!state.track && window.__defaultAudioShowTrack) {
            state.track = {
                title: window.__defaultAudioShowTrack.title,
                artist: window.__defaultAudioShowTrack.artist,
                artwork: window.__defaultAudioShowTrack.artwork,
                url: window.__defaultAudioShowTrack.url,
                type: window.__defaultAudioShowTrack.type,
            };
        }

        state.initialized = true;
        syncUIWithState();
    }

    function playIndex(plIdx: number) {
        var state = ensureState();
        var track = getPlaylistTrack(getActivePlaylist(), plIdx);
        if (!track) return;
        state.playlistIndex = plIdx;
        state.playlistPos = findPos(state, plIdx);
        window.playTrack(track);
    }

    async function loadCurrentTrackIntoAudio(audio: HTMLAudioElement, state: AudioPlayerState) {
        const track = state.track;
        if (!track?.url) return false;
        const request = ++playbackRequest;
        providerRequest?.abort();
        const controller = new AbortController();
        providerRequest = controller;
        try {
            const meta = await providers[track.type].resolve(track, controller.signal);
            if (request !== playbackRequest) return false;
            // Keep the authored URL as the track identity; only the media element
            // receives a provider's resolved preview URL.
            state.track = { ...track, ...meta, type: track.type, url: track.url };
            syncUIWithState();
            audio.src = meta.url;
            return true;
        } catch (error) {
            if (request !== playbackRequest || controller.signal.aborted) return false;
            throw error;
        } finally {
            if (providerRequest === controller) providerRequest = null;
        }
    }

    function bindControls() {
        var state = ensureState();
        var els = getElements();
        if (!els.audio) return;
        const audio = els.audio;

        async function handlePlayPause() {
            var noSource =
                !audio.src ||
                audio.src === "" ||
                audio.src === window.location.href;

            if (noSource) {
                try {
                    var didLoad = await loadCurrentTrackIntoAudio(audio, state);
                    if (!didLoad) return;
                    if (state.currentTime > 0) {
                        audio.currentTime = state.currentTime;
                    }
                } catch (error) {
                    console.error("Provider error:", error);
                    return;
                }
            }

            if (audio.paused) {
                try {
                    await audio.play();
                } catch (error) {
                    reportPlaybackFailure(error);
                }
            } else {
                audio.pause();
            }
        }

        function handleNext() {
            var nextIdx = resolveIndex(getActivePlaylist(), state, 1);
            if (nextIdx >= 0) playIndex(nextIdx);
        }

        function handlePrev() {
            if (audio.currentTime > 3) {
                audio.currentTime = 0;
                return;
            }
            var prevIdx = resolveIndex(getActivePlaylist(), state, -1);
            if (prevIdx >= 0) playIndex(prevIdx);
        }

        function handleShuffleToggle() {
            state.shuffleMode = !state.shuffleMode;
            if (state.shuffleMode) {
                state.shuffledOrder = generateShuffledOrder(
                    getActivePlaylist().length,
                );
                if (state.playlistIndex >= 0) {
                    var currentInShuffle = state.shuffledOrder.indexOf(
                        state.playlistIndex,
                    );
                    if (currentInShuffle > 0) {
                        var tmp = state.shuffledOrder[0];
                        state.shuffledOrder[0] =
                            state.shuffledOrder[currentInShuffle];
                        state.shuffledOrder[currentInShuffle] = tmp;
                    }
                    state.playlistPos = 0;
                }
            } else {
                state.shuffledOrder = null;
                state.playlistPos = state.playlistIndex;
            }
            syncUIWithState();
        }

        bindPlayerControls(els, state, {
            playPause: handlePlayPause,
            next: handleNext,
            previous: handlePrev,
            shuffle: handleShuffleToggle,
            render: syncUIWithState,
        });

        var audioHasNoSrc =
            !audio.src ||
            audio.src === "" ||
            audio.src === window.location.href;
        if (state.isPlaying && audioHasNoSrc && state.track?.url) {
            loadCurrentTrackIntoAudio(audio, state)
                .then(function (didLoad) {
                    if (!didLoad) return;
                    audio.currentTime = state.currentTime || 0;
                    audio.play().catch(function () {});
                })
                .catch(function (error) {
                    console.error("Playback restore failed:", error);
                });
        }
    }

    window.playTrack = async function (track: AudioTrack) {
        if (!track || !track.type || !track.url) {
            console.error("Invalid track object", track);
            return;
        }

        var state = ensureState();
        var provider = providers[track.type];
        if (!provider) {
            console.error("Unknown provider:", track.type);
            return;
        }

        if (Array.isArray(track._playlist)) {
            setActivePlaylist(track._playlist, {
                currentIndex: track._plIdx,
                currentUrl: track.url,
            });
        }

        if (typeof track._plIdx === "number") {
            state.playlistIndex = track._plIdx;
            state.playlistPos = findPos(state, track._plIdx);
        } else {
            var matched = findPlaylistIndexByUrl(getActivePlaylist(), track.url);
            if (matched < 0 && getActivePlaylist() !== defaultPlaylist) {
                matched = findPlaylistIndexByUrl(defaultPlaylist, track.url);
                if (matched >= 0) {
                    setActivePlaylist(defaultPlaylist, {
                        currentIndex: matched,
                        currentUrl: track.url,
                    });
                }
            }
            if (matched >= 0) {
                state.playlistIndex = matched;
                state.playlistPos = findPos(state, matched);
            } else {
                state.playlistIndex = -1;
                state.playlistPos = -1;
            }
        }

        state.track = {
            title: track.title || "Loading...",
            artist: track.artist || provider.name,
            artwork: track.artwork,
            id: track.id,
            url: track.url,
            type: track.type,
        };
        state.currentTime = 0;
        syncUIWithState();

        var els = getElements();
        if (!els.audio) return;
        els.audio.pause();
        els.audio.removeAttribute("src");

        try {
            if (await loadCurrentTrackIntoAudio(els.audio, state)) {
                await els.audio.play().catch(reportPlaybackFailure);
            }
        } catch (error) {
            console.error("Provider error:", error);
            state.track = {
                type: track.type,
                id: track.id,
                url: track.url,
                title: track.title || "Error",
                artist: "Playback failed",
                artwork: track.artwork,
            };
            syncUIWithState();
        }
    };

    window.toggleMusic = function (_playerType, url, event) {
        const target = event?.currentTarget || event?.target;
        const clickedImg = target instanceof Element ? target : null;
        const title = clickedImg?.getAttribute("alt") || "";
        const artwork = clickedImg?.getAttribute("src") || "";
        const type = url.includes("music.apple.com") ? "apple" : "local";
        window.playTrack({
            type: type,
            url: url,
            title: title,
            artwork: artwork,
        });
    };

    async function initPlayer() {
        ensureState();
        bindControls();
        syncUIWithState();
        await fetchDefaultPlaylist();
        seedInitialTrack();
    }

    window.__audioPlayerInit = initPlayer;
    document.addEventListener("astro:page-load", initPlayer);

    if (document.readyState !== "loading") {
        initPlayer();
    }
})();
