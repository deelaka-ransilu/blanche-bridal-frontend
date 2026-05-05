"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ProductSummary } from "@/types";
import {
  getProducts,
  deleteProduct,
  getDeletedProducts,
  restoreProduct,
} from "@/lib/api/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  PencilEdit01Icon,
  Delete01Icon,
  Search01Icon,
  StoreIcon,
} from "@hugeicons/core-free-icons";

type Tab = "active" | "deleted";

export default function AdminInventoryPage() {
  const { data: session, status } = useSession();
  const token = session?.user?.backendToken;
  const router = useRouter();

  const [tab, setTab] = useState<Tab>("active");
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [deletedProducts, setDeletedProducts] = useState<ProductSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // ── Load active products ──────────────────────────────────────────────────
  async function loadActive(q?: string) {
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

  // ── Load deleted products ─────────────────────────────────────────────────
  async function loadDeleted() {
    if (!token) return;
    setLoading(true);
    try {
      const res = await getDeletedProducts(token);
      if (res.success) setDeletedProducts(res.data ?? []);
    } catch (err) {
      console.error("Failed to load deleted products:", err);
    } finally {
      setLoading(false);
    }
  }

  // Initial load
  useEffect(() => {
    if (status === "authenticated") loadActive();
  }, [status]);

  // Load deleted tab when switching to it
  useEffect(() => {
    if (tab === "deleted" && status === "authenticated") loadDeleted();
  }, [tab, status]);

  // Debounced search (active tab only)
  useEffect(() => {
    if (status !== "authenticated" || tab !== "active") return;
    const t = setTimeout(() => loadActive(search || undefined), 300);
    return () => clearTimeout(t);
  }, [search, status, tab]);

  // ── Delete ────────────────────────────────────────────────────────────────
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

  // ── Restore ───────────────────────────────────────────────────────────────
  async function handleRestore(id: string) {
    if (!token) return;
    setRestoringId(id);
    try {
      await restoreProduct(id, token);
      // Remove from deleted list — it's back in active now
      setDeletedProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Restore failed:", err);
    } finally {
      setRestoringId(null);
    }
  }

  // ── Shared table row renderer ─────────────────────────────────────────────
  function ProductRow({
    p,
    isDeleted,
  }: {
    p: ProductSummary;
    isDeleted?: boolean;
  }) {
    return (
      <tr key={p.id} className="border-b hover:bg-gray-50">
        {/* Image + Name */}
        <td className="px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-12 bg-gray-100 rounded-md overflow-hidden shrink-0">
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
            <span className={isDeleted ? "text-gray-400" : ""}>{p.name}</span>
          </div>
        </td>

        {/* Type */}
        <td className="px-4 py-3 text-sm text-gray-600">
          {p.type === "DRESS" ? "Dress" : "Accessory"}
        </td>

        {/* Category */}
        <td className="px-4 py-3 text-sm text-gray-600">
          {p.category?.name ?? "—"}
        </td>

        {/* Stock */}
        <td className="px-4 py-3 text-right text-sm text-gray-600">
          {p.stock}
        </td>

        {/* Actions */}
        <td className="px-4 py-3 text-right">
          {isDeleted ? (
            // Restore button for deleted tab
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRestore(p.id)}
              disabled={restoringId === p.id}
              className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
            >
              <HugeiconsIcon icon={StoreIcon} className="size-4 mr-1.5" />
              {restoringId === p.id ? "Restoring…" : "Restore"}
            </Button>
          ) : (
            // Edit + Delete for active tab
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/admin/inventory/${p.id}`)}
              >
                <HugeiconsIcon icon={PencilEdit01Icon} />
              </Button>

              {confirmDeleteId === p.id ? (
                <span className="inline-flex items-center gap-1 ml-1">
                  <span className="text-xs text-gray-500">Sure?</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(p.id)}
                    disabled={deletingId === p.id}
                    className="text-red-600 hover:bg-red-50 h-7 px-2 text-xs"
                  >
                    {deletingId === p.id ? "…" : "Yes"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setConfirmDeleteId(null)}
                    className="h-7 px-2 text-xs"
                  >
                    No
                  </Button>
                </span>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setConfirmDeleteId(p.id)}
                >
                  <HugeiconsIcon icon={Delete01Icon} />
                </Button>
              )}
            </>
          )}
        </td>
      </tr>
    );
  }

  const activeCount = products.length;
  const deletedCount = deletedProducts.length;
  const currentList = tab === "active" ? products : deletedProducts;

  // ── UI ────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-1 flex-col p-6 gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Inventory</h2>
          <p className="text-sm text-muted-foreground">
            {activeCount} active product{activeCount !== 1 ? "s" : ""}
            {deletedCount > 0 && `, ${deletedCount} deleted`}
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

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-gray-200">
        <button
          onClick={() => setTab("active")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            tab === "active"
              ? "border-amber-600 text-amber-700"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Active
          {activeCount > 0 && (
            <span className="ml-2 bg-gray-100 text-gray-600 text-xs px-1.5 py-0.5 rounded-full">
              {activeCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setTab("deleted")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            tab === "deleted"
              ? "border-amber-600 text-amber-700"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Deleted
          {deletedCount > 0 && (
            <span className="ml-2 bg-red-100 text-red-600 text-xs px-1.5 py-0.5 rounded-full">
              {deletedCount}
            </span>
          )}
        </button>
      </div>

      {/* Search (active tab only) */}
      {tab === "active" && (
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
      )}

      {/* Table */}
      <div className="rounded-xl border bg-white overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            Loading…
          </div>
        ) : currentList.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            {tab === "active"
              ? "No products found."
              : "No deleted products."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <tbody>
                {currentList.map((p) => (
                  <ProductRow
                    key={p.id}
                    p={p}
                    isDeleted={tab === "deleted"}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}