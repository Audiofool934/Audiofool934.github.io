---
project: "sounddrop"
repo: "Audiofool934/sounddrop-ui"
sourceUrl: "https://github.com/Audiofool934/sounddrop-ui"
syncedAt: "2026-06-13T07:31:54.401Z"
---

# SoundDrop UI

SoundDrop UI is the frontend for a campus sound-map experience: users choose a place on a map, upload a photo, describe a musical feeling, generate audio through a backend AI service, and publish the selected result back onto the shared map.

This repository contains only the React/Vite UI. It does not include the production backend, database, deployment stack, or music-generation model.

## Features

* Interactive campus map with Leaflet and marker clustering
* Map pin selection and region matching
* Photo upload UI with client-side compression
* Auth screens and token-based API client
* Submission flow with optional 1 or 3 generated tracks
* Generation polling and audio selection
* Public map browsing, playback, likes, and personal work management UI
* Responsive mobile-first panels and draggable sheets

## Tech stack

* React
* TypeScript
* Vite
* Tailwind CSS
* Leaflet + leaflet.markercluster
* Howler.js
* Axios

## Getting started

```bash
npm install
npm run dev
```

The dev server expects a backend API available at `/api/v1`. In local development, you can add a Vite proxy or serve the UI behind a backend/proxy that exposes that path.

For quick UI exploration without a backend, the app falls back to bundled demo map data in Vite dev mode. Production builds do not use demo fallback unless you explicitly set `VITE_DEMO_FALLBACK=true`.

## Scripts

```bash
npm run lint
npm run build
npm run preview
```

## API expectation

The UI uses a REST API under `/api/v1` for auth, submissions, generations, works, regions, likes, and admin state. See `src/api/client.ts` and the page components for expected request shapes.

## Map asset

The included map image is used as a pixel-coordinate Leaflet overlay. If you adapt SoundDrop to another campus or place, replace `public/maps/map-zgc-web.jpg` and update `MAP_CONFIG` in `src/config.ts`.

## License

MIT
