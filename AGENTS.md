# AGENTS.md

This file is the working guide for Codex and other coding agents in this
repository. Keep it current when architecture, commands, content conventions, or
deployment behavior changes.

## Knowledge Base

- Query `~/power/` with `obsidian vault="power" <command>` when the user asks
  about their personal collection, including papers, books, notes, and prior
  discussions.
- Maintain the vault when the user shares new materials or asks to compile or
  add something.
- Answer directly for general knowledge questions.
- Do not save routine Q&A.

## Agent Workflow

- Prefer cross-model validation for non-trivial repository work when the Codex
  plugin is available.
- If Codex mostly wrote or planned the change, prefer
  `/codex:review --background --base main` unless the user specifies a different
  base.
- If Codex produced the result through review or rescue, review it in Codex
  before finalizing.
- Use `/codex:adversarial-review --background` for design pressure-testing or
  hidden-risk review.
- Use `/codex:rescue --background` for bounded, parallelizable, or token-heavy
  investigation and implementation work.
- Use `/codex:status` and `/codex:result` for background jobs. If Codex seems
  unavailable, run `/codex:setup`.
- Skip Codex for trivial edits, short answers, or urgent blocking work when
  direct local execution is clearly faster.

## Project Overview

Audiofool.blog is a personal archive and portfolio built with Astro 6. It
combines projects, notes, timeline posts, AudioShow music entries, and
photography in a dark-first minimalist interface. A persistent audio player
survives client-side page transitions.

The public IA is:

- `/timeline/` - chronological stream across logs, notes, projects, AudioShow,
  and gallery.
- `/projects/` - portfolio/project pages, optionally enriched by synced GitHub
  READMEs.
- `/notes/` - wiki collection entries surfaced as notes.
- `/audioshow/` - batch-authored music episodes, playlist data, and crates.
- `/gallery/` - photography entries with optimized local assets.

Legacy `/log/...`, selected `/wiki/...`, uppercase route variants, and older
AudioShow URLs are preserved by redirect stubs.

## Commands

Use npm with Node `>=22.12.0`.

```bash
npm run dev                    # Generate site/AudioShow image variants, then start Astro dev
npm run build                  # Generate image variants, clear Astro caches, then build
npm run preview                # Preview the production build locally
npm run astro -- check         # Astro + TypeScript diagnostics
npm run check:audioshow-parser # Parser fixture check for batch AudioShow markdown
npm run generate:site-images
npm run generate:audioshow-images
npm run refresh:github-projects
npm run build:with-sync        # Explicit GitHub sync + build
```

Important build behavior:

- `predev` and `prebuild` run `scripts/generate-site-images.mjs` and
  `scripts/generate-audioshow-images.mjs`.
- `npm run build` intentionally does not sync GitHub data from the network.
- Use `npm run build:with-sync` only when the user explicitly wants fresh GitHub
  project data.
- Deployment is handled by GitHub Actions on pushes to `main`.

## Tech Stack

- Astro 6 with the Content Layer API.
- Preact integration is installed for interactive islands if needed.
- Tailwind CSS 3 via PostCSS, not `@astrojs/tailwind`.
- TypeScript throughout.
- MDX support.
- `remark-math` + `rehype-katex` for math rendering.
- PrismJS syntax highlighting.
- `sharp` for generated site and AudioShow image variants.

## Astro And Routing Conventions

- Content collections are declared in `src/content.config.ts` with `glob`
  loaders and Zod schemas.
- Use `entry.id` for route identifiers. Do not assume `.slug`.
- Use `render(entry)` from `astro:content`; do not use legacy
  `entry.render()`.
- Use `<ClientRouter />` from `astro:transitions`.
- `trailingSlash: "always"` is set in `astro.config.mjs`; links should use
  trailing slashes.
- Dynamic route pages use `getStaticPaths()` and must return all generated
  paths at build time.
- Prefer canonical public routes:
  - Notes: `/notes/${entry.id}/`
  - Timeline entries: `/timeline/${entry.id}/`
  - Projects: `/projects/${entry.id}/`
  - AudioShow batches: `/audioshow/${entry.id}/`
  - Gallery: `/gallery/${entry.id}/`

## Layout, Head, And Theme

The global shell is `src/layouts/MinimalLayout.astro`.

It delegates to:

- `src/components/site/SiteHead.astro` for SEO, canonical URLs, Open Graph,
  Twitter cards, JSON-LD, fonts, optional KaTeX CSS, and `<ClientRouter />`.
- `src/components/site/SiteSidebar.astro` for navigation, social links, theme
  toggles, mobile menu, and `AudioPlayer`.
- `src/components/site/SiteThemeScripts.astro` for dark-first initialization
  and transition-related behavior.

Theme rules:

