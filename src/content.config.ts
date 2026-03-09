import { defineCollection, z } from 'astro:content';
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
        featured: z.boolean().default(false),
        url: z.string().optional(),
        image: z.union([
            z.string(),
            z.object({
                url: z.string(),
                alt: z.string().optional()
            })
        ]).optional(),
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
        duration: z.string().optional(),
        featured: z.boolean().default(false),
        tags: z.array(z.string()).default([]),
    }),
});

const gallery = defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/gallery' }),
    schema: z.object({
        title: z.string(),
        image: z.string(),
        date: z.coerce.date(),
        location: z.string().optional(),
        camera: z.string().optional(),
        lens: z.string().optional(),
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
    log,
    wiki,
    audioshow,
    gallery,
};
