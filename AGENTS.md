# Agent Guide

Audiofool.blog is a personal archive for projects, notes, music, photography, and public updates.
It uses Astro 6, TypeScript, Tailwind CSS 3 via PostCSS, MDX, and optional Preact islands.
Keep this guide current when project conventions change.

## Workflow

- Inspect the working tree first and preserve unrelated edits.
- Do not hand-edit synced project READMEs without an explicit override request.
- Keep generated images, `.astro`, `node_modules/.astro`, and local QA artifacts out of commits.
- GitHub Actions deploys pushes to `main`; publishing requires clear user authorization.
- Match validation to the change and reproduce user-facing bugs before fixing them.
- When the Codex plugin is available, prefer cross-model validation for non-trivial work; skip it for trivial or urgent work.
- Plugin commands: `/codex:review --background --base main` for changes, `/codex:adversarial-review --background` for design risks, and `/codex:rescue --background` for bounded investigations.
- Review Codex review/rescue results in Codex before finalizing; use `/codex:status`, `/codex:result`, and `/codex:setup` as needed.

## Commands

Use npm with Node `>=22.12.0`.

```bash
npm run dev                       # Generate image variants and start Astro
npm run build                     # Generate images, clear Astro caches, build
npm run preview                   # Serve the production build locally
npm run astro -- check             # Astro and TypeScript diagnostics
npm run check:audioshow-parser     # AudioShow parser fixtures
npm run check:performance          # Production output budgets; build first
npm run generate:site-images
npm run generate:audioshow-images
npm run refresh:github-projects    # Explicit metadata and README sync
npm run build:with-sync            # Explicit GitHub sync and build
```

`predev` and `prebuild` generate site and AudioShow image variants.
Ordinary builds use committed GitHub snapshots and do not sync network data.
Run either GitHub sync command only when fresh project data is explicitly requested.

## Architecture

| Area | Source of truth |
| --- | --- |
| Global shell | `src/layouts/MinimalLayout.astro` |
| SEO, canonical URLs, social cards, JSON-LD, RSS link, ClientRouter | `src/components/site/SiteHead.astro` |
| Navigation, theme controls, mobile menu, player | `src/components/site/SiteSidebar.astro` |
| Initial theme | `src/components/site/SiteThemeScripts.astro` |
| Theme tokens and utilities | `src/style/global.css` |
| Markdown typography and highlighting | `src/style/post.css`, `src/style/prism-theme.css` |
| Collection schemas and loaders | `src/content.config.ts` |
| Homepage updates, timeline, RSS items | `src/utils/timelineItems.ts` |

Update `getTimelineItems()` when changing what counts as an update; keep sorting and filtering out of individual consumers.
Project metadata lives in `src/content/projects/`, synced READMEs in `src/content/project-readmes/`, and the GitHub catalog in `src/data/github-projects.json`.

## Content and Routes

Collections use `glob` loaders and Zod schemas.
Use `entry.id`, `render(entry)` from `astro:content`, and `getStaticPaths()` for generated detail routes.

| Collection | Public detail route | Content |
| --- | --- | --- |
| `projects` | `/projects/${entry.id}/` | Curated metadata and optional synced README |
| `wiki` | `/notes/${entry.id}/` | Concepts, methods, models, essays, references |
| `log` | `/timeline/${entry.id}/` | Public updates and articles |
| `audioshow` | `/audioshow/${entry.id}/` | Episode batches |
| `gallery` | `/gallery/${entry.id}/` | Photography with local image metadata |

- Match frontmatter to the schema, use parseable dates, and choose stable lowercase filenames.
- Keep trailing slashes on internal routes; `trailingSlash: "always"` is configured.
- Preserve published legacy URLs with redirect stubs using `noindex, follow` and canonical targets.
- Keep legacy redirects excluded from the sitemap in `astro.config.mjs`.

## UI, Theme, and Accessibility

