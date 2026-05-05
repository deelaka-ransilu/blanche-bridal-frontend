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
import { ImageUpload } from "@/features/upload/components/ImageUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "Free Size"];

interface ProductFormProps {
  product?: ProductDetail;
}

// ── Section wrapper ───────────────────────────────────────────────────────────
function Section({
  step,
  title,
  description,
  children,
}: {
  step: number;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Section header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50/50">
        <span className="w-6 h-6 rounded-full bg-amber-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
          {step}
        </span>
        <div>
          <p className="text-sm font-semibold text-gray-900">{title}</p>
          {description && (
            <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
          )}
        </div>
      </div>
      {/* Section body */}
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

// ── Main form ─────────────────────────────────────────────────────────────────
export function ProductForm({ product }: ProductFormProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const token = session?.user?.backendToken;
  const isEdit = !!product;

  const [name, setName] = useState(product?.name ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [type, setType] = useState<"DRESS" | "ACCESSORY">(product?.type ?? "DRESS");
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
  const [selectedSizes, setSelectedSizes] = useState<string[]>(product?.sizes ?? []);
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

  function toggleSize(size: string) {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size],
    );
  }

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Product name is required.";
    if (!rentalPrice && !purchasePrice)
      errs.price = "At least one price is required.";
    if (rentalPrice && isNaN(Number(rentalPrice)))
      errs.rentalPrice = "Must be a valid number.";
    if (purchasePrice && isNaN(Number(purchasePrice)))
      errs.purchasePrice = "Must be a valid number.";
    if (isNaN(Number(stock)) || Number(stock) < 0)
      errs.stock = "Stock must be 0 or more.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

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

  return (
    <div className="max-w-2xl space-y-4">

      {/* ── Section 1: Basic Info ── */}
      <Section step={1} title="Basic Information" description="Name, description and product type">
        <div className="space-y-4">

          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="name">
              Product name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ivory Lace Ball Gown"
              className={errors.name ? "border-red-400 focus-visible:ring-red-300" : ""}
            />
            {errors.name && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <span>⚠</span> {errors.name}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="description">
              Description{" "}
              <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Describe the product — fabric, style, occasion…"
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm
                         placeholder:text-muted-foreground focus-visible:outline-none
                         focus-visible:ring-2 focus-visible:ring-amber-400 resize-none"
            />
          </div>

          {/* Type + Category side by side */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Product type <span className="text-red-500">*</span></Label>
              <div className="flex gap-2">
                {(["DRESS", "ACCESSORY"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-all ${
                      type === t
                        ? "border-amber-500 bg-amber-50 text-amber-700 ring-1 ring-amber-400"
                        : "border-gray-200 text-gray-500 hover:border-amber-300 hover:text-gray-700"
                    }`}
                  >
                    {t === "DRESS" ? "Dress" : "Accessory"}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-white px-3 py-2 text-sm
                           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              >
                <option value="">— None —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.parentName ? `${c.parentName} › ${c.name}` : c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </Section>

      {/* ── Section 2: Pricing & Stock ── */}
      <Section step={2} title="Pricing & Stock" description="Set rental price, purchase price and available quantity">
        <div className="space-y-4">

          {/* Pricing */}
          <div className="space-y-1.5">
            <p className="text-xs text-muted-foreground">
              Fill at least one price. Leave blank if not applicable.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="rentalPrice" className="text-xs text-gray-600">
                  Rental price (LKR)
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium">
                    Rs.
                  </span>
                  <Input
                    id="rentalPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={rentalPrice}
                    onChange={(e) => setRentalPrice(e.target.value)}
                    placeholder="15,000"
                    className={`pl-8 ${errors.rentalPrice ? "border-red-400" : ""}`}
                  />
                </div>
                {errors.rentalPrice && (
                  <p className="text-xs text-red-500">{errors.rentalPrice}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="purchasePrice" className="text-xs text-gray-600">
                  Purchase price (LKR)
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium">
                    Rs.
                  </span>
                  <Input
                    id="purchasePrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(e.target.value)}
                    placeholder="85,000"
                    className={`pl-8 ${errors.purchasePrice ? "border-red-400" : ""}`}
                  />
                </div>
                {errors.purchasePrice && (
                  <p className="text-xs text-red-500">{errors.purchasePrice}</p>
                )}
              </div>
            </div>
            {errors.price && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <span>⚠</span> {errors.price}
              </p>
            )}
          </div>

          {/* Stock */}
          <div className="space-y-1.5">
            <Label htmlFor="stock">
              Stock quantity <span className="text-red-500">*</span>
            </Label>
            <div className="flex items-center gap-3">
              <Input
                id="stock"
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className={`w-28 ${errors.stock ? "border-red-400" : ""}`}
              />
              <p className="text-xs text-muted-foreground">
                {Number(stock) === 0
                  ? "Out of stock"
                  : Number(stock) === 1
                  ? "1 unit available"
                  : `${stock} units available`}
              </p>
            </div>
            {errors.stock && (
              <p className="text-xs text-red-500">{errors.stock}</p>
            )}
          </div>
        </div>
      </Section>

      {/* ── Section 3: Sizes ── */}
      <Section step={3} title="Sizes" description="Select all sizes this product is available in">
        <div className="flex flex-wrap gap-2">
          {SIZES.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => toggleSize(size)}
              className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                selectedSizes.includes(size)
                  ? "border-amber-500 bg-amber-50 text-amber-700 ring-1 ring-amber-400"
                  : "border-gray-200 text-gray-500 hover:border-amber-300 hover:text-gray-700"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
        {selectedSizes.length === 0 && (
          <p className="text-xs text-muted-foreground mt-3">
            No sizes selected — suitable for accessories or one-size items.
          </p>
        )}
        {selectedSizes.length > 0 && (
          <p className="text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2 mt-3">
            {selectedSizes.length} size{selectedSizes.length > 1 ? "s" : ""} selected:{" "}
            {selectedSizes.join(", ")}
          </p>
        )}
      </Section>

      {/* ── Section 4: Images ── */}
      <Section step={4} title="Product Images" description="Upload up to 6 photos — first image will be the cover">
        <ImageUpload
          urls={imageUrls}
          onChange={setImageUrls}
          maxImages={6}
          folder="products"
        />
      </Section>

      {/* ── Section 5: Availability (edit only) ── */}
      {isEdit && (
        <Section step={5} title="Availability" description="Control whether this product appears in the catalog">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">
                {isAvailable ? "Visible in catalog" : "Hidden from catalog"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isAvailable
                  ? "Customers can find and purchase this product."
                  : "This product is hidden and cannot be ordered."}
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={isAvailable}
              onClick={() => setIsAvailable((v) => !v)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${
                isAvailable ? "bg-amber-500" : "bg-gray-200"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  isAvailable ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </Section>
      )}

      {/* ── Submit error ── */}
      {errors.submit && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <p className="text-sm text-red-600">⚠ {errors.submit}</p>
        </div>
      )}

      {/* ── Actions ── */}
      <div className="flex items-center gap-3 pt-2 pb-8">
        <Button
          onClick={handleSubmit}
          disabled={saving}
          className="bg-amber-600 hover:bg-amber-700 text-white px-6"
        >
          {saving
            ? isEdit ? "Saving…" : "Creating…"
            : isEdit ? "Save changes" : "Create product"}
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