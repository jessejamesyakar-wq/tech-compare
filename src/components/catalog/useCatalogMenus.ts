'use client';

import { useEffect, useRef, useState, type FocusEvent } from 'react';

/** Shared touch and keyboard behavior for category filter disclosures. */
export function useCatalogMenus() {
  const [brandDropdownOpen, setBrandDropdownOpen] = useState(false);
  const [tabDropdownOpen, setTabDropdownOpen] = useState(false);
  const [menuMaxHeight, setMenuMaxHeight] = useState(320);
  const filtersRef = useRef<HTMLDivElement>(null);
  const brandButtonRef = useRef<HTMLButtonElement>(null);
  const tabButtonRef = useRef<HTMLButtonElement>(null);
  const closeMenus = () => { setBrandDropdownOpen(false); setTabDropdownOpen(false); };
  const onFilterBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node)) closeMenus();
  };
  useEffect(() => {
    if (!brandDropdownOpen && !tabDropdownOpen) return;
    const fitMenu = () => {
      const rowBottom = filtersRef.current?.getBoundingClientRect().bottom || 0;
      setMenuMaxHeight(Math.max(96, Math.min(window.innerHeight / 2, window.innerHeight - rowBottom - 24)));
    };
    const outside = (event: PointerEvent) => {
      if (!filtersRef.current?.contains(event.target as Node)) closeMenus();
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      (brandDropdownOpen ? brandButtonRef : tabButtonRef).current?.focus();
      closeMenus();
    };
    fitMenu();
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    window.addEventListener('resize', fitMenu);
    window.addEventListener('scroll', fitMenu, true);
    return () => {
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('keydown', escape);
      window.removeEventListener('resize', fitMenu);
      window.removeEventListener('scroll', fitMenu, true);
    };
  }, [brandDropdownOpen, tabDropdownOpen]);
  return { brandDropdownOpen, setBrandDropdownOpen, tabDropdownOpen, setTabDropdownOpen,
    menuMaxHeight, filtersRef, brandButtonRef, tabButtonRef, onFilterBlur };
}