- Preserve the minimal archival style: thin borders, compact metadata, square cards, and restrained interaction.
- Use existing CSS variables for colors: `--bg-body`, `--text-main`, `--text-muted`, `--text-faint`, `--border-main`, `--border-subtle`, and `--accent`.
- Resolve theme before first paint: explicit `localStorage.theme` (`light` or `dark`), then system preference, then dark if the preference API is unavailable.
- Keep both themes working and initialization consistent with transition handling in `MinimalLayout.astro`.
- Use `<ClientRouter />`, attach page handlers on `astro:page-load`, and prevent duplicate listeners across navigation.
- Use buttons for actions and links for navigation; preserve keyboard controls, the skip link, and `main#main-content` focus behavior.

## Markdown and Media

- Use `.post-content` for rendered Markdown and `.wiki-content` for denser notes; extend shared styles before adding one-off rules.
- Keep tables, code, and display math horizontally scrollable within their containers, without page overflow.
- Preserve custom scrollbar styling and `.post-content .katex { position: relative; }`, which contains hidden MathML inside scrolling equations and tables.
- Pass `math={hasMath}` for math notes so `SiteHead` loads local, package-matched KaTeX CSS and font preloads only when needed; keep fonts out of inline CSS.
- `astro.config.mjs` adds lazy loading and async decoding to Markdown and raw HTML images, plus responsive local AudioShow variants and remote referrer policies.
- Fonts are vendored in `public/fonts/` with `font-display: swap`; do not load Google Fonts.
- Give new images appropriate dimensions, `sizes`, decoding, loading, and fetch priority; use `referrerpolicy="no-referrer"` and a fallback for remote images where supported.
- Gallery sources belong in `src/assets/gallery/` with schema-valid local paths using Astro's `image()` helper.
- Prioritize the first gallery thumbnail and let native lazy loading discover the remaining visible images; defer lightbox `src` assignment until interaction using `data-src`.
- Generated site images live under `/images/_generated/site/`; AudioShow WebP variants under `/images/audioshow/_generated/` use 96/192px for rows and 320px for cards/player artwork.
- The homepage uses responsive AVIF with WebP fallback; keep gallery photograph quality intact and verify image formats by measurement.

## AudioShow and Player

- Author batches in `src/content/audioshow/` using the existing episode format, rather than one file per episode.
- `src/utils/parseAudioshow.ts` parses episodes; `src/utils/loadEpisodes.ts` loads batches; `sortEpisodesDesc()` orders newest first.
- Optional batch fields include `Audio Preview` / `Preview Audio`, `Project Links`, and a fourth metadata bullet for composer.
- The player UI is `src/components/AudioPlayer.astro`; logic is `src/scripts/audioPlayer.ts`; types are `src/scripts/audio/types.ts`.
- Preserve `transition:persist` on `#audio-player-bar` and state on `window.__audioPlayerState` across navigation.
- Load artwork for the visible player only; preload neighboring covers only during playback, respecting visibility and data-saving connections.
- `src/utils/defaultAudioTrack.ts` supplies `window.__defaultAudioShowTrack` at build time.
- Start playback with `window.playTrack({ type, url, title, artist, artwork })`; `type` is `apple` for Apple Music lookup or `local` for direct audio URLs.
- Keep legacy `window.toggleMusic(playerType, url)` support and accessible upgrades of authored image handlers after page load.
- For new UI, use `data-*` attributes and listeners instead of inline event handlers.

## Verification

- Run the relevant parser fixtures, Astro/TypeScript diagnostics, or production build from the command list above.
- For rendered changes, inspect desktop and mobile in a dev or production preview, including the real interaction path.
- For typography, check `/notes/policy-gradient/` with its math and table; verify document overflow and container scrolling separately.
- For route or data changes, check both the relevant index and detail page.
- Fix related failures and report unrelated failures without expanding scope.
- CI enforces production size budgets; see `PERFORMANCE.md` for measurement and regression checks.

## Personal Knowledge Base

- For the user's papers, books, notes, or prior discussions, query `~/power/` with `obsidian vault="power" <command>`.
- Maintain the vault when the user shares materials or asks to compile/add them; answer general knowledge directly and do not save routine Q&A.
