const fs = require('fs');
const { JSDOM } = require('jsdom');
(async () => {
  for (const file of ['dist/index.html', 'dist/reviews/index.html']) {
    const dom = new JSDOM(fs.readFileSync(file, 'utf8'), { url: 'https://golynnail.jp/', runScripts: 'outside-only', pretendToBeVisual: true });
    const w = dom.window;
    w.IntersectionObserver = class { constructor(callback) { this.callback = callback; } observe(target) { this.callback([{ target, isIntersecting: true }]); } };
    for (const script of w.document.scripts) {
      if (script.type === 'application/ld+json' || script.type === 'module') continue;
      const src = script.getAttribute('src');
      w.eval(src ? fs.readFileSync('public' + src, 'utf8') : script.textContent);
    }
    w.document.dispatchEvent(new w.Event('DOMContentLoaded'));
    for (const lang of ['ja', 'en', 'vi', 'zh', 'ko', 'my', 'id']) {
      w.chooseLang(lang);
      await new Promise(resolve => setTimeout(resolve, 300));
      for (let n = 1; n <= 3; n++) {
        const el = w.document.querySelector('[data-i18n="rev' + n + '_q"]');
        const expected = w.document.createElement('p');
        expected.innerHTML = w.golynSalonTranslations[lang]['rev' + n + '_q'];
        if (el.innerHTML !== expected.innerHTML) throw Error(file + ': translation mismatch ' + lang + n);
      }
      if (lang === 'ja' && !w.document.querySelector('[data-i18n="rev1_q"]').textContent.includes('一番')) throw Error('Missing 一番');
      if (w.document.querySelector('[data-i18n="rev1_author"]').textContent !== (lang === 'ja' ? 'うなゆ 様' : 'Unayu')) throw Error('Author romanization mismatch');
      if (w.document.querySelector('[data-i18n="rev2_author"]').textContent !== (lang === 'ja' ? 'Nozomi Sakae 様' : 'Nozomi Sakae')) throw Error('Second author mismatch');
      if (w.document.querySelector('[data-i18n="rev3_author"]').textContent !== (lang === 'ja' ? '若野綺萊 様' : 'Wakano Kira')) throw Error('Third author mismatch');
    }
    console.log(file + ': all 3 reviews and author names switch correctly in 7 languages');
    dom.window.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
