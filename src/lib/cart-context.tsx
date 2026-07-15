"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

export type CartItem = {
  productId: string;
  name: string;
  image: string | null;
  size: string | null;
  quantity: number;
  unitPrice: number;
};

type CartContextValue = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (productId: string, size: string | null) => void;
  updateQuantity: (productId: string, size: string | null, quantity: number) => void;
  clear: () => void;
  total: number;
  count: number;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "blanche-bridal-cart";

function sameLine(a: CartItem, productId: string, size: string | null) {
  return a.productId === productId && a.size === size;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Load from localStorage once on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // corrupt/absent storage — start empty
    }
    setHydrated(true);
  }, []);

  // Persist on every change, but not before the initial load finishes
  // (otherwise we'd overwrite saved state with the empty initial array).
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const addItem = useCallback((item: Omit<CartItem, "quantity">, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => sameLine(i, item.productId, item.size));
      if (existing) {
        return prev.map((i) =>
          sameLine(i, item.productId, item.size)
            ? { ...i, quantity: i.quantity + quantity }
            : i,
        );
      }
      return [...prev, { ...item, quantity }];
    });
  }, []);

  const removeItem = useCallback((productId: string, size: string | null) => {
    setItems((prev) => prev.filter((i) => !sameLine(i, productId, size)));
  }, []);

  const updateQuantity = useCallback(
    (productId: string, size: string | null, quantity: number) => {
      if (quantity < 1) return;
      setItems((prev) =>
        prev.map((i) => (sameLine(i, productId, size) ? { ...i, quantity } : i)),
      );
    },
    [],
  );

  const clear = useCallback(() => setItems([]), []);

  const total = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clear, total, count }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}