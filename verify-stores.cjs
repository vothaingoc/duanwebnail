const fs = require('node:fs');
const assert = require('node:assert/strict');
const { JSDOM } = require('jsdom');

(async () => {
  const pages = ['index.html', 'access/index.html', 'access/shinsaibashi/index.html', 'staff/index.html', 'services/index.html', 'reviews/index.html', 'gallery/index.html', 'news/index.html', 'price-detail/index.html', 'article/top-nail-design-trends-in-2026/index.html'];
  for (const page of pages) {
    const dom = new JSDOM(fs.readFileSync('dist/' + page, 'utf8'), { url: 'https://golynnail.jp/', runScripts: 'outside-only', pretendToBeVisual: true });
    const w = dom.window;
    w.IntersectionObserver = class { observe() {} unobserve() {} disconnect() {} };
    w.scrollTo = () => {};
    for (const script of w.document.scripts) {
      if (script.type === 'application/ld+json' || script.type === 'module') continue;
      const src = script.getAttribute('src');
      w.eval(src ? fs.readFileSync('public' + src.split('?')[0], 'utf8') : script.textContent);
    }
    w.document.dispatchEvent(new w.Event('DOMContentLoaded'));
    for (const lang of ['ja', 'en', 'vi', 'zh', 'ko', 'my', 'id']) {
      w.chooseLang(lang);
      await new Promise(resolve => setTimeout(resolve, 200));
      const expected = w.golynStoreTranslations[lang];
      for (const link of w.document.querySelectorAll('[data-i18n="nav_stores"]')) {
        assert.equal(link.textContent, expected.nav_stores, page + ' menu ' + lang);
        assert.equal(link.getAttribute('href'), '/access/');
      }
      if (page === 'access/index.html') {
        assert.equal(w.document.querySelector('h1').textContent, expected.stores_title);
        assert.equal(w.document.querySelector('.store-button').textContent, expected.store_details);
        assert.equal(w.document.querySelector('.store-button').getAttribute('href'), '/access/shinsaibashi/');
        assert(w.document.querySelector('.store-address').textContent.includes('406'));
        assert.equal(w.document.querySelector('.store-card h2').textContent, expected.store_shinsaibashi);
      }
      if (page === 'access/shinsaibashi/index.html') {
        assert.equal(w.document.querySelector('h1').textContent, expected.store_shinsaibashi);
        assert.equal(w.document.querySelector('.back-actions a').textContent, expected.store_back);
        assert(w.document.querySelector('iframe').src.includes('maps.google.com'));
        assert(w.document.querySelector('.page-actions a').href.includes('destination='));
        assert(w.document.querySelector('a[href="tel:07088366688"]'));
        assert(w.document.querySelector('a[href^="https://www.instagram.com/golynnail"]'));
        const photos = w.document.querySelectorAll('.photo-grid img');
        assert.equal(photos.length, 3);
        for (const photo of photos) assert(fs.existsSync('dist' + photo.getAttribute('src')));
      }
    }
    console.log('PASS: store navigation and 7 languages: ' + page);
    dom.window.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
