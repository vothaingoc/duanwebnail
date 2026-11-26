(function () {
  'use strict';
  const names = { ja: '日本語', en: 'English', vi: 'Tiếng Việt', zh: '中文', ko: '한국어', my: 'မြန်မာ', id: 'Bahasa Indonesia' };
  function normalize(value) {
    const base = String(value || '').trim().toLowerCase().replace(/_/g, '-').split('-')[0];
    const aliases = { jp: 'ja', vn: 'vi', kr: 'ko', mm: 'my', in: 'id' };
    const lang = aliases[base] || base;
    return Object.prototype.hasOwnProperty.call(names, lang) ? lang : '';
  }
  function read(storage, key) { try { return window[storage].getItem(key) || ''; } catch (_) { return ''; } }
  function write(storage, key, value) {
    try { window[storage].setItem(key, value); return window[storage].getItem(key) === value; } catch (_) { return false; }
  }
  function cookie(key) {
    try { const match = document.cookie.match(new RegExp('(?:^|;\\s*)' + key + '=([^;]*)')); return match ? decodeURIComponent(match[1]) : ''; } catch (_) { return ''; }
  }
  function saveCookie(key, value, persistent) {
    try {
      document.cookie = key + '=' + encodeURIComponent(value) + '; Path=/; SameSite=Lax' + (location.protocol === 'https:' ? '; Secure' : '') + (persistent ? '; Max-Age=31536000' : '');
      return cookie(key) === value;
    } catch (_) { return false; }
  }
  const params = new URLSearchParams(location.search);
  const explicit = normalize(params.get('lang'));
  const saved = normalize(read('localStorage', 'golynLangUserSet') === 'true' ? read('localStorage', 'golynLang') : '') || normalize(cookie('golynLangChoice'));
  let firstLanguage = '';
  try { firstLanguage = navigator.languages && navigator.languages.length ? navigator.languages[0] : navigator.language; } catch (_) {}
  const first = normalize(firstLanguage);
  const handled = read('sessionStorage', 'golynLanguagePromptHandled') === 'true' || cookie('golynLanguagePromptHandled') === 'true';
  let current = explicit || saved || 'ja';
  let linkLanguage = explicit;
  let dialog;
  let previousFocus;
  const originalLinks = new WeakMap();

  function updateURL(lang) {
    linkLanguage = lang;
    try { const url = new URL(location.href); url.searchParams.set('lang', lang); history.replaceState(history.state, '', url); } catch (_) {}
  }
  function markHandled() {
    const sessionSaved = write('sessionStorage', 'golynLanguagePromptHandled', 'true');
    const cookieSaved = saveCookie('golynLanguagePromptHandled', 'true', false);
    // Carry the current language in links when every storage mechanism is unavailable.
    if (!sessionSaved && !cookieSaved) updateURL(current);
  }
  function closePrompt() {
    markHandled();
    if (dialog) {
      if (typeof dialog.close === 'function') dialog.close(); else dialog.removeAttribute('open');
      if (previousFocus && previousFocus.isConnected) previousFocus.focus();
    }
  }
  window.GolynLanguage = {
    get: function () { return current; },
    apply: function (lang) { current = normalize(lang) || 'ja'; },
    select: function (lang) {
      current = normalize(lang) || 'ja';
      // Only a deliberate choice writes a persistent language preference.
      write('localStorage', 'golynLang', current);
      write('localStorage', 'golynLangUserSet', 'true');
      saveCookie('golynLangChoice', current, true);
      updateURL(current);
      closePrompt();
    }
  };
  // Preserve explicit URL choices across normal navigation, including modified clicks.
  document.addEventListener('click', carryLanguage, true);
  document.addEventListener('auxclick', carryLanguage, true);
  function carryLanguage(event) {
    const anchor = event.target.closest && event.target.closest('a[href]');
    if (!anchor || !linkLanguage || anchor.hasAttribute('download')) return;
    try {
      if (!originalLinks.has(anchor)) originalLinks.set(anchor, anchor.getAttribute('href'));
      const url = new URL(originalLinks.get(anchor), location.href);
      if (url.origin !== location.origin || !/^https?:$/.test(url.protocol) || url.searchParams.has('lang')) return;
      url.searchParams.set('lang', linkLanguage);
      anchor.href = url.href;
    } catch (_) {}
  }
  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.lang-current').forEach(function (button) {
      button.setAttribute('aria-label', '言語 / Language');
      const label = button.querySelector('.lang-current-label');
      if (label) label.textContent = '言語 / Language';
    });
    // An unknown browser language keeps Japanese without prompting. An identifiable,
    // unsupported language still gets the same supported choices, without a suggestion.
    if (explicit || saved || handled || !firstLanguage || first === 'ja') return;
    previousFocus = document.activeElement;
    dialog = document.createElement('dialog');
    dialog.className = 'golyn-language-dialog';
    dialog.setAttribute('aria-labelledby', 'golyn-language-title');
    dialog.setAttribute('aria-describedby', 'golyn-language-description');
    dialog.innerHTML = '<button type="button" class="golyn-language-close" aria-label="閉じる / Close">×</button>' +
      '<p class="golyn-language-brand">GOLYN NAIL</p><h2 id="golyn-language-title">言語 / Language</h2>' +
      '<p id="golyn-language-description">表示する言語をお選びください。<br>Choose your preferred language.</p>' +
      '<div class="golyn-language-options"></div><button type="button" class="golyn-language-dismiss">日本語のまま見る / Continue in Japanese</button>';
    const options = dialog.querySelector('.golyn-language-options');
    Object.entries(names).forEach(function (entry) {
      const lang = entry[0];
      const button = document.createElement('button');
      button.type = 'button';
      button.lang = lang;
      button.dataset.language = lang;
      button.textContent = entry[1];
      if (lang === first) {
        button.className = 'suggested';
        button.setAttribute('autofocus', '');
        const hint = document.createElement('small');
        hint.textContent = 'おすすめ / Suggested';
        button.appendChild(hint);
      }
      button.addEventListener('click', function () { window.chooseLang(lang); });
      options.appendChild(button);
    });
    dialog.querySelector('.golyn-language-close').addEventListener('click', closePrompt);
    dialog.querySelector('.golyn-language-dismiss').addEventListener('click', closePrompt);
    dialog.addEventListener('cancel', function (event) { event.preventDefault(); closePrompt(); });
    document.body.appendChild(dialog);
    markHandled();
    if (typeof dialog.showModal === 'function') dialog.showModal(); else dialog.setAttribute('open', '');
  });
})();
