import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://golynnail.jp',
  output: 'static',
  trailingSlash: 'always',
  integrations: [
    sitemap()
  ]
});
