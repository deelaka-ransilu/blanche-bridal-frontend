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

  useEffect(() => {
    if (status === "authenticated") loadActive();
  }, [status]);

  useEffect(() => {
    if (tab === "deleted" && status === "authenticated") loadDeleted();
  }, [tab, status]);

  useEffect(() => {
    if (status !== "authenticated" || tab !== "active") return;
    const t = setTimeout(() => loadActive(search || undefined), 300);
    return () => clearTimeout(t);
  }, [search, status, tab]);

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

  async function handleRestore(id: string) {
    if (!token) return;
    setRestoringId(id);
    try {
      await restoreProduct(id, token);
      setDeletedProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Restore failed:", err);
    } finally {
      setRestoringId(null);
    }
  }

  const activeCount = products.length;
  const deletedCount = deletedProducts.length;
  const currentList = tab === "active" ? products : deletedProducts;

  return (
    <div className="flex flex-1 flex-col p-4 sm:p-6 gap-4 sm:gap-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold">Inventory</h2>
          <p className="text-sm text-muted-foreground">
            {activeCount} active product{activeCount !== 1 ? "s" : ""}
            {deletedCount > 0 && `, ${deletedCount} deleted`}
          </p>
        </div>
        <Button
          asChild
          disabled={!token}
          className="bg-amber-600 hover:bg-amber-700 text-white shrink-0"
        >
          <Link href="/admin/inventory/new">
            <HugeiconsIcon icon={Add01Icon} className="size-4 mr-1.5" />
            <span className="hidden sm:inline">Add product</span>
            <span className="sm:hidden">Add</span>
          </Link>
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-gray-200">
        {(["active", "deleted"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 sm:px-4 py-2 text-sm font-medium border-b-2 transition-colors capitalize ${
              tab === t
                ? "border-amber-600 text-amber-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {t}
            {t === "active" && activeCount > 0 && (
              <span className="ml-1.5 bg-gray-100 text-gray-600 text-xs px-1.5 py-0.5 rounded-full">
                {activeCount}
              </span>
            )}
            {t === "deleted" && deletedCount > 0 && (
              <span className="ml-1.5 bg-red-100 text-red-600 text-xs px-1.5 py-0.5 rounded-full">
                {deletedCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search */}
      {tab === "active" && (
        <div className="relative w-full sm:max-w-sm">
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

      {/* List */}
      <div className="rounded-xl border bg-white overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-6 h-6 rounded-full border-2 border-amber-600 border-t-transparent animate-spin" />
          </div>
        ) : currentList.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            {tab === "active" ? "No products found." : "No deleted products."}
          </div>
        ) : (
          <div className="divide-y">
            {currentList.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50"
              >
                {/* Thumbnail */}
                <div className="relative w-9 h-11 sm:w-10 sm:h-12 bg-gray-100 rounded-md overflow-hidden shrink-0">
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

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${tab === "deleted" ? "text-gray-400" : "text-gray-900"}`}>
                    {p.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {p.type === "DRESS" ? "Dress" : "Accessory"}
                    {p.category?.name && (
                      <span className="ml-1.5">· {p.category.name}</span>
                    )}
                    <span className="ml-1.5">· {p.stock} in stock</span>
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  {tab === "deleted" ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRestore(p.id)}
                      disabled={restoringId === p.id}
                      className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 text-xs"
                    >
                      <HugeiconsIcon icon={StoreIcon} className="size-3.5 mr-1" />
                      {restoringId === p.id ? "Restoring…" : "Restore"}
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/admin/inventory/${p.id}`)}
                      >
                        <HugeiconsIcon icon={PencilEdit01Icon} className="size-4" />
                      </Button>
                      {confirmDeleteId === p.id ? (
                        <span className="inline-flex items-center gap-1">
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
                          <HugeiconsIcon icon={Delete01Icon} className="size-4" />
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}