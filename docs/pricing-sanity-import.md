# Pricing Sanity Import

## Original Pricing Source

The live pricing data is currently stored in:

- `public/assets/js/pricing-data.js`

There is also a backup/source copy at:

- `assets/js/pricing-data.js`

The import script reads `public/assets/js/pricing-data.js` because that is the browser-facing data source currently used by the Astro pages. The old pricing source is kept as a backup and is not deleted.

## Sanity Schemas Used

The import writes to these Sanity document types:

- `pricingCategory`
- `pricingItem`

The schemas are defined in:

- `src/sanity/schemaTypes/pricingCategory.ts`
- `src/sanity/schemaTypes/pricingItem.ts`

## What The Import Does

The script is:

- `scripts/import-pricing-to-sanity.mjs`

It does the following:

1. Executes `public/assets/js/pricing-data.js` in a safe Node VM context.
2. Reads:
   - `window.GOLYN_PRICING_CATEGORIES`
   - `window.GOLYN_PRICING_HOME_CARDS`
   - `window.GOLYN_PRICING_ITEMS`
3. Creates all `pricingCategory` documents first.
4. Creates all `pricingItem` documents second.
5. Patches category `homeItems` references after items exist.
6. Uses stable document IDs, so running the import multiple times updates existing documents instead of creating duplicates.

Stable IDs:

- Category: `pricingCategory-{categoryKey}`
- Item: `pricingItem-{itemId}`

## Imported Counts

From the current pricing source, the script prepares:

- 4 pricing categories
- 26 pricing items

## How To Run

First, check the conversion without writing to Sanity:

```bash
npm run sanity:import-pricing -- --dry-run
```

To run the real import, create a Sanity API token with write access, then set it as an environment variable.

PowerShell:

```powershell
$env:SANITY_AUTH_TOKEN="your_sanity_write_token"
npm run sanity:import-pricing
```

The script also accepts `SANITY_API_TOKEN`.

If you are already logged in with the Sanity CLI, you can import without creating a token by generating JSON files and using `sanity documents create`:

```powershell
node scripts/import-pricing-to-sanity.mjs --write-files migrations/pricing-import
node .\node_modules\sanity\bin\sanity documents create migrations/pricing-import/pricing-categories.json --replace
node .\node_modules\sanity\bin\sanity documents create migrations/pricing-import/pricing-items.json --replace
node .\node_modules\sanity\bin\sanity documents create migrations/pricing-import/pricing-categories-with-home-items.json --replace
```

This preserves the required order:

1. categories first
2. items second
3. category home-card references last

Optional environment overrides:

- `PUBLIC_SANITY_PROJECT_ID` or `SANITY_PROJECT_ID`
- `PUBLIC_SANITY_DATASET` or `SANITY_DATASET`
- `PUBLIC_SANITY_API_VERSION` or `SANITY_API_VERSION`

Defaults used by the script:

- Project ID: `722zj1tf`
- Dataset: `production`
- API version: `2026-06-17`

## How To Verify In Sanity Studio

Open:

- `https://golyn-nail.sanity.studio/`

Then check:

1. Go to `Pricing Category`.
2. Confirm these categories exist:
   - `gel`
   - `extension`
   - `foot`
   - `options`
3. Go to `Pricing Item`.
4. Confirm the imported menu items exist, such as:
   - `gel-onecolor`
   - `gel-4art`
   - `ext-onecolor`
   - `foot-onecolor`
   - `off-own`
5. Open a pricing item and confirm:
   - category reference is set
   - order is preserved
   - regular price is present
   - campaign price is present where available
   - duration is present
   - translations are present

## How The Website Uses Sanity Pricing

The website now fetches pricing data from Sanity in:

- `src/lib/sanity.ts`

These pages pass the Sanity pricing data to the frontend:

- `src/pages/index.astro`
- `src/pages/price-detail.astro`

The frontend pricing renderer still loads:

- `public/assets/js/pricing-data.js`
- `public/assets/js/pricing-render.js`

But `pricing-data.js` now prefers `window.GOLYN_SANITY_PRICING_DATA` when available. If Sanity pricing data is missing or incomplete, it falls back to the old JS pricing source.

After importing or editing pricing in Sanity, rebuild/deploy the website so the static Astro pages fetch the latest published Sanity data.
