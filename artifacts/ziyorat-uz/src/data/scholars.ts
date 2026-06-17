import bukhari from '@/assets/scholars/bukhari.jpg';
import ibnSina from '@/assets/scholars/ibn-sina.jpg';
import temur from '@/assets/scholars/temur.jpg';
import navoiy from '@/assets/scholars/navoiy.jpg';
import ulugbek from '@/assets/scholars/ulugbek.jpg';

export interface Scholar {
  id: string;
  name: string;
  era: string;
  title: string;
  image: string;
  bio: string;
  quotes: string[];
  voiceLang: string; // BCP-47 for TTS
  systemPrompt: string;
}

export const SCHOLARS: Scholar[] = [
  {
    id: 'bukhari',
    name: 'Imom Buxoriy',
    era: '810 — 870',
    title: 'Buyuk muhaddis, "Sahihi Buxoriy" muallifi',
    image: bukhari,
    bio: "Abu Abdulloh Muhammad ibn Ismoil al-Buxoriy — islom olamidagi eng buyuk muhaddislardan biri. Buxoroda tug'ilib, butun umrini hadis ilmiga bag'ishlagan. \"Al-Jome' as-Sahih\" (Sahihi Buxoriy) asari Qur'ondan keyin eng ishonchli kitob hisoblanadi. 600 mingdan ortiq hadisni yodlagan va saralagan.",
    quotes: [
      "Ilm — amaldan oldin keladi.",
      "Hadis ilmi — payg'ambarning merosi.",
      "Rost so'z aytuvchining qalbi tinch bo'ladi.",
    ],
    voiceLang: 'ar-SA',
    systemPrompt: "Sen Imom Buxoriysan (810-870) — buyuk muhaddis. Hurmatli, donishmand, sokin va hikmatli ohangda gapir. Hadis, ilm, taqvo, rostgo'ylik haqida hikoya qil. Foydalanuvchining tilida javob ber. Javoblar 3-5 jumladan oshmasin, oddiy va o'qilishi qulay bo'lsin.",
  },
  {
    id: 'ibn-sina',
    name: 'Ibn Sino (Avitsenna)',
    era: '980 — 1037',
    title: 'Tabib, faylasuf, "Tib qonunlari" muallifi',
    image: ibnSina,
    bio: "Abu Ali Husayn ibn Sino — o'rta asr Sharqining buyuk olimi, tabib, faylasuf va shoir. Buxoro yaqinida Afshona qishlog'ida tug'ilgan. \"Al-Qonun fit-tibb\" asari 600 yil davomida Yevropa universitetlarida darslik bo'lgan. Tibbiyot, falsafa, mantiq, astronomiya va musiqa bo'yicha 450 dan ortiq asar yozgan.",
    quotes: [
      "Tibbiyot — sog'liqni saqlash va kasallikni davolash san'atidir.",
      "Aql — bu insonning eng oliy ne'matidir.",
      "Bilim — qalbning oziqasi.",
    ],
    voiceLang: 'fa-IR',
    systemPrompt: "Sen Ibn Sinosan (Avitsenna, 980-1037) — buyuk tabib va faylasuf. Aqlli, kuzatuvchan, tabiat va inson tanasi haqida bilimdon ohangda gapir. Tibbiyot, falsafa, ilm haqida hikoya qil. Foydalanuvchining tilida javob ber. Javoblar 3-5 jumladan oshmasin.",
  },
  {
    id: 'temur',
    name: 'Amir Temur',
    era: '1336 — 1405',
    title: 'Sohibqiron, Temuriylar saltanati asoschisi',
    image: temur,
    bio: "Amir Temur (Tamerlan) — buyuk sarkarda va davlat arbobi, Temuriylar saltanatining asoschisi. Shahrisabz yaqinida tug'ilgan, Samarqandni dunyoning go'zal poytaxtiga aylantirgan. Ilm, san'at va me'morchilikning homiysi bo'lgan. \"Temur tuzuklari\" — uning siyosiy va harbiy ta'limoti.",
    quotes: [
      "Kuch — adolatda.",
      "Davlatning poydevori — to'g'rilik, mahkamligi — kengashda.",
      "Bir bog'bonsiz bog' qurib qoladi, bir podshohsiz mamlakat vayron bo'ladi.",
    ],
    voiceLang: 'tr-TR',
    systemPrompt: "Sen Amir Temursan (Sohibqiron, 1336-1405) — buyuk sarkarda va davlat asoschisi. Salobatli, qat'iy, lekin adolatli ohangda gapir. Davlatchilik, harbiy ish, adolat, Samarqandni qurish haqida hikoya qil. Foydalanuvchining tilida javob ber. Javoblar 3-5 jumladan oshmasin.",
  },
  {
    id: 'navoiy',
    name: 'Alisher Navoiy',
    era: '1441 — 1501',
    title: 'Buyuk shoir, mutafakkir, davlat arbobi',
    image: navoiy,
    bio: "Mir Alisher Navoiy — o'zbek mumtoz adabiyotining asoschisi, buyuk shoir, mutafakkir va davlat arbobi. Hirotda Husayn Boyqaro saroyida vazir bo'lgan. \"Xamsa\", \"Xazoyin ul-maoniy\", \"Mahbub ul-qulub\" kabi 30 dan ortiq asar yozgan. Eski o'zbek tilini adabiy tilga aylantirgan.",
    quotes: [
      "Odami ersang demagil odami, oningkim yo'q xalq g'amidin g'ami.",
      "Ilm o'rganmoq farzdir, har ne sening yodingda yo'q.",
      "Til — ko'ngilning tarjimoni.",
    ],
    voiceLang: 'uz-UZ',
    systemPrompt: "Sen Alisher Navoiysan (1441-1501) — buyuk shoir va mutafakkir. She'riy, nozik, hikmatli ohangda gapir. Adabiyot, til, do'stlik, insoniylik, ishq haqida hikoya qil. Imkon bo'lsa o'z g'azaliyotingdan misol keltir. Foydalanuvchining tilida javob ber. Javoblar 3-5 jumladan oshmasin.",
  },
  {
    id: 'ulugbek',
    name: "Mirzo Ulug'bek",
    era: '1394 — 1449',
    title: 'Astronom, matematik, Temuriylar sultoni',
    image: ulugbek,
    bio: "Mirzo Muhammad Tarag'ay Ulug'bek — Amir Temurning nabirasi, buyuk astronom va matematik. Samarqandda mashhur rasadxonani qurgan, \"Zij-i Ulug'bek\" yulduzlar katalogini tuzgan. Yulduzlar harakatini hayratlanarli aniqlik bilan o'lchagan. Madrasalar qurib, ilm-ma'rifatni rivojlantirgan.",
    quotes: [
      "Dinlar to'zg'ib ketadi, ammo ilmiy asarlar abadiy qoladi.",
      "Yulduzlar — Tangrining yozuvidir.",
      "Ilm intilish — eng oliy ibodatdir.",
    ],
    voiceLang: 'uz-UZ',
    systemPrompt: "Sen Mirzo Ulug'beksan (1394-1449) — buyuk astronom va matematik, Samarqand rasadxonasi sohibi. Aqlli, ilmga oshufta, samimiy ohangda gapir. Astronomiya, yulduzlar, matematika, Samarqand rasadxonasi haqida hikoya qil. Foydalanuvchining tilida javob ber. Javoblar 3-5 jumladan oshmasin.",
  },
];

export const getScholar = (id: string) => SCHOLARS.find((s) => s.id === id);
