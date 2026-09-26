import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { parseEpisodesFromMarkdown, sortEpisodesDesc } from '../src/utils/parseAudioshow.ts';

const fixture = `### 📻 Audioshow - EP_42
"First line
second line"
Test Song
- Test Artist
- Test Album
- 1977
- Test Composer

<img src="/images/audioshow/test.webp" alt="Test cover" onclick="toggleMusic('apple', 'https://music.apple.com/us/song/test?i=123456')" />

Audio Preview
https://example.com/preview.mp3

Project Links
- [Apple Music](https://music.apple.com/us/song/test?i=123456)
`;

const episodes = parseEpisodesFromMarkdown(fixture, 'fixture.md');
assert.equal(episodes.length, 1);
assert.equal(episodes[0].number, 42);
assert.equal(episodes[0].songTitle, 'Test Song');
assert.equal(episodes[0].artist, 'Test Artist');
assert.equal(episodes[0].album, 'Test Album');
assert.equal(episodes[0].year, 1977);
assert.equal(episodes[0].composer, 'Test Composer');
assert.equal(episodes[0].imageUrl, '/images/audioshow/test.webp');
assert.equal(episodes[0].coverAlt, 'Test cover');
assert.equal(episodes[0].playbackUrl, 'https://music.apple.com/us/song/test?i=123456');
assert.equal(episodes[0].audioPreviewUrl, 'https://example.com/preview.mp3');
assert.deepEqual(episodes[0].projectLinks, [
  { label: 'Apple Music', url: 'https://music.apple.com/us/song/test?i=123456' },
]);
assert.equal(sortEpisodesDesc([{ ...episodes[0], number: 1 }, episodes[0]])[0].number, 42);
const dataFixture = fixture.replace(/onclick="toggleMusic\([^,]+,\s*'([^']+)'\)"/, 'data-audio-url="$1"');
assert.deepEqual(parseEpisodesFromMarkdown(dataFixture, 'fixture.md'), episodes);

const instrumental = `### 📻 Audioshow - EP_43
[Instrumental]
Instrumental Song
- Another Artist
- Another Album
- 2001

<img src="/cover.webp" data-audio-url="https://example.com/audio.mp3" />
Preview Audio
https://example.com/other.mp3
`;
const combined = parseEpisodesFromMarkdown(dataFixture + '\n' + instrumental, 'fixture.md');
assert.equal(combined.length, 2);
assert.equal(combined[1].quote, '[Instrumental]');
assert.equal(combined[1].songTitle, 'Instrumental Song');
assert.equal(combined[1].audioPreviewUrl, 'https://example.com/other.mp3');
assert.equal(combined[1].composer, undefined);
assert.deepEqual(combined[1].projectLinks, []);
assert.deepEqual(parseEpisodesFromMarkdown('# No episodes', 'empty.md'), []);
assert.deepEqual(parseEpisodesFromMarkdown(instrumental.replace('EP_43', 'EP_0'), 'zero.md'), []);
assert.equal(sortEpisodesDesc(combined)[0].number, 43);
assert.equal(combined[0].number, 42, 'Sorting must not mutate its input');

const directory = new URL('../src/content/audioshow/', import.meta.url);
const authored = [];
for (const file of readdirSync(directory).filter((file) => file.endsWith('.md'))) {
    const markdown = readFileSync(new URL(file, directory), 'utf8');
    assert(!/<script\b|\bonclick\s*=/i.test(markdown), `${file}: author playback data, not executable behavior`);
    authored.push(...parseEpisodesFromMarkdown(markdown, file));
}
assert(authored.length > 0);
assert.equal(new Set(authored.map((episode) => episode.number)).size, authored.length, 'Episode numbers must be unique');
for (const episode of authored) {
    assert(episode.songTitle && episode.artist, `EP_${episode.number}: missing song metadata`);
}
console.log(`AudioShow fixtures and ${authored.length} authored episodes passed`);
