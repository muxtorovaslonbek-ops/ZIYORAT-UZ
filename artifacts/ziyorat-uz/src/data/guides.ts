import sobir from '@/assets/people/sobir.jpg';
import maxliyo from '@/assets/people/maxliyo.jpg';
import hilola from '@/assets/people/hilola.jpg';
import lola from '@/assets/people/lola.jpg';
import roxila from '@/assets/people/roxila.jpg';
import murod from '@/assets/people/murod.jpg';
import farhodbek from '@/assets/people/farhodbek.jpg';
import guli from '@/assets/people/guli.jpg';
import temur from '@/assets/people/temur.jpg';

export interface Guide {
  id: string;
  name: string;
  region: string;
  languages: string[];
  pricePerDay: number;
  rating: number;
  experience: number;
  phone: string;
  telegram: string;
  avatar: string;
  bio: string;
  role?: string;
  certificate?: string;
}

export const GUIDES: Guide[] = [
  {
    id: 'g-sobir',
    name: 'Sobir Aliyev',
    region: 'Navoiy',
    languages: ['UZ', 'RU', 'EN'],
    pricePerDay: 75,
    rating: 4.9,
    experience: 12,
    phone: '+998901234501',
    telegram: 'ziyorat_bot',
    avatar: sobir,
    bio: "Navoiy va Buxoro ziyoratgohlari boʻyicha tajribali gid.",
    role: 'Gid',
    certificate: 'NV-2023-018',
  },
  {
    id: 'g-maxliyo',
    name: 'Maxliyo Karimova',
    region: 'Buxoro',
    languages: ['UZ', 'EN'],
    pricePerDay: 70,
    rating: 4.8,
    experience: 7,
    phone: '+998901234502',
    telegram: 'ziyorat_bot',
    avatar: maxliyo,
    bio: 'Buxoro tarixi va meʼmorchiligi boʻyicha sertifikatlangan gid.',
    role: 'Gid',
    certificate: 'BX-2022-041',
  },
  {
    id: 'g-hilola',
    name: 'Hilola Yusupova',
    region: 'Buxoro',
    languages: ['UZ', 'EN', 'RU'],
    pricePerDay: 65,
    rating: 4.9,
    experience: 6,
    phone: '+998901234503',
    telegram: 'ziyorat_bot',
    avatar: hilola,
    bio: "Poi-Kalon va Lyabi-Hovuz boʻyicha mutaxassis hamroh.",
    role: 'Hamroh',
    certificate: 'BX-2023-077',
  },
  {
    id: 'g-lola',
    name: 'Lola Rahmonova',
    region: 'Navoiy',
    languages: ['UZ', 'RU'],
    pricePerDay: 55,
    rating: 4.7,
    experience: 5,
    phone: '+998901234504',
    telegram: 'ziyorat_bot',
    avatar: lola,
    bio: 'Navoiy viloyati ziyoratgohlari boʻyicha hamroh va tarjimon.',
    role: 'Tarjimon',
    certificate: 'NV-2024-012',
  },
  {
    id: 'g-roxila',
    name: 'Roxila Soliyeva',
    region: 'Buxoro',
    languages: ['UZ', 'EN', 'TR'],
    pricePerDay: 80,
    rating: 5.0,
    experience: 9,
    phone: '+998901234505',
    telegram: 'ziyorat_bot',
    avatar: roxila,
    bio: 'Turk tilidagi guruhlar uchun tajribali gid-tarjimon.',
    role: 'Tarjimon',
    certificate: 'BX-2021-104',
  },
  {
    id: 'g-murod',
    name: 'Murod Ergashev',
    region: 'Navoiy',
    languages: ['UZ', 'RU', 'EN'],
    pricePerDay: 85,
    rating: 4.8,
    experience: 14,
    phone: '+998901234506',
    telegram: 'ziyorat_bot',
    avatar: murod,
    bio: 'Bahouddin Naqshband majmuasi boʻyicha sertifikatlangan ekspert.',
    role: 'Gid',
    certificate: 'NV-2020-005',
  },
  {
    id: 'g-farhodbek',
    name: 'Farhodbek Toshev',
    region: 'Buxoro',
    languages: ['UZ', 'EN', 'AR'],
    pricePerDay: 90,
    rating: 4.9,
    experience: 10,
    phone: '+998901234507',
    telegram: 'ziyorat_bot',
    avatar: farhodbek,
    bio: 'Arab tilida soʻzlashuvchi mehmonlar uchun maxsus gid.',
    role: 'Gid',
    certificate: 'BX-2022-058',
  },
  {
    id: 'g-guli',
    name: 'Guli Nazarova',
    region: 'Buxoro',
    languages: ['UZ', 'RU'],
    pricePerDay: 60,
    rating: 4.8,
    experience: 8,
    phone: '+998901234508',
    telegram: 'ziyorat_bot',
    avatar: guli,
    bio: 'Buxoro shahar markazi va bozorlari boʻyicha hamroh.',
    role: 'Hamroh',
    certificate: 'BX-2023-091',
  },
  {
    id: 'g-temur',
    name: 'Temur Xolmatov',
    region: 'Navoiy',
    languages: ['UZ', 'EN', 'RU'],
    pricePerDay: 78,
    rating: 4.9,
    experience: 11,
    phone: '+998901234509',
    telegram: 'ziyorat_bot',
    avatar: temur,
    bio: "Nurota va Chashma boʻyicha tajribali gid.",
    role: 'Gid',
    certificate: 'NV-2021-029',
  },
];
