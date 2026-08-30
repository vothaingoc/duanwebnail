import { createClient } from '@sanity/client';
import { toHTML } from '@portabletext/to-html';
import blogData from '../../content/blog/articles.json';
import galleryData from '../../content/gallery/gallery.json';

const projectId = import.meta.env.PUBLIC_SANITY_PROJECT_ID;
const dataset = import.meta.env.PUBLIC_SANITY_DATASET || 'production';
const apiVersion = import.meta.env.PUBLIC_SANITY_API_VERSION || '2026-06-17';

export function isSanityConfigured() {
  return Boolean(projectId && dataset && apiVersion);
}

export const sanityClient = isSanityConfigured()
  ? createClient({
      projectId,
      dataset,
      apiVersion,
      useCdn: false,
      perspective: 'published'
    })
  : null;

const blogListQuery = `*[_type == "blogPost"] | order(publishedAt desc) {
  _id,
  title,
  "slug": slug.current,
  excerpt,
  "mainImageUrl": mainImage.asset->url,
  publishedAt,
  tag,
  tags,
  body,
  seoTitle,
  seoDescription
}`;

const blogDetailQuery = `*[_type == "blogPost" && slug.current == $slug][0] {
  _id,
  title,
  "slug": slug.current,
  excerpt,
  "mainImageUrl": mainImage.asset->url,
  publishedAt,
  tag,
  tags,
  body,
  seoTitle,
  seoDescription
}`;

const galleryQuery = `*[_type == "galleryImage" && published != false] | order(order asc, _createdAt desc) {
  _id,
  title,
  "imageUrl": image.asset->url,
  alt,
  category,
  tags,
  description,
  order,
  published
}`;

const pricingCampaignQuery = `*[_type == "pricingCampaign"] | order(_updatedAt desc)[0] {
  _id,
  name,
  active,
  startsAt,
  endsAt
}`;

const pricingCategoryQuery = `*[_type == "pricingCategory" && published != false] | order(coalesce(order, 999) asc, _createdAt asc) {
  _id,
  "key": key.current,
  title,
  label,
  order,
  featured,
  showOnHome,
  homeOrder,
  translations,
  "homeItems": homeItems[]->{
    _id,
    "id": id.current
  }
}`;

const pricingItemQuery = `*[_type == "pricingItem" && published != false && defined(category->_id)] | order(category->order asc, coalesce(order, 999) asc, _createdAt asc) {
  _id,
  "id": id.current,
  "category": category->key.current,
  order,
  showOnHome,
  regularPrice,
  regularPriceText,
  campaignEnabled,
  campaignPrice,
  campaignPriceText,
  duration,
  noteType,
  translations
}`;

const staffListQuery = `*[_type == "staffMember" && published == true] | order(coalesce(order, 999) asc, _createdAt asc) {
  _id,
  name,
  "slug": slug.current,
  position,
  experience,
  specialty,
  certifications,
  "photo": photo.asset->url,
  introduction,
  selfIntroduction,
  "gallery": gallery[].asset->url,
  order,
  published
}`;

const staffDetailQuery = `*[_type == "staffMember" && published == true && slug.current == $slug][0] {
  _id,
  name,
  "slug": slug.current,
  position,
  experience,
  specialty,
  certifications,
  "photo": photo.asset->url,
  introduction,
  selfIntroduction,
  "gallery": gallery[].asset->url,
  order,
  published
}`;

type LegacyBlogPost = {
  id?: string;
  slug?: string;
  lang?: string;
  date?: string;
  tag?: string;
  title?: string;
  desc?: string;
  excerpt?: string;
  image?: string;
  featuredImage?: string;
  content?: string;
  body?: string;
  html?: string;
  seoTitle?: string;
  seoDescription?: string;
};

type LegacyGalleryImage = {
  src?: string;
  image?: string;
  label?: string;
  title?: string;
  alt?: string;
  tag?: string;
  category?: string;
  tags?: string[];
  description?: string;
  order?: number;
  featured?: boolean;
  createdAt?: string;
};

