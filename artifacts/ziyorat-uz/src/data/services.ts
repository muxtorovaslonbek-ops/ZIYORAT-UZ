export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  rating: number;
  image: string;
}

const HOTEL_IMG = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600';
const FOOD_IMG = 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600';
const PERSON_M = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600';
const PERSON_F = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600';

const make = (prefix: string, n: number, names: string[], desc: string, basePrice: number, img: string): Service[] =>
  names.map((name, i) => ({
    id: `${prefix}-${n}-${i}`,
    name,
    description: desc,
    price: basePrice + i * 50,
    rating: 4 + Math.random(),
    image: img,
  }));

import { REGION_OVERRIDES } from './regionOverrides';

export function getServicesForRegion(slug: string) {
  const seed = slug.length;
  const base = {
    translator: make('tr', seed, [
      'Sardor Aliyev — Ingliz/Arab',
      'Malika Yusupova — Rus/Frantsuz',
      'Jasur Karimov — Nemis/Koreys',
    ], 'Tajribali tarjimon, 5+ yil tajriba', 100, PERSON_M),
    hotel: make('ht', seed, [
      'Grand Plaza Hotel ★★★★★',
      'Silk Road Boutique ★★★★',
      'Caravanserai Inn ★★★',
      'Heritage Palace ★★★★★',
    ], "Sayohatchi uchun qulay joylashuv, nonushta bilan", 80, HOTEL_IMG),
    companion: make('hm', seed, [
      'Aziz Toʻrayev — Mahalliy hamroh',
      'Dilshod Rasulov — Tarixchi hamroh',
    ], "Viloyatni yaxshi biluvchi mahalliy hamroh", 60, PERSON_M),
    food: make('fd', seed, [
      'Plov Center — Milliy oshxona',
      'Caravan Restaurant — Sharq taomlari',
      'Tea House — An\'anaviy choyxona',
    ], "An\'anaviy o\'zbek taomlari, milliy interyer", 25, FOOD_IMG),
    guide: make('gd', seed, [
      'Aziza Botirova — Litsenziyali gid',
      'Bekzod Olimov — Tarix bo\'yicha mutaxassis',
    ], 'Sertifikatlangan professional gid', 90, PERSON_F),
  };

  const override = REGION_OVERRIDES[slug];
  if (override) {
    return {
      translator: override.translator ?? base.translator,
      hotel: override.hotel ?? base.hotel,
      companion: override.companion ?? base.companion,
      food: override.food ?? base.food,
      guide: override.guide ?? base.guide,
    };
  }
  return base;
}

export const SERVICE_TYPES = ['translator', 'hotel', 'companion', 'food', 'guide'] as const;
export type ServiceType = typeof SERVICE_TYPES[number];
