import { defineCollection, z } from 'astro:content';

const projects = defineCollection({
    type: 'content',
    schema: z.object({
        title: z.string(),
        description: z.string().optional(),
        pubDate: z.coerce.date(),
        stack: z.array(z.string()).default([]),
        type: z.enum(['Product', 'Lib', 'Art', 'Research', 'Experiment', 'Other']).optional(),
        category: z.string().default('Other'), // Custom category for grouping
        featured: z.boolean().default(false), // For "Latest" section
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
    type: 'content', // Stream
    schema: z.object({
        title: z.string(),
        pubDate: z.coerce.date(),
        tags: z.array(z.string()).default([]),
        description: z.string().optional(),
    }),
});

const wiki = defineCollection({
    type: 'content', // Graph
    schema: z.object({
        title: z.string(),
        updatedDate: z.coerce.date().optional(),
        parents: z.array(z.string()).optional(), // For graph structure
        related: z.array(z.string()).optional(),
        tags: z.array(z.string()).default([]),
    }),
});

const audioshow = defineCollection({
    type: 'content',
    schema: z.object({
        title: z.string(),
        episode: z.number().or(z.string()), // Handle existing string/number
        description: z.string().optional(),
        pubDate: z.coerce.date(),
        audioUrl: z.string().optional(), // For the player
        duration: z.string().optional(),
        featured: z.boolean().default(false),
        tags: z.array(z.string()).default([]),
    }),
});

const gallery = defineCollection({
    type: 'content',
    schema: z.object({
        title: z.string(),
        image: z.string(),
        date: z.coerce.date(),
        location: z.string().optional(),
        camera: z.string().optional(),
        category: z.string().default('Other'),
        featured: z.boolean().default(false),
    }),
});

export const collections = {
    projects,
    log,
    wiki, // Formerly notes
    audioshow,
    gallery,
};
