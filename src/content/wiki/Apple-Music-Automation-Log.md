---
title: "Automating Apple Music Embeds"
description: "A developer log chronicling the journey from manual labor to an automated Python solution for embedding music players in AudioShow."
pubDate: "Dec 21 2025"
---

# Automating Apple Music Embeds: A Developer Log

> "Why spend 5 minutes doing it manually when you can spend 5 hours automating it?" — Every Programmer Ever

## The Problem
Maintaining the [AudioShow](/audioshow/) section of this site involves curating a list of songs played in each episode. While listing the `Song - Artist` text is easy, providing a playable experience is better. Apple Music offers nice embeddable players, but manually searching for each song, copying the embed code, and pasting it into the markdown files for hundreds of episodes is a soul-crushing task.

## The Journey

### Phase 1: The "Simple" Script
Initially, the plan was simple:
1. Parse the Markdown files (`src/content/audioshow/*.md`).
2. Extract the "Song - Artist" string.
3. Query the iTunes Search API.
4. Replace the static cover image with a clickable one that loads the player.

However, extracting metadata purely from the Markdown file (`[text](link)`) proved inconsistent. Sometimes the hyphen was a dash, sometimes the order was Artist - Song, and typos were rampant.

### Phase 2: The Discovery (Audioshow.xml)
While poking around the project files, we discovered `Audioshow.xml` — a raw iTunes Library export. This was the Rosetta Stone!
- **Accurate Metadata**: No more guessing. We have exact `Name`, `Artist`, and `Album` fields.
- **Structured Data**: It's a standard Apple Property List (plist) file.

### Phase 3: The Optimized Solution
We built a Python script (`update_music_embeds.py`) that acts as the bridge between the XML data and the Markdown content.

#### Key Features:
1.  **XML Source of Truth**: The script parses `Audioshow.xml` to build a dictionary of high-fidelity track info.
2.  **Smart Matching**: It correlates the fuzzy "Song" text in the Markdown with the precise entry in the XML database.
3.  **Caching**: To avoid hitting API rate limits and speed up subsequent runs, all successful API responses are cached in `music_embed_cache.json`.
4.  **Rate Limit Handling**: The iTunes API can be touchy. The script implements retries and pauses (sleeping 3 seconds between updates) to stay under the radar.
5.  **Interactive Embeds**: instead of loading heavy iframes immediately, we use a lightweight image with an `onclick` handler:
    ```html
    <img 
      class="audioshow-image" 
      src="/images/audioshow/covers/..." 
      onclick="toggleMusic('apple-music-player', 'EMBED_URL')" 
    />
    ```

## The Result
- **Efficiency**: 250+ episodes updated in batches.
- **Performance**: The site remains fast because players only load on user interaction.
- **Maintainability**: Future updates are as simple as running `python3 update_music_embeds.py`.

This automation turned a tedious manual chore into a robust, repeatable process, proving once again that a little bit of code goes a long way.
