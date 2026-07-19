import samarqandImg from '@/assets/regions/samarqand.jpg';
import buxoroImg from '@/assets/regions/buxoro.jpg';
import xorazmImg from '@/assets/regions/xorazm.jpg';
import toshkentImg from '@/assets/regions/toshkent.jpg';
import toshkentShaharImg from '@/assets/regions/toshkent-shahar.jpg';
import andijonImg from '@/assets/regions/andijon.jpg';
import fargonaImg from '@/assets/regions/fargona.jpg';
import namanganImg from '@/assets/regions/namangan.jpg';
import qashqadaryoImg from '@/assets/regions/qashqadaryo.jpg';
import surxondaryoImg from '@/assets/regions/surxondaryo.jpg';
import jizzaxImg from '@/assets/regions/jizzax.jpg';
import sirdaryoImg from '@/assets/regions/sirdaryo.jpg';
import navoiyImg from '@/assets/regions/navoiy.jpg';
import qoraqalpogistonImg from '@/assets/regions/qoraqalpogiston.jpg';

export interface Region {
  slug: string;
  name: string;
  nameEn: string;
  description: string;
  image: string;
}

export const REGIONS: Region[] = [
  { slug: 'samarqand', name: 'Samarqand viloyati', nameEn: 'Samarkand', description: 'Registon, Bibi-Xonim, Shohi-Zinda', image: samarqandImg },
  { slug: 'buxoro', name: 'Buxoro viloyati', nameEn: 'Bukhara', description: "Poi-Kalon, Ark qal'asi, Mir-i Arab", image: buxoroImg },
  { slug: 'xorazm', name: 'Xorazm viloyati', nameEn: 'Khorezm', description: 'Ichan-Qala, Kalta-Minor', image: xorazmImg },
  { slug: 'toshkent', name: 'Toshkent viloyati', nameEn: 'Tashkent Region', description: 'Chimyon togʻlari, Charvoq', image: toshkentImg },
  { slug: 'andijon', name: 'Andijon viloyati', nameEn: 'Andijan', description: "Bobur bog'i, Jome masjid", image: andijonImg },
  { slug: 'fargona', name: "Fargʻona viloyati", nameEn: 'Fergana', description: "Qoʻqon xonligi obidalari", image: fargonaImg },
  { slug: 'namangan', name: 'Namangan viloyati', nameEn: 'Namangan', description: "Mulla Qirgʻiz madrasasi", image: namanganImg },
  { slug: 'qashqadaryo', name: 'Qashqadaryo viloyati', nameEn: 'Qashqadaryo', description: "Oqsaroy, Doʻrut-Tilovat", image: qashqadaryoImg },
  { slug: 'surxondaryo', name: 'Surxondaryo viloyati', nameEn: 'Surkhandarya', description: 'Termiz tarixiy obidalari', image: surxondaryoImg },
  { slug: 'jizzax', name: 'Jizzax viloyati', nameEn: 'Jizzakh', description: 'Tarixiy obidalar va tabiat', image: jizzaxImg },
  { slug: 'sirdaryo', name: 'Sirdaryo viloyati', nameEn: 'Sirdarya', description: "Tarixiy karvon yoʻli", image: sirdaryoImg },
  { slug: 'navoiy', name: 'Navoiy viloyati', nameEn: 'Navoi', description: 'Nurota, Qizilqum', image: navoiyImg },
  { slug: 'qoraqalpogiston', name: "Qoraqalpogʻiston Respublikasi", nameEn: 'Karakalpakstan', description: 'Mizdaxxon, Chilpiq, Orol', image: qoraqalpogistonImg },
  { slug: 'toshkent-shahar', name: 'Toshkent shahri', nameEn: 'Tashkent City', description: 'Hazrati Imom, Xast-Imom majmuasi', image: toshkentShaharImg },
];
