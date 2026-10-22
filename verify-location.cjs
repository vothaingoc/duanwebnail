const fs = require('fs');
const { JSDOM } = require('jsdom');
(async () => {
  for (const file of ['dist/index.html', 'dist/access/index.html']) {
    const dom = new JSDOM(fs.readFileSync(file, 'utf8'), { url: 'https://golynnail.jp/', runScripts: 'outside-only', pretendToBeVisual: true });
    const w = dom.window;
    w.IntersectionObserver = class { constructor(callback) { this.callback = callback; } observe(target) { this.callback([{ target, isIntersecting: true }]); } unobserve() {} };
    for (const script of w.document.scripts) {
      if (script.type === 'application/ld+json' || script.type === 'module') continue;
      const src = script.getAttribute('src');
      w.eval(src ? fs.readFileSync('public' + src, 'utf8') : script.textContent);
    }
    w.document.dispatchEvent(new w.Event('DOMContentLoaded'));
    await new Promise(resolve => setTimeout(resolve, 250));
    for (const lang of ['ja', 'en', 'vi', 'zh', 'ko', 'my', 'id']) {
      w.chooseLang(lang);
      await new Promise(resolve => setTimeout(resolve, 250));
      const address = w.document.querySelector('[data-i18n="acc_addr"]').textContent;
      if (!address.includes('542-0081') || !address.includes('406')) throw Error(file + ' bad address ' + lang);
      if (!w.document.querySelector('[data-i18n="acc_dir4"]')) throw Error('Missing fourth station');
    }
    if (file === 'dist/index.html') {
      const hidden = [...w.document.querySelectorAll('.fade-up')].filter(el => !el.classList.contains('visible'));
      if (hidden.length) throw Error('Sections still hidden: ' + hidden.length);
      console.log('Home sections revealed successfully');
    }
    console.log(file + ': scripts and 7 languages passed');
    dom.window.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
