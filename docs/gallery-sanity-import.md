# Gallery Sanity Import

## Why Gallery Image Is Empty In Studio

The website currently has gallery images because it can fall back to local/static content.

Current gallery source:

- `content/gallery/gallery.json`
- `public/content/gallery/gallery.json`
- `public/images/nail1.jpg` through `public/images/nail11.jpg`
- a few external image URLs referenced inside the JSON

Sanity Studio is empty because those gallery entries were not previously imported as `galleryImage` documents.

## Where Images Will Be Stored Later

After import, and for all future uploads from Sanity Studio, images are stored in:

- Sanity Assets for project `722zj1tf`
- dataset `production`
- served through Sanity's image CDN

The old local images remain in the repository as a backup. They are not deleted.

## Import Script

Script:

- `scripts/import-gallery-to-sanity.mjs`

NPM command:

```bash
npm run sanity:import-gallery
```

The script:

1. Reads `content/gallery/gallery.json`.
2. Uploads local images from `public/images/...` to Sanity Assets.
3. Downloads external image URLs and uploads them to Sanity Assets.
4. Creates `galleryImage` documents.
5. Preserves title, alt text, category, tags, order, published state, and original source path.
6. Uses stable document IDs to avoid duplicate documents.
7. Reuses existing uploaded image assets when run again, unless `--force-assets` is passed.

Stable document ID format:

```text
galleryImage-{order}-{image-basename}
```

## Counts

Current source prepares:

- 13 gallery image documents

## Dry Run

Check what will be imported without writing to Sanity:

```powershell
npm.cmd run sanity:import-gallery -- --dry-run
```

## Real Import

Create a Sanity API token with write access and set it as an environment variable.

PowerShell:

```powershell
$env:SANITY_AUTH_TOKEN="your_sanity_write_token"
npm.cmd run sanity:import-gallery
```

The script also accepts:

- `SANITY_API_TOKEN`

Optional environment overrides:

- `PUBLIC_SANITY_PROJECT_ID` or `SANITY_PROJECT_ID`
- `PUBLIC_SANITY_DATASET` or `SANITY_DATASET`
- `PUBLIC_SANITY_API_VERSION` or `SANITY_API_VERSION`

Defaults:

- Project ID: `722zj1tf`
- Dataset: `production`
- API version: `2026-06-17`

## Verify In Sanity Studio

Open:

- `https://golyn-nail.sanity.studio/`

Then:

1. Go to `Gallery Image`.
2. Confirm imported documents appear.
3. Open one document.
4. Confirm the image preview, category, tags, order, and published field.

After import, rebuild/deploy the website so Astro fetches the published Sanity gallery documents instead of using the local fallback.

## Fast Folder Import

Use this when you have many images, for example 96 photos from one shoot.

1. Put all photos in one folder, for example:

```text
C:\Users\thai ngoc\Desktop\golyn-upload\valentine
```

2. Dry run first:

```powershell
npm.cmd run sanity:import-gallery-folder -- "C:\Users\thai ngoc\Desktop\golyn-upload\valentine" --category valentine --tags valentine,seasonal --start-order 100 --title-prefix Valentine --dry-run
```

3. Real import:

```powershell
$env:SANITY_AUTH_TOKEN="your_sanity_write_token"
npm.cmd run sanity:import-gallery-folder -- "C:\Users\thai ngoc\Desktop\golyn-upload\valentine" --category valentine --tags valentine,seasonal --start-order 100 --title-prefix Valentine
```

Options:

- `--category valentine`: sets the Gallery Image category for all photos.
- `--tags valentine,seasonal`: adds tags for filtering/searching.
- `--start-order 100`: first order number. The next images become 101, 102, and so on.
- `--title-prefix Valentine`: adds a prefix to generated titles.
- `--force-assets`: uploads image assets again instead of reusing existing document assets.

Supported image formats:

- `.jpg`
- `.jpeg`
- `.png`
- `.webp`
- `.avif`
