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

function toLegacyBlogPost(post: any): LegacyBlogPost {
  const slug = post.slug || post._id || '';
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
