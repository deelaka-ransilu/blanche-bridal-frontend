"use client";

import { useState } from "react";
import { mockRentalProducts, type MockCategory } from "@/lib/mock/products-mock";

const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];

type RentalProductFormProps = {
  productId: string | null;
  categories: MockCategory[];
  onClose: () => void;
};

export function RentalProductForm({ productId, categories, onClose }: RentalProductFormProps) {
  const existing = productId
    ? mockRentalProducts.find((p) => p.id === productId)
    : null;

  const [name, setName] = useState(existing?.name ?? "");
  const [categoryId, setCategoryId] = useState(
    existing?.category.id ?? categories[0]?.id ?? ""
  );
  const [rentalPrice, setRentalPrice] = useState<number | "">(
    existing?.rentalPrice ?? ""
  );
  const [rentalPricePerDay, setRentalPricePerDay] = useState<number | "">(
    existing?.rentalPricePerDay ?? ""
  );
  const [sizes, setSizes] = useState<string[]>(existing?.sizes ?? []);
  const [description, setDescription] = useState("");

  function toggleSize(size: string) {
    setSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  }

  function handleSubmit() {
    // type is hardcoded to DRESS — no dropdown, accessories aren't rentable yet.
    console.log("rental product submit", {
      name,
      type: "DRESS",
      categoryId,
      rentalPrice: rentalPrice === "" ? null : rentalPrice,
      rentalPricePerDay: rentalPricePerDay === "" ? null : rentalPricePerDay,
      sizes,
      description,
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg rounded-lg bg-background p-6 shadow-lg">
        <h2 className="mb-4 text-lg font-semibold">
          {existing ? "Edit rental item" : "New rental item"}
        </h2>

        <div className="grid gap-4">
          <label className="grid gap-1 text-sm">
            Name
            <input
              className="rounded-md border px-3 py-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>

          <label className="grid gap-1 text-sm">
            Category
            <select
              className="rounded-md border px-3 py-2"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              {categories.length === 0 && <option value="">No dress categories yet</option>}
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="grid gap-1 text-sm">
              Rental price (Rs, flat)
              <input
                type="number"
                placeholder="Optional"
                className="rounded-md border px-3 py-2"
                value={rentalPrice}
                onChange={(e) =>
                  setRentalPrice(e.target.value === "" ? "" : Number(e.target.value))
                }
              />
            </label>
            <label className="grid gap-1 text-sm">
              Rental price per day (Rs)
              <input
                type="number"
                placeholder="Optional"
                className="rounded-md border px-3 py-2"
                value={rentalPricePerDay}
                onChange={(e) =>
                  setRentalPricePerDay(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
              />
            </label>
          </div>

          <div className="grid gap-1 text-sm">
            Sizes
            <div className="flex flex-wrap gap-2">
              {SIZE_OPTIONS.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => toggleSize(size)}
                  className={[
                    "rounded-full border px-3 py-1 text-xs",
                    sizes.includes(size)
                      ? "border-primary bg-primary text-white"
                      : "text-muted-foreground",
                  ].join(" ")}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <label className="grid gap-1 text-sm">
            Description
            <textarea
              className="rounded-md border px-3 py-2"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>

          <div className="grid gap-1 text-sm">
            Images
            <div className="flex h-24 items-center justify-center rounded-md border border-dashed text-xs text-muted-foreground">
              Image uploader goes here (reuse existing ImageUploader)
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-md border px-4 py-2 text-sm">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}