"use client";

import { useRef, useState } from "react";
import { Upload, Loader2, X } from "lucide-react";
import { uploadToCloudinary, validateFile } from "@/lib/upload";

interface UploadedImage {
  url: string;
  publicId: string;
}

interface Props {
  value: UploadedImage | null;
  onChange: (img: UploadedImage | null) => void;
}

export default function ImageUploader({ value, onChange }: Props) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setError(null);

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      const result = await uploadToCloudinary(file, {
        onProgress: setProgress,
        signEndpoint: "/api/admin/cloudinary/sign",
      });
      onChange({ url: result.url, publicId: result.publicId });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  if (value) {
    return (
      <div className="relative inline-block">
        <img
          src={value.url}
          alt=""
          className="max-h-80 max-w-full object-contain bg-paper border border-line"
        />
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="px-4 py-2 border border-line text-xs font-medium hover:border-ink transition-colors"
          >
            Replace
          </button>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="px-4 py-2 border border-line text-xs font-medium hover:border-red-400 hover:text-red-600 transition-colors flex items-center gap-1.5"
          >
            <X size={14} strokeWidth={1.5} />
            Remove
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>
    );
  }

  return (
    <div
      onClick={() => !uploading && fileRef.current?.click()}
      className={`border border-dashed p-10 text-center transition-colors ${
        uploading
          ? "border-line cursor-wait"
          : "border-line hover:border-ink cursor-pointer"
      } ${error ? "border-red-400" : ""}`}
    >
      {uploading ? (
        <>
          <Loader2
            className="animate-spin mx-auto text-accent mb-3"
            size={28}
            strokeWidth={1.5}
          />
          <p className="text-sm">Uploading… {progress}%</p>
          <div className="mt-3 w-48 h-1 bg-line mx-auto overflow-hidden">
            <div
              className="h-full bg-accent transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </>
      ) : (
        <>
          <Upload
            className="mx-auto text-ink-soft mb-3"
            size={28}
            strokeWidth={1.5}
          />
          <p className="text-sm font-medium">Click to upload an image</p>
          <p className="text-xs text-muted mt-1">JPG or PNG, max 25MB</p>
          {error && <p className="text-xs text-red-600 mt-3">{error}</p>}
        </>
      )}
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  );
}