- The site is dark-first. The root HTML starts with `class="dark"`.
- Only an explicit `localStorage.theme === "light"` removes dark mode.
- Keep light mode working; do not delete light theme variables.
- Use CSS variables from `src/style/global.css`:
  - `--bg-body`
  - `--text-main`
  - `--text-muted`
  - `--text-faint`
  - `--border-main`
  - `--border-subtle`
  - `--accent`
- Avoid hardcoded foreground/background colors in components when a variable
  exists.

## Markdown Rendering

Shared markdown typography lives in `src/style/post.css`.

Use these classes consistently:

- `.post-content` for rendered markdown across notes, project READMEs,
  AudioShow, and timeline-style article bodies.
- `.wiki-content` for denser reference-note spacing.

Current reading-design intent:

- Dense but readable typography for long-form dark-mode reading.
- Tables, code blocks, and KaTeX display blocks can scroll horizontally inside
  their own containers.
- The page itself should not gain accidental horizontal scrolling from wide
  tables or math.
- Markdown scrollbar styling is intentionally customized for dark mode on
  `pre`, `table`, and `.katex-display`; do not reintroduce bright native bars.
- Use the existing link, code, table, blockquote, and heading styles before
  adding new one-off prose styling.

Math behavior:

- Notes detect math from the raw body and pass `math={hasMath}` to
  `MinimalLayout`.
- `SiteHead` only loads the KaTeX stylesheet when `math` is true.
- Keep long display equations horizontally scrollable on mobile.

Markdown image behavior:

- `astro.config.mjs` injects lazy loading and async decoding for markdown
  images.
- Raw HTML `<img>` in markdown is patched too, because README screenshots and
  AudioShow content may arrive as raw nodes.
- AudioShow local images under `/images/audioshow/` get generated responsive
  variants under `/images/audioshow/_generated/`.
- Remote markdown images get `referrerpolicy="no-referrer"` when possible, which
  helps older Imgur/GitHub-hosted content keep loading reliably.

## Media Performance

- `scripts/generate-site-images.mjs` creates responsive homepage variants under
  `/images/_generated/site/`. These outputs are generated and ignored by git.
- `scripts/generate-audioshow-images.mjs` creates 96px, 192px, and 320px WebP
  variants under `/images/audioshow/_generated/`. Use 96/192 for tiny rows and
  320 for card/player artwork.
- Keep generated image directories out of commits; source images and scripts are
  the maintainable inputs.
- `SiteHead.astro` should not load Google Fonts. Fonts are vendored in
  `public/fonts/` and declared in `src/style/global.css` with
  `font-display: swap`.
- Gallery index should eager-load only the first visible lane of masonry images.
  Do not make large offscreen Gallery cards eager.
- Gallery detail pages should not put fullscreen/lightbox image URLs in `src`
  before interaction. Store them in `data-src` and assign `src` only when opened.
- Prefer explicit `width`, `height`, `sizes`, `decoding`, `loading`, and
  `fetchpriority` attributes for any new hand-authored `<img>`.
- For remote image URLs that cannot be optimized locally, add
  `referrerpolicy="no-referrer"` and a local placeholder fallback where the UI
  supports it.

## Content Collections

Collections in `src/content.config.ts`:

- `projects` - portfolio items with stack, type, category, status, pinned,
  featured, URLs, GitHub repo metadata, and optional image.
- `projectReadmes` - generated/synced GitHub README markdown. Do not hand-edit
  these unless the user explicitly wants to override synced content.
- `log` - timeline/log entries with title, date, tags, and optional
  description. Public individual log URLs redirect to `/timeline/...`.
- `wiki` - notes knowledge base with `kind`, dates, parents, related entries,
  and tags. Public route is `/notes/...`.
- `audioshow` - batch markdown files that contain multiple music episodes.
- `gallery` - photography entries with local optimized image metadata and EXIF-
  style fields.

When adding content:

- Keep frontmatter aligned with the Zod schema.
- Dates should be parseable by `z.coerce.date()`.
- Use lowercase, stable file names for new public content.
- Prefer adding redirects only when preserving an already-published URL.

## Timeline Data Layer

`src/utils/timelineItems.ts` is the single source for chronological archive
items.

It combines:

- `log` -> timeline detail pages at `/timeline/${entry.id}/`
- `projects` -> `/projects/${entry.id}/`
- `wiki` -> `/notes/${entry.id}/`
- `audioshow` -> `/audioshow/${entry.id}/`
- `gallery` -> `/gallery/${entry.id}/`

Consumers include:

- Homepage Updates.
- `/timeline/`.
- RSS feed at `/rss.xml`.

When changing what counts as an update, update `getTimelineItems()` instead of
duplicating sorting/filtering logic in individual pages.

## AudioShow

AudioShow source markdown is batch-authored in `src/content/audioshow/`, not
one file per episode. Each batch contains sections like:

