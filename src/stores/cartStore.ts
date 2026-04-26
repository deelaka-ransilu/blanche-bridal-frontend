import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem, ProductDetail } from "@/types";

interface CartStore {
  items: CartItem[];
  isOpen: boolean;

  // Actions
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

  // Computed (called as functions since zustand doesn't have computed props)
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
          // Same product + same size → increment quantity
          set((s) => ({
            items: s.items.map((i) =>
              i.productId === product.id && i.selectedSize === size
                ? { ...i, quantity: i.quantity + 1 }
                : i,
            ),
          }));
        } else {
          // New line item
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
        // If qty drops to 0 or below, remove the item entirely
        if (qty <= 0) {
          get().removeItem(productId, size);
          return;
        }
        set((s) => ({
          items: s.items.map((i) =>
            i.productId === productId && i.selectedSize === size
              ? { ...i, quantity: qty }
              : i,
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      // totalItems and totalAmount read live from state via get()
      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      totalAmount: () =>
        get().items.reduce((sum, i) => {
          const price = i.rentalPrice ?? i.purchasePrice ?? 0;
          return sum + price * i.quantity;
        }, 0),
    }),
    {
      name: "blanche-cart",
      partialize: (s) => ({ items: s.items }), // persist items only, not isOpen
    },
  ),
);
