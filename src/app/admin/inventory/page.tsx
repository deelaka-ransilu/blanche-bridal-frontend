"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ProductSummary } from "@/types";
import { getProducts, deleteProduct } from "@/lib/api/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  PencilEdit01Icon,
  Delete01Icon,
  Search01Icon,
} from "@hugeicons/core-free-icons";

export default function AdminInventoryPage() {
  const { data: session, status } = useSession();
  const token = session?.user?.backendToken;
  const router = useRouter();

  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // ─────────────────────────────────────────
  // Load products
  // ─────────────────────────────────────────
  async function load(q?: string) {
    setLoading(true);
    try {
      const res = await getProducts({ search: q, size: 100 });
      setProducts(res.data);
    } catch (err) {
      console.error("Failed to load products:", err);
    } finally {
      setLoading(false);
    }
  }

  // Initial load (only after session ready)
  useEffect(() => {
    if (status === "authenticated") {
      load();
    }
  }, [status]);

  // Debounced search
  useEffect(() => {
    if (status !== "authenticated") return;

    const t = setTimeout(() => {
      load(search || undefined);
    }, 300);

    return () => clearTimeout(t);
  }, [search, status]);

  // ─────────────────────────────────────────
  // Delete
  // ─────────────────────────────────────────
  async function handleDelete(id: string) {
    if (!token) return;

    setDeletingId(id);

    try {
      await deleteProduct(id, token);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  }

  // ─────────────────────────────────────────
  // UI
  // ─────────────────────────────────────────
  return (
      <div className="flex flex-1 flex-col p-6 gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Inventory</h2>
            <p className="text-sm text-muted-foreground">
              {products.length} products
            </p>
          </div>

          <Button
            asChild
            disabled={!token}
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            <Link href="/admin/inventory/new">
              <HugeiconsIcon icon={Add01Icon} className="size-4 mr-1.5" />
              Add product
            </Link>
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <HugeiconsIcon
            icon={Search01Icon}
            className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products…"
            className="pl-9"
          />
        </div>

        {/* Table */}
        <div className="rounded-xl border bg-white overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              Loading…
            </div>
          ) : products.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No products found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 flex items-center gap-3">
                        <div className="relative w-10 h-12 bg-gray-100 rounded-md overflow-hidden">
                          {p.firstImageUrl ? (
                            <Image
                              src={p.firstImageUrl}
                              alt={p.name}
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-gray-300">
                              —
                            </div>
                          )}
                        </div>
                        {p.name}
                      </td>

                      <td className="px-4 py-3">
                        {p.type === "DRESS" ? "Dress" : "Accessory"}
                      </td>

                      <td className="px-4 py-3">
                        {p.category?.name ?? "—"}
                      </td>

                      <td className="px-4 py-3 text-right">
                        {p.stock}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            router.push(`/admin/inventory/${p.id}`)
                          }
                        >
                          <HugeiconsIcon icon={PencilEdit01Icon} />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setConfirmDeleteId(p.id)}
                        >
                          <HugeiconsIcon icon={Delete01Icon} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
  );
}