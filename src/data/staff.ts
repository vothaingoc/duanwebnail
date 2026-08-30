export type StaffMember = {
  slug: string;
  name: string;
  position: string;
  experience: string;
  specialty: string;
  certifications: string[];
  photo: string;
  introduction: string;
  selfIntroduction: string;
  gallery: string[];
};

export const staffMembers: StaffMember[] = [
  {
    slug: 'yuki',
    name: 'Yuki',
    position: 'ネイリスト',
    experience: '8年',
    specialty: '上品なニュアンスネイル、ロングネイル、持ち込みデザイン',
    certifications: ['JNECネイリスト技能検定 1級', 'JNAジェルネイル技能検定 上級'],
    photo: '/images/nail1.jpg',
    introduction: '丁寧なカウンセリングと繊細な仕上がりで、一人ひとりに似合うデザインをご提案します。',
    selfIntroduction:
      'お客様のライフスタイルや好みに寄り添いながら、指先がきれいに見えるバランスを大切にしています。シンプルなデザインにも少し特別感を添える施術が得意です。',
    gallery: ['/images/nail2.jpg', '/images/nail3.jpg', '/images/nail4.jpg'],
  },
  {
    slug: 'emi',
    name: 'Emi',
    position: 'ネイリスト',
    experience: '5年',
    specialty: '韓国風デザイン、ワンホンネイル、パーツアート',
    certifications: ['JNECネイリスト技能検定 2級', 'JNAジェルネイル技能検定 中級'],
    photo: '/images/nail5.jpg',
    introduction: 'トレンド感のある華やかなアートから日常になじむデザインまで幅広く対応します。',
    selfIntroduction:
      '流行のデザインを取り入れつつ、お客様の雰囲気に合わせて上品に仕上げることを心がけています。初めての方にも安心して過ごしていただける接客を大切にしています。',
    gallery: ['/images/nail6.jpg', '/images/nail7.jpg', '/images/nail8.jpg'],
  },
  {
    slug: 'nana',
    name: 'Nana',
    position: 'ネイリスト',
    experience: '3年',
    specialty: 'シンプルネイル、フットネイル、ケア重視の施術',
    certifications: ['JNECネイリスト技能検定 2級', 'ネイルサロン衛生管理士'],
    photo: '/images/nail9.jpg',
    introduction: '清潔感のあるシンプルデザインと、爪の状態に合わせたケアを大切にしています。',
    selfIntroduction:
      'お客様がリラックスできる時間を過ごせるよう、やさしい接客と丁寧な施術を心がけています。自然で長く楽しめるネイルをご提案します。',
    gallery: ['/images/nail10.jpg', '/images/nail11.jpg', '/images/nail1.jpg'],
  },
];

export function getStaffBySlug(slug: string): StaffMember | undefined {
  return staffMembers.find((staff) => staff.slug === slug);
}
