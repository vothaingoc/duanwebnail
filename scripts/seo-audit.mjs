import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

const dist = resolve(process.cwd(), 'dist');
const requiredRoutes = ['/', '/gallery/', '/price/', '/services/', '/staff/', '/access/', '/reservation/', '/news/'];
const forbidden = [
  'Namba Osaka', '九条', '大阪随一', '大阪で一番', 'Admin Login', 'Quản Lý Blog',
  'Nhập mật khẩu admin', 'Thêm bài viết', 'Test Sanity Blog', 'quản trị viên', 'card giới thiệu', 'chủ quán',
];
const errors = [];

function routeFile(route) {
  return route === '/' ? join(dist, 'index.html') : join(dist, route, 'index.html');
}

function htmlFiles(directory) {
  return readdirSync(directory).flatMap((name) => {
    const file = join(directory, name);
    return statSync(file).isDirectory() ? htmlFiles(file) : (name.endsWith('.html') ? [file] : []);
  });
}

function match(html, pattern) {
  return html.match(pattern)?.[1]?.trim() || '';
}

for (const route of requiredRoutes) {
  const file = routeFile(route);
  if (!existsSync(file)) {
    errors.push(`Missing required route: ${route}`);
    continue;
  }
  const html = readFileSync(file, 'utf8');
  const title = match(html, /<title>([\s\S]*?)<\/title>/i);
  const description = match(html, /<meta\s+name="description"\s+content="([^"]+)"/i);
  const canonical = match(html, /<link\s+rel="canonical"\s+href="([^"]+)"/i);
  const h1Count = (html.match(/<h1(?:\s[^>]*)?>/gi) || []).length;
  if (!title) errors.push(`${route}: missing title`);
  if (!description) errors.push(`${route}: missing meta description`);
  if (canonical !== `https://golynnail.jp${route}`) errors.push(`${route}: incorrect canonical (${canonical})`);
  if (h1Count !== 1) errors.push(`${route}: expected one H1, found ${h1Count}`);
}

for (const file of htmlFiles(dist)) {
  const html = readFileSync(file, 'utf8');
  for (const value of forbidden) if (html.toLowerCase().includes(value.toLowerCase())) errors.push(`${file}: forbidden public content "${value}"`);
  for (const tag of html.match(/<img\b[^>]*>/gi) || []) if (!/\salt="[^"]*"/i.test(tag)) errors.push(`${file}: image without alt attribute`);
  for (const json of html.matchAll(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)) {
    try { JSON.parse(json[1]); } catch { errors.push(`${file}: invalid JSON-LD`); }
  }
  for (const link of html.matchAll(/<a\b[^>]*\shref="([^"]+)"/gi)) {
    const href = link[1];
    if (!href.startsWith('/') || href.startsWith('//')) continue;
    const clean = href.split('#')[0].split('?')[0];
    if (!clean) continue;
    const target = clean.endsWith('/') ? routeFile(clean) : join(dist, clean);
    if (!existsSync(target)) errors.push(`${file}: broken internal link ${href}`);
  }
}

for (const lang of ['en', 'vi', 'zh', 'ko', 'my', 'id']) {
  const html = readFileSync(routeFile(`/${lang}/`), 'utf8');
  if (!/<meta\s+name="robots"\s+content="noindex, nofollow"/i.test(html)) errors.push(`/${lang}/: missing temporary noindex`);
}

if (!existsSync(join(dist, '404.html'))) errors.push('Missing custom 404 page');
const sitemap = readFileSync(join(dist, 'sitemap.xml'), 'utf8');
for (const route of requiredRoutes) if (!sitemap.includes(`<loc>https://golynnail.jp${route}</loc>`)) errors.push(`Sitemap missing ${route}`);
if (!readFileSync(join(dist, 'robots.txt'), 'utf8').includes('Sitemap: https://golynnail.jp/sitemap.xml')) errors.push('robots.txt has incorrect sitemap URL');

if (errors.length) {
  console.error(`SEO audit failed with ${errors.length} issue(s):\n- ${errors.join('\n- ')}`);
  process.exit(1);
}

console.log(`SEO audit passed: ${requiredRoutes.length} primary routes, metadata, canonicals, H1s, JSON-LD, internal links, sitemap, robots, images and placeholder scan.`);
