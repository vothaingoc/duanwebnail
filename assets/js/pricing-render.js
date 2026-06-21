(function () {
  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, char => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[char]));
  }

  function formatPrice(value) {
    if (value == null || value === '') return '';
    if (typeof value === 'number') return `¥${value.toLocaleString('ja-JP')}`;
    return String(value);
  }

  function getItem(id) {
    return (window.GOLYN_PRICING_ITEMS || []).find(item => item.id === id);
  }

  function byCategory(category) {
    return (window.GOLYN_PRICING_ITEMS || [])
      .filter(item => item.category === category)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  function itemText(item, lang) {
    const ja = item.translations.ja || {};
    return Object.assign({}, ja, item.translations[lang] || {});
  }

  function categoryText(category, lang) {
    const data = (window.GOLYN_PRICING_CATEGORIES || {})[category];
    if (!data) return { label: '', title: '' };
    return {
      label: data.label || '',
      title: (data.translations && (data.translations[lang] || data.translations.ja)) || category
    };
  }

  function campaignActive() {
    const campaign = window.GOLYN_PRICING_CAMPAIGN;
    if (!campaign || campaign.active !== true) return false;
    const now = new Date();
    if (campaign.startsAt && new Date(campaign.startsAt) > now) return false;
    if (campaign.endsAt && new Date(campaign.endsAt) < now) return false;
    return true;
  }

  function itemSaleActive(item) {
    return campaignActive() && item.saleActive && item.salePrice !== null && item.salePrice !== '';
  }

  function currentPrice(item, text) {
    return itemSaleActive(item) ? item.salePrice : (text.originalPrice || item.originalPrice);
  }

  function priceInline(item, text) {
    const oldPrice = formatPrice(text.originalPrice || item.originalPrice);
    const newPrice = formatPrice(currentPrice(item, text));
    const showSale = itemSaleActive(item);
    if (!showSale) return `<span>${escapeHtml(oldPrice)}</span>`;
    return `<span class="price-wrap"><s class="price-old">${escapeHtml(oldPrice)}</s><span>${escapeHtml(newPrice)}</span></span>`;
  }

  function priceBox(item, text) {
    const oldPrice = formatPrice(text.originalPrice || item.originalPrice);
    const newPrice = formatPrice(currentPrice(item, text));
    const showSale = itemSaleActive(item);
    if (!showSale) return `<span class="price-new">${escapeHtml(oldPrice)}</span>`;
    return `<span class="price-old">${escapeHtml(oldPrice)}</span><span class="price-new">${escapeHtml(newPrice)}</span>`;
  }

  function campaignText(lang) {
    const labels = {
      ja: '※ 期間限定キャンペーン価格',
      en: '※ Limited-time campaign price',
      vi: '※ Giá khuyến mãi có thời hạn',
      zh: '※ 限时活动价格',
      ko: '※ 기간 한정 캠페인 가격',
      my: '※ ကာလသတ်မှတ် campaign စျေးနှုန်း',
      id: '※ Harga campaign terbatas'
    };
    return labels[lang] || labels.ja;
  }

  function servicePriceText(lang, price) {
    const templates = {
      ja: `${price}〜`,
      en: `From ${price}`,
      vi: `Từ ${price}`,
      zh: `${price}起`,
      ko: `${price}부터`,
      my: `${price} မှစ၍`,
      id: `Mulai ${price}`
    };
    return templates[lang] || templates.ja;
  }

  function renderServicePrices(lang) {
    document.querySelectorAll('[data-service-price]').forEach(el => {
      const item = getItem(el.getAttribute('data-service-price'));
      if (!item) return;
      const text = itemText(item, lang);
      const price = formatPrice(currentPrice(item, text));
      const campaign = itemSaleActive(item)
        ? `<span class="service-campaign">${escapeHtml(campaignText(lang))}</span>`
        : '';
      el.innerHTML = `<span class="service-price-value">${escapeHtml(servicePriceText(lang, price))}</span>${campaign}`;
    });
  }

  function noteHtml(item, text, lang) {
    const showSale = itemSaleActive(item);
    if (!item.note) return showSale ? escapeHtml(campaignText(lang)) : '';
    if (item.note === 'campaign_only') return showSale ? escapeHtml(campaignText(lang)) : '';
    const note = text.note || '';
    if (!note && !showSale) return '';
    if (!showSale) return escapeHtml(note);
    return `${escapeHtml(note)}<span class="campaign-note">${escapeHtml(campaignText(lang))}</span>`;
  }

  function homeNoteHtml(card, lang) {
    const items = card.itemIds.map(getItem).filter(Boolean);
    const text = itemText(items.find(item => item.note !== 'campaign_only') || items[0] || {}, lang);
    const note = text.note || '';
    const hasSale = items.some(itemSaleActive);
    if (!note && !hasSale) return '';
    if (!hasSale) return escapeHtml(note);
    return `${escapeHtml(note)}<br>${escapeHtml(campaignText(lang))}`;
  }

  function applyCampaignState() {
    const active = campaignActive();
    document.querySelectorAll('.campaign-badge').forEach(el => {
      el.hidden = !active;
    });
    document.querySelectorAll('[data-i18n="notice6"]').forEach(el => {
      el.hidden = !active;
    });
  }

  function detailDescription(text) {
    const parts = [];
    if (text.duration) parts.push(text.duration);
    if (text.description) parts.push(text.description);
    return parts.join(' / ');
  }

  function renderHome(lang) {
    const root = document.querySelector('[data-pricing-summary]');
    if (!root) return;
    root.innerHTML = (window.GOLYN_PRICING_HOME_CARDS || []).map(card => {
      const category = (window.GOLYN_PRICING_CATEGORIES || {})[card.category] || {};
      const featured = category.featured ? ' featured' : '';
      const delay = card.delay ? ` style="transition-delay:${card.delay}"` : '';
      const descStyle = category.featured ? ' style="color:rgba(250,247,242,.6)"' : '';
      const noteStyle = category.featured ? ' style="color:rgba(250,247,242,.4);border-color:rgba(250,247,242,.12)"' : '';
      const items = card.itemIds.map(getItem).filter(Boolean).map(item => {
        const text = itemText(item, lang);
        const name = text.summaryName || text.name;
        return `<li>${escapeHtml(name)} ${priceInline(item, text)}</li>`;
      }).join('');
      const note = homeNoteHtml(card, lang);
      return `<div class="pricing-card${featured} fade-up"${delay}>
<div class="pricing-card-label" data-i18n="${card.labelKey}"></div>
<div class="pricing-name" data-i18n="${card.nameKey}"></div>
<p class="pricing-desc" data-i18n="${card.descKey}"${descStyle}></p>
<ul class="pricing-list">${items}</ul>
${note ? `<div class="pricing-note"${noteStyle}>${note}</div>` : ''}
</div>`;
    }).join('');
    renderServicePrices(lang);
    observeFadeUps(root);
    applyCampaignState();
  }

  function renderDetail(lang) {
    const root = document.querySelector('[data-pricing-detail]');
    if (!root) return;
    root.innerHTML = Object.keys(window.GOLYN_PRICING_CATEGORIES || {}).map(category => {
      const categoryData = window.GOLYN_PRICING_CATEGORIES[category];
      const label = categoryText(category, lang);
      const featured = categoryData.featured ? ' featured' : '';
      const items = byCategory(category).map(item => {
        const text = itemText(item, lang);
        const desc = detailDescription(text);
        const note = noteHtml(item, text, lang);
        return `<li class="menu-item"><div>
<div class="item-name">${escapeHtml(text.name)}</div>
${desc ? `<div class="item-desc">${escapeHtml(desc)}</div>` : ''}
${note ? `<div class="item-note">${note}</div>` : ''}
</div><div class="price-box">${priceBox(item, text)}</div></li>`;
      }).join('');
      return `<section class="menu-section${featured}">
<div class="menu-head"><div class="menu-label">${escapeHtml(label.label)}</div><h2 class="menu-title">${escapeHtml(label.title)}</h2></div>
<ul class="menu-list">${items}</ul>
</section>`;
    }).join('');
    renderServicePrices(lang);
    applyCampaignState();
  }

  function observeFadeUps(root) {
    if (!root || typeof IntersectionObserver === 'undefined') return;
    const observer = window.golynRevealObserver;
    if (!observer) return;
    root.querySelectorAll('.fade-up').forEach(el => observer.observe(el));
  }

  window.GolynPricing = {
    campaignActive,
    applyCampaignState,
    renderServicePrices,
    renderHome,
    renderDetail
  };
})();
