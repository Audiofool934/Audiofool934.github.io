const AUDIO_IMAGE_PREFIX = "/images/audioshow/";
const GENERATED_PREFIX = "/images/audioshow/_generated/";
const REMOTE_IMAGE_RE = /^https?:\/\//i;

function encodePath(pathname: string) {
    return pathname
        .split("/")
        .map((segment, index) => (index === 0 ? segment : encodeURIComponent(segment).replace(/'/g, "%27")))
        .join("/");
}

export function isOptimizableAudioImage(src?: string) {
    if (!src) return false;
    return (
        src.startsWith(AUDIO_IMAGE_PREFIX) &&
        !src.startsWith(GENERATED_PREFIX) &&
        /\.(webp|png|jpe?g)$/i.test(src)
    );
}

export function audioImage(src: string | undefined, width = 320) {
    if (!src || !isOptimizableAudioImage(src)) return src;
    const extensionIndex = src.lastIndexOf(".");
    const relative = src.slice(AUDIO_IMAGE_PREFIX.length, extensionIndex);
    return encodePath(`${GENERATED_PREFIX}${relative}-${width}.webp`);
}

export function audioImageSrcset(src: string | undefined, widths = [96, 320]) {
    if (!isOptimizableAudioImage(src)) return undefined;
    return widths.map((width) => `${audioImage(src, width)} ${width}w`).join(", ");
}

export function isRemoteImage(src?: string) {
    return REMOTE_IMAGE_RE.test(src || "");
}

export function imageReferrerPolicy(src?: string) {
    return isRemoteImage(src) ? "no-referrer" : undefined;
}