export type PricingCampaign = {
  active: boolean;
  source: 'sanity';
  name: string;
  startsAt: string | null;
  endsAt: string | null;
};

export type PricingData = {
  source: 'sanity';
  langs: string[];
  categories: Record<string, any>;
  homeCards: any[];
  items: any[];
};

export type StaffMember = {
  slug: string;
  name: string;
  position: string;
  experience: string;
  specialty: string;
  certifications: string[];
  photo: string;
  introduction: string;
  selfIntroduction: string;
  gallery: string[];
  order: number;
};

function legacyBlogPosts(): LegacyBlogPost[] {
  const articles = Array.isArray(blogData) ? blogData : blogData.articles;
  return Array.isArray(articles) ? articles : [];
}

function legacyGalleryImages(): LegacyGalleryImage[] {
  const images = Array.isArray(galleryData) ? galleryData : galleryData.images;
  return Array.isArray(images) ? images : [];
}

function portableTextToHtml(body: unknown) {
  if (!Array.isArray(body) || body.length === 0) return '';
  return toHTML(body);
}

function formatDate(value: string | undefined) {
  return value ? value.slice(0, 10) : '';
}

function slugify(value: string | undefined) {
  return String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 96);
}

function toLegacyBlogPost(post: any): LegacyBlogPost {
  const slug = post.slug || slugify(post.title) || post._id || '';
  return {
    id: slug,
    slug,
    lang: 'ja',
    date: formatDate(post.publishedAt),
    tag: post.tag || (Array.isArray(post.tags) ? post.tags[0] : '') || 'Blog',
    title: post.title || '',
    desc: post.excerpt || post.seoDescription || '',
    excerpt: post.excerpt || post.seoDescription || '',
    image: post.mainImageUrl || '',
    featuredImage: post.mainImageUrl || '',
    body: '',
    content: '',
    html: portableTextToHtml(post.body),
    seoTitle: post.seoTitle || '',
    seoDescription: post.seoDescription || ''
  };
}

function toLegacyGalleryImage(item: any): LegacyGalleryImage {
  const title = item.title || '';
  const image = item.imageUrl || '';
  return {
    title,
    label: title,
    alt: item.alt || title,
    tag: Array.isArray(item.tags) ? item.tags[0] : '',
    category: item.category || 'simple',
    tags: Array.isArray(item.tags) ? item.tags : [],
    description: item.description || '',
    order: typeof item.order === 'number' ? item.order : 999,
    featured: false,
    image,
    src: image
  };
}

function toPricingCampaign(item: any): PricingCampaign | null {
  if (!item || typeof item.active !== 'boolean') return null;
  return {
    active: item.active,
    source: 'sanity',
    name: item.name || 'Limited-time campaign',
    startsAt: item.startsAt || null,
    endsAt: item.endsAt || null
  };
}

const pricingLangs = ['ja', 'en', 'vi', 'zh', 'ko', 'my', 'id'];

function priceValue(textValue: string | undefined, numericValue: number | undefined) {
  if (textValue) return textValue;
  return typeof numericValue === 'number' ? numericValue : null;
}

function localizedPricingObject(translations: any, fallback: any = {}) {
  const source = translations || {};
  return pricingLangs.reduce<Record<string, any>>((acc, lang) => {
    acc[lang] = {
      ...(fallback || {}),
      ...(source.ja || {}),
      ...(source[lang] || {})
    };
    return acc;
  }, {});
}

function localizedPricingItemObject(translations: any, fallback: any = {}) {
  const source = translations || {};
  return pricingLangs.reduce<Record<string, any>>((acc, lang) => {
    const ja = source.ja || {};
    const current = source[lang] || {};
    const merged = {
      ...(fallback || {}),
      ...ja,
      ...current
    };
    if (current.name && (!current.summaryName || (lang !== 'ja' && current.summaryName === ja.summaryName))) {
      merged.summaryName = current.name;
    }
    acc[lang] = merged;
    return acc;
  }, {});
}

