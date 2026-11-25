import { salonTranslations, mapUrl, mapEmbedUrl } from './salon';

// Add each future branch here with its own photos, translated information and map links.
export const stores = [
  {
    slug: 'shinsaibashi',
    name: '心斎橋店',
    nameKey: 'store_shinsaibashi',
    photos: [
      '/images/stores/shinsaibashi-interior.jpg',
      '/images/stores/shinsaibashi-seating.jpg',
      '/images/stores/shinsaibashi-sign.jpg'
    ],
    translations: salonTranslations,
    mapUrl,
    mapEmbedUrl,
    phone: '070-8836-6688',
    phoneHref: 'tel:07088366688',
    reservationUrl: 'https://www.instagram.com/golynnail?igsh=MWhoNmR1NXV1dnFmcg%3D%3D&utm_source=qr'
  }
];
