---
project: "audiofool-blog"
repo: "Audiofool934/Audiofool934.github.io"
sourceUrl: "https://github.com/Audiofool934/Audiofool934.github.io"
syncedAt: "2026-09-26T13:59:33.446Z"
---

# audiofool.blog

A personal archive for notes, music, photography, and projects.

<p>
  <a href="https://audiofool.blog">
    <img referrerpolicy="no-referrer" decoding="async" loading="lazy" src="https://raw.githubusercontent.com/Audiofool934/Audiofool934.github.io/main/docs/home.png" alt="audiofool.blog homepage with sidebar navigation, the persistent audio player, and recent updates" width="900" />
  </a>
</p>

<p>
  <a href="https://audiofool.blog"><strong>audiofool.blog</strong></a>
  ·
  <a href="https://audiofool.blog/rss.xml">RSS</a>
  ·
  <a href="https://audiofool.blog/timeline/">Timeline</a>
</p>

The site is a small set of typed content systems built with Astro.
GitHub holds the source and project documentation; the website gives all of it one visual language: monochrome, archival, and typography-first.
External services supply data, and the site owns the presentation.

## Sections

| Section   | Route         | What lives there                                                                           |
| --------- | ------------- | ------------------------------------------------------------------------------------------ |
| Timeline  | `/timeline/`  | A curated record of updates across the site, also published as RSS                         |
| Projects  | `/projects/`  | Project dossiers backed by GitHub metadata and README snapshots                            |
| Notes     | `/notes/`     | Essays, methods, models, and references, with KaTeX math                                   |
| AudioShow | `/audioshow/` | A long-running music journal with episode archive, curated crates, and a persistent player |
| Gallery   | `/gallery/`   | Selected photographs with subject filters and camera, lens, and film metadata              |

## Stack

[Astro 6](https://astro.build) with content collections and client-side routing, TypeScript, Tailwind CSS 3, KaTeX, and Prism.
Fonts are self-hosted, image variants are generated at build time with `sharp`, and the site deploys to GitHub Pages.

## Getting started

Requires Node.js 22.12 or newer.

```bash
npm install
npm run dev        # http://localhost:4321
```

| Command                           | Purpose                                                                                                                                         |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run dev`                     | Generate image variants and start the dev server                                                                                                |
| `npm run build`                   | Generate image variants, clear Astro caches, and build to `dist/`                                                                               |
| `npm run preview`                 | Serve the production build                                                                                                                      |
| `npm run astro -- check`          | Astro and TypeScript diagnostics                                                                                                                |
| `npm run check:audioshow-parser`  | AudioShow parser fixtures                                                                                                                       |
| `npm run check:performance`       | Gzip size budgets and local math assets; run after a build                                                                                      |
| `npm run refresh:github-projects` | Fetch fresh GitHub metadata and README snapshots                                                                                                |
| `npm run build:with-sync`         | Refresh GitHub snapshots, then build                                                                                                            |
| `npm run gallery:intake`          | Local photo curation desk (see [its README](https://github.com/Audiofool934/Audiofool934.github.io/blob/main/scripts/gallery-intake/README.md)) |

## How it works

**Content.**
Each section is an Astro content collection of Markdown files under `src/content/`, validated by Zod schemas in `src/content.config.ts`.
Notes live in `wiki/` and timeline entries in `log/`; older `/wiki/` and `/log/` URLs redirect to their current routes.

**Updates.**
`src/utils/timelineItems.ts` decides what counts as an update.
The homepage, the Timeline, and the RSS feed all read from it.

**Projects.**
A project entry can point at a GitHub repository:

```yaml
githubRepo: "Audiofool934/example-repo"
githubReadme: true
```

`npm run refresh:github-projects` fetches repository metadata and the README, sanitizes it, and writes a snapshot to `src/data/github-projects.json` and `src/content/project-readmes/`.
The snapshot is committed, so builds never call the GitHub API.

**AudioShow.**
Episodes are authored in batches in `src/content/audioshow/` and parsed by `src/utils/parseAudioshow.ts`.
The player keeps playing across page navigation and supports Apple Music previews and local audio.

**Images.**
`predev` and `prebuild` generate responsive variants of site images (AVIF with WebP fallback) and AudioShow artwork (WebP).
Gallery photographs are processed by Astro's image pipeline from `src/assets/gallery/`.

## Project layout

```text
src/
├── components/   site shell, theme toggle, audio player
├── content/      Markdown collections: projects, project-readmes, wiki, log, audioshow, gallery
├── data/         GitHub snapshot, gallery subjects, AudioShow crates
├── layouts/      the shared page shell
├── pages/        routes, legacy redirects, RSS, AudioShow playlist
├── scripts/      client code for the player and gallery
├── style/        theme tokens, prose typography, code highlighting
└── utils/        timeline, AudioShow parsing, date formatting
scripts/          image generation, GitHub sync, checks, gallery intake desk
public/           fonts, static media, CV
```

Conventions for contributors and coding agents are in [AGENTS.md](https://github.com/Audiofool934/Audiofool934.github.io/blob/main/AGENTS.md).

## Deployment and performance

Every push to `main` builds and deploys through [GitHub Actions](https://github.com/Audiofool934/Audiofool934.github.io/blob/main/.github/workflows/deploy.yml).
The build job runs `npm run check:performance` first, and a deploy only proceeds if every page stays within its gzip budget in `scripts/check-performance.mjs`.
Math pages load KaTeX locally, and only where it is needed.

To audit a page against a running preview, compare the median of at least three runs:

```bash
npx lighthouse@13.4.1 http://localhost:4321/notes/policy-gradient/ \
  --only-categories=performance --chrome-flags=--headless
```

## License

The canonical repository is [Audiofool934/Audiofool934.github.io](https://github.com/Audiofool934/Audiofool934.github.io).

* **Code** (the Astro site, components, scripts, and styles) is released under the [MIT License](https://github.com/Audiofool934/Audiofool934.github.io/blob/main/LICENSE).
* **Content** (writing, photographs, AudioShow curation, and other personal media) is © Audiofool, all rights reserved, and is not covered by the MIT License.

If you build on this, a link back is appreciated.
