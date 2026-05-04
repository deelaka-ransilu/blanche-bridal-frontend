"use client";

import { useRef } from "react";
import { CldUploadWidget } from "next-cloudinary";
import { X, ImagePlus } from "lucide-react";
import Image from "next/image";

interface ImageUploadProps {
  urls: string[];
  onChange: (urls: string[]) => void;
  maxImages?: number;
  folder?: string;
}

export function ImageUpload({
  urls,
  onChange,
  maxImages = 6,
  folder,
}: ImageUploadProps) {
  // Keep a ref to always have the latest urls without stale closure
  const urlsRef = useRef(urls);
  urlsRef.current = urls;

  function handleUpload(result: any) {
    const url: string = result.info.secure_url;
    const current = urlsRef.current;
    if (!current.includes(url)) {
      onChange([...current, url]);
    }
  }

  function handleRemove(urlToRemove: string) {
    onChange(urls.filter((u) => u !== urlToRemove));
  }

  return (
    <div className="space-y-3">
      {urls.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {urls.map((url) => (
            <div
              key={url}
              className="relative group aspect-square rounded-md overflow-hidden border border-border"
            >
              <Image
                src={url}
                alt="Product image"
                fill
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => handleRemove(url)}
                className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5
                           opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {urls.length < maxImages && (
        <CldUploadWidget
          uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
          onSuccess={handleUpload}
          options={{ multiple: true, maxFiles: maxImages - urls.length }}
        >
          {({ open }) => (
            <button
              type="button"
              onClick={() => open()}
              className="flex items-center gap-2 px-4 py-2 rounded-md border border-dashed
                         border-amber-400 text-amber-600 hover:bg-amber-50 transition-colors
                         text-sm font-medium"
            >
              <ImagePlus className="w-4 h-4" />
              Add images {urls.length > 0 && `(${urls.length}/${maxImages})`}
            </button>
          )}
        </CldUploadWidget>
      )}

      {urls.length === 0 && (
        <p className="text-xs text-muted-foreground">No images uploaded yet.</p>
      )}
    </div>
  );
}
