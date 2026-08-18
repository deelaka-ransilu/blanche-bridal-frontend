"use server";

import { getProductById } from "@/lib/api/products";

export type CartStockInfo = {
  productId: string;
  found: boolean;
  available: boolean;
  stock: number;
  name: string;
} | null;

export async function checkCartStockAction(
  productIds: string[],
): Promise<Record<string, CartStockInfo>> {
  const uniqueIds = Array.from(new Set(productIds));

  const results = await Promise.all(
    uniqueIds.map(async (id) => {
      const res = await getProductById(id);

      if (!res.success) {
        // Product deleted / not found — cart should treat this as unavailable
        return [id, { productId: id, found: false, available: false, stock: 0, name: "" }] as const;
      }

      const p = res.data;
      return [
        id,
        {
          productId: id,
          found: true,
          available: p.isAvailable !== false,
          stock: p.stock,
          name: p.name,
        },
      ] as const;
    }),
  );

  return Object.fromEntries(results);
}