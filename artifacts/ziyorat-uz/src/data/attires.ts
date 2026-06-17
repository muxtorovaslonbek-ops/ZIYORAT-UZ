export type AttireGender = 'male' | 'female';

export type Attire = {
  id: string;
  name: string;
  era: string;
  gender: AttireGender;
  description: string;
  background: string;
  preview: string;
};

export const ATTIRES: Attire[] = [
  // ===== ERKAKLAR =====
  {
    id: 'amir-temur',
    name: 'Amir Temur',
    era: 'XIV asr — Temuriylar saltanati',
    gender: 'male',
    description: "Oltin zarbof choponi, qimmatbaho toshlar bilan bezatilgan toj-salla, yashil-qizil ipak ichki kiyim, kamarda jangchi qilichi, qo'lda hokimiyat tayog'i",
    background: "Samarqanddagi Bibi-Xonim masjidi yaqinida, oltin tong nuri, hashamatli saroy hovlisi",
    preview: '👑',
  },
  {
    id: 'alisher-navoiy',
    name: 'Alisher Navoiy',
    era: 'XV asr — Temuriylar madaniyati',
    gender: 'male',
    description: "Yashil ipak choponi, oq nafis salla, kashta tikilgan kamar, qo'lda qalam va kitob, donishmand ulamo qiyofasi",
    background: "Hirot kutubxonasi, qadimiy qo'lyozmalar va xattotlik asboblari, derazadan tushgan yumshoq nur",
    preview: '📜',
  },
  {
    id: 'imom-buxoriy',
    name: 'Imom Buxoriy',
    era: 'IX asr — Islom oltin davri',
    gender: 'male',
    description: "Oq va och yashil rangli uzun jubba, oq salla, tasbeh qo'lda, ulamo libosi, sodda va vazmin uslub",
    background: "Buxorodagi qadimiy madrasa hovlisi, ganch o'ymakorligi, ilm muhiti",
    preview: '🕌',
  },
  {
    id: 'ulugbek',
    name: "Mirzo Ulug'bek",
    era: 'XV asr — astronom shoh',
    gender: 'male',
    description: "Ko'k va kumush rangli zarbof choponi, yulduzli naqshlar, astronomik asboblar (asturlab) qo'lda, shoh-olim qiyofasi",
    background: "Samarqand rasadxonasi, kechqurun yulduzli osmon, mis astronomik asboblar",
    preview: '⭐',
  },
  {
    id: 'ibn-sino',
    name: 'Ibn Sino',
    era: 'X asr — tabib va faylasuf',
    gender: 'male',
    description: "Qo'ng'ir va oltin rangli olim choponi, oq salla, qo'lda tabobat kitobi va shisha qadahda dorivor o'simlik",
    background: "Qadimiy tabobat xonasi, javon to'la qo'lyozmalar va dori shishalar, sham yorug'i",
    preview: '⚗️',
  },
  {
    id: 'erkak-toy',
    name: "Erkak — Milliy to'y",
    era: "An'anaviy o'zbek",
    gender: 'male',
    description: "Yorqin atlas zarbof chopon, do'ppi (zarbof), ipak kamar, oq ko'ylak, an'anaviy to'y libosi",
    background: "An'anaviy o'zbek hovlisi, gullagan o'rik daraxti, supa va ko'rpachalar",
    preview: '🎉',
  },
  {
    id: 'erkak-jangchi',
    name: 'Sohibqiron jangchisi',
    era: 'XIV-XV asr',
    gender: 'male',
    description: "Po'lat zirhli ko'ylak, dubulg'a, charm etiklar, qilich va qalqon, jangchi qiyofasi",
    background: "Tarixiy jang maydoni cheti, bayroqlar va otlar, tongotar nuri",
    preview: '🛡️',
  },

  // ===== AYOLLAR =====
  {
    id: 'bibi-xonim',
    name: 'Bibi Xonim',
    era: 'XIV asr — Temuriylar malikasi',
    gender: 'female',
    description: "Oltin va qizil zarbof uzun ko'ylak, qimmatbaho marvarid taqinchoqlar, baland zar bezakli bosh kiyim (kulta), nafis ipak ro'mol, malika qiyofasi",
    background: "Bibi-Xonim masjidi old hovlisi, oltin quyosh nuri, marmar ustunlar",
    preview: '👸',
  },
  {
    id: 'ayol-toy',
    name: "Ayol — Milliy to'y",
    era: "An'anaviy o'zbek",
    gender: 'female',
    description: "Yorqin xon-atlas (xonatlas) ko'ylak, kashta tikilgan nimcha, marvarid va kumush taqinchoqlar, baxmal do'ppi yoki ro'mol, kelinchak libosi",
    background: "An'anaviy o'zbek hovlisi, gullagan bog', qizil so'zana fonida",
    preview: '💐',
  },
  {
    id: 'ayol-shoira',
    name: "Saroy shoirasi",
    era: 'XV asr — Hirot saroyi',
    gender: 'female',
    description: "Ko'k va kumush ipak ko'ylak, nafis kashta, oq tor ro'mol, qo'lda qalam va g'azal kitob, ma'rifatli ayol qiyofasi",
    background: "Hirot kutubxonasi, qo'lyozmalar va anor shabchiroqlar, yumshoq sham yorug'i",
    preview: '🌸',
  },
  {
    id: 'ayol-malika',
    name: "Saroy malikasi",
    era: 'XV asr — Temuriylar saroyi',
    gender: 'female',
    description: "To'q qizil baxmal va oltin tikuvli uzun libos, marvarid taqinchoqlar, baland kulta bosh kiyim ustida nafis duvozda, qirol ayol qiyofasi",
    background: "Samarqand saroyi marmar zalida, gilam va shamdonlar, hashamatli muhit",
    preview: '👑',
  },
  {
    id: 'ayol-bukhori',
    name: "Buxorolik xonim",
    era: "An'anaviy Buxoro",
    gender: 'female',
    description: "Yashil va oltin zarbof ko'ylak, paranji o'rniga nafis ipak ro'mol, kumush bilakuzuk va sirg'a, klassik buxorolik xonim qiyofasi",
    background: "Buxorodagi Lyabi-Hovuz, qadimiy g'isht devorlar, kechki oltin nur",
    preview: '🌷',
  },
];

export const MALE_ATTIRES = ATTIRES.filter((a) => a.gender === 'male');
export const FEMALE_ATTIRES = ATTIRES.filter((a) => a.gender === 'female');
