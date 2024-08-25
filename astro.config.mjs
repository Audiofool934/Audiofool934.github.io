import { defineConfig } from 'astro/config';

import preact from "@astrojs/preact";

// https://astro.build/config
export default defineConfig({
  site: "http://audiofool934.github.io",
  integrations: [preact()]
});