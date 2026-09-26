import type { AudioPlayerState, NormalizedAudioTrack } from "./types.ts";
import { resolveIndex } from "./playlist.ts";
import { GENERATED_AUDIO_IMAGE_PREFIX } from "../../utils/audioImages.mjs";

var artworkPreloadCache = new Map<string, HTMLImageElement>();
var artworkPreloadPending = new Set<string>();
var artworkPreloadOrder: string[] = [];
var artworkPreloadLimit = 48;
var artworkRenderId = 0;
export const desktopArtwork = window.matchMedia("(min-width: 768px)");

export function playerArtworkUrl(url?: string) {
    var normalizedUrl = normalizeArtworkUrl(url);
    if (!desktopArtwork.matches && normalizedUrl.startsWith(GENERATED_AUDIO_IMAGE_PREFIX)) {
        // The 48px mobile cover uses a 192px source, including on high-DPI screens.
        return normalizedUrl.replace(/-320\.webp$/, "-192.webp");
    }
    return normalizedUrl;
}

function shouldPreloadArtwork() {
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    return window.__audioPlayerState?.isPlaying
        && document.visibilityState === "visible"
        && !connection?.saveData
        && !/^(slow-)?2g$/.test(connection?.effectiveType || "");
}

function normalizeArtworkUrl(url?: string) {
    return typeof url === "string" ? url.trim() : "";
}

function forgetPreloadedArtwork(url: string) {
    artworkPreloadCache.delete(url);
    artworkPreloadPending.delete(url);
    artworkPreloadOrder = artworkPreloadOrder.filter(function (item) {
        return item !== url;
    });
}

function rememberPreloadedArtwork(url: string, image: HTMLImageElement) {
    artworkPreloadCache.set(url, image);
    artworkPreloadOrder.push(url);

    while (artworkPreloadOrder.length > artworkPreloadLimit) {
        var oldest = artworkPreloadOrder.shift();
        if (oldest && oldest !== url) {
            artworkPreloadCache.delete(oldest);
        }
    }
}

function preloadArtwork(url?: string) {
    var normalizedUrl = normalizeArtworkUrl(url);
    if (!normalizedUrl || artworkPreloadCache.has(normalizedUrl)) return;

    var image = new Image();
    image.decoding = "async";
    image.loading = "eager";
    image.fetchPriority = "low";
    rememberPreloadedArtwork(normalizedUrl, image);

    image.onerror = function () {
        forgetPreloadedArtwork(normalizedUrl);
    };
    image.src = normalizedUrl;
    image.decode?.().catch(function () {});
}

function scheduleArtworkPreload(url?: string) {
    var normalizedUrl = playerArtworkUrl(url);
    if (
        !normalizedUrl ||
        artworkPreloadCache.has(normalizedUrl) ||
        artworkPreloadPending.has(normalizedUrl)
    ) {
        return;
    }

    artworkPreloadPending.add(normalizedUrl);
    var run = function () {
        artworkPreloadPending.delete(normalizedUrl);
        if (shouldPreloadArtwork()) preloadArtwork(normalizedUrl);
    };

    if (typeof window.requestIdleCallback === "function") {
        window.requestIdleCallback(run, { timeout: 1200 });
    } else {
        window.setTimeout(run, 120);
    }
}

function preloadPlaylistArtworkAt(list: NormalizedAudioTrack[], index: number) {
    var track = list[index];
    scheduleArtworkPreload(track?.img);
}

export function preloadNeighborArtwork(state: AudioPlayerState, list: NormalizedAudioTrack[]) {
    if (!shouldPreloadArtwork()) return;
    if (!list.length) return;

    var nextIdx = resolveIndex(list, state, 1);
    if (nextIdx >= 0) preloadPlaylistArtworkAt(list, nextIdx);

    var prevIdx = resolveIndex(list, state, -1);
    if (prevIdx >= 0 && prevIdx !== nextIdx) {
        preloadPlaylistArtworkAt(list, prevIdx);
    }
}

export function setArtwork(img: HTMLImageElement | null, placeholder: HTMLElement | null, url?: string) {
    if (!img || !placeholder) return;

    var requestId = String(++artworkRenderId);
    img.dataset.artworkRequestId = requestId;

    var showImage = function () {
        if (img.dataset.artworkRequestId !== requestId) return;
        img.style.opacity = "1";
        placeholder.style.opacity = "0";
    };
    var showPlaceholder = function () {
        if (img.dataset.artworkRequestId !== requestId) return;
        img.removeAttribute("src");
        img.style.opacity = "0";
        placeholder.style.opacity = "1";
    };
    var normalizedUrl = normalizeArtworkUrl(url);

    img.onload = showImage;
    img.onerror = showPlaceholder;

    if (!normalizedUrl) {
        showPlaceholder();
        return;
    }

    if (img.getAttribute("src") !== normalizedUrl) {
        img.style.opacity = "0";
        placeholder.style.opacity = "1";
        img.src = normalizedUrl;
    }

    if (img.complete) {
        if (img.naturalWidth > 0) {
            showImage();
        } else {
            showPlaceholder();
        }
    } else {
        img.decode?.().then(showImage).catch(function () {
            if (img.complete && img.naturalWidth > 0) showImage();
        });
    }
}
