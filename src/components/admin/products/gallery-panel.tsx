"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import {
  createGalleryImageAction,
  updateGalleryImageAction,
  deleteGalleryImageAction,
} from "@/lib/actions/gallery";
import { ImageUploader, type ImageUploaderHandle } from "@/components/products/image-uploader";
import { Button } from "@/components/ui/button";
import type { GalleryImage } from "@/types/gallery";

export function GalleryPanel({ images }: { images: GalleryImage[] }) {
  const router = useRouter();
  const uploaderRef = useRef<ImageUploaderHandle>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [editingCaptionId, setEditingCaptionId] = useState<string | null>(null);
  const [captionDraft, setCaptionDraft] = useState("");

  async function handleUpload() {
    if (!uploaderRef.current?.hasPending()) return;
    setError(null);
    setIsUploading(true);
    try {
      const uploaded = await uploaderRef.current.uploadAll();
      await Promise.all(
        uploaded.map((img) => createGalleryImageAction({ url: img.url, publicId: img.publicId })),
      );
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  }

  async function confirmDelete() {
    if (!pendingDeleteId) return;
    await deleteGalleryImageAction(pendingDeleteId);
    setPendingDeleteId(null);
    router.refresh();
  }

  function startEditingCaption(img: GalleryImage) {
    setEditingCaptionId(img.id);
    setCaptionDraft(img.caption ?? "");
  }

  async function saveCaption(id: string) {
    await updateGalleryImageAction(id, { caption: captionDraft.trim() });
    setEditingCaptionId(null);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-foreground">Gallery · {images.length}</p>
      </div>

      <div className="space-y-3 rounded-2xl border border-border p-4">
        <ImageUploader ref={uploaderRef} initialImages={[]} uploadContext="gallery" />
        <div className="flex items-center justify-between border-t border-border pt-3">
          <p className="text-xs text-muted-foreground">Feeds the public /gallery page</p>
          <Button type="button" onClick={handleUpload} disabled={isUploading} size="sm">
            {isUploading ? "Uploading…" : "Add to gallery"}
          </Button>
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>

      {images.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          No images yet — drag some in above to get started.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {images.map((img) => (
            <div
              key={img.id}
              className="group overflow-hidden rounded-2xl border border-border transition-shadow hover:shadow-md"
            >
              <div className="relative aspect-square bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.url}
                  alt={img.caption || "Gallery image"}
                  className="h-full w-full object-cover"
                />
                <button
                  onClick={() => setPendingDeleteId(img.id)}
                  className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity hover:bg-black/80 group-hover:opacity-100"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {editingCaptionId === img.id ? (
                <div className="flex items-center gap-1.5 p-2">
                  <input
                    autoFocus
                    value={captionDraft}
                    onChange={(e) => setCaptionDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveCaption(img.id);
                      if (e.key === "Escape") setEditingCaptionId(null);
                    }}
                    placeholder="Add a caption"
                    className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs transition-colors focus:border-primary focus:outline-none"
                  />
                  <button
                    onClick={() => saveCaption(img.id)}
                    className="shrink-0 rounded-lg px-2 py-1.5 text-xs font-medium text-primary hover:bg-primary/5"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => startEditingCaption(img)}
                  className="block w-full truncate px-3 py-2 text-left text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  {img.caption || "Add a caption"}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {pendingDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-5 shadow-2xl">
            <h2 className="mb-2 text-base font-medium text-foreground">Delete image?</h2>
            <p className="mb-5 text-sm text-muted-foreground">
              This can&apos;t be undone. The image will be removed from the public gallery.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setPendingDeleteId(null)}
                className="rounded-lg border border-border px-4 py-2 text-sm transition-colors hover:bg-muted"
              >
                Cancel
              </button>
              <Button
                type="button"
                onClick={confirmDelete}
                variant="outline"
                className="border-destructive/30 text-destructive hover:bg-destructive/5"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}