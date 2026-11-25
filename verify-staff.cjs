const fs = require('node:fs');
const assert = require('node:assert/strict');
const { JSDOM } = require('jsdom');

(async () => {
  for (const file of ['dist/staff/index.html', 'dist/staff/golyn/index.html']) {
    const dom = new JSDOM(fs.readFileSync(file, 'utf8'), {
      url: 'https://golynnail.jp/', runScripts: 'outside-only', pretendToBeVisual: true
    });
    const w = dom.window;
    for (const script of w.document.scripts) {
      if (script.type === 'application/ld+json' || script.type === 'module') continue;
      const src = script.getAttribute('src');
      w.eval(src ? fs.readFileSync('public' + src, 'utf8') : script.textContent);
    }
    w.document.dispatchEvent(new w.Event('DOMContentLoaded'));
    const roles = { ja: '店長', en: 'Salon Manager', vi: 'Quản lý cửa hàng', zh: '店长', ko: '점장', my: 'ဆိုင်မန်နေဂျာ', id: 'Manajer Salon' };
    for (const [lang, role] of Object.entries(roles)) {
      w.chooseLang(lang);
      await new Promise(resolve => setTimeout(resolve, 180));
      assert.equal(w.document.querySelector('[data-i18n="staff_ngoc_linh_name"]').textContent, lang === 'ja' ? 'ゴック リン' : 'Ngoc Linh');
      assert.equal(w.document.querySelector('[data-i18n="staff_ngoc_linh_position"]').textContent, role);
      assert.equal(w.document.documentElement.lang, lang);
    }
    assert(w.document.querySelector('img[src="/images/golyn-staff.jpg"]'));
    for (const value of w.document.querySelectorAll('.profile-facts dd')) assert.equal(value.textContent.trim(), '');
    assert.equal(w.document.querySelector('.profile-text, .staff-intro, .staff-gallery'), null);
    assert(!w.document.body.textContent.includes('8000 tài lanh'));
    assert(!w.document.body.textContent.includes('chuyên foot'));
    console.log('PASS: photo, empty demo content, and 7 languages: ' + file);
    dom.window.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
