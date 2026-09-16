import rawSmartphones from './smartphonesData.json';
import { Product } from './types';

const list = rawSmartphones as any[];

export const DEFAULT_DUEL_P1: Product = (list.find(
  (p) => p.id === 'apple-apple-iphone-18-pro-max-256-gb-1071187' || p.name?.includes('iPhone 18 Pro Max') || p.name?.includes('iPhone 16 Pro Max')
) || list[0]) as unknown as Product;

export const DEFAULT_DUEL_P2: Product = (list.find(
  (p) => p.id === 'samsung-samsung-galaxy-s24-ultra-95' || p.name?.includes('S24 Ultra') || p.name?.includes('Galaxy S25 Ultra')
) || list[1]) as unknown as Product;
