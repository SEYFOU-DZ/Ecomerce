"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { normalizeCurrency } from "@/lib/formatPrice";

const CartContext = createContext(null);

const STORAGE_KEY = "store_cart_v1";

const makeLineId = (productId, size, color) =>
  `${productId}::${size || ""}::${color || ""}`;

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [hydrated, setHydrated] = useState(false);
  const [open, setOpen] = useState(false);
  const [bumpCartBadge, setBumpCartBadge] = useState(false);
  const cartAnchorRef = useRef(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setItems(parsed);
      }
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* ignore */
    }
  }, [items, hydrated]);

  const addItem = useCallback(
    ({ product, quantity = 1, size = null, color = null }) => {
      if (!product?._id) return;
      const qty = Math.max(1, Number(quantity) || 1);
      const id = makeLineId(product._id, size, color);
      setItems((prev) => {
        const i = prev.findIndex((l) => l.lineId === id);
        const cur = normalizeCurrency(product.currency);
        if (i >= 0) {
          const next = [...prev];
          next[i] = {
            ...next[i],
            quantity: next[i].quantity + qty,
          };
          return next;
        }
        return [
          ...prev,
          {
            lineId: id,
            productId: product._id,
            title: product.title,
            image: product.mainImage,
            price: Number(product.price) || 0,
            currency: cur,
            size,
            color,
            quantity: qty,
          },
        ];
      });
      setBumpCartBadge(true);
      window.setTimeout(() => setBumpCartBadge(false), 520);
    },
    []
  );

  const setLineQuantity = useCallback((lineId, nextQty) => {
    const q = Math.max(0, Math.floor(Number(nextQty) || 0));
    if (q === 0) {
      setItems((prev) => prev.filter((l) => l.lineId !== lineId));
      return;
    }
    setItems((prev) =>
      prev.map((l) => (l.lineId === lineId ? { ...l, quantity: q } : l))
    );
  }, []);

  const removeLine = useCallback((lineId) => {
    setItems((prev) => prev.filter((l) => l.lineId !== lineId));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const totalQuantity = useMemo(
    () => items.reduce((s, l) => s + l.quantity, 0),
    [items]
  );

  const subtotal = useMemo(
    () => items.reduce((s, l) => s + l.price * l.quantity, 0),
    [items]
  );

  const value = useMemo(
    () => ({
      items,
      hydrated,
      open,
      setOpen,
      addItem,
      setLineQuantity,
      removeLine,
      clearCart,
      totalQuantity,
      subtotal,
      cartAnchorRef,
      bumpCartBadge,
    }),
    [
      items,
      hydrated,
      open,
      addItem,
      setLineQuantity,
      removeLine,
      clearCart,
      totalQuantity,
      subtotal,
      bumpCartBadge,
    ]
  );

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within CartProvider");
  }
  return ctx;
}
