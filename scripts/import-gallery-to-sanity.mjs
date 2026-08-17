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
const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif']);

function argValue(name, fallback = '') {
  const prefix = `--${name}=`;
  const inline = process.argv.find(arg => arg.startsWith(prefix));
  if (inline) return inline.slice(prefix.length);
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] || fallback : fallback;
}

const SOURCE_FOLDER = argValue('folder') || argValue('dir');
const IMPORT_CATEGORY = argValue('category', 'simple');
const IMPORT_TAGS = argValue('tags', IMPORT_CATEGORY);
const START_ORDER = Number.parseInt(argValue('start-order', '1'), 10);
const TITLE_PREFIX = argValue('title-prefix');

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
  return String(item.localPath || item.image || item.src || '').trim();
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
  if (path.isAbsolute(source) && fs.existsSync(source)) return source;
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
    sourcePath: item.sourcePath || source
  };
}

function titleFromFilename(filename) {
  const base = path.parse(filename).name;
  const words = base
    .replace(/^\d+[-_\s.]*/, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return words
    ? words.replace(/\b\w/g, letter => letter.toUpperCase())
    : base;
}

function folderGalleryItems() {
  const folder = path.resolve(ROOT_DIR, SOURCE_FOLDER);
  if (!fs.existsSync(folder)) {
    throw new Error(`Gallery import folder not found: ${folder}`);
  }

  const tags = IMPORT_TAGS
    ? IMPORT_TAGS.split(',').map(tag => tag.trim()).filter(Boolean)
    : [];
  const files = fs.readdirSync(folder, { withFileTypes: true })
    .filter(entry => entry.isFile() && IMAGE_EXTENSIONS.has(path.extname(entry.name).toLowerCase()))
    .map(entry => entry.name)
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

  return files.map((filename, index) => {
    const order = Number.isFinite(START_ORDER) ? START_ORDER + index : index + 1;
    const title = `${TITLE_PREFIX ? `${TITLE_PREFIX} ` : ''}${titleFromFilename(filename)}`.trim();
    return {
      localPath: path.join(folder, filename),
      sourcePath: `folder-import:${filename}`,
      title,
      label: title,
      alt: `${title} nail design`,
      category: IMPORT_CATEGORY,
      tags,
      order,
      published: true
    };
  });
}

function jsonGalleryItems() {
  const galleryData = JSON.parse(fs.readFileSync(SOURCE_FILE, 'utf8'));
  const images = Array.isArray(galleryData) ? galleryData : galleryData.images;
  return Array.isArray(images) ? images : [];
}

function galleryItems() {
  return SOURCE_FOLDER ? folderGalleryItems() : jsonGalleryItems();
}

async function run() {
  const items = galleryItems();
  const prepared = items.map((item, index) => buildDocument(item, index));

  console.log(`Gallery source: ${SOURCE_FOLDER ? path.resolve(ROOT_DIR, SOURCE_FOLDER) : 'content/gallery/gallery.json'}`);
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
