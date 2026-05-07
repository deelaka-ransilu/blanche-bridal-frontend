import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem, OrderMode, ProductDetail } from "@/types";

interface CartStore {
  items: CartItem[];
  isOpen: boolean;

  addItem: (product: ProductDetail, size?: string, mode?: OrderMode) => void;
  removeItem: (productId: string, size?: string, mode?: OrderMode) => void;
  updateQuantity: (
    productId: string,
    size: string | undefined,
    qty: number,
    mode?: OrderMode,
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

      addItem: (product, size, mode) => {
        const resolvedMode: OrderMode = mode ?? "purchase";

        // Match on productId + size + mode so rental and purchase
        // versions of the same product are treated as separate line items
        const existing = get().items.find(
          (i) =>
            i.productId === product.id &&
            i.selectedSize === size &&
            i.selectedMode === resolvedMode,
        );

        if (existing) {
          if (existing.quantity >= product.stock) return;

          set((s) => ({
            items: s.items.map((i) =>
              i.productId === product.id &&
              i.selectedSize === size &&
              i.selectedMode === resolvedMode
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
                selectedMode: resolvedMode,
                quantity: 1,
                stock: product.stock,
              } satisfies CartItem,
            ],
          }));
        }
      },

      removeItem: (productId, size, mode) =>
        set((s) => ({
          items: s.items.filter(
            (i) =>
              !(
                i.productId === productId &&
                i.selectedSize === size &&
                (mode === undefined || i.selectedMode === mode)
              ),
          ),
        })),

      updateQuantity: (productId, size, qty, mode) => {
        if (qty <= 0) {
          get().removeItem(productId, size, mode);
          return;
        }

        const item = get().items.find(
          (i) =>
            i.productId === productId &&
            i.selectedSize === size &&
            (mode === undefined || i.selectedMode === mode),
        );
        const maxQty = item?.stock ?? qty;
        const capped = Math.min(qty, maxQty);

        set((s) => ({
          items: s.items.map((i) =>
            i.productId === productId &&
            i.selectedSize === size &&
            (mode === undefined || i.selectedMode === mode)
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

      // Use the correct price based on the item's selected mode
      totalAmount: () =>
        get().items.reduce((sum, i) => {
          const price =
            i.selectedMode === "rental"
              ? (i.rentalPrice ?? 0)
              : (i.purchasePrice ?? i.rentalPrice ?? 0);
          return sum + price * i.quantity;
        }, 0),
    }),
    {
      name: "blanche-cart",
      partialize: (s) => ({ items: s.items }),
    },
  ),
);