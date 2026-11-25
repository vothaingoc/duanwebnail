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
      assert.equal(w.document.querySelector('[data-i18n="staff_ngoc_linh_name"]').textContent, lang === 'ja' ? 'リン' : 'Ngoc Linh');
      assert.equal(w.document.querySelector('[data-i18n="staff_ngoc_linh_position"]').textContent, role);
      assert.equal(w.document.documentElement.lang, lang);
      if (file.includes('/golyn/')) {
        const years = { ja: '5年', en: '5 years', vi: '5 năm', zh: '5年', ko: '5년', my: '၅ နှစ်', id: '5 tahun' };
        assert.equal(w.document.querySelector('[data-i18n="staff_ngoc_linh_experience"]').textContent, years[lang]);
        const certificates = w.document.querySelectorAll('[data-i18n^="staff_ngoc_linh_certification_"]');
        assert.equal(certificates.length, 2);
        assert(certificates[0].textContent.includes('JNA'));
        assert(certificates[1].textContent.includes('JNEC'));
        assert(/[3၃]/.test(certificates[1].textContent));
        if (lang === 'ja') {
          assert.equal(certificates[0].textContent, 'JNA認定 ネイルサロン衛生管理士');
          assert.equal(certificates[1].textContent, 'JNEC ネイリスト技能検定試験 3級');
        }
      }
    }
    assert(w.document.querySelector('img[src="/images/golyn-staff.jpg"]'));
    const specialty = w.document.querySelector('[data-i18n="staff_specialty"] + dd');
    if (specialty) assert.equal(specialty.textContent.trim(), '');
    assert.equal(w.document.querySelector('.profile-text, .staff-intro, .staff-gallery'), null);
    assert(!w.document.body.textContent.includes('8000 tài lanh'));
    assert(!w.document.body.textContent.includes('chuyên foot'));
    console.log('PASS: photo, experience, certifications, and 7 languages: ' + file);
    dom.window.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
