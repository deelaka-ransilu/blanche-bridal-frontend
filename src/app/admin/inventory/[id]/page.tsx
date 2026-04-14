"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ProductDetail } from "@/types";
import { getProductById } from "@/lib/api/products";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { ProductForm } from "@/features/products/components/ProductForm";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";

export default function EditProductPage() {
  const params = useParams();
  const id = params?.id as string;

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    getProductById(id)
      .then(setProduct)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

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
          {/* Back link */}
          <Link
            href="/admin/inventory"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-amber-700 transition-colors w-fit"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" />
            Back to inventory
          </Link>

          {loading ? (
            <div className="space-y-4 max-w-2xl">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-10 rounded-lg bg-gray-200 animate-pulse"
                />
              ))}
            </div>
          ) : notFound ? (
            <div className="text-sm text-muted-foreground">
              Product not found.
            </div>
          ) : (
            <>
              <div>
                <h2 className="text-xl font-semibold">Edit product</h2>
                <p className="text-sm text-muted-foreground mt-0.5 truncate max-w-md">
                  {product?.name}
                </p>
              </div>
              <ProductForm product={product!} />
            </>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
