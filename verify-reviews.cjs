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
    const names = [...w.document.querySelectorAll('.test-author')].map(el => el.textContent);
    for (const lang of ['ja', 'en', 'vi', 'zh', 'ko', 'my', 'id']) {
      w.chooseLang(lang);
      await new Promise(resolve => setTimeout(resolve, 300));
      for (let n = 1; n <= 3; n++) {
        const el = w.document.querySelector('[data-i18n="rev' + n + '_q"]');
        const expected = w.document.createElement('p');
        expected.innerHTML = w.golynSalonTranslations[lang]['rev' + n + '_q'];
        if (el.innerHTML !== expected.innerHTML) throw Error(file + ': translation mismatch ' + lang + n);
      }
      if (lang === 'ja' && !w.document.querySelector('.review-number')) throw Error('Missing legible digit');
      if (names.join() !== [...w.document.querySelectorAll('.test-author')].map(el => el.textContent).join()) throw Error('Author names changed');
    }
    console.log(file + ': all 3 reviews switch correctly in 7 languages; author names preserved');
    dom.window.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
