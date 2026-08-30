export const primaryNavigation = [
  { href: '/gallery/', label: 'ネイルデザイン' },
  { href: '/price/', label: 'メニュー・料金' },
  { href: '/services/', label: 'サービス' },
  { href: '/staff/', label: 'スタッフ紹介' },
  { href: '/access/', label: '店舗情報' },
  { href: '/reservation/', label: 'ご予約' },
  { href: '/news/', label: 'ネイルコラム' },
] as const;

export const supportedLanguages = [
  { code: 'ja', label: '日本語', href: '/' },
  { code: 'en', label: 'English', href: '/en/' },
  { code: 'vi', label: 'Tiếng Việt', href: '/vi/' },
  { code: 'zh', label: '中文', href: '/zh/' },
  { code: 'ko', label: '한국어', href: '/ko/' },
  { code: 'my', label: 'မြန်မာ', href: '/my/' },
  { code: 'id', label: 'Bahasa Indonesia', href: '/id/' },
] as const;

export const pageSeo = {
  home: {
    title: 'Golyn Nail（ゴーリンネイル）｜大阪のネイルサロン',
    description:
      '大阪のネイルサロン「Golyn Nail（ゴーリンネイル）」。ジェルネイル、韓国ネイル、ワンホンネイル、長さ出し、持ち込みデザインなど、幅広いネイルメニューをご用意しています。',
  },
  gallery: {
    title: 'ネイルデザイン・ギャラリー｜Golyn Nail',
    description:
      'Golyn Nailのネイルデザインギャラリー。ジェルネイル、韓国ネイル、ワンホンネイル、上品なアートや季節のデザインをご覧いただけます。',
  },
  price: {
    title: 'ネイルメニュー・料金｜Golyn Nail',
    description:
      'Golyn Nailのネイルメニューと料金をご案内します。ジェルネイル、長さ出し、フットネイル、オフやケアの内容を分かりやすく掲載しています。',
  },
  services: {
    title: 'ネイルサービス｜Golyn Nail',
    description:
      'Golyn Nailのネイルサービスをご紹介します。ジェルネイル、ネイルアート、韓国ネイル、ワンホンネイル、長さ出し、持ち込みデザインに対応します。',
  },
  staff: {
    title: 'スタッフ紹介｜Golyn Nail',
    description:
      'Golyn Nailの公開済みスタッフ情報をご紹介します。プロフィールは確認済みの情報が登録された場合のみ掲載します。',
  },
  access: {
    title: '店舗情報｜Golyn Nail',
    description:
      '大阪でオープン準備中のGolyn Nailの店舗情報ページです。住所や最寄り駅は確定後、当サイトと公式SNSでお知らせします。',
  },
  reservation: {
    title: 'ご予約｜Golyn Nail',
    description:
      'Golyn Nailのご予約案内です。予約受付の開始時期と正式な予約方法は、準備が整い次第当サイトと公式SNSでお知らせします。',
  },
  news: {
    title: 'ネイルコラム｜Golyn Nail',
    description:
      'Golyn Nailのネイルコラム。デザイン選び、ネイルケア、トレンド、初めてのネイルサロン利用に役立つ情報をお届けします。',
  },
} as const;
