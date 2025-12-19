import rss, { pagesGlobToRssItems } from '@astrojs/rss';

export async function GET(context) {
  return rss({
    title: 'Audiofool Studio',
    description: 'Projects, notes, photography, and Audioshow logs.',
    site: context.site,
    items: await pagesGlobToRssItems(import.meta.glob('./**/**/*.md')),
    customData: `<language>en-us</language>`,
  });
}