function toPricingData(categories: any[], items: any[]): PricingData | null {
  const validCategories = Array.isArray(categories) ? categories.filter(item => item?.key) : [];
  const validItems = Array.isArray(items) ? items.filter(item => item?.id && item?.category) : [];
  if (!validCategories.length || !validItems.length) return null;

  const normalizedItems = validItems.map(item => ({
    id: item.id,
    category: item.category,
    order: typeof item.order === 'number' ? item.order : 999,
    originalPrice: priceValue(item.regularPriceText, item.regularPrice),
    saleActive: item.campaignEnabled === true,
    salePrice: priceValue(item.campaignPriceText, item.campaignPrice),
    duration: item.duration || '',
    note: item.noteType || '',
    home: item.showOnHome === true,
    translations: localizedPricingItemObject(item.translations, {
      duration: item.duration || '',
      originalPrice: priceValue(item.regularPriceText, item.regularPrice),
      salePrice: priceValue(item.campaignPriceText, item.campaignPrice)
    })
  }));

  const categoriesByKey = validCategories.reduce<Record<string, any>>((acc, category) => {
    acc[category.key] = {
      label: category.label || category.title || category.key,
      featured: category.featured === true,
      translations: pricingLangs.reduce<Record<string, string>>((translationAcc, lang) => {
        const value = category.translations?.[lang]?.title || category.translations?.ja?.title || category.title || category.key;
        translationAcc[lang] = value;
        return translationAcc;
      }, {})
    };
    return acc;
  }, {});

  const homeCards = validCategories
    .filter(category => category.showOnHome === true)
    .sort((a, b) => (a.homeOrder || a.order || 999) - (b.homeOrder || b.order || 999))
    .map((category, index) => {
      const selectedIds = Array.isArray(category.homeItems)
        ? category.homeItems.map((item: any) => item?.id).filter(Boolean)
        : [];
      const itemIds = selectedIds.length
        ? selectedIds
        : normalizedItems
            .filter(item => item.category === category.key && item.home)
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .map(item => item.id);

      return {
        category: category.key,
        delay: index ? `.${index}s` : '',
        itemIds,
        translations: localizedPricingObject(category.translations, {
          label: category.label || '',
          title: category.title || category.key,
          description: ''
        })
      };
    })
    .filter(card => card.itemIds.length);

  return {
    source: 'sanity',
    langs: pricingLangs,
    categories: categoriesByKey,
    homeCards,
    items: normalizedItems
  };
}

function toStaffMember(item: any): StaffMember | null {
  const slug = item?.slug || '';
  const name = item?.name || '';
  const photo = item?.photo || '';
  if (!slug || !name || !photo) return null;
  return {
    slug,
    name,
    position: item.position || '',
    experience: item.experience || '',
    specialty: item.specialty || '',
    certifications: Array.isArray(item.certifications) ? item.certifications.filter(Boolean) : [],
    photo,
    introduction: item.introduction || '',
    selfIntroduction: item.selfIntroduction || item.introduction || '',
    gallery: Array.isArray(item.gallery) ? item.gallery.filter(Boolean) : [],
    order: typeof item.order === 'number' ? item.order : 999
  };
}

export async function getSanityBlogPosts(): Promise<LegacyBlogPost[]> {
  if (!sanityClient) {
    console.log('[Sanity] Blog: ENV not configured, using JSON fallback.');
    return [];
  }
  const posts = await sanityClient.fetch(blogListQuery);
  console.log(`[Sanity] Blog: fetched ${Array.isArray(posts) ? posts.length : 0} post(s).`);
  return Array.isArray(posts) ? posts.map(toLegacyBlogPost) : [];
}

export async function getSanityBlogPostBySlug(slug: string): Promise<LegacyBlogPost | null> {
  if (!sanityClient || !slug) {
    console.log(`[Sanity] Blog detail: ENV not configured or empty slug "${slug}", using JSON fallback.`);
    return null;
  }
  const post = await sanityClient.fetch(blogDetailQuery, { slug });
  console.log(`[Sanity] Blog detail: slug "${slug}" ${post ? 'found' : 'not found'}.`);
  return post ? toLegacyBlogPost(post) : null;
}

