// Japanese originals supplied by the salon; other languages are translations.
export const reviewTranslations = {
  "ja": {
    "rev1_q": "すごくていねいに施術していただき 色味も迷っていたら一緒に考えて下さり とても素敵な仕上がりになりました!! いままで通ったネイルサロンで一番丁寧でした！",
    "rev2_q": "初めて利用しましたが、とても丁寧にカウンセリングから施術までしていただき楽しく過ごすことができました！",
    "rev3_q": "亀裂が入っていたにも関わらず、かわいいネイルにして頂きました！<br />ありがとうございました。"
  },
  "en": {
    "rev1_q": "The treatment was incredibly thorough. When I couldn't decide on a color, they helped me choose, and the result was wonderful!! This was the most attentive nail salon I've ever been to!",
    "rev2_q": "It was my first visit, and they took great care from the consultation through to the treatment. I had such an enjoyable time!",
    "rev3_q": "Even though my nail had a crack, they still made my nails look lovely!<br />Thank you so much."
  },
  "vi": {
    "rev1_q": "Tôi được làm móng rất tỉ mỉ. Khi tôi còn phân vân về màu sắc, bạn ấy cùng tôi suy nghĩ và chọn màu, thành phẩm rất đẹp!! Đây là tiệm nail làm cẩn thận nhất trong những tiệm tôi từng đến!",
    "rev2_q": "Đây là lần đầu tôi đến tiệm, nhưng từ tư vấn đến làm móng đều rất chu đáo, và tôi đã có khoảng thời gian thật vui vẻ!",
    "rev3_q": "Dù móng của tôi bị nứt, bạn ấy vẫn làm cho tôi một bộ móng thật dễ thương!<br />Cảm ơn rất nhiều."
  },
  "zh": {
    "rev1_q": "做美甲时非常细致。我犹豫选什么颜色时，美甲师还和我一起挑选，最后的效果特别漂亮!! 这是我去过的美甲店里做得最细致的一家！",
    "rev2_q": "第一次来这家店，从咨询到做美甲都非常细心，让我度过了一段愉快的时光！",
    "rev3_q": "虽然我的指甲有裂纹，还是帮我做出了可爱的美甲！<br />非常感谢。"
  },
  "ko": {
    "rev1_q": "정말 꼼꼼하게 시술해 주셨어요. 색상을 고민하고 있으니 함께 골라 주셔서 결과가 정말 예뻤습니다!! 지금까지 다녀 본 네일숍 중 가장 꼼꼼했어요!",
    "rev2_q": "처음 방문했는데 상담부터 시술까지 정말 세심하게 해 주셔서 즐거운 시간을 보낼 수 있었어요!",
    "rev3_q": "손톱에 균열이 있었는데도 예쁜 네일로 완성해 주셨어요!<br />감사합니다."
  },
  "my": {
    "rev1_q": "လက်သည်းကို အလွန်ဂရုတစိုက် ပြုလုပ်ပေးခဲ့ပါတယ်။ ဘယ်အရောင်ရွေးရမလဲ မဆုံးဖြတ်နိုင်တဲ့အခါ အတူတူစဉ်းစားရွေးချယ်ပေးလို့ ရလဒ်က အရမ်းလှပခဲ့ပါတယ်!! သွားဖူးသမျှ လက်သည်းဆိုင်တွေထဲမှာ ဂရုအစိုက်ဆုံးဆိုင်ပါပဲ။",
    "rev2_q": "ပထမဆုံးလာဖြစ်တာပါ။ တိုင်ပင်ဆွေးနွေးချိန်ကစပြီး လက်သည်းပြုလုပ်ပြီးတဲ့အထိ အရမ်းဂရုစိုက်ပေးလို့ ပျော်ရွှင်စရာအချိန်ကို ဖြတ်သန်းနိုင်ခဲ့ပါတယ်။",
    "rev3_q": "လက်သည်းမှာ အက်ကြောင်းရှိနေပေမယ့် ချစ်စရာကောင်းတဲ့ လက်သည်းလေးတွေဖြစ်အောင် ပြုလုပ်ပေးခဲ့ပါတယ်။<br />အရမ်းကျေးဇူးတင်ပါတယ်။"
  },
  "id": {
    "rev1_q": "Pengerjaannya sangat teliti. Saat saya bingung memilih warna, mereka membantu memikirkannya bersama, dan hasilnya sangat cantik!! Ini salon kuku dengan pengerjaan paling teliti yang pernah saya kunjungi!",
    "rev2_q": "Ini kunjungan pertama saya. Mereka sangat teliti sejak konsultasi hingga pengerjaan, dan saya menikmati waktu saya di sana!",
    "rev3_q": "Meskipun kuku saya retak, mereka tetap berhasil membuat kuku saya terlihat cantik!<br />Terima kasih banyak."
  }
};

Object.entries(reviewTranslations).forEach(([lang, values]) => {
  Object.assign(values, {
    rev1_author: lang === 'ja' ? 'うなゆ 様' : 'Unayu',
    rev2_author: lang === 'ja' ? 'Nozomi Sakae 様' : 'Nozomi Sakae',
    // Reading confirmed by the salon: わかの きら.
    rev3_author: lang === 'ja' ? '若野綺萊 様' : 'Wakano Kira',
  });
});
