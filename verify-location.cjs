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
      if (address.includes('4階')) throw Error('Floor label still present');
      if (lang !== 'ja' && !address.includes('Osaka-fu, Osaka-shi, Chuo-ku, Minamisenba 3-11-27Nippo Building Room 406')) throw Error('Romanized address mismatch: ' + lang);
      const direction = w.document.querySelector('[data-i18n="acc_dir1"]').textContent;
      if (!direction.includes('2') || !/[3၃]/.test(direction)) throw Error('Missing Exit 2 walking time: ' + lang);
      if (!w.document.querySelector('[data-i18n="acc_dir4"]')) throw Error('Missing fourth station');
      const hours = w.document.querySelector('[data-i18n="acc_hours"]').textContent;
      if (!hours.includes('21:00') || !hours.includes('21:30') || hours.includes('20:00')) throw Error('Incorrect opening hours: ' + lang);
      if (file === 'dist/index.html') {
        if (!w.document.querySelector('.hero-title-lead') || !w.document.querySelector('.hero-title em')) throw Error('Missing slogan hierarchy: ' + lang);
        if (w.document.querySelector('.hero-desc').children.length !== 0) throw Error('Hero description must be one continuous paragraph: ' + lang);
      }
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
