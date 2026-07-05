"use client";

import { useRef, useState } from "react";
import { getUploadSignatureAction } from "@/lib/actions/products";

export type UploadedImage = { id: string; url: string; publicId: string | null };

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