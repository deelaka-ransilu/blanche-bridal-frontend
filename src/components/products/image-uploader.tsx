"use client";

import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import type { Ref } from "react";
import { getUploadSignatureAction } from "@/lib/actions/products";

export type PendingImage = {
  id: string;
  file: File;
  previewUrl: string;
};

export type UploadedImage = { id: string; url: string; publicId: string | null };

export type ImageUploaderHandle = {
  uploadAll: () => Promise<UploadedImage[]>;
  hasPending: () => boolean;
};

type ImageUploaderProps = {
  initialImages?: UploadedImage[];
  uploadContext?: string;
  // Defaults to 5 (the product-gallery use case). Pass 1 for single-image
  // contexts like refund proof.
  maxImages?: number;
};

function ImageUploaderInner(
  { initialImages = [], uploadContext = "product", maxImages = 5 }: ImageUploaderProps,
  ref: Ref<ImageUploaderHandle>,
) {
  const [existing, setExisting] = useState<UploadedImage[]>(initialImages);
  const [pending, setPending] = useState<PendingImage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const totalCount = existing.length + pending.length;

  function addFiles(files: FileList | File[]) {
    setError(null);

    const incoming = Array.from(files);
    const availableSlots = maxImages - totalCount;

    if (availableSlots <= 0) {
      setError(
        maxImages === 1
          ? "Only one image is allowed here — remove it to replace."
          : `You can add up to ${maxImages} images.`,
      );
      return;
    }

    const toAdd = incoming.slice(0, availableSlots);
    if (incoming.length > toAdd.length) {
      setError(
        `You can add up to ${maxImages} image${maxImages === 1 ? "" : "s"} — only added the first ${toAdd.length}.`,
      );
    }

    const newPending: PendingImage[] = toAdd.map((file) => ({
      id: crypto.randomUUID(),
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setPending((prev) => [...prev, ...newPending]);
  }

  function removeExisting(id: string) {
    setExisting((prev) => prev.filter((img) => img.id !== id));
  }

  function removePending(id: string) {
    setPending((prev) => {
      const target = prev.find((p) => p.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((p) => p.id !== id);
    });
  }

  useImperativeHandle(ref, () => ({
    hasPending: () => pending.length > 0,
    async uploadAll(): Promise<UploadedImage[]> {
      setIsUploading(true);
      try {
        const results = await Promise.all(
          pending.map(async ({ file }) => {
            const sigResult = await getUploadSignatureAction(uploadContext);
            if (!sigResult.success) {
              throw new Error(sigResult.message || "Could not get upload signature");
            }
            const { signature, timestamp, apiKey, cloudName, folder } = sigResult.data;

            const body = new FormData();
            body.append("file", file);
            body.append("api_key", apiKey);
            body.append("timestamp", String(timestamp));
            body.append("signature", signature);
            body.append("folder", folder);

            const result = await new Promise<{ secure_url: string; public_id: string } | null>(
              (resolve) => {
                const xhr = new XMLHttpRequest();
                xhr.open("POST", `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`);
                xhr.onload = () => {
                  if (xhr.status >= 200 && xhr.status < 300) {
                    resolve(JSON.parse(xhr.responseText));
                  } else {
                    resolve(null);
                  }
                };
                xhr.onerror = () => resolve(null);
                xhr.send(body);
              },
            );

            if (!result) {
              throw new Error(`Failed to upload ${file.name}`);
            }

            return { id: result.public_id, url: result.secure_url, publicId: result.public_id };
          }),
        );

        return [...existing, ...results];
      } finally {
        setIsUploading(false);
      }
    },
  }));

  const atLimit = totalCount >= maxImages;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {existing.map((img) => (
          <div key={img.id} className="relative h-24 w-24 overflow-hidden rounded-lg border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.url} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => removeExisting(img.id)}
              className="absolute right-1 top-1 rounded-full bg-black/60 px-1.5 text-xs text-white"
            >
              ×
            </button>
          </div>
        ))}

        {pending.map((img) => (
          <div key={img.id} className="relative h-24 w-24 overflow-hidden rounded-lg border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.previewUrl} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => removePending(img.id)}
              disabled={isUploading}
              className="absolute right-1 top-1 rounded-full bg-black/60 px-1.5 text-xs text-white disabled:opacity-40"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        {totalCount} / {maxImages} {maxImages === 1 ? "image" : "images"}
      </p>

      {atLimit ? (
        <p className="rounded-lg border border-dashed border-border px-4 py-3 text-center text-xs text-muted-foreground">
          {maxImages === 1
            ? "Remove the image to replace it."
            : "Limit reached — remove an image to add another."}
        </p>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            if (e.dataTransfer.files?.length) {
              addFiles(e.dataTransfer.files);
            }
          }}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-6 text-center transition-colors ${
            dragging ? "border-primary bg-primary/5" : "border-border"
          }`}
        >
          <p className="text-sm text-muted-foreground">
            Drag & drop {maxImages === 1 ? "an image" : "images"}, or click to browse
          </p>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple={maxImages > 1}
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.length) {
                addFiles(e.target.files);
              }
              e.target.value = "";
            }}
          />
        </div>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export const ImageUploader = forwardRef(ImageUploaderInner);