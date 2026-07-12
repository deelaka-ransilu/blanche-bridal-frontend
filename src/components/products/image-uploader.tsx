"use client";

import { useRef, useState } from "react";
import { getUploadSignatureAction } from "@/lib/actions/products";

export type UploadedImage = { id: string; url: string; publicId: string | null };

// Product cards render images at up to ~600px wide (3:4 aspect) and the
// product detail gallery even larger, so anything much smaller than this
// visibly blurs when scaled up to fill those containers.
const MIN_WIDTH = 800;
const MIN_HEIGHT = 800;
const MAX_IMAGES = 5;

function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read image"));
    };
    img.src = url;
  });
}

export function ImageUploader({
  images,
  onChange,
}: {
  images: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
}) {
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError(null);

    if (images.length >= MAX_IMAGES) {
      setError(`You can add up to ${MAX_IMAGES} images per product.`);
      return;
    }

    try {
      const { width, height } = await getImageDimensions(file);
      if (width < MIN_WIDTH || height < MIN_HEIGHT) {
        setError(
          `Image is too small (${width}×${height}px). Please use at least ${MIN_WIDTH}×${MIN_HEIGHT}px so it doesn't look blurry on the site.`,
        );
        return;
      }
    } catch {
      setError("Could not read that file as an image.");
      return;
    }

    setProgress(0);

    try {
      const sigResult = await getUploadSignatureAction();
      if (!sigResult.success) {
        setError(sigResult.message || "Could not get upload signature");
        setProgress(null);
        return;
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
          xhr.open(
            "POST",
            `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          );

          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              setProgress(Math.round((e.loaded / e.total) * 100));
            }
          };

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
        setError("Upload failed");
        return;
      }

      onChange([
        ...images,
        { id: result.public_id, url: result.secure_url, publicId: result.public_id },
      ]);
    } catch {
      setError("Upload failed — check connection");
    } finally {
      setProgress(null);
    }
  }

  function removeImage(id: string) {
    onChange(images.filter((img) => img.id !== id));
  }

  const atLimit = images.length >= MAX_IMAGES;

  return (
    <div className="space-y-3">
      <input type="hidden" name="images" value={JSON.stringify(images)} />

      <div className="flex flex-wrap gap-3">
        {images.map((img) => (
          <div
            key={img.id}
            className="relative h-24 w-24 overflow-hidden rounded-lg border border-border"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.url} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => removeImage(img.id)}
              className="absolute right-1 top-1 rounded-full bg-black/60 px-1.5 text-xs text-white"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        {images.length} / {MAX_IMAGES} images
      </p>

      {atLimit ? (
        <p className="rounded-lg border border-dashed border-border px-4 py-3 text-center text-xs text-muted-foreground">
          Limit reached — remove an image to add another.
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
            const file = e.dataTransfer.files?.[0];
            if (file) handleFile(file);
          }}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-6 text-center transition-colors ${
            dragging ? "border-primary bg-primary/5" : "border-border"
          }`}
        >
          <p className="text-sm text-muted-foreground">
            Drag & drop an image, or click to browse
          </p>
          <p className="mt-1 text-xs text-muted-foreground/70">
            Minimum {MIN_WIDTH}×{MIN_HEIGHT}px
          </p>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
              e.target.value = "";
            }}
          />
        </div>
      )}

      {progress !== null && (
        <div className="h-2 w-full overflow-hidden rounded-full bg-border">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}