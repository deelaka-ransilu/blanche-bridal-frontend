"use client";

import { useState } from "react";
import { updateCustomerProfileAction } from "@/lib/actions/customers";
import { Button } from "@/components/ui/button";

interface CustomerProfileFormProps {
  customerId: string;
  initialNotes: string;
  initialImageUrls: string[];
}

export default function CustomerProfileForm({
  customerId,
  initialNotes,
  initialImageUrls,
}: CustomerProfileFormProps) {
  const [imageUrls, setImageUrls] = useState<string[]>(initialImageUrls);
  const [newUrl, setNewUrl] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [saved, setSaved] = useState(false);

  function addImageUrl() {
    if (newUrl.trim()) {
      setImageUrls((prev) => [...prev, newUrl.trim()]);
      setNewUrl("");
    }
  }

  function removeImageUrl(index: number) {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(formData: FormData) {
    formData.set("designImageUrls", JSON.stringify(imageUrls));
    setIsPending(true);
    setSaved(false);
    await updateCustomerProfileAction(customerId, formData);
    setIsPending(false);
    setSaved(true);
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-3 rounded-lg border border-border p-4">
      <div>
        <label className="text-xs text-muted-foreground">Admin Notes</label>
        <textarea
          name="adminNotes"
          defaultValue={initialNotes}
          rows={3}
          className="w-full rounded-md border border-border p-2 text-sm mt-1"
          placeholder="Internal notes about this customer..."
        />
      </div>

      <div>
        <label className="text-xs text-muted-foreground">Design Image URLs</label>
        <div className="flex flex-col gap-1 mt-1">
          {imageUrls.map((url, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <span className="truncate flex-1">{url}</span>
              <button
                type="button"
                onClick={() => removeImageUrl(i)}
                className="text-status-cancelled"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-2">
          <input
            type="text"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            placeholder="Paste image URL"
            className="flex-1 rounded-md border border-border p-2 text-sm"
          />
          <Button type="button" size="sm" variant="outline" onClick={addImageUrl}>
            Add
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? "Saving..." : "Save Profile"}
        </Button>
        {saved && <span className="text-xs text-status-completed">Saved.</span>}
      </div>
    </form>
  );
}