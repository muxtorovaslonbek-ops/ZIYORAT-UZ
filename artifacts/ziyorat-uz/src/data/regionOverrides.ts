import { Service } from './services';
import sobirImg from '@/assets/people/sobir.jpg';
import maxliyoImg from '@/assets/people/maxliyo.jpg';
import hilolaImg from '@/assets/people/hilola.jpg';
import lolaImg from '@/assets/people/lola.jpg';
import roxilaImg from '@/assets/people/roxila.jpg';
import murodImg from '@/assets/people/murod.jpg';
import temurImg from '@/assets/people/temur.jpg';
import guliImg from '@/assets/people/guli.jpg';
import farhodbekImg from '@/assets/people/farhodbek.jpg';

export interface ExtendedService extends Service {
  certificate?: string;
  languages?: string;
  notes?: string;
  externalUrl?: string;
  embedUrl?: string;
}

export type RegionServices = {
  translator?: ExtendedService[];
  hotel?: ExtendedService[];
  companion?: ExtendedService[];
  food?: ExtendedService[];
  guide?: ExtendedService[];
};

const HOTEL_IMG = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600';
const FOOD_IMG = 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600';

export const REGION_OVERRIDES: Record<string, RegionServices> = {
  navoiy: {
    translator: [
      {
        id: 'nv-tr-1',
        name: 'Pulatov Sobir Kodirovich',
        description: 'Ingliz/Rus tarjimon · Buxoro/Navoiy hududlari',
        price: 120,
        rating: 4.9,
        image: sobirImg,
        languages: 'Ingliz, Rus',
        certificate: 'A-455/B',
      },
      {
        id: 'nv-tr-2',
        name: 'Atoyeva Maxliyo Djalolitdinovna',
        description: 'Rus tilida tarjimon · Navoiy viloyati',
        price: 110,
        rating: 4.8,
        image: maxliyoImg,
        languages: 'Rus',
        certificate: 'A 265/B (18.02.2022)',
      },
      {
        id: 'nv-tr-3',
        name: 'Jan Hilola Shavkatovna',
        description: "Ingliz/Oʻzbek tarjimon · Buxoro/Navoiy",
        price: 115,
        rating: 4.9,
        image: hilolaImg,
        languages: "Ingliz, Oʻzbek",
        certificate: 'A-904/B (01.03.2022)',
      },
    ],
    companion: [
      {
        id: 'nv-hm-1',
        name: 'Yaxshiyeva Lola Mahmudjonovna',
        description: "Ekskursiya yetakchisi · Buxoro · Ingliz/Rus/Chex",
        price: 90,
        rating: 4.9,
        image: lolaImg,
        languages: 'Ingliz, Rus, Chex',
      },
      {
        id: 'nv-hm-2',
        name: "Bafoyeva Roxila Valijon qizi",
        description: "Ekskursiya yetakchisi · Navoiy · Oʻzbek",
        price: 70,
        rating: 4.7,
        image: roxilaImg,
        languages: "Oʻzbek",
        certificate: '18.02.2022',
      },
      {
        id: 'nv-hm-3',
        name: 'Kadirov Murod Gaybulloyevich',
        description: 'Ekskursiya yetakchisi · Buxoro/Navoiy · Ingliz/Rus',
        price: 95,
        rating: 4.8,
        image: murodImg,
        languages: 'Ingliz, Rus',
        certificate: '31.12.2023',
      },
      {
        id: 'nv-hm-4',
        name: 'Ergashov Temur',
        description: "Yosh hamroh · Navoiy",
        price: 50,
        rating: 4.6,
        image: temurImg,
        languages: "Oʻzbek, Ingliz",
      },
    ],
    guide: [
      {
        id: 'nv-gd-1',
        name: 'Guli Jumanazarova',
        description: 'Yosh gid · Ingliz tilida ekskursiya',
        price: 80,
        rating: 4.8,
        image: guliImg,
        languages: 'Ingliz',
        certificate: 'YG-25-1006468 (30.09.2025)',
      },
      {
        id: 'nv-gd-2',
        name: 'Farhodbek Polatov',
        description: 'Yosh gid · Ingliz tilida ekskursiya',
        price: 80,
        rating: 4.8,
        image: farhodbekImg,
        languages: 'Ingliz',
        certificate: 'YG-25-460491 (30.09.2025)',
      },
    ],
    hotel: [
      {
        id: 'nv-ht-1',
        name: 'Navoiy mehmonxonasi (Yandex Maps)',
        description: "Tavsiya etilgan mehmonxona — joylashuv va sharhlar Yandex Maps'da",
        price: 90,
        rating: 4.7,
        image: HOTEL_IMG,
        externalUrl: 'https://yandex.uz/maps/org/54380443144/',
        embedUrl: 'https://yandex.uz/map-widget/v1/org/54380443144/',
      },
    ],
    food: [
      {
        id: 'nv-fd-1',
        name: 'Navoiy oshxonasi (Yandex Maps)',
        description: "Tavsiya etilgan ovqatlanish joyi — manzil Yandex Maps'da",
        price: 30,
        rating: 4.7,
        image: FOOD_IMG,
        externalUrl: 'https://yandex.uz/maps/org/156206287560/',
        embedUrl: 'https://yandex.uz/map-widget/v1/org/156206287560/',
      },
    ],
  },
};
