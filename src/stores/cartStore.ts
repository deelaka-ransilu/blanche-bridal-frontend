import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem, ProductDetail } from "@/types";

interface CartStore {
  items: CartItem[];
  isOpen: boolean;

  addItem: (product: ProductDetail, size?: string) => void;
  removeItem: (productId: string, size?: string) => void;
  updateQuantity: (
    productId: string,
    size: string | undefined,
    qty: number,
  ) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;

  totalItems: () => number;
  totalAmount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (product, size) => {
        const existing = get().items.find(
          (i) => i.productId === product.id && i.selectedSize === size,
        );

        if (existing) {
          // Only increment if we haven't already hit the stock limit
          if (existing.quantity >= product.stock) return;

          set((s) => ({
            items: s.items.map((i) =>
              i.productId === product.id && i.selectedSize === size
                ? { ...i, quantity: i.quantity + 1 }
                : i,
            ),
          }));
        } else {
          if (product.stock <= 0) return;

          set((s) => ({
            items: [
              ...s.items,
              {
                productId: product.id,
                productName: product.name,
                productImage: product.images?.[0]?.url,
                slug: product.slug,
                type: product.type,
                rentalPrice: product.rentalPrice,
                purchasePrice: product.purchasePrice,
                selectedSize: size,
                quantity: 1,
                // Store stock so the drawer can cap the + button
                // without needing a network call.
                stock: product.stock,
              },
            ],
          }));
        }
      },

      removeItem: (productId, size) =>
        set((s) => ({
          items: s.items.filter(
            (i) => !(i.productId === productId && i.selectedSize === size),
          ),
        })),

      updateQuantity: (productId, size, qty) => {
        if (qty <= 0) {
          get().removeItem(productId, size);
          return;
        }

        // Cap at the stock value stored in the cart item
        const item = get().items.find(
          (i) => i.productId === productId && i.selectedSize === size,
        );
        const maxQty = item?.stock ?? qty;
        const capped = Math.min(qty, maxQty);

        set((s) => ({
          items: s.items.map((i) =>
            i.productId === productId && i.selectedSize === size
              ? { ...i, quantity: capped }
              : i,
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      totalAmount: () =>
        get().items.reduce((sum, i) => {
          const price = i.rentalPrice ?? i.purchasePrice ?? 0;
          return sum + price * i.quantity;
        }, 0),
    }),
    {
      name: "blanche-cart",
      partialize: (s) => ({ items: s.items }),
    },
  ),
);