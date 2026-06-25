(function () {
  const supported = ['ja', 'en', 'vi', 'zh', 'ko', 'my', 'id'];
  const aliases = {
    ja: 'ja',
    jp: 'ja',
    en: 'en',
    vi: 'vi',
    vn: 'vi',
    zh: 'zh',
    'zh-cn': 'zh',
    'zh-hans': 'zh',
    'zh-hant': 'zh',
    ko: 'ko',
    kr: 'ko',
    my: 'my',
    mm: 'my',
    id: 'id',
    in: 'id'
  };

  function normalize(value) {
    const raw = String(value || '').toLowerCase().replace('_', '-');
    if (!raw) return '';
    if (aliases[raw]) return aliases[raw];
    const base = raw.split('-')[0];
    return aliases[base] || '';
  }

  function cookieValue(name) {
    const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : '';
  }

  function browserLanguage() {
    const languages = Array.isArray(navigator.languages) && navigator.languages.length
      ? navigator.languages
      : [navigator.language || navigator.userLanguage || ''];
    for (const language of languages) {
      const normalized = normalize(language);
      if (supported.includes(normalized)) return normalized;
    }
    return '';
  }

  function countryLanguage() {
    const country = cookieValue('golynCountry').toUpperCase();
    return country === 'JP' ? 'ja' : 'en';
  }

  if (localStorage.getItem('golynLangUserSet') === 'true') return;

  const detected = browserLanguage() || countryLanguage() || 'en';
  localStorage.setItem('golynLang', detected);
  localStorage.setItem('golynLangAutoSource', browserLanguage() ? 'browser' : 'country');
})();
