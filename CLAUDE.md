# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Audiofool.blog is a personal portfolio website built with Astro. It features a minimalist black & white design aesthetic with five content sections (Projects, Blog/Log, Wiki, AudioShow, Gallery) and a persistent audio player that maintains playback state across page transitions.

## Development Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build locally
```

Deployment is automatic via GitHub Actions on push to `main` branch.

## Architecture

### Content Layer API (`src/content/`)

All content uses Astro 5's Content Layer API with `glob` loaders and Zod schemas defined in `src/content.config.ts`:
- **projects/**: Portfolio items with metadata (stack, type, featured flag)
- **log/**: Blog posts with tags
- **wiki/**: Knowledge base entries with parent/related links for graph structure
- **audioshow/**: Music episodes with audio URLs and durations
- **gallery/**: Photography with EXIF metadata

Key Astro 5 patterns used throughout:
- `entry.id` (not `.slug`) for content entry identifiers
- `render(entry)` imported from `astro:content` (not `entry.render()`)
- `<ClientRouter />` from `astro:transitions` (not `<ViewTransitions />`)

### AudioShow Content Format

Unlike other collections, AudioShow episodes are stored in **batch markdown files** (e.g., `2-EP_1-50.md`) rather than one file per episode. Each file contains multiple episodes in a specific format parsed by `src/utils/parseAudioshow.ts` at build time:

```
### 📻 Audioshow - EP_X
"Quote from the song"
Song Title
- Artist Name
- Album Name
- Year
<img src="artwork-url" alt="Song Title" onclick="toggleMusic('player', 'apple-music-url')">
```

The parser splits on `### 📻 Audioshow - EP_\d+` headers and extracts structured `Episode` objects. Use `loadAllEpisodes()` from `src/utils/loadEpisodes.ts` to load all episodes (shared across pages).

### Persistent Audio Player

The audio player (`src/components/AudioPlayer.astro`) persists across page navigations using Astro's Client Router:
- Uses `transition:persist` on `#audio-player-bar` in the layout
- State stored in `window.__audioPlayerState` to survive transitions
- `window.__defaultAudioShowTrack` is set at page load from build-time data (latest episode)
- Separate UI for desktop (sidebar) and mobile (fixed bottom bar); both controlled by the same `<audio>` element
- **Global API**: Call `window.playTrack({ type, url, title, artist, artwork })` from any page to trigger playback
- `type` must be `"apple"` (resolves via iTunes API `itunes.apple.com/lookup`) or `"local"` (direct URL)
- `window.toggleMusic(playerType, url)` is a legacy wrapper around `playTrack`
- Legacy `<iframe>` elements in `.post-content` are hidden via CSS (replaced by the global player)
- AudioShow pages use `data-track` / `data-play-track` attributes with JSON + addEventListener (not inline onclick)

### Layout & Theming

- `src/layouts/MinimalLayout.astro`: Global shell with sidebar nav, audio player, and theme initialization
- `src/style/global.css`: CSS custom properties for dark/light themes:
  - `--bg-body`, `--text-main`, `--text-muted`, `--border-main`, `--border-subtle`, `--accent` — use these instead of hardcoded colors
- Dark mode toggled via `class="dark"` on HTML element, persisted to localStorage
- Inline script in `<head>` prevents flash of unstyled content on theme
- CSS utilities: `.hover-invert` (inverts bg/text on hover), `.grid-lines` (blueprint grid aesthetic), `.anime-fade-in-up` (entry animation)
- `trailingSlash: 'always'` is set in `astro.config.mjs` — always use trailing slashes in `href` attributes

### Shared Utilities (`src/utils/`)

- `parseAudioshow.ts`: Parses AudioShow batch markdown files into `Episode` objects
- `loadEpisodes.ts`: `loadAllEpisodes()` — shared file-reading logic for AudioShow data
- `formatDate.ts`: `formatDateCompact()` ("2025.12.20") and `formatDateLong()` ("December 20, 2025")

### Dynamic Routes

Pages like `src/pages/log/[...slug].astro` use `getStaticPaths()` for static generation of all routes at build time.

## Tech Stack

- **Astro 5** with Preact for interactive components
- **Tailwind CSS 3** with typography plugin (via PostCSS, not `@astrojs/tailwind`)
- **TypeScript** throughout
- **MDX** support with remark-math/rehype-katex for LaTeX
- **PrismJS** for syntax highlighting
