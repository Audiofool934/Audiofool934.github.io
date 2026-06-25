import rss from '@astrojs/rss';
import { getTimelineItems } from '../utils/timelineItems';

export async function GET(context) {
  const items = await getTimelineItems();

  return rss({
    title: 'Audiofool Studio',
    description: 'Projects, notes, photography, AudioShow, and timeline updates.',
    site: context.site,
    items: items.map((item) => ({
      title: item.title,
      pubDate: item.date,
      description: item.description || item.lane,
      link: item.href,
    })),
    customData: `<language>en-us</language>`,
  });
}
