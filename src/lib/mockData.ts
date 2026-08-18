import { Smartphone } from './types';
import rawSmartphones from './smartphonesData.json';

export const mockSmartphones: Smartphone[] = rawSmartphones as Smartphone[];

export const popularComparisonsList = [
  {
    "phone1Id": "apple-iphone-17-pro-max-1tb-2",
    "phone2Id": "samsung-galaxy-s26-ultra-1tb-2",
    "viewCount": 14820
  },
  {
    "phone1Id": "apple-iphone-17-pro-512gb-6",
    "phone2Id": "apple-iphone-16-pro-max-512gb-2",
    "viewCount": 12450
  },
  {
    "phone1Id": "apple-iphone-17-pro-max-2tb-1",
    "phone2Id": "apple-iphone-17-pro-1tb-4",
    "viewCount": 9840
  },
  {
    "phone1Id": "samsung-galaxy-s26-ultra-512gb-3",
    "phone2Id": "xiaomi-16-ultra-512gb-2",
    "viewCount": 8710
  }
];
