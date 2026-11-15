const fs = require('fs');
const { JSDOM } = require('jsdom');
(async () => {
  for (const file of ['dist/index.html', 'dist/gallery/index.html']) {
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
      const el = w.document.querySelector('[data-i18n="photo_disclaimer"]');
      if (el.textContent !== w.golynPhotoDisclaimer[lang]) throw Error(file + ': wrong disclaimer ' + lang);
    }
    console.log(file + ': photo disclaimer verified in all 7 languages');
    dom.window.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
