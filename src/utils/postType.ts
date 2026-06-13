import type { CollectionEntry } from "astro:content";

/**
 * Classify a log/timeline post into a coarse content type from its tags.
 * Shared by the homepage and the timeline index so the mapping can't drift.
 */
export function getPostType(post: CollectionEntry<"log">): string {
    const tags = post.data.tags.map((tag) => tag.toLowerCase());
    if (tags.includes("photography") || tags.includes("gallery")) return "photo";
    if (
        tags.includes("notes") ||
        tags.includes("note") ||
        tags.includes("essay") ||
        tags.includes("math") ||
        tags.includes("dsp")
    )
        return "note";
    if (tags.includes("audioshow") || tags.includes("music")) return "music";
    if (tags.includes("project") || tags.includes("projects")) return "project";
    if (tags.includes("update") || tags.includes("meta")) return "site";
    return "post";
}
