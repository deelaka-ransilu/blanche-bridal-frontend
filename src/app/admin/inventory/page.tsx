"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ProductSummary } from "@/types";
import { getProducts, deleteProduct, updateStock } from "@/lib/api/products";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
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
  const { data: session } = useSession();
  const token = session?.user?.backendToken;
  const router = useRouter();

  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  async function load(q?: string) {
    setLoading(true);
    try {
      const res = await getProducts({ search: q, size: 100 });
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => load(search || undefined), 300);
    return () => clearTimeout(t);
  }, [search]);

  async function handleDelete(id: string) {
    if (!token) return;
    setDeletingId(id);
    try {
      await deleteProduct(id, token);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col p-6 gap-6">
          {/* Page header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Inventory</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                {products.length} products
              </p>
            </div>
            <Button
              asChild
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
                  <thead>
                    <tr className="border-b bg-gray-50 text-xs text-muted-foreground uppercase tracking-wide">
                      <th className="px-4 py-3 text-left">Product</th>
                      <th className="px-4 py-3 text-left">Type</th>
                      <th className="px-4 py-3 text-left">Category</th>
                      <th className="px-4 py-3 text-right">Rental</th>
                      <th className="px-4 py-3 text-right">Purchase</th>
                      <th className="px-4 py-3 text-right">Stock</th>
                      <th className="px-4 py-3 text-center">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {products.map((p) => (
                      <tr
                        key={p.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        {/* Product */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="relative w-10 h-12 rounded-md overflow-hidden bg-gray-100 shrink-0">
                              {p.firstImageUrl ? (
                                <Image
                                  src={p.firstImageUrl}
                                  alt={p.name}
                                  fill
                                  sizes="40px"
                                  className="object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                                  —
                                </div>
                              )}
                            </div>
                            <span className="font-medium text-gray-900 max-w-[180px] truncate">
                              {p.name}
                            </span>
                          </div>
                        </td>

                        {/* Type */}
                        <td className="px-4 py-3">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                            {p.type === "DRESS" ? "Dress" : "Accessory"}
                          </span>
                        </td>

                        {/* Category */}
                        <td className="px-4 py-3 text-muted-foreground">
                          {p.category?.name ?? "—"}
                        </td>

                        {/* Rental price */}
                        <td className="px-4 py-3 text-right text-gray-700">
                          {p.rentalPrice != null
                            ? `LKR ${p.rentalPrice.toLocaleString()}`
                            : "—"}
                        </td>

                        {/* Purchase price */}
                        <td className="px-4 py-3 text-right text-gray-700">
                          {p.purchasePrice != null
                            ? `LKR ${p.purchasePrice.toLocaleString()}`
                            : "—"}
                        </td>

                        {/* Stock */}
                        <td className="px-4 py-3 text-right">
                          <span
                            className={
                              p.stock === 0
                                ? "text-red-500 font-medium"
                                : "text-gray-700"
                            }
                          >
                            {p.stock}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              p.isAvailable
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-gray-100 text-gray-500 border border-gray-200"
                            }`}
                          >
                            {p.isAvailable ? "Available" : "Hidden"}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-amber-700"
                              onClick={() =>
                                router.push(`/admin/inventory/${p.id}`)
                              }
                            >
                              <HugeiconsIcon
                                icon={PencilEdit01Icon}
                                className="size-4"
                              />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-red-600"
                              onClick={() => setConfirmDeleteId(p.id)}
                            >
                              <HugeiconsIcon
                                icon={Delete01Icon}
                                className="size-4"
                              />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </SidebarInset>

      {/* Delete confirm dialog */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setConfirmDeleteId(null)}
          />
          <div className="relative bg-white rounded-xl shadow-xl p-6 w-full max-w-sm mx-4">
            <h3 className="text-base font-semibold text-gray-900 mb-2">
              Delete product?
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              This will permanently remove the product and all its images. This
              action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setConfirmDeleteId(null)}
              >
                Cancel
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700 text-white"
                disabled={deletingId === confirmDeleteId}
                onClick={() => handleDelete(confirmDeleteId)}
              >
                {deletingId === confirmDeleteId ? "Deleting…" : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </SidebarProvider>
  );
}
