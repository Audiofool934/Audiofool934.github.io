import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  // Fetch all content collections
  const [projects, logs, wiki, audioshow] = await Promise.all([
    getCollection('projects'),
    getCollection('log'),
    getCollection('wiki'),
    getCollection('audioshow'),
  ]);

  // Combine and format all items
  const allItems = [
    ...projects.map(post => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description || '',
      link: `/projects/${post.slug}/`,
    })),
    ...logs.map(post => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description || '',
      link: `/log/${post.slug}/`,
    })),
    ...wiki.map(post => ({
      title: post.data.title,
      pubDate: post.data.pubDate || new Date(),
      description: post.data.description || '',
      link: `/wiki/${post.slug}/`,
    })),
    ...audioshow.map(post => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: `AudioShow Episode ${post.data.episode}`,
      link: `/audioshow/${post.slug}/`,
    })),
  ];

  // Sort by date descending
  allItems.sort((a, b) => b.pubDate.valueOf() - a.pubDate.valueOf());

  return rss({
    title: 'Audiofool Studio',
    description: 'Projects, notes, photography, and Audioshow logs.',
    site: context.site,
    items: allItems,
    customData: `<language>en-us</language>`,
  });
}
