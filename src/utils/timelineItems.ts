import type { CollectionEntry } from "astro:content";
import { getCollection } from "astro:content";
import { getPostType } from "./postType";

export type TimelineItemKind = "log" | "project" | "note" | "audioshow" | "gallery";

export interface TimelineItem {
    kind: TimelineItemKind;
    lane: string;
    title: string;
    date: Date;
    href: string;
    description: string;
    sourceId: string;
}

function fromLog(entry: CollectionEntry<"log">): TimelineItem {
    const lane = getPostType(entry);
    return {
        kind: "log",
        lane,
        title: entry.data.title,
        date: entry.data.pubDate,
        href: `/timeline/${entry.id}/`,
        description: entry.data.description || "",
        sourceId: entry.id,
    };
}

export async function getTimelineItems(): Promise<TimelineItem[]> {
    const [logs, projects, wiki, audioshow, gallery] = await Promise.all([
        getCollection("log"),
        getCollection("projects"),
        getCollection("wiki"),
        getCollection("audioshow"),
        getCollection("gallery"),
    ]);

    const items: TimelineItem[] = [
        ...logs.filter((entry) => entry.data.timeline).map(fromLog),
        ...projects.map((entry) => ({
            kind: "project" as const,
            lane: "project",
            title: entry.data.title,
            date: entry.data.pubDate,
            href: `/projects/${entry.id}/`,
            description: entry.data.description || "",
            sourceId: entry.id,
        })),
        ...wiki.map((entry) => ({
            kind: "note" as const,
            lane: "note",
            title: entry.data.title,
            date: entry.data.updatedDate || entry.data.pubDate || new Date("2024-01-01"),
            href: `/notes/${entry.id}/`,
            description: entry.data.tags.length ? entry.data.tags.join(" / ") : entry.data.kind,
            sourceId: entry.id,
        })),
        ...audioshow.map((entry) => ({
            kind: "audioshow" as const,
            lane: "music",
            title: entry.data.title,
            date: entry.data.pubDate,
            href: `/audioshow/${entry.id}/`,
            description: entry.data.description || `AudioShow Episode ${entry.data.episode}`,
            sourceId: entry.id,
        })),
        ...gallery.map((entry) => ({
            kind: "gallery" as const,
            lane: "photo",
            title: entry.data.title,
            date: entry.data.date,
            href: `/gallery/${entry.id}/`,
            description: [entry.data.location, entry.data.camera].filter(Boolean).join(" / "),
            sourceId: entry.id,
        })),
    ];

    return items.sort((a, b) => b.date.valueOf() - a.date.valueOf());
}
