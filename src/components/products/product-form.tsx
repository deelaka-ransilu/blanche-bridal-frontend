"use client";

import { useActionState, useState } from "react";
import { createProductAction, updateProductAction, type ProductFormState } from "@/lib/actions/products";
import { ImageUploader, type UploadedImage } from "@/components/products/image-uploader";
import { Button } from "@/components/ui/button";
import { PRODUCT_SIZE_LABELS, PRODUCT_SIZES, type ProductCategory, type ProductDetail } from "@/types/product";

// Child sizing isn't offered in this catalog — only show adult sizes.
const SELECTABLE_SIZES = PRODUCT_SIZES.filter(
  (size) => !PRODUCT_SIZE_LABELS[size].toLowerCase().startsWith("child"),
);

export function ProductForm({
  categories,
  product,
  embedded = false,
}: {
  // Catalog is accessory-only now — pass only ACCESSORY categories in here
  // (filter at the call site, e.g. categories.filter(c => c.type === "ACCESSORY")
  // once ProductCategory carries a type field; see note in types/product.ts).
  categories: ProductCategory[];
  product?: ProductDetail;
  /** Set true when rendering inside a modal/dialog that already provides
   * its own border and title — omits the redundant wrapper + heading. */
  embedded?: boolean;
}) {
  const action = product
    ? updateProductAction.bind(null, product.id)
    : createProductAction;

  const [state, formAction, pending] = useActionState<ProductFormState, FormData>(
    action,
    null,
  );

  const [images, setImages] = useState<UploadedImage[]>(
    product?.images.map((i) => ({ id: i.id, url: i.url, publicId: null })) ?? [],
  );

  return (
    <form
      action={formAction}
      className={embedded ? "space-y-3" : "space-y-3 rounded-lg border border-border p-4"}
    >
      {!embedded && (
        <h2 className="font-heading text-lg font-medium text-foreground">
          {product ? "Edit product" : "New product"}
        </h2>
      )}

      {state?.message && <p className="text-sm text-destructive">{state.message}</p>}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs text-muted-foreground">Name</label>
          <input
            name="name"
            defaultValue={product?.name}
            required
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
          {state?.fields?.name && <p className="text-xs text-destructive">{state.fields.name}</p>}
        </div>

        <div>
          <label className="mb-1 block text-xs text-muted-foreground">Category</label>
          <select
            name="categoryId"
            defaultValue={product?.category?.id ?? ""}
            required
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="" disabled>Select a category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs text-muted-foreground">Stock</label>
          <input
            type="number"
            name="stock"
            min={0}
            defaultValue={product?.stock ?? 0}
            required
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs text-muted-foreground">Purchase price (Rs)</label>
          <input
            type="number"
            name="purchasePrice"
            step="0.01"
            required
            defaultValue={product?.purchasePrice ?? ""}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-xs text-muted-foreground">Sizes</label>
          <div className="flex flex-wrap gap-1.5">
            {SELECTABLE_SIZES.map((size) => (
              <label
                key={size}
                className="flex cursor-pointer items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-xs has-[:checked]:border-primary has-[:checked]:bg-primary/10 has-[:checked]:text-primary"
              >
                <input
                  type="checkbox"
                  name="sizes"
                  value={size}
                  defaultChecked={product?.sizes.includes(size)}
                  className="sr-only"
                />
                {PRODUCT_SIZE_LABELS[size]}
              </label>
            ))}
          </div>
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs text-muted-foreground">Description</label>
          <textarea
            name="description"
            rows={2}
            defaultValue={product?.description ?? ""}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs text-muted-foreground">Images</label>
          <ImageUploader images={images} onChange={setImages} />
        </div>
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : product ? "Save changes" : "Create product"}
      </Button>
    </form>
  );
}