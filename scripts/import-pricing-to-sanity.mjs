import { createClient } from '@sanity/client';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const ROOT_DIR = process.cwd();
const SOURCE_FILE = path.join(ROOT_DIR, 'public', 'assets', 'js', 'pricing-data.js');
const PROJECT_ID = process.env.PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID || '722zj1tf';
const DATASET = process.env.PUBLIC_SANITY_DATASET || process.env.SANITY_DATASET || 'production';
const API_VERSION = process.env.PUBLIC_SANITY_API_VERSION || process.env.SANITY_API_VERSION || '2026-06-17';
const TOKEN = process.env.SANITY_AUTH_TOKEN || process.env.SANITY_API_TOKEN || '';
const DRY_RUN = process.argv.includes('--dry-run');
const WRITE_FILES_INDEX = process.argv.indexOf('--write-files');
const WRITE_FILES_DIR = WRITE_FILES_INDEX >= 0
  ? path.resolve(ROOT_DIR, process.argv[WRITE_FILES_INDEX + 1] || 'migrations/pricing-import')
  : '';

const LANGS = ['ja', 'en', 'vi', 'zh', 'ko', 'my', 'id'];

const HOME_CARD_COPY = {
  gel: {
    ja: { label: 'ベーシック', title: 'Gel Nail', description: 'ワンカラーからアートコースまで。韓国・ワンホン・ニュアンス対応。' },
    en: { label: 'Basic', title: 'Gel Nail', description: 'From one-color to art courses. Korean, Wanghong, and nuance styles available.' },
    vi: { label: 'Cơ bản', title: 'Gel Nail', description: 'Từ một màu đến course art. Có thể làm phong cách Hàn, Wanghong và nuance.' },
    zh: { label: '基础', title: '凝胶美甲', description: '从纯色到艺术套餐。支持韩系、网红与氛围款。' },
    ko: { label: '베이직', title: '젤 네일', description: '원컬러부터 아트 코스까지. 한국, 왕홍, 뉘앙스 스타일 가능.' },
    my: { label: 'Basic', title: 'Gel Nail', description: 'တစ်ရောင်မှ art course အထိ။ Korean, Wanghong, Nuance စတိုင်များရနိုင်သည်။' },
    id: { label: 'Dasar', title: 'Gel Nail', description: 'Dari satu warna hingga course art. Tersedia gaya Korea, Wanghong, dan nuance.' }
  },
  extension: {
    ja: { label: 'おすすめ', title: '長さ出し', description: '自然な長さ出しからロングネイルまで。華やかなデザインにも対応。' },
    en: { label: 'Popular', title: 'Nail Extension', description: 'From natural extensions to long nails. Glamorous designs are also available.' },
    vi: { label: 'Gợi ý', title: 'Nối móng', description: 'Từ nối móng tự nhiên đến móng dài. Có thể làm cả thiết kế nổi bật.' },
    zh: { label: '推荐', title: '延长美甲', description: '从自然延长到长款美甲。也支持华丽设计。' },
    ko: { label: '추천', title: '네일 연장', description: '자연스러운 연장부터 롱네일까지. 화려한 디자인도 가능.' },
    my: { label: 'အကြံပြု', title: 'Nail Extension', description: 'သဘာဝဆန်သော အရှည်တိုးခြင်းမှ လက်သည်းရှည်ဒီဇိုင်းအထိ ရနိုင်သည်။' },
    id: { label: 'Populer', title: 'Nail Extension', description: 'Dari extension natural hingga kuku panjang. Desain glamor juga tersedia.' }
  },
  foot: {
    ja: { label: 'フット・オフ', title: 'Foot & Off', description: 'フットネイルと付け替えオフの基本料金。' },
    en: { label: 'Foot & Off', title: 'Foot & Off', description: 'Basic pricing for foot nails and replacement removal.' },
    vi: { label: 'Foot & Off', title: 'Foot & Off', description: 'Giá cơ bản cho foot nail và tháo gel khi thay bộ mới.' },
    zh: { label: '足部・卸甲', title: 'Foot & Off', description: '足部美甲与换新卸甲的基础价格。' },
    ko: { label: '풋・제거', title: 'Foot & Off', description: '풋 네일과 교체 제거의 기본 가격입니다.' },
    my: { label: 'Foot & Off', title: 'Foot & Off', description: 'ခြေသည်းနှင့် gel ဖယ်ရှားခြင်းအတွက် အခြေခံစျေးနှုန်းများ။' },
    id: { label: 'Foot & Off', title: 'Foot & Off', description: 'Harga dasar untuk nail kaki dan pelepasan gel.' }
  }
};