```markdown
### 📻 Audioshow - EP_X
"Quote from the song"
Song Title
- Artist Name
- Album Name
- Year
<img src="artwork-url" alt="Song Title" onclick="toggleMusic('player', 'apple-music-url')">
```

Parser and loading utilities:

- `src/utils/parseAudioshow.ts` parses sections into `Episode` objects.
- `src/utils/loadEpisodes.ts` reads all batch files and reuses the parser.
- `sortEpisodesDesc()` returns newest episodes first.
- `scripts/check-audioshow-parser.mjs` covers header parsing, quotes, metadata,
  artwork, Apple URLs, preview URLs, project links, and sorting.

Supported optional batch fields:

- `Audio Preview` or `Preview Audio` followed by a URL.
- `Project Links` followed by markdown links.
- A fourth metadata bullet for composer.

Generated images:

- `scripts/generate-audioshow-images.mjs` creates 96px, 192px, and 320px WebP
  variants for local AudioShow images.
- It skips `_generated/` and old `*-og.jpg` files.
- `AUDIOSHOW_IMAGE_WORKERS` can tune worker count.

## Persistent Audio Player

The audio player is `src/components/AudioPlayer.astro` with browser logic in
`src/scripts/audioPlayer.ts` and types in `src/scripts/audio/types.ts`.

Rules:

- The player persists across Astro client-router navigations via
  `transition:persist` on `#audio-player-bar`.
- Playback state lives on `window.__audioPlayerState`.
- The default track is computed at build time by
  `src/utils/defaultAudioTrack.ts` and injected as `window.__defaultAudioShowTrack`.
- Use `window.playTrack({ type, url, title, artist, artwork })` to trigger
  playback.
- `type` is `"apple"` for Apple Music URLs resolved through the iTunes lookup
  flow, or `"local"` for direct audio URLs.
- `window.toggleMusic(playerType, url)` is a legacy wrapper kept for authored
  AudioShow batch markdown.
- AudioShow pages upgrade legacy image `onclick` handlers after
  `astro:page-load` into accessible click and keyboard handlers.
- Do not introduce new inline event handlers for fresh UI. Prefer
  `data-*` attributes plus event listeners.

## Projects And GitHub Sync

Project data lives in:

- `src/content/projects/` for curated project metadata.
- `src/content/project-readmes/` for synced README content.
- `src/data/github-projects.json` for GitHub catalog data.

Use `scripts/sync-github-projects.mjs` through
`npm run refresh:github-projects` only when fresh network data is desired.
Ordinary builds should remain deterministic and avoid GitHub API side effects.

## Gallery

- Gallery content lives in `src/content/gallery/`.
- Local source images live in `src/assets/gallery/`.
- The gallery schema uses Astro's `image()` helper so pages can emit optimized
  image output.
- Keep image frontmatter paths local and schema-valid.

## Styling And Frontend QA

- Global tokens and utilities live in `src/style/global.css`.
- Markdown/prose styling lives in `src/style/post.css`.
- Prism theme lives in `src/style/prism-theme.css`.
- Prefer existing Tailwind utility patterns and CSS variables.
- Keep cards and layout elements square/minimal unless the existing design
  clearly uses another shape.
- Check desktop and mobile viewports for frontend changes that affect rendered
  layout.
- For typography changes, inspect at least one dense note with math/table
  content, such as `/notes/policy-gradient/`.
- For route or data changes, inspect the relevant index page and detail page.

Recommended verification by change type:

- Parser/content pipeline: `npm run check:audioshow-parser`
- Astro/TypeScript: `npm run astro -- check`
- Production output: `npm run build`
- Rendered frontend changes: run a dev or preview server and verify with the
  browser at desktop plus one mobile viewport.

## Accessibility And Interaction

- Keep the skip link and `main#main-content` focus behavior intact.
- Preserve keyboard access for mobile navigation, AudioShow image playback, and
  timeline filters.
- Use real buttons for UI actions and links for navigation.
- When adding client-side scripts under Astro transitions, attach handlers on
  `astro:page-load` and clean up listeners if they can be registered more than
  once.

## SEO, Feeds, And Redirects

- `SiteHead.astro` owns canonical URLs, social metadata, JSON-LD, RSS link, and
  optional article metadata.
- RSS pulls from `getTimelineItems()`.
- Legacy redirect pages should use `noindex, follow` and canonical URLs to the
  new location.
- Sitemap excludes known legacy redirect URLs through the filter in
  `astro.config.mjs`.

## Git And Deployment Notes

- The main deployed branch is `main`.
- GitHub Actions deploys on push to `main`.
- Keep generated caches (`.astro`, `node_modules/.astro`, local screenshot
  output, Playwright temp folders) out of commits.
- `AGENTS.md` is part of the repository and should be kept updated with
  architectural changes.
- Do not revert unrelated user changes in a dirty worktree.
