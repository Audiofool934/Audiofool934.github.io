// @ts-nocheck
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
    var defaultPlaylist = [];
    var activePlaylist = defaultPlaylist;
    var playlistPromise = null;

    function getElements() {
        return {
            audio: document.getElementById("main-audio-element"),
            playBtn: document.getElementById("player-play-btn"),
            playIcon: document.getElementById("play-icon"),
            artBtn: document.getElementById("player-art-btn"),
            seekContainer: document.getElementById("player-seek-container"),
            progressBar: document.getElementById("player-progress-bar"),
            currTimeEl: document.getElementById("player-current-time"),
            durationEl: document.getElementById("player-duration"),
            trackNameEl: document.getElementById("player-track-name"),
            artistNameEl: document.getElementById("player-artist-name"),
            artImg: document.getElementById("player-art-img"),
            artPlaceholder: document.getElementById("player-art-placeholder"),
            prevBtn: document.getElementById("player-prev-btn"),
            nextBtn: document.getElementById("player-next-btn"),
            shuffleBtn: document.getElementById("player-shuffle-btn"),
            playBtnMobile: document.getElementById("player-play-btn-mobile"),
            playIconMobile: document.getElementById("play-icon-mobile"),
            progressBarMobile: document.getElementById(
                "player-progress-bar-mobile",
            ),
            trackNameMobile: document.getElementById("player-track-name-mobile"),
            artistNameMobile: document.getElementById(
                "player-artist-name-mobile",
            ),
            artImgMobile: document.getElementById("player-art-img-mobile"),
            artPlaceholderMobile: document.getElementById(
                "player-art-placeholder-mobile",
            ),
            prevBtnMobile: document.getElementById("player-prev-btn-mobile"),
            nextBtnMobile: document.getElementById("player-next-btn-mobile"),
            shuffleBtnMobile: document.getElementById(
                "player-shuffle-btn-mobile",
            ),
        };
    }

    function normalizePlaylist(items) {
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
            .filter(Boolean);
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
                return defaultPlaylist;
            });

        return playlistPromise;
    }

    function getActivePlaylist() {
        return activePlaylist && activePlaylist.length
            ? activePlaylist
            : defaultPlaylist;
    }

    function findPlaylistIndexByUrl(list, url) {
        for (var i = 0; i < list.length; i++) {
            if (list[i].url === url) return i;
        }
        return -1;
    }

    function setActivePlaylist(items, options) {
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

    function generateShuffledOrder(length) {
        var order = [];
        for (var i = 0; i < length; i++) order.push(i);
        for (var j = length - 1; j > 0; j--) {
            var swapIndex = Math.floor(Math.random() * (j + 1));
            var tmp = order[j];
            order[j] = order[swapIndex];
            order[swapIndex] = tmp;
        }
        return order;
    }

    function getPlaylistTrack(index) {
        var ep = getActivePlaylist()[index];
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

    function resolveIndex(state, offset) {
        var len = getActivePlaylist().length;
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

    function findPos(state, plIdx) {
        if (state.shuffleMode && state.shuffledOrder) {
            for (var i = 0; i < state.shuffledOrder.length; i++) {
                if (state.shuffledOrder[i] === plIdx) return i;
            }
        }
        return plIdx;
    }

    function setText(el, value) {
        if (el) el.textContent = value;
    }

    function setArtwork(img, placeholder, url) {
        if (!img || !placeholder) return;
        if (url) {
            if (img.getAttribute("src") !== url) img.src = url;
            img.style.opacity = "1";
            placeholder.style.opacity = "0";
        } else {
            img.removeAttribute("src");
            img.style.opacity = "0";
            placeholder.style.opacity = "1";
        }
    }

    function syncUIWithState() {
        var state = window.__audioPlayerState;
        if (!state) return;

        var els = getElements();
        if (!els.audio) return;

        var track = state.track;
        var isPlaying = !!state.isPlaying;
        var shuffleOn = !!state.shuffleMode;
        var title = track?.title || "Select a track...";
        var artist = track?.artist || "AudioShow";
        var playLabel = isPlaying ? "Pause" : "Play";
        var hasTrack = !!track?.url;

        setText(els.trackNameEl, title);
        setText(els.artistNameEl, artist);
        setText(els.trackNameMobile, title);
        setText(els.artistNameMobile, artist);
        setArtwork(els.artImg, els.artPlaceholder, track?.artwork);
        setArtwork(
            els.artImgMobile,
            els.artPlaceholderMobile,
            track?.artwork,
        );

        if (els.playBtn) {
            els.playBtn.disabled = !hasTrack;
            els.playBtn.setAttribute("aria-label", playLabel);
        }
        if (els.playIcon) els.playIcon.textContent = isPlaying ? "II" : "▶";
        if (els.playBtnMobile) {
            els.playBtnMobile.disabled = !hasTrack;
            els.playBtnMobile.setAttribute("aria-label", playLabel);
        }
        if (els.playIconMobile) {
            els.playIconMobile.textContent = isPlaying ? "II" : "▶";
        }
        if (els.artBtn) {
            els.artBtn.disabled = !hasTrack;
            els.artBtn.setAttribute(
                "aria-label",
                hasTrack ? playLabel + " " + title : "No track selected",
            );
        }

        if (els.shuffleBtn) {
            els.shuffleBtn.style.color = shuffleOn ? "var(--text-main)" : "";
            els.shuffleBtn.style.opacity = shuffleOn ? "1" : "";
            els.shuffleBtn.setAttribute(
                "aria-pressed",
                shuffleOn ? "true" : "false",
            );
        }
        if (els.shuffleBtnMobile) {
            els.shuffleBtnMobile.style.color = shuffleOn
                ? "var(--text-main)"
                : "";
            els.shuffleBtnMobile.style.opacity = shuffleOn ? "1" : "";
            els.shuffleBtnMobile.setAttribute(
                "aria-pressed",
                shuffleOn ? "true" : "false",
            );
        }
    }

    var providers = {
        apple: {
            name: "Apple Music",
            async resolve(track) {
                var trackId = track.id;
                if (!trackId && track.url) {
                    var match = track.url.match(/[?&]i=(\d+)/);
                    trackId = match ? match[1] : null;
                }
                if (!trackId) throw new Error("Invalid Apple Music ID");

                var resp = await fetch(
                    "https://itunes.apple.com/lookup?id=" + trackId,
                );
                if (!resp.ok) {
                    throw new Error("iTunes API error: " + resp.status);
                }

                var data = await resp.json();
                if (data.resultCount > 0) {
                    var info = data.results[0];
                    return {
                        url: info.previewUrl,
                        title: info.trackName,
                        artist: info.artistName,
                        artwork:
                            track.artwork ||
                            info.artworkUrl100?.replace("100x100", "300x300"),
                    };
                }
                throw new Error("Track not found");
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

    function formatTime(seconds) {
        if (!seconds || isNaN(seconds)) return "0:00";
        var mins = Math.floor(seconds / 60);
        var secs = Math.floor(seconds % 60);
        return mins + ":" + secs.toString().padStart(2, "0");
    }

    function ensureState() {
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
            var first = getPlaylistTrack(initialIndex);
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

    function playIndex(plIdx) {
        var state = ensureState();
        var track = getPlaylistTrack(plIdx);
        if (!track) return;
        state.playlistIndex = plIdx;
        state.playlistPos = findPos(state, plIdx);
        window.playTrack(track);
    }

    async function loadCurrentTrackIntoAudio(audio, state) {
        if (!state.track?.url) return false;
        if (state.track.type === "local") {
            audio.src = state.track.url;
            return true;
        }

        var provider = providers[state.track.type];
        if (!provider) {
            audio.src = state.track.url;
            return true;
        }

        var meta = await provider.resolve(state.track);
        state.track = Object.assign({}, meta, { type: state.track.type });
        syncUIWithState();
        audio.src = meta.url;
        return true;
    }

    function bindControls() {
        var state = ensureState();
        var els = getElements();
        if (!els.audio) return;

        async function handlePlayPause() {
            var audio = els.audio;
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
                    console.error("Playback failed:", error);
                }
            } else {
                audio.pause();
            }
        }

        function handleNext() {
            var nextIdx = resolveIndex(state, 1);
            if (nextIdx >= 0) playIndex(nextIdx);
        }

        function handlePrev() {
            if (els.audio.currentTime > 3) {
                els.audio.currentTime = 0;
                return;
            }
            var prevIdx = resolveIndex(state, -1);
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

        if (els.playBtn) els.playBtn.onclick = handlePlayPause;
        if (els.playBtnMobile) els.playBtnMobile.onclick = handlePlayPause;
        if (els.artBtn) els.artBtn.onclick = handlePlayPause;
        if (els.prevBtn) els.prevBtn.onclick = handlePrev;
        if (els.nextBtn) els.nextBtn.onclick = handleNext;
        if (els.prevBtnMobile) els.prevBtnMobile.onclick = handlePrev;
        if (els.nextBtnMobile) els.nextBtnMobile.onclick = handleNext;
        if (els.shuffleBtn) els.shuffleBtn.onclick = handleShuffleToggle;
        if (els.shuffleBtnMobile) {
            els.shuffleBtnMobile.onclick = handleShuffleToggle;
        }

        els.audio.onplay = function () {
            state.isPlaying = true;
            syncUIWithState();
        };
        els.audio.onpause = function () {
            state.isPlaying = false;
            syncUIWithState();
        };
        els.audio.ontimeupdate = function () {
            state.currentTime = els.audio.currentTime;
            var dur = els.audio.duration;
            var percent =
                dur > 0 && isFinite(dur) ? (els.audio.currentTime / dur) * 100 : 0;
            if (els.progressBar) els.progressBar.style.width = percent + "%";
            if (els.progressBarMobile) {
                els.progressBarMobile.style.width = percent + "%";
            }
            if (els.seekContainer) {
                els.seekContainer.setAttribute(
                    "aria-valuenow",
                    String(Math.round(percent)),
                );
                els.seekContainer.setAttribute(
                    "aria-valuetext",
                    formatTime(els.audio.currentTime) +
                        (dur > 0 && isFinite(dur)
                            ? " of " + formatTime(dur)
                            : ""),
                );
            }
            setText(els.currTimeEl, formatTime(els.audio.currentTime));
        };
        els.audio.onloadedmetadata = function () {
            setText(els.durationEl, formatTime(els.audio.duration));
        };
        els.audio.onended = handleNext;
        els.audio.onerror = function () {
            state.isPlaying = false;
            if (state.track) {
                state.track = {
                    title:
                        state.track.title && state.track.title !== "Loading..."
                            ? state.track.title
                            : "Playback error",
                    artist: "Source unavailable",
                    artwork: state.track.artwork,
                };
            }
            syncUIWithState();
        };

        if (els.seekContainer) {
            els.seekContainer.onclick = function (event) {
                var dur = els.audio.duration;
                if (!dur || !isFinite(dur)) return;
                var rect = els.seekContainer.getBoundingClientRect();
                var pos = (event.clientX - rect.left) / rect.width;
                els.audio.currentTime = Math.max(0, Math.min(1, pos)) * dur;
            };
            els.seekContainer.onkeydown = function (event) {
                var dur = els.audio.duration;
                if (!dur || !isFinite(dur)) return;
                var time = els.audio.currentTime;
                var step = 5;
                switch (event.key) {
                    case "ArrowRight":
                    case "ArrowUp":
                        time = Math.min(dur, time + step);
                        break;
                    case "ArrowLeft":
                    case "ArrowDown":
                        time = Math.max(0, time - step);
                        break;
                    case "Home":
                        time = 0;
                        break;
                    case "End":
                        time = dur;
                        break;
                    default:
                        return;
                }
                event.preventDefault();
                els.audio.currentTime = time;
            };
        }

        var audioHasNoSrc =
            !els.audio.src ||
            els.audio.src === "" ||
            els.audio.src === window.location.href;
        if (state.isPlaying && audioHasNoSrc && state.track?.url) {
            loadCurrentTrackIntoAudio(els.audio, state)
                .then(function (didLoad) {
                    if (!didLoad) return;
                    els.audio.currentTime = state.currentTime || 0;
                    els.audio.play().catch(function () {});
                })
                .catch(function (error) {
                    console.error("Playback restore failed:", error);
                });
        }
    }

    window.playTrack = async function (track) {
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
            url: track.url,
            type: track.type,
        };
        state.currentTime = 0;
        syncUIWithState();

        var els = getElements();
        if (!els.audio) return;

        try {
            var meta = await provider.resolve(track);
            state.track = Object.assign({}, meta, {
                type: track.type,
                url: meta.url,
            });
            syncUIWithState();
            els.audio.src = meta.url;
            els.audio
                .play()
                .catch(function (error) {
                    console.error("Playback failed:", error);
                });
        } catch (error) {
            console.error("Provider error:", error);
            state.track = {
                title: track.title || "Error",
                artist: "Playback failed",
                artwork: track.artwork,
            };
            syncUIWithState();
        }
    };

    window.toggleMusic = function (_playerType, url, event) {
        var clickedImg = event?.currentTarget || event?.target || null;
        var title = clickedImg?.getAttribute?.("alt") || "";
        var artwork = clickedImg?.getAttribute?.("src") || "";
        var type = url.includes("music.apple.com") ? "apple" : "local";
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
