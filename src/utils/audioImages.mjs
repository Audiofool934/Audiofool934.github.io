export const AUDIO_IMAGE_PREFIX = "/images/audioshow/";
export const GENERATED_AUDIO_IMAGE_PREFIX = `${AUDIO_IMAGE_PREFIX}_generated/`;
export const AUDIO_IMAGE_WIDTHS = Object.freeze([96, 192, 320]);

/** @param {string | undefined} src */
export function isOptimizableAudioImage(src) {
    return !!src && src.startsWith(AUDIO_IMAGE_PREFIX)
        && !src.startsWith(GENERATED_AUDIO_IMAGE_PREFIX)
        && /\.(webp|png|jpe?g)$/i.test(src);
}

/** Unescaped public path, also used by the image generator for output filenames.
 * @param {string} src
 * @param {number} width
 */
export function audioImageVariantPath(src, width) {
    if (!AUDIO_IMAGE_WIDTHS.includes(width)) throw new Error(`Unsupported artwork width: ${width}`);
    const relative = src.slice(AUDIO_IMAGE_PREFIX.length, src.lastIndexOf("."));
    return `${GENERATED_AUDIO_IMAGE_PREFIX}${relative}-${width}.webp`;
}

/** @param {string | undefined} src */
export function audioImage(src, width = 320) {
    if (!src || !isOptimizableAudioImage(src)) return src;
    return audioImageVariantPath(src, width).split("/")
        .map((segment) => encodeURIComponent(segment).replace(/'/g, "%27"))
        .join("/");
}

/** @param {string | undefined} src */
export function audioImageSrcset(src, widths = [96, 320]) {
    if (!isOptimizableAudioImage(src)) return undefined;
    return widths.map((width) => `${audioImage(src, width)} ${width}w`).join(", ");
}

/** @param {string | undefined} src */
export function isRemoteImage(src) {
    return /^https?:\/\//i.test(src || "");
}

/** @param {string | undefined} src */
export function imageReferrerPolicy(src) {
    return isRemoteImage(src) ? "no-referrer" : undefined;
}
