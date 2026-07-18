"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { createProductAction, updateProductAction, type ProductFormState } from "@/lib/actions/products";
import { ImageUploader, type ImageUploaderHandle, type UploadedImage } from "@/components/products/image-uploader";
import { Button } from "@/components/ui/button";
import { PRODUCT_SIZE_LABELS, PRODUCT_SIZES, type ProductCategory, type ProductDetail } from "@/types/product";

const SELECTABLE_SIZES = PRODUCT_SIZES.filter(
  (size) => !PRODUCT_SIZE_LABELS[size].toLowerCase().startsWith("child"),
);

export function ProductForm({
  categories,
  product,
  embedded = false,
  onSuccess,
}: {
  categories: ProductCategory[];
  product?: ProductDetail;
  embedded?: boolean;
  onSuccess?: () => void;
}) {
  const action = product ? updateProductAction.bind(null, product.id) : createProductAction;
  const [state, formAction, pending] = useActionState<ProductFormState, FormData>(action, null);

  const formRef = useRef<HTMLFormElement>(null);
  const uploaderRef = useRef<ImageUploaderHandle>(null);
  const [imagesJson, setImagesJson] = useState<string>(
    JSON.stringify(product?.images.map((i) => ({ id: i.id, url: i.url, publicId: null })) ?? []),
  );
  const [submitting, setSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    if (!pending) {
      setSubmitting(false);
    }
  }, [pending]);

  useEffect(() => {
    if (state?.success) {
      onSuccess?.();
    }
  }, [state, onSuccess]);

  async function handleSubmitClick() {
    setUploadError(null);
    setSubmitting(true);
    try {
      const finalImages: UploadedImage[] = uploaderRef.current
        ? await uploaderRef.current.uploadAll()
        : [];
      setImagesJson(JSON.stringify(finalImages));
      requestAnimationFrame(() => formRef.current?.requestSubmit());
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Image upload failed");
      setSubmitting(false);
    }
  }

  return (
    <form
      ref={formRef}
      action={formAction}
      className={embedded ? "space-y-3" : "space-y-3 rounded-lg border border-border p-4"}
    >
      {!embedded && (
        <h2 className="font-heading text-lg font-medium text-foreground">
          {product ? "Edit product" : "New product"}
        </h2>
      )}

      {state?.message && <p className="text-sm text-destructive">{state.message}</p>}
      {uploadError && <p className="text-sm text-destructive">{uploadError}</p>}

      <input type="hidden" name="images" value={imagesJson} />

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
          <ImageUploader
            ref={uploaderRef}
            initialImages={product?.images.map((i) => ({ id: i.id, url: i.url, publicId: null })) ?? []}
          />
        </div>
      </div>

      <Button type="button" onClick={handleSubmitClick} disabled={pending || submitting}>
        {pending || submitting ? "Saving…" : product ? "Save changes" : "Create product"}
      </Button>
    </form>
  );
}