function loadLegacyPricingData() {
  if (!fs.existsSync(SOURCE_FILE)) {
    throw new Error(`Pricing source not found: ${SOURCE_FILE}`);
  }

  const code = fs.readFileSync(SOURCE_FILE, 'utf8');
  const context = {
    window: {},
    console,
    document: undefined
  };
  vm.createContext(context);
  vm.runInContext(code, context, { filename: SOURCE_FILE });

  const categories = context.window.GOLYN_PRICING_CATEGORIES;
  const homeCards = context.window.GOLYN_PRICING_HOME_CARDS;
  const items = context.window.GOLYN_PRICING_ITEMS;

  if (!categories || !homeCards || !items) {
    throw new Error('Pricing source did not expose the expected GOLYN_PRICING_* globals.');
  }

  return { categories, homeCards, items };
}

function slug(value) {
  return { _type: 'slug', current: value };
}

function categoryId(key) {
  return `pricingCategory-${key}`;
}

function itemId(id) {
  return `pricingItem-${id}`;
}

function isNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

function splitPrice(value) {
  return isNumber(value)
    ? { numeric: value, text: undefined }
    : { numeric: undefined, text: value == null || value === '' ? undefined : String(value) };
}

function homeCardForCategory(homeCards, key) {
  return homeCards.find(card => card.category === key);
}

function localizedCategoryTranslations(key, category) {
  const copy = HOME_CARD_COPY[key] || {};
  return LANGS.reduce((acc, lang) => {
    const categoryTitle = category.translations?.[lang] || category.translations?.ja || category.label || key;
    acc[lang] = {
      label: copy[lang]?.label || category.label || '',
      title: copy[lang]?.title || categoryTitle,
      description: copy[lang]?.description || ''
    };
    return acc;
  }, {});
}

function localizedItemTranslations(item) {
  const source = item.translations || {};
  return LANGS.reduce((acc, lang) => {
    const ja = source.ja || {};
    const current = source[lang] || {};
    const merged = { ...ja, ...current };

    const translation = {
      name: merged.name || '',
      summaryName: current.summaryName || current.name || (lang === 'ja' ? ja.summaryName : ''),
      duration: merged.duration || item.duration || '',
      description: merged.description || '',
      note: merged.note || '',
      regularPriceText: isNumber(merged.originalPrice) ? undefined : merged.originalPrice,
      campaignPriceText: isNumber(merged.salePrice) ? undefined : merged.salePrice
    };

    Object.keys(translation).forEach(key => {
      if (translation[key] === undefined || translation[key] === '') delete translation[key];
    });

    acc[lang] = translation;
    return acc;
  }, {});
}

function buildCategoryDocs(pricing) {
  return Object.entries(pricing.categories).map(([key, category], index) => {
    const homeCard = homeCardForCategory(pricing.homeCards, key);
    const order = (index + 1) * 10;
    return {
      _id: categoryId(key),
      _type: 'pricingCategory',
      key: slug(key),
      title: HOME_CARD_COPY[key]?.ja?.title || category.translations?.ja || category.label || key,
      label: category.label || key,
      order,
      featured: category.featured === true,
      published: true,
      showOnHome: Boolean(homeCard),
      homeOrder: homeCard ? (pricing.homeCards.indexOf(homeCard) + 1) * 10 : order,
      translations: localizedCategoryTranslations(key, category)
    };
  });
}

function buildItemDocs(pricing) {
  const homeItemIds = new Set(pricing.homeCards.flatMap(card => card.itemIds || []));
  return pricing.items.map(item => {
    const regularPrice = splitPrice(item.originalPrice);
    const campaignPrice = splitPrice(item.salePrice);

    return {
      _id: itemId(item.id),
      _type: 'pricingItem',
      id: slug(item.id),
      category: { _type: 'reference', _ref: categoryId(item.category) },
      order: item.order || 999,
      published: true,
      showOnHome: item.home === true || homeItemIds.has(item.id),
      regularPrice: regularPrice.numeric,
      regularPriceText: regularPrice.text,
      campaignEnabled: item.saleActive === true,
      campaignPrice: campaignPrice.numeric,
      campaignPriceText: campaignPrice.text,
      duration: item.duration || '',
      noteType: item.note || '',
      translations: localizedItemTranslations(item)
    };
  });
}

