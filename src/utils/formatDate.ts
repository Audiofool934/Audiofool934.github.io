/**
 * Format date as "2025.12.20" (compact dot-separated)
 */
export function formatDateCompact(date: Date): string {
    return date.toISOString().split("T")[0].replace(/-/g, ".");
}

/**
 * Format date as "December 20, 2025" (en-US long form)
 */
export function formatDateLong(date: Date): string {
    // Anchor to UTC so this matches formatDateCompact (which uses toISOString)
    // regardless of the build host's timezone — otherwise the same date can
    // render as two different calendar days across pages.
    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "UTC",
    });
}
