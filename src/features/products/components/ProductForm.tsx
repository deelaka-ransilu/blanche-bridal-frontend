"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Category,
  CreateProductPayload,
  ProductDetail,
  UpdateProductPayload,
} from "@/types";
import {
  createProduct,
  updateProduct,
  getCategories,
} from "@/lib/api/products";
import { ImageUpload } from "@/components/shared/ImageUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "Free Size"];

interface ProductFormProps {
  /** Pass existing product to switch to edit mode */
  product?: ProductDetail;
}

export function ProductForm({ product }: ProductFormProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const token = session?.user?.backendToken;
  const isEdit = !!product;

  // ── Form state ────────────────────────────────────────────────────────────
  const [name, setName] = useState(product?.name ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [type, setType] = useState<"DRESS" | "ACCESSORY">(
    product?.type ?? "DRESS",
  );
  const [categoryId, setCategoryId] = useState(product?.category?.id ?? "");
  const [rentalPrice, setRentalPrice] = useState(
    product?.rentalPrice != null ? String(product.rentalPrice) : "",
  );
  const [purchasePrice, setPurchasePrice] = useState(
    product?.purchasePrice != null ? String(product.purchasePrice) : "",
  );
  const [stock, setStock] = useState(
    product?.stock != null ? String(product.stock) : "0",
  );
  const [selectedSizes, setSelectedSizes] = useState<string[]>(
    product?.sizes ?? [],
  );
  const [imageUrls, setImageUrls] = useState<string[]>(
    product?.images?.map((i) => i.url) ?? [],
  );
  const [isAvailable, setIsAvailable] = useState(product?.isAvailable ?? true);

  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    getCategories().then(setCategories).catch(console.error);
  }, []);

  // ── Size toggle ───────────────────────────────────────────────────────────
  function toggleSize(size: string) {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size],
    );
  }

  // ── Validation ────────────────────────────────────────────────────────────
  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Name is required.";
    if (!rentalPrice && !purchasePrice)
      errs.price = "At least one price (rental or purchase) is required.";
    if (rentalPrice && isNaN(Number(rentalPrice)))
      errs.rentalPrice = "Must be a valid number.";
    if (purchasePrice && isNaN(Number(purchasePrice)))
      errs.purchasePrice = "Must be a valid number.";
    if (isNaN(Number(stock)) || Number(stock) < 0)
      errs.stock = "Stock must be 0 or more.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  async function handleSubmit() {
    if (!validate() || !token) return;
    setSaving(true);

    const payload: CreateProductPayload = {
      name: name.trim(),
      description: description.trim() || undefined,
      type,
      categoryId: categoryId || undefined,
      rentalPrice: rentalPrice ? Number(rentalPrice) : undefined,
      purchasePrice: purchasePrice ? Number(purchasePrice) : undefined,
      stock: Number(stock),
      sizes: selectedSizes.length > 0 ? selectedSizes : undefined,
      imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
    };

    try {
      if (isEdit) {
        const updatePayload: UpdateProductPayload = { ...payload, isAvailable };
        await updateProduct(product!.id, updatePayload, token);
      } else {
        await createProduct(payload, token);
      }
      router.push("/admin/inventory");
      router.refresh();
    } catch (err) {
      console.error(err);
      setErrors({ submit: "Something went wrong. Please try again." });
    } finally {
      setSaving(false);
    }
  }

  // ── UI ────────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl space-y-8">
      {/* Name */}
      <div className="space-y-1.5">
        <Label htmlFor="name">Product name *</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Ivory Lace Ball Gown"
        />
        {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Optional product description..."
          className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm
                     placeholder:text-muted-foreground focus-visible:outline-none
                     focus-visible:ring-2 focus-visible:ring-amber-400 resize-none"
        />
      </div>

      {/* Type */}
      <div className="space-y-1.5">
        <Label>Product type *</Label>
        <div className="flex gap-3">
          {(["DRESS", "ACCESSORY"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                type === t
                  ? "border-amber-500 bg-amber-50 text-amber-700 ring-1 ring-amber-400"
                  : "border-gray-200 text-gray-600 hover:border-amber-300"
              }`}
            >
              {t === "DRESS" ? "Dress" : "Accessory"}
            </button>
          ))}
        </div>
      </div>

      {/* Category */}
      <div className="space-y-1.5">
        <Label htmlFor="category">Category</Label>
        <select
          id="category"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="w-full rounded-md border border-input bg-white px-3 py-2 text-sm
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
        >
          <option value="">— No category —</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.parentName ? `${c.parentName} › ${c.name}` : c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Pricing */}
      <div className="space-y-1.5">
        <Label>Pricing *</Label>
        <p className="text-xs text-muted-foreground">
          Fill at least one. Leave blank if not applicable.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label
              htmlFor="rentalPrice"
              className="text-xs text-muted-foreground"
            >
              Rental price (LKR)
            </Label>
            <Input
              id="rentalPrice"
              type="number"
              min="0"
              step="0.01"
              value={rentalPrice}
              onChange={(e) => setRentalPrice(e.target.value)}
              placeholder="e.g. 15000"
            />
            {errors.rentalPrice && (
              <p className="text-xs text-red-500">{errors.rentalPrice}</p>
            )}
          </div>
          <div className="space-y-1">
            <Label
              htmlFor="purchasePrice"
              className="text-xs text-muted-foreground"
            >
              Purchase price (LKR)
            </Label>
            <Input
              id="purchasePrice"
              type="number"
              min="0"
              step="0.01"
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(e.target.value)}
              placeholder="e.g. 85000"
            />
            {errors.purchasePrice && (
              <p className="text-xs text-red-500">{errors.purchasePrice}</p>
            )}
          </div>
        </div>
        {errors.price && <p className="text-xs text-red-500">{errors.price}</p>}
      </div>

      {/* Stock */}
      <div className="space-y-1.5">
        <Label htmlFor="stock">Stock quantity *</Label>
        <Input
          id="stock"
          type="number"
          min="0"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          className="w-32"
        />
        {errors.stock && <p className="text-xs text-red-500">{errors.stock}</p>}
      </div>

      {/* Sizes */}
      <div className="space-y-1.5">
        <Label>Sizes available</Label>
        <p className="text-xs text-muted-foreground">
          Select all that apply. Leave empty for accessories or one-size items.
        </p>
        <div className="flex flex-wrap gap-2 mt-1">
          {SIZES.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => toggleSize(size)}
              className={`px-3.5 py-1.5 rounded-lg border text-sm font-medium transition-all ${
                selectedSizes.includes(size)
                  ? "border-amber-500 bg-amber-50 text-amber-700 ring-1 ring-amber-400"
                  : "border-gray-200 text-gray-600 hover:border-amber-300"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Images */}
      <div className="space-y-1.5">
        <Label>Product images</Label>
        <p className="text-xs text-muted-foreground">
          Upload up to 6 images via Cloudinary.
        </p>
        <ImageUpload urls={imageUrls} onChange={setImageUrls} maxImages={6} />
      </div>

      {/* Available toggle — edit only */}
      {isEdit && (
        <div className="flex items-center gap-3">
          <button
            type="button"
            role="switch"
            aria-checked={isAvailable}
            onClick={() => setIsAvailable((v) => !v)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              isAvailable ? "bg-amber-500" : "bg-gray-200"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                isAvailable ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
          <Label
            className="cursor-pointer"
            onClick={() => setIsAvailable((v) => !v)}
          >
            {isAvailable ? "Available for sale/rental" : "Hidden from catalog"}
          </Label>
        </div>
      )}

      {/* Submit error */}
      {errors.submit && <p className="text-sm text-red-500">{errors.submit}</p>}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <Button
          onClick={handleSubmit}
          disabled={saving}
          className="bg-amber-600 hover:bg-amber-700 text-white"
        >
          {saving
            ? isEdit
              ? "Saving…"
              : "Creating…"
            : isEdit
              ? "Save changes"
              : "Create product"}
        </Button>
        <Button
          variant="outline"
          onClick={() => router.push("/admin/inventory")}
          disabled={saving}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
