export type BusinessLocation = {
  address: string | null;
  nearestStation: string | null;
  mapUrl: string | null;
  latitude: number | null;
  longitude: number | null;
};

export const business = {
  name: 'Golyn Nail',
  japaneseName: 'ゴーリンネイル',
  siteUrl: 'https://golynnail.jp',
  serviceArea: '大阪',
  logo: '/images/golyn-logo.jpg',
  socialImage: '/images/nail1.jpg',
  telephone: null as string | null,
  openingHours: null as string[] | null,
  location: {
    address: null,
    nearestStation: null,
    mapUrl: null,
    latitude: null,
    longitude: null,
  } satisfies BusinessLocation,
  socials: {
    instagram: 'https://www.instagram.com/golynnail/',
    facebook: 'https://www.facebook.com/people/Golyn-Nail/61585820682024/',
    tiktok: 'https://www.tiktok.com/@golynnail',
    line: null as string | null,
  },
} as const;

export const locationAnnouncement =
  '店舗住所はオープン準備が整い次第、当サイトおよび公式SNSにてお知らせいたします。';

export const officialSocialUrls = Object.values(business.socials).filter(
  (url): url is string => Boolean(url),
);