function categoryHomeItemPatches(pricing) {
  return pricing.homeCards
    .filter(card => card.category && Array.isArray(card.itemIds))
    .map(card => ({
      id: categoryId(card.category),
      homeItems: card.itemIds.map(id => ({
        _key: id.replace(/[^A-Za-z0-9_-]/g, '-'),
        _type: 'reference',
        _ref: itemId(id)
      }))
    }));
}

function withCategoryHomeItems(categoryDocs, pricing) {
  const patchesById = new Map(categoryHomeItemPatches(pricing).map(patch => [patch.id, patch.homeItems]));
  return categoryDocs.map(doc => ({
    ...doc,
    homeItems: patchesById.get(doc._id) || []
  }));
}

function writeImportFiles(categoryDocs, itemDocs, categoryDocsWithHomeItems) {
  fs.mkdirSync(WRITE_FILES_DIR, { recursive: true });
  const files = {
    categories: path.join(WRITE_FILES_DIR, 'pricing-categories.json'),
    items: path.join(WRITE_FILES_DIR, 'pricing-items.json'),
    categoriesWithHomeItems: path.join(WRITE_FILES_DIR, 'pricing-categories-with-home-items.json')
  };

  fs.writeFileSync(files.categories, `${JSON.stringify(categoryDocs, null, 2)}\n`);
  fs.writeFileSync(files.items, `${JSON.stringify(itemDocs, null, 2)}\n`);
  fs.writeFileSync(files.categoriesWithHomeItems, `${JSON.stringify(categoryDocsWithHomeItems, null, 2)}\n`);

  console.log('Wrote import files:');
  Object.values(files).forEach(file => console.log(`- ${path.relative(ROOT_DIR, file)}`));
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

async function commitInBatches(client, docs, label) {
  const batchSize = 25;
  for (let index = 0; index < docs.length; index += batchSize) {
    const batch = docs.slice(index, index + batchSize);
    const transaction = client.transaction();
    batch.forEach(doc => transaction.createOrReplace(doc));
    await transaction.commit();
    console.log(`Imported ${Math.min(index + batch.length, docs.length)}/${docs.length} ${label}.`);
  }
}

async function run() {
  const pricing = loadLegacyPricingData();
  const categoryDocs = buildCategoryDocs(pricing);
  const itemDocs = buildItemDocs(pricing);
  const categoryDocsWithHomeItems = withCategoryHomeItems(categoryDocs, pricing);
  const homeItemPatches = categoryHomeItemPatches(pricing);

  console.log(`Pricing source: ${path.relative(ROOT_DIR, SOURCE_FILE)}`);
  console.log(`Categories prepared: ${categoryDocs.length}`);
  console.log(`Pricing items prepared: ${itemDocs.length}`);

  if (DRY_RUN) {
    console.log('Dry run only. No Sanity documents were written.');
    console.log(JSON.stringify({
      categories: categoryDocs.map(doc => ({ _id: doc._id, key: doc.key.current, order: doc.order })),
      items: itemDocs.map(doc => ({ _id: doc._id, id: doc.id.current, category: doc.category._ref, order: doc.order }))
    }, null, 2));
    return;
  }

  if (WRITE_FILES_DIR) {
    writeImportFiles(categoryDocs, itemDocs, categoryDocsWithHomeItems);
    return;
  }

  const client = createClientForImport();
  await commitInBatches(client, categoryDocs, 'pricing categories');
  await commitInBatches(client, itemDocs, 'pricing items');

  for (const patch of homeItemPatches) {
    await client.patch(patch.id).set({ homeItems: patch.homeItems }).commit();
  }

  console.log(`Linked home card items for ${homeItemPatches.length} pricing categories.`);
  console.log('Pricing import complete.');
}

run().catch(error => {
  console.error(error.message || error);
  process.exit(1);
});
