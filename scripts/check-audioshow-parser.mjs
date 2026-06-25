import assert from 'node:assert/strict';
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
assert.equal(episodes[0].appleMusicUrl, 'https://music.apple.com/us/song/test?i=123456');
assert.equal(episodes[0].audioPreviewUrl, 'https://example.com/preview.mp3');
assert.deepEqual(episodes[0].projectLinks, [
  { label: 'Apple Music', url: 'https://music.apple.com/us/song/test?i=123456' },
]);
assert.equal(sortEpisodesDesc([{ ...episodes[0], number: 1 }, episodes[0]])[0].number, 42);
console.log('AudioShow parser fixture passed');
