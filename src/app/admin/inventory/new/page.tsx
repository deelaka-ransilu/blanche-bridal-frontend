"use client";

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { ProductForm } from "@/features/products/components/ProductForm";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";

export default function NewProductPage() {
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

          <div>
            <h2 className="text-xl font-semibold">Add product</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Fill in the details below to add a new product to the catalog.
            </p>
          </div>

          <ProductForm />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