export async function getSanityGallery(): Promise<LegacyGalleryImage[]> {
  if (!sanityClient) return [];
  const items = await sanityClient.fetch(galleryQuery);
  return Array.isArray(items) ? items.map(toLegacyGalleryImage) : [];
}

export async function getSanityPricingCampaign(): Promise<PricingCampaign | null> {
  if (!sanityClient) {
    console.log('[Sanity] Pricing campaign: ENV not configured, using JS fallback.');
    return null;
  }
  const campaign = await sanityClient.fetch(pricingCampaignQuery);
  const normalized = toPricingCampaign(campaign);
  console.log(`[Sanity] Pricing campaign: ${normalized ? `fetched active=${normalized.active}` : 'no document found'}.`);
  return normalized;
}

export async function getSanityPricingData(): Promise<PricingData | null> {
  if (!sanityClient) {
    console.log('[Sanity] Pricing data: ENV not configured, using JS fallback.');
    return null;
  }
  const [categories, items] = await Promise.all([
    sanityClient.fetch(pricingCategoryQuery),
    sanityClient.fetch(pricingItemQuery)
  ]);
  const normalized = toPricingData(categories, items);
  console.log(`[Sanity] Pricing data: ${normalized ? `fetched ${Object.keys(normalized.categories).length} category/categories and ${normalized.items.length} item(s)` : 'no complete pricing data found'}.`);
  return normalized;
}

export async function getSanityStaffMembers(): Promise<StaffMember[]> {
  if (!sanityClient) {
    console.log('[Sanity] Staff: ENV not configured.');
    return [];
  }
  const items = await sanityClient.fetch(staffListQuery);
  return Array.isArray(items) ? items.map(toStaffMember).filter(Boolean) : [];
}

export async function getSanityStaffMemberBySlug(slug: string): Promise<StaffMember | null> {
  if (!sanityClient || !slug) return null;
  const item = await sanityClient.fetch(staffDetailQuery, { slug });
  return toStaffMember(item);
}

export async function getBlogPostsWithFallback() {
  try {
    const posts = await getSanityBlogPosts();
    if (posts.length) return posts;
    console.log(`[Sanity] Blog: no Sanity posts, using ${legacyBlogPosts().length} JSON fallback post(s).`);
  } catch (error) {
    console.warn('Sanity blog fallback:', error);
  }
  return legacyBlogPosts();
}

export async function getBlogPostBySlugWithFallback(slug: string) {
  try {
    const post = await getSanityBlogPostBySlug(slug);
    if (post) return post;
  } catch (error) {
    console.warn('Sanity blog detail fallback:', error);
  }
  return legacyBlogPosts().find(post => post.slug === slug || post.id === slug) || null;
}

export async function getGalleryWithFallback() {
  try {
    const items = await getSanityGallery();
    if (items.length) return items;
  } catch (error) {
    console.warn('Sanity gallery fallback:', error);
  }
  return legacyGalleryImages();
}

export async function getPricingCampaignOverride() {
  try {
    return await getSanityPricingCampaign();
  } catch (error) {
    console.warn('Sanity pricing campaign fallback:', error);
  }
  return null;
}

export async function getPricingDataOverride() {
  try {
    return await getSanityPricingData();
  } catch (error) {
    console.warn('Sanity pricing data fallback:', error);
  }
  return null;
}

export async function getStaffMembers() {
  try {
    return await getSanityStaffMembers();
  } catch (error) {
    console.warn('Sanity staff fallback:', error);
  }
  return [];
}

export async function getStaffMemberBySlug(slug: string) {
  try {
    return await getSanityStaffMemberBySlug(slug);
  } catch (error) {
    console.warn('Sanity staff detail fallback:', error);
  }
  return null;
}
