import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const projects = defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
    schema: z.object({
        title: z.string(),
        description: z.string().optional(),
        pubDate: z.coerce.date(),
        stack: z.array(z.string()).default([]),
        type: z.enum(['Product', 'Lib', 'Art', 'Research', 'Experiment', 'Other']).optional(),
        category: z.string().default('Other'),
        status: z.enum(['active', 'paused', 'archived', 'research', 'prototype']).default('active'),
        featured: z.boolean().default(false),
        pinned: z.boolean().default(false),
        url: z.string().optional(),
        githubRepo: z.string().optional(),
        githubReadme: z.boolean().default(false),
        image: z.union([
            z.string(),
            z.object({
                url: z.string(),
                alt: z.string().optional()
            })
        ]).optional(),
    }),
});

const projectReadmes = defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/project-readmes' }),
    schema: z.object({
        project: z.string(),
        repo: z.string(),
        sourceUrl: z.url(),
        syncedAt: z.coerce.date(),
    }),
});

const log = defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/log' }),
    schema: z.object({
        title: z.string(),
        pubDate: z.coerce.date(),
        tags: z.array(z.string()).default([]),
        description: z.string().optional(),
    }),
});

const wiki = defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/wiki' }),
    schema: z.object({
        title: z.string(),
        kind: z.enum(['Concept', 'Method', 'Model', 'Essay', 'Reference']).default('Concept'),
        pubDate: z.coerce.date().optional(),
        updatedDate: z.coerce.date().optional(),
        parents: z.array(z.string()).optional(),
        related: z.array(z.string()).optional(),
        tags: z.array(z.string()).default([]),
    }),
});

const audioshow = defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/audioshow' }),
    schema: z.object({
        title: z.string(),
        episode: z.number().or(z.string()),
        description: z.string().optional(),
        pubDate: z.coerce.date(),
        audioUrl: z.string().optional(),
        appleMusicEmbedUrl: z.string().optional(),
        audioPreviewUrl: z.string().optional(),
        localAudioUrl: z.string().optional(),
        coverImage: z.string().optional(),
        coverAlt: z.string().optional(),
        // Batch files author cover art as `image: { url, alt }` (or a bare
        // string); kept in the schema so it survives to the page for og:image.
        image: z.union([
            z.string(),
            z.object({
                url: z.string(),
                alt: z.string().optional(),
            }),
        ]).optional(),
        lyricExcerpt: z.string().optional(),
        projectLinks: z.array(z.object({
            label: z.string(),
            url: z.string(),
        })).default([]),
        duration: z.string().optional(),
        featured: z.boolean().default(false),
        tags: z.array(z.string()).default([]),
    }),
});

const gallery = defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/gallery' }),
    // `image()` turns the frontmatter path into an optimizable ImageMetadata so
    // the gallery can emit responsive, width-constrained, modern-format output
    // instead of shipping the full-resolution originals.
    schema: ({ image }) => z.object({
        title: z.string(),
        image: image(),
        images: z.array(image()).optional(),
        date: z.coerce.date(),
        location: z.string().optional(),
        camera: z.string().optional(),
        lens: z.string().optional(),
        filmStock: z.string().optional(),
        iso: z.number().optional(),
        focalLength: z.string().optional(),
        aperture: z.string().optional(),
        shutterSpeed: z.string().optional(),
        category: z.string().default('Other'),
        featured: z.boolean().default(false),
    }),
});

export const collections = {
    projects,
    projectReadmes,
    log,
    wiki,
    audioshow,
    gallery,
};
