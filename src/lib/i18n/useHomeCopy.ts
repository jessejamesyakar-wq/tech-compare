'use client';
import { useCallback } from 'react';
import { useI18n } from './context';
import { translateHome } from './homeCopy';
export function useHomeCopy() {
  const { language } = useI18n();
  return useCallback((text: string) => translateHome(language, text), [language]);
}
