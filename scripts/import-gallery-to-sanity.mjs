import { createClient } from '@sanity/client';
import fs from 'node:fs';
import path from 'node:path';
import { Readable } from 'node:stream';

const ROOT_DIR = process.cwd();
const SOURCE_FILE = path.join(ROOT_DIR, 'content', 'gallery', 'gallery.json');
const PROJECT_ID = process.env.PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID || '722zj1tf';
const DATASET = process.env.PUBLIC_SANITY_DATASET || process.env.SANITY_DATASET || 'production';
const API_VERSION = process.env.PUBLIC_SANITY_API_VERSION || process.env.SANITY_API_VERSION || '2026-06-17';
const TOKEN = process.env.SANITY_AUTH_TOKEN || process.env.SANITY_API_TOKEN || '';
const DRY_RUN = process.argv.includes('--dry-run');
const FORCE_ASSETS = process.argv.includes('--force-assets');

function slugify(value) {
  return String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function sourceValue(item) {
  return String(item.image || item.src || '').trim();
}

function basenameFromSource(source) {
  try {
    const parsed = new URL(source);
    return path.basename(parsed.pathname);
  } catch {
    return path.basename(source);
  }
}

function documentId(item, index) {
  const source = sourceValue(item);
  const base = slugify(path.parse(basenameFromSource(source)).name);
  const title = slugify(item.title || item.label || item.alt);
  return `galleryImage-${String(item.order || index + 1).padStart(3, '0')}-${base || title || `item-${index + 1}`}`;
}

function cleanTags(item) {
  const tags = Array.isArray(item.tags)
    ? item.tags
    : item.tags
      ? String(item.tags).split(',')
      : [];
  return Array.from(new Set(tags.map(tag => String(tag).trim()).filter(Boolean)));
}

function resolveLocalPath(source) {
  const normalized = source.replace(/^\//, '').replace(/^\.\//, '');
  const candidates = [
    path.join(ROOT_DIR, 'public', normalized),
    path.join(ROOT_DIR, normalized)
  ];
  return candidates.find(candidate => fs.existsSync(candidate));
}

function createClientForImport() {
  if (!TOKEN) {
    throw new Error('Missing SANITY_AUTH_TOKEN or SANITY_API_TOKEN. Create a Sanity token with write access and set it before running this import.');
  }

  return createClient({
    projectId: PROJECT_ID,
    dataset: DATASET,
    apiVersion: API_VERSION,
    token: TOKEN,
    useCdn: false
  });
}

async function existingImageRef(client, id) {
  if (FORCE_ASSETS) return null;
  const doc = await client.fetch('*[_id == $id][0]{image}', { id });
  return doc?.image?.asset?._ref || null;
}

async function uploadLocalImage(client, source, filename) {
  const localPath = resolveLocalPath(source);
  if (!localPath) throw new Error(`Local gallery image not found: ${source}`);
  return client.assets.upload('image', fs.createReadStream(localPath), { filename });
}

async function uploadRemoteImage(client, source, filename) {
  const response = await fetch(source);
  if (!response.ok) throw new Error(`Failed to fetch remote image ${source}: ${response.status}`);
  const buffer = Buffer.from(await response.arrayBuffer());
  return client.assets.upload('image', Readable.from(buffer), {
    filename,
    contentType: response.headers.get('content-type') || undefined
  });
}

async function uploadImage(client, item) {
  const source = sourceValue(item);
  const filename = basenameFromSource(source) || `${slugify(item.title || item.label || 'gallery-image')}.jpg`;
  return /^https?:\/\//i.test(source)
    ? uploadRemoteImage(client, source, filename)
    : uploadLocalImage(client, source, filename);
}

function buildDocument(item, index, assetRef = null) {
  const source = sourceValue(item);
  const title = item.title || item.label || item.alt || `Gallery Image ${index + 1}`;

  return {
    _id: documentId(item, index),
    _type: 'galleryImage',
    title,
    image: assetRef
      ? {
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: assetRef
          }
        }
      : undefined,
    alt: item.alt || title,
    category: item.category || 'simple',
    tags: cleanTags(item),
    description: item.description || item.tag || '',
    order: Number.isFinite(Number(item.order)) ? Number(item.order) : index + 1,
    published: item.published !== false,
    sourcePath: source
  };
}

function galleryItems() {
  const galleryData = JSON.parse(fs.readFileSync(SOURCE_FILE, 'utf8'));
  const images = Array.isArray(galleryData) ? galleryData : galleryData.images;
  return Array.isArray(images) ? images : [];
}

async function run() {
  const items = galleryItems();
  const prepared = items.map((item, index) => buildDocument(item, index));

  console.log(`Gallery source: content/gallery/gallery.json`);
  console.log(`Gallery documents prepared: ${prepared.length}`);

  if (DRY_RUN) {
    console.log('Dry run only. No Sanity documents or assets were written.');
    console.log(JSON.stringify(prepared.map(doc => ({
      _id: doc._id,
      title: doc.title,
      category: doc.category,
      order: doc.order,
      source: doc.sourcePath
    })), null, 2));
    return;
  }

  const client = createClientForImport();
  let uploadedAssets = 0;
  let reusedAssets = 0;

  for (let index = 0; index < items.length; index += 1) {
    const item = items[index];
    const id = documentId(item, index);
    let assetRef = await existingImageRef(client, id);

    if (assetRef) {
      reusedAssets += 1;
    } else {
      const asset = await uploadImage(client, item);
      assetRef = asset._id;
      uploadedAssets += 1;
    }

    const doc = buildDocument(item, index, assetRef);
    await client.createOrReplace(doc);
    console.log(`Imported ${index + 1}/${items.length}: ${doc.title}`);
  }

  console.log(`Gallery import complete. Documents: ${items.length}. Uploaded assets: ${uploadedAssets}. Reused assets: ${reusedAssets}.`);
}

run().catch(error => {
  console.error(error.message || error);
  process.exit(1);
});
