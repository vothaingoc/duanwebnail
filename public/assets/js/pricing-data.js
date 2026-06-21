(function () {
  const langs = ['ja', 'en', 'vi', 'zh', 'ko', 'my', 'id'];
  const True = true;
  const False = false;

  // Sanity-compatible campaign settings.
  // For now, Astro still reads this file as the fallback source.
  // Toggle all sale prices here: true = show campaign prices, false = hide campaign prices.
  const campaign = {
    active: false,
    source: 'pricing-data',
    name: 'Limited-time campaign',
    startsAt: null,
    endsAt: null,
  };

  const categoryTranslations = {
    gel: {
      label: 'Gel Nail',
      featured: false,
      translations: {
        ja: 'ジェルネイル', en: 'Gel Nail', vi: 'Gel Nail', zh: '凝胶美甲',
        ko: '젤 네일', my: 'ဂျယ်လ် လက်သည်း', id: 'Gel Nail'
      }
    },
    extension: {
      label: 'Extension',
      featured: true,
      translations: {
        ja: '長さ出し', en: 'Nail Extension', vi: 'Nối móng', zh: '延长美甲',
        ko: '네일 연장', my: 'လက်သည်း တိုးချဲ့', id: 'Nail Extension'
      }
    },
    foot: {
      label: 'Foot Nail',
      featured: false,
      translations: {
        ja: 'フットネイル', en: 'Foot Nail', vi: 'Foot Nail', zh: '足部美甲',
        ko: '풋 네일', my: 'ခြေဖျား လက်သည်း', id: 'Foot Nail'
      }
    },
    options: {
      label: 'Off / Options / Care',
      featured: false,
      translations: {
        ja: 'オフ・オプション・ケア', en: 'Removal / Options / Care', vi: 'Tháo móng / Option / Chăm sóc', zh: '卸甲・选项・护理',
        ko: '제거・옵션・케어', my: 'ဖယ်ရှားခြင်း・အပိုရွေးချယ်မှု・စောင့်ရှောက်မှု', id: 'Removal / Opsi / Perawatan'
      }
    }
  };

  const homeCards = [
    { category: 'gel', delay: '', labelKey: 'price_basic_label', nameKey: 'price_basic_name', descKey: 'price_basic_desc', noteKey: 'price_note', itemIds: ['gel-onecolor', 'gel-4art', 'gel-6art', 'gel-10art'] },
    { category: 'extension', delay: '.1s', labelKey: 'price_art_label', nameKey: 'price_art_name', descKey: 'price_art_desc', noteKey: 'price_note_ext', itemIds: ['ext-onecolor', 'ext-4art', 'ext-6art', 'ext-10art'] },
    { category: 'foot', delay: '.2s', labelKey: 'price_spa_label', nameKey: 'price_spa_name', descKey: 'price_spa_desc', noteKey: 'price_note', itemIds: ['foot-onecolor', 'foot-design', 'off-own', 'off-other', 'off-only'] }
  ];

  function byLang(values) {
    const out = {};
    langs.forEach(lang => {
      out[lang] = Object.assign({}, values.ja, values[lang] || {});
    });
    return out;
  }

  function item(config) {
    return Object.assign({
      saleActive: false,
      salePrice: null,
      duration: '',
      note: 'fix_campaign',
      home: false
    }, config, { translations: byLang(config.translations) });
  }

  const items = [
    item({
      id: 'gel-onecolor', category: 'gel', order: 10, originalPrice: 7500, saleActive: true, salePrice: 5900, duration: '80分', home: true,
      translations: {
        ja: { name: 'ワンカラー・フラッシュネイル・ラメグラ', summaryName: 'ワンカラー・フラッシュネイル・ラメグラ', duration: '80分', description: '2カラー +¥500 / 3カラー +¥700 / 韓国・ワンホン・ニュアンス対応', note: '※ 7日以内お直し無料' },
        en: { name: 'One color / Flash nail / Glitter gradation', summaryName: 'One-colour / Flash / Glitter Gradient', duration: '80 min', description: '2 colors +¥500 / 3 colors +¥700 / Korean, Wanghong and nuance styles available', note: '※ Free fix within 7 days of visit' },
        vi: { name: 'Một màu / Flash nail / Ombre', summaryName: 'One-color / Flash / Glitter Gradient', duration: '80 phút', description: '2 màu +¥500 / 3 màu +¥700 / Có thể làm phong cách Hàn, Wanghong, nuance', note: '※ Sửa miễn phí trong vòng 7 ngày sau khi đến tiệm' },
        zh: { name: '纯色 / 闪光甲 / 亮片渐变', duration: '80分钟', description: '2色 +¥500 / 3色 +¥700 / 支持韩系、网红与氛围款', note: '※ 到店后7天内免费修补' },
        ko: { name: '원컬러 / 플래시 네일 / 글리터 그라데이션', duration: '80분', description: '2컬러 +¥500 / 3컬러 +¥700 / 한국·왕홍·누앙스 스타일 가능', note: '※ 방문 후 7일 이내 무료 보수' },
        my: { name: 'တစ်ရောင် / Flash nail / Glitter gradation', duration: '80 မိနစ်', description: '2 ရောင် +¥500 / 3 ရောင် +¥700 / Korean, Wanghong, Nuance စတိုင်များ ရနိုင်', note: '※ လာရောက်ပြီး ၇ ရက်အတွင်း အခမဲ့ပြင်ဆင်ပေးပါသည်' },
        id: { name: 'Satu warna / Flash nail / Gradasi glitter', duration: '80 menit', description: '2 warna +¥500 / 3 warna +¥700 / Tersedia gaya Korea, Wanghong, dan nuance', note: '※ Perbaikan gratis dalam 7 hari setelah kunjungan' }
      }
    }),
    item({
      id: 'gel-4art', category: 'gel', order: 20, originalPrice: 9500, saleActive: true, salePrice: 8200, duration: '120分', home: true,
      translations: {
        ja: { name: '4本アート・ストーン・パーツ付けコース', summaryName: '4本アートコース', duration: '120分', description: '人気パーツ込み / 持ち込みデザインOK / 他6本ワンカラー', note: '※ 7日以内お直し無料' },
        en: { name: '4-nail art, stones & parts course', summaryName: '4-nail Art Course', duration: '120 min', description: 'Popular parts included / Bring-in designs OK / Other 6 nails one color', note: '※ Free fix within 7 days of visit' },
        vi: { name: 'Course 4 móng art, đá & phụ kiện', summaryName: 'Course art 4 móng', duration: '120 phút', description: 'Bao gồm phụ kiện phổ biến / Có thể mang mẫu / 6 móng còn lại một màu', note: '※ Sửa miễn phí trong vòng 7 ngày sau khi đến tiệm' },
        zh: { name: '4指艺术、钻饰与配件套餐', duration: '120分钟', description: '含热门配件 / 可持图定制 / 其余6指纯色', note: '※ 到店后7天内免费修补' },
        ko: { name: '4개 아트, 스톤 & 파츠 코스', duration: '120분', description: '인기 파츠 포함 / 디자인 지참 가능 / 나머지 6손가락 원컬러', note: '※ 방문 후 7일 이내 무료 보수' },
        my: { name: '၄ ချောင်း art, stones & parts course', duration: '120 မိနစ်', description: 'လူကြိုက်များ parts ပါဝင် / Design ယူလာနိုင် / ကျန် 6 ချောင်းကို တစ်ရောင်', note: '※ လာရောက်ပြီး ၇ ရက်အတွင်း အခမဲ့ပြင်ဆင်ပေးပါသည်' },
        id: { name: 'Course 4 kuku art, stone & parts', duration: '120 menit', description: 'Part populer termasuk / Boleh bawa referensi desain / 6 kuku lainnya satu warna', note: '※ Perbaikan gratis dalam 7 hari setelah kunjungan' }
      }
    }),
    item({
      id: 'gel-6art', category: 'gel', order: 30, originalPrice: 10500, saleActive: true, salePrice: 9200, duration: '140分', home: true,
      translations: {
        ja: { name: '6本アート・ストーン・パーツ付けコース', summaryName: '6本アートコース', duration: '140分', description: '人気パーツ込み / 持ち込みデザインOK / 他4本ワンカラー', note: '※ 7日以内お直し無料' },
        en: { name: '6-nail art, stones & parts course', summaryName: '6-nail Art Course', duration: '140 min', description: 'Popular parts included / Bring-in designs OK / Other 4 nails one color', note: '※ Free fix within 7 days of visit' },
        vi: { name: 'Course 6 móng art, đá & phụ kiện', summaryName: 'Course art 6 móng', duration: '140 phút', description: 'Bao gồm phụ kiện phổ biến / Có thể mang mẫu / 4 móng còn lại một màu', note: '※ Sửa miễn phí trong vòng 7 ngày sau khi đến tiệm' },
        zh: { name: '6指艺术、钻饰与配件套餐', duration: '140分钟', description: '含热门配件 / 可持图定制 / 其余4指纯色', note: '※ 到店后7天内免费修补' },
        ko: { name: '6개 아트, 스톤 & 파츠 코스', duration: '140분', description: '인기 파츠 포함 / 디자인 지참 가능 / 나머지 4손가락 원컬러', note: '※ 방문 후 7일 이내 무료 보수' },
        my: { name: '၆ ချောင်း art, stones & parts course', duration: '140 မိနစ်', description: 'လူကြိုက်များ parts ပါဝင် / Design ယူလာနိုင် / ကျန် 4 ချောင်းကို တစ်ရောင်', note: '※ လာရောက်ပြီး ၇ ရက်အတွင်း အခမဲ့ပြင်ဆင်ပေးပါသည်' },
        id: { name: 'Course 6 kuku art, stone & parts', duration: '140 menit', description: 'Part populer termasuk / Boleh bawa referensi desain / 4 kuku lainnya satu warna', note: '※ Perbaikan gratis dalam 7 hari setelah kunjungan' }
      }
    }),
    item({
      id: 'gel-10art', category: 'gel', order: 40, originalPrice: 13100, saleActive: true, salePrice: 11800, duration: '160分', home: true,
      translations: {
        ja: { name: '10本アート・ストーン・パーツ付けコース', summaryName: '10本アートコース', duration: '160分', description: '人気パーツ込み / 持ち込みデザインOK', note: '※ 7日以内お直し無料' },
        en: { name: '10-nail art, stones & parts course', summaryName: '10-nail Art Course', duration: '160 min', description: 'Popular parts included / Bring-in designs OK', note: '※ Free fix within 7 days of visit' },
        vi: { name: 'Course 10 móng art, đá & phụ kiện', summaryName: 'Course art 10 móng', duration: '160 phút', description: 'Bao gồm phụ kiện phổ biến / Có thể mang mẫu', note: '※ Sửa miễn phí trong vòng 7 ngày sau khi đến tiệm' },
        zh: { name: '10指艺术、钻饰与配件套餐', duration: '160分钟', description: '含热门配件 / 可持图定制', note: '※ 到店后7天内免费修补' },
        ko: { name: '10개 아트, 스톤 & 파츠 코스', duration: '160분', description: '인기 파츠 포함 / 디자인 지참 가능', note: '※ 방문 후 7일 이내 무료 보수' },
        my: { name: '၁၀ ချောင်း art, stones & parts course', duration: '160 မိနစ်', description: 'လူကြိုက်များ parts ပါဝင် / Design ယူလာနိုင်', note: '※ လာရောက်ပြီး ၇ ရက်အတွင်း အခမဲ့ပြင်ဆင်ပေးပါသည်' },
        id: { name: 'Course 10 kuku art, stone & parts', duration: '160 menit', description: 'Part populer termasuk / Boleh bawa referensi desain', note: '※ Perbaikan gratis dalam 7 hari setelah kunjungan' }
      }
    }),

    item({
      id: 'ext-onecolor', category: 'extension', order: 10, originalPrice: 8500, saleActive: true, salePrice: 6800, duration: '100分', home: true,
      translations: {
        ja: { name: '【長さ出し】ワンカラー・フラッシュネイル・ラメグラ', summaryName: '【長さ出し】ワンカラー・ラメグラ', duration: '100分', description: '2カラー +¥500 / 3カラー +¥700 / 韓国・ワンホン・ニュアンス対応', note: '※ 7日以内お直し無料' },
        en: { name: '[Extension] One color / Flash nail / Glitter gradation', summaryName: '[Extension] One-colour / Glitter Gradient', duration: '100 min', description: '2 colors +¥500 / 3 colors +¥700 / Korean, Wanghong and nuance styles available', note: '※ Free fix within 7 days of visit' },
        vi: { name: '[Nối móng] Một màu / Flash nail / Ombre', summaryName: '[Nối móng] One-color / Glitter Gradient', duration: '100 phút', description: '2 màu +¥500 / 3 màu +¥700 / Có thể làm phong cách Hàn, Wanghong, nuance', note: '※ Sửa miễn phí trong vòng 7 ngày sau khi đến tiệm' },
        zh: { name: '[延长] 纯色 / 闪光甲 / 亮片渐变', duration: '100分钟', description: '2色 +¥500 / 3色 +¥700 / 支持韩系、网红与氛围款', note: '※ 到店后7天内免费修补' },
        ko: { name: '[연장] 원컬러 / 플래시 / 글리터 그라데이션', duration: '100분', description: '2컬러 +¥500 / 3컬러 +¥700 / 한국·왕홍·누앙스 스타일 가능', note: '※ 방문 후 7일 이내 무료 보수' },
        my: { name: '[Extension] တစ်ရောင် / Flash / Glitter gradation', duration: '100 မိနစ်', description: '2 ရောင် +¥500 / 3 ရောင် +¥700 / Korean, Wanghong, Nuance စတိုင်များ ရနိုင်', note: '※ လာရောက်ပြီး ၇ ရက်အတွင်း အခမဲ့ပြင်ဆင်ပေးပါသည်' },
        id: { name: '[Extension] Satu warna / Flash nail / Gradasi glitter', duration: '100 menit', description: '2 warna +¥500 / 3 warna +¥700 / Tersedia gaya Korea, Wanghong, dan nuance', note: '※ Perbaikan gratis dalam 7 hari setelah kunjungan' }
      }
    }),
    item({
      id: 'ext-4art', category: 'extension', order: 20, originalPrice: 10500, saleActive: true, salePrice: 9100, duration: '130分', home: true,
      translations: {
        ja: { name: '【長さ出し】4本アート・ストーン・パーツ付けコース', summaryName: '【長さ出し】4本アートコース', duration: '130分', description: '人気パーツ込み / 持ち込みデザインOK / 他6本ワンカラー', note: '※ 7日以内お直し無料' },
        en: { name: '[Extension] 4-nail art, stones & parts course', summaryName: '[Extension] 4-nail Art Course', duration: '130 min', description: 'Popular parts included / Bring-in designs OK / Other 6 nails one color', note: '※ Free fix within 7 days of visit' },
        vi: { name: '[Nối móng] Course 4 móng art, đá & phụ kiện', summaryName: '[Nối móng] Course art 4 móng', duration: '130 phút', description: 'Bao gồm phụ kiện phổ biến / Có thể mang mẫu / 6 móng còn lại một màu', note: '※ Sửa miễn phí trong vòng 7 ngày sau khi đến tiệm' },
        zh: { name: '[延长] 4指艺术、钻饰与配件套餐', duration: '130分钟', description: '含热门配件 / 可持图定制 / 其余6指纯色', note: '※ 到店后7天内免费修补' },
        ko: { name: '[연장] 4개 아트, 스톤 & 파츠 코스', duration: '130분', description: '인기 파츠 포함 / 디자인 지참 가능 / 나머지 6손가락 원컬러', note: '※ 방문 후 7일 이내 무료 보수' },
        my: { name: '[Extension] ၄ ချောင်း art, stones & parts course', duration: '130 မိနစ်', description: 'လူကြိုက်များ parts ပါဝင် / Design ယူလာနိုင် / ကျန် 6 ချောင်းကို တစ်ရောင်', note: '※ လာရောက်ပြီး ၇ ရက်အတွင်း အခမဲ့ပြင်ဆင်ပေးပါသည်' },
        id: { name: '[Extension] Course 4 kuku art, stone & parts', duration: '130 menit', description: 'Part populer termasuk / Boleh bawa referensi desain / 6 kuku lainnya satu warna', note: '※ Perbaikan gratis dalam 7 hari setelah kunjungan' }
      }
    }),
    item({
      id: 'ext-6art', category: 'extension', order: 30, originalPrice: 11500, saleActive: true, salePrice: 10200, duration: '150分', home: true,
      translations: {
        ja: { name: '【長さ出し】6本アート・ストーン・パーツ付けコース', summaryName: '【長さ出し】6本アートコース', duration: '150分', description: '人気パーツ込み / 持ち込みデザインOK / 他4本ワンカラー', note: '※ 7日以内お直し無料' },
        en: { name: '[Extension] 6-nail art, stones & parts course', summaryName: '[Extension] 6-nail Art Course', duration: '150 min', description: 'Popular parts included / Bring-in designs OK / Other 4 nails one color', note: '※ Free fix within 7 days of visit' },
        vi: { name: '[Nối móng] Course 6 móng art, đá & phụ kiện', summaryName: '[Nối móng] Course art 6 móng', duration: '150 phút', description: 'Bao gồm phụ kiện phổ biến / Có thể mang mẫu / 4 móng còn lại một màu', note: '※ Sửa miễn phí trong vòng 7 ngày sau khi đến tiệm' },
        zh: { name: '[延长] 6指艺术、钻饰与配件套餐', duration: '150分钟', description: '含热门配件 / 可持图定制 / 其余4指纯色', note: '※ 到店后7天内免费修补' },
        ko: { name: '[연장] 6개 아트, 스톤 & 파츠 코스', duration: '150분', description: '인기 파츠 포함 / 디자인 지참 가능 / 나머지 4손가락 원컬러', note: '※ 방문 후 7일 이내 무료 보수' },
        my: { name: '[Extension] ၆ ချောင်း art, stones & parts course', duration: '150 မိနစ်', description: 'လူကြိုက်များ parts ပါဝင် / Design ယူလာနိုင် / ကျန် 4 ချောင်းကို တစ်ရောင်', note: '※ လာရောက်ပြီး ၇ ရက်အတွင်း အခမဲ့ပြင်ဆင်ပေးပါသည်' },
        id: { name: '[Extension] Course 6 kuku art, stone & parts', duration: '150 menit', description: 'Part populer termasuk / Boleh bawa referensi desain / 4 kuku lainnya satu warna', note: '※ Perbaikan gratis dalam 7 hari setelah kunjungan' }
      }
    }),
    item({
      id: 'ext-10art', category: 'extension', order: 40, originalPrice: 14500, saleActive: true, salePrice: 12900, duration: '180分', home: true,
      translations: {
        ja: { name: '【長さ出し】10本アート・ストーン・パーツ付けコース', summaryName: '【長さ出し】10本アートコース', duration: '180分', description: '人気パーツ込み / 持ち込みデザインOK', note: '※ 7日以内お直し無料' },
        en: { name: '[Extension] 10-nail art, stones & parts course', summaryName: '[Extension] 10-nail Art Course', duration: '180 min', description: 'Popular parts included / Bring-in designs OK', note: '※ Free fix within 7 days of visit' },
        vi: { name: '[Nối móng] Course 10 móng art, đá & phụ kiện', summaryName: '[Nối móng] Course art 10 móng', duration: '180 phút', description: 'Bao gồm phụ kiện phổ biến / Có thể mang mẫu', note: '※ Sửa miễn phí trong vòng 7 ngày sau khi đến tiệm' },
        zh: { name: '[延长] 10指艺术、钻饰与配件套餐', duration: '180分钟', description: '含热门配件 / 可持图定制', note: '※ 到店后7天内免费修补' },
        ko: { name: '[연장] 10개 아트, 스톤 & 파츠 코스', duration: '180분', description: '인기 파츠 포함 / 디자인 지참 가능', note: '※ 방문 후 7일 이내 무료 보수' },
        my: { name: '[Extension] ၁၀ ချောင်း art, stones & parts course', duration: '180 မိနစ်', description: 'လူကြိုက်များ parts ပါဝင် / Design ယူလာနိုင်', note: '※ လာရောက်ပြီး ၇ ရက်အတွင်း အခမဲ့ပြင်ဆင်ပေးပါသည်' },
        id: { name: '[Extension] Course 10 kuku art, stone & parts', duration: '180 menit', description: 'Part populer termasuk / Boleh bawa referensi desain', note: '※ Perbaikan gratis dalam 7 hari setelah kunjungan' }
      }
    }),
    item({
      id: 'ext-design', category: 'extension', order: 50, originalPrice: 9100, saleActive: true, salePrice: 8100, duration: '160分',
      translations: {
        ja: { name: '【長さ出し】10本アート・マグネット・フレンチ・グラデーション等', duration: '160分', description: '韓国・ワンホン・ガーリーデザイン対応 / 持ち込みデザイン対応', note: '※ 7日以内お直し無料' },
        en: { name: '[Extension] 10-nail art, magnet, French, gradation, etc.', duration: '160 min', description: 'Korean, Wanghong and girly designs available / Bring-in designs OK', note: '※ Free fix within 7 days of visit' },
        vi: { name: '[Nối móng] 10 móng art, magnet, French, Ombre...', duration: '160 phút', description: 'Hỗ trợ phong cách Hàn, Wanghong, girly / Có thể mang mẫu', note: '※ Sửa miễn phí trong vòng 7 ngày sau khi đến tiệm' },
        zh: { name: '[延长] 10指艺术、猫眼、法式、渐变等', duration: '160分钟', description: '支持韩系、网红与少女风 / 可持图定制', note: '※ 到店后7天内免费修补' },
        ko: { name: '[연장] 10개 아트, 마그넷, 프렌치, 그라데이션 등', duration: '160분', description: '한국·왕홍·걸리 디자인 가능 / 디자인 지참 가능', note: '※ 방문 후 7일 이내 무료 보수' },
        my: { name: '[Extension] 10 ချောင်း art, magnet, French, gradation စသည်', duration: '160 မိနစ်', description: 'Korean, Wanghong, girly စတိုင်များ ရနိုင် / Design ယူလာနိုင်', note: '※ လာရောက်ပြီး ၇ ရက်အတွင်း အခမဲ့ပြင်ဆင်ပေးပါသည်' },
        id: { name: '[Extension] 10 kuku art, magnet, French, gradasi, dll.', duration: '160 menit', description: 'Tersedia gaya Korea, Wanghong, dan girly / Boleh bawa referensi desain', note: '※ Perbaikan gratis dalam 7 hari setelah kunjungan' }
      }
    }),
    item({
      id: 'ext-sculpt', category: 'extension', order: 60, originalPrice: 21100, saleActive: true, salePrice: 18600, duration: '250分',
      translations: {
        ja: { name: '【スカルプ / 40〜75MM】ジェルチップ長さ出し10本コース', duration: '250分', description: '超ロングOK / 10本フルアート・ストーン・人気パーツ込み / 持ち込みデザインOK', note: '※ 7日以内お直し無料' },
        en: { name: '[Sculpt / 40–75MM] Gel-tip extension 10-nail course', duration: '250 min', description: 'Extra-long OK / 10 full-art nails, stones and popular parts included / Bring-in designs OK', note: '※ Free fix within 7 days of visit' },
        vi: { name: '[Sculpt / 40–75MM] Course nối gel tip 10 móng', duration: '250 phút', description: 'Có thể làm móng siêu dài / Bao gồm full art 10 móng, đá và phụ kiện phổ biến / Có thể mang mẫu', note: '※ Sửa miễn phí trong vòng 7 ngày sau khi đến tiệm' },
        zh: { name: '[雕花 / 40–75MM] 凝胶甲片延长10指套餐', duration: '250分钟', description: '可做超长 / 含10指全艺术、钻饰与热门配件 / 可持图定制', note: '※ 到店后7天内免费修补' },
        ko: { name: '[스컬프 / 40–75MM] 젤 팁 연장 10개 코스', duration: '250분', description: '초롱 길이 가능 / 10손가락 풀아트, 스톤, 인기 파츠 포함 / 디자인 지참 가능', note: '※ 방문 후 7일 이내 무료 보수' },
        my: { name: '[Sculpt / 40–75MM] Gel-tip extension 10 ချောင်း course', duration: '250 မိနစ်', description: 'အလွန်ရှည်ပုံစံ ရနိုင် / 10 ချောင်း full art, stone နှင့် လူကြိုက်များ parts ပါဝင် / Design ယူလာနိုင်', note: '※ လာရောက်ပြီး ၇ ရက်အတွင်း အခမဲ့ပြင်ဆင်ပေးပါသည်' },
        id: { name: '[Sculpt / 40–75MM] Course extension gel-tip 10 kuku', duration: '250 menit', description: 'Bisa ekstra panjang / 10 kuku full art, stone, dan part populer termasuk / Boleh bawa referensi desain', note: '※ Perbaikan gratis dalam 7 hari setelah kunjungan' }
      }
    }),
    item({
      id: 'ext-chip', category: 'extension', order: 70, originalPrice: 18000, saleActive: true, salePrice: 14600, duration: '220分',
      translations: {
        ja: { name: 'ジェルチップ（長さ出し40〜75MM）アート2本・ストーン6本', duration: '220分', description: 'ロングネイル人気 / 韓国・ワンホンネイル対応', note: '※ 7日以内お直し無料' },
        en: { name: 'Gel tips (40–75MM extension), 2 art nails & 6 stone nails', duration: '220 min', description: 'Popular long nails / Korean and Wanghong nail styles available', note: '※ Free fix within 7 days of visit' },
        vi: { name: 'Gel tip nối dài 40–75MM, 2 móng art & 6 móng đá', duration: '220 phút', description: 'Móng dài được yêu thích / Hỗ trợ phong cách Hàn và Wanghong', note: '※ Sửa miễn phí trong vòng 7 ngày sau khi đến tiệm' },
        zh: { name: '凝胶甲片延长40–75MM、2指艺术与6指钻饰', duration: '220分钟', description: '人气长甲款 / 支持韩系与网红风', note: '※ 到店后7天内免费修补' },
        ko: { name: '젤 팁 연장 40–75MM, 2개 아트 & 6개 스톤', duration: '220분', description: '롱네일 인기 / 한국·왕홍 스타일 가능', note: '※ 방문 후 7일 이내 무료 보수' },
        my: { name: 'Gel-tip extension 40–75MM, art 2 ချောင်း + stone 6 ချောင်း', duration: '220 မိနစ်', description: 'Long nail လူကြိုက်များ / Korean နှင့် Wanghong စတိုင်များ ရနိုင်', note: '※ လာရောက်ပြီး ၇ ရက်အတွင်း အခမဲ့ပြင်ဆင်ပေးပါသည်' },
        id: { name: 'Gel-tip extension 40–75MM, 2 kuku art & 6 kuku stone', duration: '220 menit', description: 'Long nail populer / Tersedia gaya Korea dan Wanghong', note: '※ Perbaikan gratis dalam 7 hari setelah kunjungan' }
      }
    }),

    item({
      id: 'foot-onecolor', category: 'foot', order: 10, originalPrice: 5900, saleActive: true, salePrice: 4600, duration: '45分', home: true,
      translations: {
        ja: { name: '【フット】ワンカラー / フラッシュ / ラメネイル', summaryName: '【フット】ワンカラー / フラッシュ / ラメ', duration: '45分', description: '夏人気フットネイル', note: '※ 7日以内お直し無料' },
        en: { name: '[Foot] One color / Flash / Glitter nail', summaryName: '[Foot] One-colour / Flash / Glitter', duration: '45 min', description: 'Popular summer foot nail', note: '※ Free fix within 7 days of visit' },
        vi: { name: '[Chân] Một màu / Flash / Nhũ', summaryName: '[Chân] One-color / Flash / Glitter', duration: '45 phút', description: 'Foot nail được yêu thích mùa hè', note: '※ Sửa miễn phí trong vòng 7 ngày sau khi đến tiệm' },
        zh: { name: '[足部] 纯色 / 闪光 / 亮片', duration: '45分钟', description: '夏季人气足部美甲', note: '※ 到店后7天内免费修补' },
        ko: { name: '[풋] 원컬러 / 플래시 / 글리터', duration: '45분', description: '여름 인기 풋네일', note: '※ 방문 후 7일 이내 무료 보수' },
        my: { name: '[Foot] တစ်ရောင် / Flash / Glitter', duration: '45 မိနစ်', description: 'နွေရာသီ လူကြိုက်များသော foot nail', note: '※ လာရောက်ပြီး ၇ ရက်အတွင်း အခမဲ့ပြင်ဆင်ပေးပါသည်' },
        id: { name: '[Foot] Satu warna / Flash / Glitter', duration: '45 menit', description: 'Foot nail populer di musim panas', note: '※ Perbaikan gratis dalam 7 hari setelah kunjungan' }
      }
    }),
    item({
      id: 'foot-design', category: 'foot', order: 20, originalPrice: 7100, saleActive: true, salePrice: 5800, duration: '70分', home: true,
      translations: {
        ja: { name: '【フット】10本アート・マグネット・フレンチなど', summaryName: '【フット】10本アート・マグネット・フレンチ', duration: '70分', description: '人気デザインから1つ選択OK / 持ち込みデザイン対応', note: '※ 7日以内お直し無料' },
        en: { name: '[Foot] 10-nail art, magnet, French, etc.', summaryName: '[Foot] 10-nail Art · Magnet / French', duration: '70 min', description: 'Choose one popular design / Bring-in designs OK', note: '※ Free fix within 7 days of visit' },
        vi: { name: '[Chân] 10 móng art, magnet, French...', summaryName: '[Chân] 10 móng art · magnet / french', duration: '70 phút', description: 'Chọn 1 thiết kế phổ biến / Có thể mang mẫu', note: '※ Sửa miễn phí trong vòng 7 ngày sau khi đến tiệm' },
        zh: { name: '[足部] 10指艺术、猫眼、法式等', duration: '70分钟', description: '可选1款人气设计 / 可持图定制', note: '※ 到店后7天内免费修补' },
        ko: { name: '[풋] 10개 아트, 마그넷, 프렌치 등', duration: '70분', description: '인기 디자인 1개 선택 가능 / 디자인 지참 가능', note: '※ 방문 후 7일 이내 무료 보수' },
        my: { name: '[Foot] ၁၀ ချောင်း art, magnet, French စသည်', duration: '70 မိနစ်', description: 'လူကြိုက်များ design 1 မျိုး ရွေးနိုင် / Design ယူလာနိုင်', note: '※ လာရောက်ပြီး ၇ ရက်အတွင်း အခမဲ့ပြင်ဆင်ပေးပါသည်' },
        id: { name: '[Foot] 10 kuku art, magnet, French, dll.', duration: '70 menit', description: 'Pilih 1 desain populer / Boleh bawa referensi desain', note: '※ Perbaikan gratis dalam 7 hari setelah kunjungan' }
      }
    }),
    item({
      id: 'foot-2art', category: 'foot', order: 30, originalPrice: 6900, saleActive: true, salePrice: 5900, duration: '60分', note: 'campaign_only',
      translations: {
        ja: { name: '【フット】2本アート・ストーン・パーツ付けコース', duration: '60分', description: '持ち込みOK / 人気パーツ込み / 韓国・ワンホン・ニュアンス対応 / 他8本ワンカラー', note: '' },
        en: { name: '[Foot] 2 art nails, stones & parts course', duration: '60 min', description: 'Bring-in designs OK / Popular parts included / Korean, Wanghong and nuance styles / Other 8 nails one color', note: '' },
        vi: { name: '[Chân] Course 2 móng art, đá & phụ kiện', duration: '60 phút', description: 'Có thể mang mẫu / Bao gồm phụ kiện phổ biến / Phong cách Hàn, Wanghong, nuance / 8 móng còn lại một màu', note: '' },
        zh: { name: '[足部] 2指艺术、钻饰与配件套餐', duration: '60分钟', description: '可持图定制 / 含热门配件 / 韩系、网红、氛围款 / 其余8指纯色', note: '' },
        ko: { name: '[풋] 2개 아트, 스톤 & 파츠 코스', duration: '60분', description: '디자인 지참 가능 / 인기 파츠 포함 / 한국·왕홍·누앙스 스타일 / 나머지 8손가락 원컬러', note: '' },
        my: { name: '[Foot] ၂ ချောင်း art, stones & parts course', duration: '60 မိနစ်', description: 'Design ယူလာနိုင် / လူကြိုက်များ parts ပါဝင် / Korean, Wanghong, Nuance စတိုင် / ကျန် 8 ချောင်း တစ်ရောင်', note: '' },
        id: { name: '[Foot] Course 2 kuku art, stone & parts', duration: '60 menit', description: 'Boleh bawa referensi desain / Part populer termasuk / Gaya Korea, Wanghong, nuance / 8 kuku lainnya satu warna', note: '' }
      }
    }),
    item({
      id: 'foot-10art', category: 'foot', order: 40, originalPrice: 8900, saleActive: true, salePrice: 7700, duration: '90分',
      translations: {
        ja: { name: '【フット】10本アート・ストーン・パーツ付けコース', duration: '90分', description: '持ち込みOK / 人気パーツ込み / 韓国・ワンホン・ニュアンス対応', note: '※ 7日以内お直し無料' },
        en: { name: '[Foot] 10-nail art, stones & parts course', duration: '90 min', description: 'Bring-in designs OK / Popular parts included / Korean, Wanghong and Nuance styles', note: '※ Free fix within 7 days of visit' },
        vi: { name: '[Chân] Course 10 móng art, đá & phụ kiện', duration: '90 phút', description: 'Có thể mang mẫu / Bao gồm phụ kiện phổ biến / Phong cách Hàn, Wanghong, Nuance', note: '※ Sửa miễn phí trong vòng 7 ngày sau khi đến tiệm' },
        zh: { name: '[足部] 10指艺术、钻饰与配件套餐', duration: '90分钟', description: '可持图定制 / 含热门配件 / 韩系、网红、氛围款', note: '※ 到店后7天内免费修补' },
        ko: { name: '[풋] 10개 아트, 스톤 & 파츠 코스', duration: '90분', description: '디자인 지참 가능 / 인기 파츠 포함 / 한국·왕홍·누앙스 스타일', note: '※ 방문 후 7일 이내 무료 보수' },
        my: { name: '[Foot] ၁၀ ချောင်း art, stones & parts course', duration: '90 မိနစ်', description: 'Design ယူလာနိုင် / လူကြိုက်များ parts ပါဝင် / Korean, Wanghong, Nuance စတိုင်', note: '※ လာရောက်ပြီး ၇ ရက်အတွင်း အခမဲ့ပြင်ဆင်ပေးပါသည်' },
        id: { name: '[Foot] Course 10 kuku art, stone & parts', duration: '90 menit', description: 'Boleh bawa referensi desain / Part populer termasuk / Gaya Korea, Wanghong, Nuance', note: '※ Perbaikan gratis dalam 7 hari setelah kunjungan' }
      }
    }),

    item({ id: 'off-replacement', category: 'options', order: 10, originalPrice: 0, saleActive: false, duration: '', note: '', translations: {
      ja: { name: '付替オフ', description: '自店オフ or 初回他店オフ / オフがある場合はこちらをご選択ください' },
      en: { name: 'Replacement removal', description: 'Our salon removal or first-time other salon removal / Choose this if removal is needed' },
      vi: { name: 'Tháo khi thay bộ mới', description: 'Tháo móng của tiệm hoặc lần đầu tháo từ tiệm khác / Chọn mục này nếu cần tháo móng' },
      zh: { name: '换新卸甲', description: '本店卸甲或首次他店卸甲 / 如需卸甲请选择此项' },
      ko: { name: '교체 제거', description: '자점 제거 또는 첫 방문 타점 제거 / 제거가 필요한 경우 이 항목을 선택해 주세요' },
      my: { name: 'ပြောင်းလဲတပ်ဆင်ရန် ဖယ်ရှားခြင်း', description: 'မိမိဆိုင်မှ ဖယ်ရှားခြင်း သို့မဟုတ် ပထမအကြိမ် အခြားဆိုင်မှ ဖယ်ရှားခြင်း / ဖယ်ရှားရန်လိုပါက ဤရွေးချယ်မှုကို ရွေးပါ' },
      id: { name: 'Replacement removal', description: 'Lepas dari salon kami atau lepas pertama kali dari salon lain / Pilih ini jika perlu lepas' }
    } }),
    item({ id: 'off-own', category: 'options', order: 20, originalPrice: 1000, saleActive: false, duration: '', note: '', home: true, translations: {
      ja: { name: '自店オフ（付け替え）' }, en: { name: 'Same-salon Removal' }, vi: { name: 'Tháo gel của tiệm khi làm bộ mới' }, zh: { name: '本店卸甲（换新）' },
      ko: { name: '자점 제거(교체)' }, my: { name: 'မိမိဆိုင် ဖယ်ရှားခြင်း (ပြောင်းလဲတပ်ဆင်)' }, id: { name: 'Removal salon kami saat ganti set' }
    } }),
    item({ id: 'off-other', category: 'options', order: 30, originalPrice: 2500, saleActive: false, duration: '', note: '', home: true, translations: {
      ja: { name: '他店オフ' }, en: { name: 'Other-salon Removal' }, vi: { name: 'Tháo gel tiệm khác' }, zh: { name: '他店卸甲' },
      ko: { name: '타점 제거' }, my: { name: 'အခြားဆိုင် ဖယ်ရှားခြင်း' }, id: { name: 'Removal salon lain' }
    } }),
    item({ id: 'off-only', category: 'options', order: 40, originalPrice: 3500, saleActive: false, duration: '', note: '', home: true, translations: {
      ja: { name: 'オフのみ' }, en: { name: 'Removal Only' }, vi: { name: 'Chỉ tháo gel' }, zh: { name: '仅卸甲' },
      ko: { name: '제거만' }, my: { name: 'ဖယ်ရှားခြင်းသာ' }, id: { name: 'Removal saja' }
    } }),
    item({ id: 'stone', category: 'options', order: 50, originalPrice: '¥50〜¥200 / 個', saleActive: false, duration: '', note: '', translations: {
      ja: { name: 'ストーン' }, en: { name: 'Stone', originalPrice: '¥50–¥200 / piece' }, vi: { name: 'Đá', originalPrice: '¥50–¥200 / viên' }, zh: { name: '水钻' },
      ko: { name: '스톤' }, my: { name: 'စတုန်း' }, id: { name: 'Stone' }
    } }),
    item({ id: 'simple-art', category: 'options', order: 60, originalPrice: '¥300〜¥600', saleActive: false, duration: '', note: '', translations: {
      ja: { name: 'シンプルアート' }, en: { name: 'Simple Art', originalPrice: '¥300–¥600' }, vi: { name: 'Art đơn giản', originalPrice: '¥300–¥600' }, zh: { name: '简约艺术' },
      ko: { name: '심플 아트' }, my: { name: 'ရိုးရှင်း art' }, id: { name: 'Art sederhana' }
    } }),
    item({ id: 'hand-art', category: 'options', order: 70, originalPrice: '¥500〜¥1,200', saleActive: false, duration: '', note: '', translations: {
      ja: { name: '手描きアート' }, en: { name: 'Hand-painted Art', originalPrice: '¥500–¥1,200' }, vi: { name: 'Art vẽ tay', originalPrice: '¥500–¥1,200' }, zh: { name: '手绘艺术' },
      ko: { name: '핸드페인팅 아트' }, my: { name: 'လက်ရေးဆွဲ art' }, id: { name: 'Art lukis tangan' }
    } }),
    item({ id: 'parts', category: 'options', order: 80, originalPrice: '¥500〜¥1,500', saleActive: false, duration: '', note: '', translations: {
      ja: { name: 'パーツ' }, en: { name: 'Parts', originalPrice: '¥500–¥1,500' }, vi: { name: 'Phụ kiện', originalPrice: '¥500–¥1,500' }, zh: { name: '配件' },
      ko: { name: '파츠' }, my: { name: 'parts' }, id: { name: 'Parts' }
    } }),
    item({ id: 'care-cuticle', category: 'options', order: 90, originalPrice: '¥2,000〜¥3,000', saleActive: false, duration: '', note: '', translations: {
      ja: { name: '甘皮処理' }, en: { name: 'Cuticle Care', originalPrice: '¥2,000–¥3,000' }, vi: { name: 'Xử lý da thừa', originalPrice: '¥2,000–¥3,000' }, zh: { name: '甘皮护理' },
      ko: { name: '큐티클 케어' }, my: { name: 'Cuticle care' }, id: { name: 'Cuticle care' }
    } }),
    item({ id: 'care-hand', category: 'options', order: 100, originalPrice: '¥3,000〜¥4,500', saleActive: false, duration: '', note: '', translations: {
      ja: { name: 'ハンドケア' }, en: { name: 'Hand Care', originalPrice: '¥3,000–¥4,500' }, vi: { name: 'Chăm sóc tay', originalPrice: '¥3,000–¥4,500' }, zh: { name: '手部护理' },
      ko: { name: '핸드 케어' }, my: { name: 'Hand care' }, id: { name: 'Perawatan tangan' }
    } }),
    item({ id: 'care-foot', category: 'options', order: 110, originalPrice: '¥4,000〜¥6,500', saleActive: false, duration: '', note: '', translations: {
      ja: { name: 'フットケア' }, en: { name: 'Foot Care', originalPrice: '¥4,000–¥6,500' }, vi: { name: 'Chăm sóc chân', originalPrice: '¥4,000–¥6,500' }, zh: { name: '足部护理' },
      ko: { name: '풋 케어' }, my: { name: 'Foot care' }, id: { name: 'Perawatan kaki' }
    } })
  ];

  window.GOLYN_PRICING_LANGS = langs;
  window.GOLYN_PRICING_CATEGORIES = categoryTranslations;
  window.GOLYN_PRICING_HOME_CARDS = homeCards;
  window.GOLYN_PRICING_ITEMS = items;
  window.GOLYN_PRICING_CAMPAIGN = window.GOLYN_SANITY_PRICING_CAMPAIGN || window.GOLYN_PRICING_CAMPAIGN || campaign;
})();
