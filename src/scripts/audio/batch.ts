// Markdown provides playback data; this module owns its accessible behavior.
function initBatchArtwork() {
    document.querySelectorAll<HTMLImageElement>(".audioshow-image").forEach((image) => {
        if (image.dataset.audioBound) return;
        const legacy = image.getAttribute("onclick")?.match(/toggleMusic\([^,]+,\s*'([^']+)'\)/i);
        const url = image.dataset.audioUrl || legacy?.[1];
        if (!url) return;

        image.removeAttribute("onclick");
        image.dataset.audioBound = "true";
        image.setAttribute("role", "button");
        image.tabIndex = 0;
        const label = image.alt.replace(/^EP[_-]?\d+[_-]?/i, "").replace(/_/g, " ").trim();
        image.setAttribute("aria-label", `Play${label ? `: ${label}` : ""}`);

        const play = () => window.playTrack({
            type: url.includes("music.apple.com") ? "apple" : "local",
            url,
            title: label,
            artwork: image.currentSrc || image.src,
        });
        image.addEventListener("click", play);
        image.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                void play();
            }
        });
    });
}

document.addEventListener("astro:page-load", initBatchArtwork);
