import { defineCollection, z } from 'astro:content';

const projects = defineCollection({
    type: 'content',
    schema: z.object({
        title: z.string(),
        description: z.string(),
        author: z.string().default('Audiofool'),
        pubDate: z.coerce.date(),
        status: z.string().optional(),
        tags: z.array(z.string()).default([]),
        image: z.object({
            url: z.string(),
            alt: z.string(),
        }).optional(),
    }),
});

const notes = defineCollection({
    type: 'content',
    schema: z.object({
        title: z.string(),
        description: z.string(),
        author: z.string().default('Audiofool'),
        pubDate: z.coerce.date(),
        tags: z.array(z.string()).default([]),
    }),
});

const audioshow = defineCollection({
    type: 'content',
    schema: z.object({
        title: z.string(),
        episode: z.coerce.string(),
        description: z.string().optional(),
        pubDate: z.coerce.date(),
        tags: z.array(z.string()).default(['audioshow']),
    }),
});

export const collections = {
    projects,
    notes,
    audioshow,
};
