# Astro migration notes

Current target: Cloudflare Pages static deployment.

Cloudflare Pages settings:

- Build command: `npm run build`
- Output directory: `dist`
- Node version: `20` or newer

Notes:

- Content editing has moved to Sanity Studio.
- Legacy data is still copied into the Astro build from `public/content`, `public/assets`, and `public/images`.
- Sanity is now the active CMS for editable content.
