"use client";

import { useState, useRef } from "react";
import { mockGalleryImages, type GalleryImage } from "@/lib/mock/products-mock";

export function GalleryPanel() {
  const [images, setImages] = useState<GalleryImage[]>(mockGalleryImages);
  const [isDragging, setIsDragging] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [editingCaptionId, setEditingCaptionId] = useState<string | null>(null);
  const [captionDraft, setCaptionDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function addFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const newImages: GalleryImage[] = Array.from(files).map((file, i) => ({
      id: `local-${Date.now()}-${i}`,
      url: URL.createObjectURL(file),
      caption: "",
    }));
    // Frontend-first phase: local preview only. Swap for a real upload
    // (e.g. Cloudinary) once backend wiring starts.
    setImages((prev) => [...newImages, ...prev]);
  }

  function confirmDelete() {
    if (!pendingDeleteId) return;
    setImages((prev) => prev.filter((img) => img.id !== pendingDeleteId));
    setPendingDeleteId(null);
  }

  function startEditingCaption(img: GalleryImage) {
    setEditingCaptionId(img.id);
    setCaptionDraft(img.caption);
  }

  function saveCaption(id: string) {
    setImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, caption: captionDraft.trim() } : img))
    );
    setEditingCaptionId(null);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Gallery · {images.length}</p>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          addFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={[
          "flex h-40 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed text-sm text-muted-foreground transition-colors",
          isDragging ? "border-primary bg-muted/50" : "",
        ].join(" ")}
      >
        <p>Drag and drop images here, or click to browse</p>
        <p className="text-xs">Feeds the public /gallery page</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>

      {images.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          No images yet — drag some in above to get started.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {images.map((img) => (
            <div key={img.id} className="group relative overflow-hidden rounded-lg border">
              <div className="aspect-square bg-muted">
                {img.url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={img.url}
                    alt={img.caption || "Gallery image"}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <button
                onClick={() => setPendingDeleteId(img.id)}
                className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                Delete
              </button>

              {editingCaptionId === img.id ? (
                <div className="flex items-center gap-1 p-1.5">
                  <input
                    autoFocus
                    value={captionDraft}
                    onChange={(e) => setCaptionDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveCaption(img.id);
                      if (e.key === "Escape") setEditingCaptionId(null);
                    }}
                    placeholder="Add a caption"
                    className="w-full rounded-md border px-2 py-1 text-xs"
                  />
                  <button
                    onClick={() => saveCaption(img.id)}
                    className="shrink-0 text-xs text-primary"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => startEditingCaption(img)}
                  className="block w-full truncate px-2 py-1.5 text-left text-xs text-muted-foreground hover:text-foreground"
                >
                  {img.caption || "Add a caption"}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {pendingDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-lg bg-background p-6 shadow-lg">
            <h2 className="mb-2 text-base font-semibold">Delete image?</h2>
            <p className="mb-6 text-sm text-muted-foreground">
              This can&apos;t be undone. The image will be removed from the public gallery.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setPendingDeleteId(null)}
                className="rounded-md border px-4 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="rounded-md bg-destructive px-4 py-2 text-sm font-medium text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}