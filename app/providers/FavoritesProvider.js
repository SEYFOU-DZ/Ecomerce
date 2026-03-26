"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { normalizeCurrency } from "@/lib/formatPrice";

const STORAGE_KEY = "store_favorites_v1";

const FavoritesContext = createContext(null);

export function FavoritesProvider({ children }) {
  const [entries, setEntries] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setEntries(parsed);
      }
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch {
      /* ignore */
    }
  }, [entries, hydrated]);

  const isFavorite = useCallback(
    (productId) => entries.some((e) => e.productId === productId),
    [entries]
  );

  const toggleFavorite = useCallback((product) => {
    if (!product?._id) return;
    const id = product._id;
    setEntries((prev) => {
      const exists = prev.some((e) => e.productId === id);
      if (exists) {
        return prev.filter((e) => e.productId !== id);
      }
      return [
        ...prev,
        {
          productId: id,
          title: product.title,
          mainImage: product.mainImage,
          price: Number(product.price) || 0,
          description: product.description || "",
          colors: Array.isArray(product.colors) ? product.colors : [],
          sizes: Array.isArray(product.sizes) ? product.sizes : [],
          subImages: Array.isArray(product.subImages) ? product.subImages : [],
          currency: normalizeCurrency(product.currency),
        },
      ];
    });
  }, []);

  const removeFavorite = useCallback((productId) => {
    setEntries((prev) => prev.filter((e) => e.productId !== productId));
  }, []);

  const count = entries.length;

  const value = useMemo(
    () => ({
      entries,
      hydrated,
      isFavorite,
      toggleFavorite,
      removeFavorite,
      count,
    }),
    [entries, hydrated, isFavorite, toggleFavorite, removeFavorite, count]
  );

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) {
    throw new Error("useFavorites must be used within FavoritesProvider");
  }
  return ctx;
}
