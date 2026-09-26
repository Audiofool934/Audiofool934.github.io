import type { AudioPlayerState } from "./types";
import { desktopArtwork, playerArtworkUrl, setArtwork } from "./artwork";

export function getElements() {
    return {
        audio: document.querySelector<HTMLAudioElement>("#main-audio-element"),
        playBtn: document.querySelector<HTMLButtonElement>("#player-play-btn"),
        playIcon: document.querySelector<HTMLElement>("#play-icon"),
        artBtn: document.querySelector<HTMLButtonElement>("#player-art-btn"),
        seekContainer: document.querySelector<HTMLElement>("#player-seek-container"),
        progressBar: document.querySelector<HTMLElement>("#player-progress-bar"),
        currTimeEl: document.querySelector<HTMLElement>("#player-current-time"),
        durationEl: document.querySelector<HTMLElement>("#player-duration"),
        trackNameEl: document.querySelector<HTMLElement>("#player-track-name"),
        artistNameEl: document.querySelector<HTMLElement>("#player-artist-name"),
        artImg: document.querySelector<HTMLImageElement>("#player-art-img"),
        artPlaceholder: document.querySelector<HTMLElement>("#player-art-placeholder"),
        prevBtn: document.querySelector<HTMLButtonElement>("#player-prev-btn"),
        nextBtn: document.querySelector<HTMLButtonElement>("#player-next-btn"),
        shuffleBtn: document.querySelector<HTMLButtonElement>("#player-shuffle-btn"),
        playBtnMobile: document.querySelector<HTMLButtonElement>("#player-play-btn-mobile"),
        playIconMobile: document.querySelector<HTMLElement>("#play-icon-mobile"),
        progressBarMobile: document.querySelector<HTMLElement>("#player-progress-bar-mobile"),
        trackNameMobile: document.querySelector<HTMLElement>("#player-track-name-mobile"),
        artistNameMobile: document.querySelector<HTMLElement>("#player-artist-name-mobile"),
        artImgMobile: document.querySelector<HTMLImageElement>("#player-art-img-mobile"),
        artPlaceholderMobile: document.querySelector<HTMLElement>("#player-art-placeholder-mobile"),
        prevBtnMobile: document.querySelector<HTMLButtonElement>("#player-prev-btn-mobile"),
        nextBtnMobile: document.querySelector<HTMLButtonElement>("#player-next-btn-mobile"),
        shuffleBtnMobile: document.querySelector<HTMLButtonElement>("#player-shuffle-btn-mobile"),
    };
}

export function setText(el: HTMLElement | null, value: string) {
    if (el) el.textContent = value;
}

export function renderPlayer(state: AudioPlayerState) {
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
    var artwork = playerArtworkUrl(track?.artwork);
    setArtwork(els.artImg, els.artPlaceholder, desktopArtwork.matches ? artwork : "");
    setArtwork(
        els.artImgMobile,
        els.artPlaceholderMobile,
        desktopArtwork.matches ? "" : artwork,
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

export function formatTime(seconds: number) {
    if (!seconds || isNaN(seconds)) return "0:00";
    var mins = Math.floor(seconds / 60);
    var secs = Math.floor(seconds % 60);
    return mins + ":" + secs.toString().padStart(2, "0");
}

interface PlayerActions {
    playPause: () => Promise<void>;
    next: () => void;
    previous: () => void;
    shuffle: () => void;
    render: () => void;
}

export function bindPlayerControls(els: ReturnType<typeof getElements>, state: AudioPlayerState, actions: PlayerActions) {
    const audio = els.audio;
    if (!audio) return;
    if (els.playBtn) els.playBtn.onclick = actions.playPause;
    if (els.playBtnMobile) els.playBtnMobile.onclick = actions.playPause;
    if (els.artBtn) els.artBtn.onclick = actions.playPause;
    if (els.prevBtn) els.prevBtn.onclick = actions.previous;
    if (els.nextBtn) els.nextBtn.onclick = actions.next;
    if (els.prevBtnMobile) els.prevBtnMobile.onclick = actions.previous;
    if (els.nextBtnMobile) els.nextBtnMobile.onclick = actions.next;
    if (els.shuffleBtn) els.shuffleBtn.onclick = actions.shuffle;
    if (els.shuffleBtnMobile) {
        els.shuffleBtnMobile.onclick = actions.shuffle;
    }

    audio.onplay = function () {
        state.isPlaying = true;
        actions.render();
    };
    audio.onpause = function () {
        state.isPlaying = false;
        actions.render();
    };
    audio.ontimeupdate = function () {
        state.currentTime = audio.currentTime;
        var dur = audio.duration;
        var percent =
            dur > 0 && isFinite(dur) ? (audio.currentTime / dur) * 100 : 0;
        if (els.progressBar) els.progressBar.style.width = percent + "%";
        if (els.progressBarMobile) {
            els.progressBarMobile.style.width = percent + "%";
        }
        const seekContainer = els.seekContainer;
        if (seekContainer) {
            seekContainer.setAttribute(
                "aria-valuenow",
                String(Math.round(percent)),
            );
            seekContainer.setAttribute(
                "aria-valuetext",
                formatTime(audio.currentTime) +
                    (dur > 0 && isFinite(dur)
                        ? " of " + formatTime(dur)
                        : ""),
            );
        }
        setText(els.currTimeEl, formatTime(audio.currentTime));
    };
    audio.onloadedmetadata = function () {
        setText(els.durationEl, formatTime(audio.duration));
    };
    audio.onended = actions.next;
    audio.onerror = function () {
        audio.removeAttribute("src");
        state.isPlaying = false;
        if (state.track) {
            state.track = {
                ...state.track,
                title:
                    state.track.title && state.track.title !== "Loading..."
                        ? state.track.title
                        : "Playback error",
                artist: "Source unavailable",
                artwork: state.track.artwork,
            };
        }
        actions.render();
    };

    const seekContainer = els.seekContainer;
    if (seekContainer) {
        seekContainer.onclick = function (event) {
            var dur = audio.duration;
            if (!dur || !isFinite(dur)) return;
            var rect = seekContainer.getBoundingClientRect();
            var pos = (event.clientX - rect.left) / rect.width;
            audio.currentTime = Math.max(0, Math.min(1, pos)) * dur;
        };
        seekContainer.onkeydown = function (event) {
            var dur = audio.duration;
            if (!dur || !isFinite(dur)) return;
            var time = audio.currentTime;
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
            audio.currentTime = time;
        };
    }

}
