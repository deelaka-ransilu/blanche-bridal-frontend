"use client";

import { useActionState, useState } from "react";
import { createProductAction, updateProductAction, type ProductFormState } from "@/lib/actions/products";
import { ImageUploader, type UploadedImage } from "@/components/products/image-uploader";
import { Button } from "@/components/ui/button";
import { PRODUCT_SIZE_LABELS, PRODUCT_SIZES, type ProductDetail } from "@/types/product";
import type { Category } from "@/types/category";

const SELECTABLE_SIZES = PRODUCT_SIZES.filter(
  (size) => !PRODUCT_SIZE_LABELS[size].toLowerCase().startsWith("child"),
);

export function RentalProductForm({
  categories,
  product,
  onClose,
}: {
  categories: Category[];
  product?: ProductDetail;
  onClose: () => void;
}) {
  const action = product
    ? updateProductAction.bind(null, product.id)
    : createProductAction;

  const [state, formAction, pending] = useActionState<ProductFormState, FormData>(action, null);

  const [images, setImages] = useState<UploadedImage[]>(
    product?.images.map((i) => ({ id: i.id, url: i.url, publicId: null })) ?? [],
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg overflow-y-auto rounded-lg bg-background p-6 shadow-lg" style={{ maxHeight: "90vh" }}>
        <h2 className="mb-4 text-lg font-semibold">
          {product ? "Edit rental item" : "New rental item"}
        </h2>

        <form action={formAction} className="space-y-3">
          {state?.message && <p className="text-sm text-destructive">{state.message}</p>}

          <div>
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
              <option value="" disabled>
                {categories.length === 0 ? "No dress categories yet" : "Select a category"}
              </option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Rental price (Rs, flat)</label>
              <input
                type="number"
                name="rentalPrice"
                step="0.01"
                defaultValue={product?.rentalPrice ?? ""}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Rental price per day (Rs)</label>
              <input
                type="number"
                name="rentalPricePerDay"
                step="0.01"
                defaultValue={product?.rentalPricePerDay ?? ""}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>
          {/* Backend requires at least one of the two above — see
              ProductServiceImpl.validateCategoryProductTypeMatch */}

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

          <div>
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

          <div>
            <label className="mb-1 block text-xs text-muted-foreground">Description</label>
            <textarea
              name="description"
              rows={2}
              defaultValue={product?.description ?? ""}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-muted-foreground">Images</label>
            <ImageUploader images={images} onChange={setImages} />
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="rounded-md border px-4 py-2 text-sm">
              Cancel
            </button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : product ? "Save changes" : "Create rental item"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}