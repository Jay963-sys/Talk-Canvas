"use client";

import { useState, useRef } from "react";
import { Upload, Loader2, AlertCircle } from "lucide-react";
import { useConfigurator } from "@/lib/store";
import { uploadToCloudinary, validateFile } from "@/lib/upload";

export default function StepUpload() {
  const { image, setImage } = useConfigurator();
  const [dragging, setDragging] = useState(false);
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
      const result = await uploadToCloudinary(file, setProgress);
      setImage({
        url: result.url,
        publicId: result.publicId,
        width: result.width,
        height: result.height,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Upload failed. Please try again.",
      );
    } finally {
      setUploading(false);
    }
  };

  const borderColor = dragging
    ? "border-accent bg-paper"
    : error
      ? "border-red-400"
      : "border-line";

  return (
    <div className="slide-up">
      <h2 className="display text-3xl font-normal mb-2">Upload your design</h2>
      <p className="text-sm text-ink-soft mb-6">
        JPG or PNG, minimum 300dpi at intended print size. Maximum 25MB.
      </p>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!uploading) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (!uploading) handleFile(e.dataTransfer.files[0]);
        }}
        onClick={() => !uploading && fileRef.current?.click()}
        className={`border-[1.5px] border-dashed p-12 text-center min-h-[400px] flex flex-col items-center justify-center transition-all ${
          uploading ? "cursor-wait" : "cursor-pointer"
        } ${borderColor}`}
      >
        {uploading ? (
          <>
            <Loader2
              size={32}
              className="animate-spin text-accent mb-5"
              strokeWidth={1.5}
            />
            <p className="display-italic text-2xl">Uploading…</p>
            <div className="mt-5 w-64 h-1 bg-line overflow-hidden">
              <div
                className="h-full bg-accent transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-muted mt-2">{progress}%</p>
          </>
        ) : image ? (
          <>
            <img
              src={image.url}
              alt="Uploaded"
              className="max-h-80 max-w-full object-contain"
            />
            <p className="text-xs text-muted mt-5">
              {image.width} × {image.height} px — Click to replace
            </p>
          </>
        ) : (
          <>
            <div
              className={`w-14 h-14 rounded-full flex items-center justify-center mb-5 ${
                error ? "bg-red-50" : "bg-paper"
              }`}
            >
              {error ? (
                <AlertCircle
                  size={22}
                  className="text-red-600"
                  strokeWidth={1.5}
                />
              ) : (
                <Upload size={22} strokeWidth={1.5} />
              )}
            </div>
            <p className="display-italic text-2xl">
              {error ? "Something went wrong" : "Drop your file here"}
            </p>
            <p
              className={`text-xs mt-2 ${error ? "text-red-600" : "text-muted"}`}
            >
              {error || "or click to browse"}
            </p>
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
    </div>
  );
}
