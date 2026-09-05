# Performance

## Measurement

Measured on September 5, 2026 using Lighthouse 13.4.1 against local Astro production previews.
Mobile simulated throttling used 150 ms RTT, approximately 1.6 Mbps throughput, and 4x CPU slowdown.
Home, the Policy Gradient note, and Gallery use medians of three cold runs for each version.
AudioShow recent and archive are single-run smoke checks.
The baseline was reconstructed from the starting checkpoint and verified against all 776 recorded file hashes.
Production CDN behavior and real-user Web Vitals still need verification after deployment.

| Page | Performance score, before / after | First paint, before / after | Largest paint, before / after |
| --- | --- | --- | --- |
| Home | 99 / 99 | 1.12 / 1.06 s | 2.11 / 2.11 s |
| Policy Gradient note | 93 / 97 | 2.21 / 1.51 s | 2.52 / 2.42 s |
| Gallery | 98 / 99 | 1.22 / 1.21 s | 2.28 / 2.11 s |
| AudioShow archive | 99 / 99 | 1.36 / 1.42 s | 1.96 / 1.96 s |
| AudioShow recent | 100 / 100 | 1.06 / 1.06 s | 1.81 / 1.81 s |

All sampled runs reported zero Total Blocking Time and zero Cumulative Layout Shift.
The math note reached first paint 32% sooner; homepage largest paint was effectively unchanged.
Scores and timings vary, so small differences should not be treated as precise guarantees.

## Controlled mobile transfers

A separate cold-browser check used a 390px viewport at 2x pixel density and the same initial track, Strawberry Fields Forever.
The test fixed the random seed in the test browser only and waited for the original idle-preload window.
Production still chooses its initial track randomly.

| Resource | Before | After | Reduction |
| --- | --- | --- | --- |
| Player artwork | 3 requests, 68,138 bytes | 1 request, 13,378 bytes | 80% transferred bytes |
| Homepage background | 116,178 bytes, 960px WebP | 49,791 bytes, 640px AVIF | 57% transferred bytes |

These are observed transfer sizes for the controlled example; album artwork varies by track.

## Changes

- Serve matching KaTeX CSS and fonts locally, only on math pages; preload the two common math fonts and keep unused fonts out of inline CSS.
- Request artwork for the visible player only, use 192px local covers on mobile, and defer neighboring-cover preloads until playback while respecting page visibility and data-saving connections.
- Use responsive AVIF with WebP fallback for the homepage background, including intermediate widths for mobile screens.
- Match gallery image sizes to the sidebar and masonry columns; prioritize the first thumbnail and retain existing WebP quality and on-demand full-size images.
- Compile theme and filter scripts as Astro modules; delegate archive and crate interactions to their page containers.
- Reduce repeated archive classes and duplicate crate playlist data while retaining all content and keyboard controls.
- Fix a reproduced crate-navigation bug that dispatched one track click twice after visiting two crates.

Archive HTML fell from 687,041 to 565,844 uncompressed bytes.
Its gzip reduction is much smaller because repeated markup compresses well.
Route 88 HTML fell from 142,159 to 124,865 uncompressed bytes.

## Verification and budgets

```bash
npm run build
npm run astro -- check
npm run check:audioshow-parser
npm run check:performance
```

The build generated 186 pages; Astro diagnostics reported no errors, warnings, or hints.
Browser checks covered playback persistence, next/previous/shuffle and crate queues, repeated crate navigation, keyboard playback, archive lyric toggles, filters, mobile navigation, theme persistence, math containment, gallery viewing, and artwork changes across viewport sizes.
KaTeX retains its font-display behavior to preserve mathematical typography; its package license is included in `public/licenses/katex.txt`.

`check:performance` checks actual compressed build output, aggregate JavaScript assets, conditional math loading, and local font references without network access.
The deployment build job runs it before the deploy job can proceed.
Review budget changes deliberately when content grows; measure before increasing a limit.

To repeat a cold mobile audit against a running preview:

```bash
npx lighthouse@13.4.1 http://localhost:4321/notes/policy-gradient/ \
  --only-categories=performance --output=json \
  --output-path=/tmp/audiofool-math.json --chrome-flags=--headless
```

Repeat at least three times and compare medians using the same Lighthouse version and environment.
Do not compare total transfer size between random initial tracks without controlling that source of variation.
