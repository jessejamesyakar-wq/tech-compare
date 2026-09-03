'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, PriceAlert } from '@/lib/types';

interface CompareContextType {
  compareList: Product[];
  addToCompare: (product: Product) => void;
  removeFromCompare: (productId: string) => void;
  clearCompare: () => void;
  isInCompare: (productId: string) => boolean;
  alerts: PriceAlert[];
  addAlert: (alert: Omit<PriceAlert, 'id' | 'createdAt'>) => void;
  removeAlert: (id: string) => void;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [compareList, setCompareList] = useState<Product[]>([]);
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);

  // Safely hydrate from localStorage on client mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    async function loadSaved() {
      try {
        const savedIdsStr = localStorage.getItem('tech_compare_list_ids');
        if (savedIdsStr) {
          const ids: string[] = JSON.parse(savedIdsStr);
          const products: Product[] = [];
          for (const id of ids) {
            try {
              const res = await fetch(`/api/products/${id}`);
              if (res.ok) {
                const p = await res.json();
                if (p && p.id) products.push(p);
              }
            } catch (e) {
              console.error('Failed to fetch product for compare', id, e);
            }
          }
          setCompareList(products);
        } else {
          // Backward compatibility check for old stored full objects
          const oldSaved = localStorage.getItem('tech_compare_list');
          if (oldSaved) {
            const parsed = JSON.parse(oldSaved);
            if (Array.isArray(parsed)) {
              setCompareList(parsed);
            }
          }
        }

        const savedAlerts = localStorage.getItem('tech_price_alerts');
        if (savedAlerts) {
          setAlerts(JSON.parse(savedAlerts));
        }
      } catch (e) {
        console.error('Failed to load compare context from localStorage', e);
      }
    }

    loadSaved();
  }, []);

  // Helper to safely write IDs to localStorage
  const saveToStorage = (list: Product[]) => {
    if (typeof window === 'undefined') return;
    try {
      const ids = list.map((p) => p.id);
      localStorage.setItem('tech_compare_list_ids', JSON.stringify(ids));
      // Clean up legacy heavy key if present
      localStorage.removeItem('tech_compare_list');
    } catch (e) {
      console.error('Failed to save compare list to localStorage', e);
    }
  };

  const addToCompare = (product: Product) => {
    if (!product || !product.id) return;
    if (compareList.length >= 4) return;
    if (compareList.some((p) => p.id === product.id)) return;
    const updated = [...compareList, product];
    setCompareList(updated);
    saveToStorage(updated);
  };

  const removeFromCompare = (productId: string) => {
    if (!productId) return;
    const updated = compareList.filter((p) => p.id !== productId);
    setCompareList(updated);
    saveToStorage(updated);
  };

  const clearCompare = () => {
    setCompareList([]);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('tech_compare_list_ids');
        localStorage.removeItem('tech_compare_list');
      } catch (e) {
        console.error('Failed to clear compare localStorage', e);
      }
    }
  };

  const isInCompare = (productId: string) => {
    if (!productId) return false;
    return compareList.some((p) => p.id === productId);
  };

  const addAlert = (newAlertData: Omit<PriceAlert, 'id' | 'createdAt'>) => {
    const newAlert: PriceAlert = {
      ...newAlertData,
      id: 'alert-' + Date.now(),
      createdAt: new Date().toISOString()
    };
    const updated = [newAlert, ...alerts];
    setAlerts(updated);

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('tech_price_alerts', JSON.stringify(updated));
      } catch (e) {}
    }
  };

  const removeAlert = (id: string) => {
    const updated = alerts.filter((a) => a.id !== id);
    setAlerts(updated);

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('tech_price_alerts', JSON.stringify(updated));
      } catch (e) {}
    }
  };

  return (
    <CompareContext.Provider
      value={{
        compareList,
        addToCompare,
        removeFromCompare,
        clearCompare,
        isInCompare,
        alerts,
        addAlert,
        removeAlert
      }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
}
