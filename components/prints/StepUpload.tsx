"use client";

import { useState, useRef } from "react";
import { Upload, Loader2, AlertCircle } from "lucide-react";
import { useConfigurator } from "@/lib/store";
import { uploadToCloudinary, validateFile } from "@/lib/upload";
import { downscaleImage } from "@/lib/image";
import ArchivePickerModal, { ArchiveItem } from "./ArchivePickerModal";

export default function StepUpload() {
  const { image, setImage } = useConfigurator();
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
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
      const optimized = await downscaleImage(file, 4000, 0.9);
      const result = await uploadToCloudinary(optimized, {
        onProgress: setProgress,
      });
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

  const handleArchiveSelect = (item: ArchiveItem) => {
    setError(null);
    setImage({
      url: item.imageUrl,
      publicId: item.imagePublicId,
      width: item.width,
      height: item.height,
    });
    setPickerOpen(false);
  };

  const borderColor = dragging
    ? "border-ink bg-paper"
    : error
      ? "border-red-400 bg-red-50/30"
      : "border-line/60 bg-paper";

  return (
    <div className="fade-in">
      <h2 className="display text-3xl font-normal mb-3">Upload your design</h2>
      <p className="text-[14px] text-ink-soft mb-8 max-w-xl">
        JPG or PNG, up to 25MB. For the sharpest print, upload the
        highest-resolution file you have — we optimize it automatically.
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
        className={`border text-center rounded-2xl min-h-[400px] flex flex-col items-center justify-center transition-all ${
          uploading ? "cursor-wait" : "cursor-pointer hover:border-ink/50"
        } ${borderColor}`}
      >
        {uploading ? (
          <>
            <Loader2
              size={28}
              className="animate-spin text-ink mb-5"
              strokeWidth={1.5}
            />
            <p className="display text-xl text-ink">Uploading…</p>
            <div className="mt-6 w-64 h-1 bg-line overflow-hidden rounded-full">
              <div
                className="h-full bg-ink transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-[12px] uppercase tracking-widest text-ink-soft font-medium mt-4">
              {progress}%
            </p>
          </>
        ) : image ? (
          <>
            <img
              src={image.url}
              alt="Selected"
              className="max-h-80 max-w-full object-contain p-6"
            />
            <p className="text-[12px] text-ink-soft mt-2">
              {image.width} × {image.height} px — Click to replace
            </p>
          </>
        ) : (
          <>
            <div
              className={`w-14 h-14 rounded-full flex items-center justify-center mb-5 transition-colors ${
                error ? "bg-red-100" : "bg-cream"
              }`}
            >
              {error ? (
                <AlertCircle
                  size={20}
                  className="text-red-600"
                  strokeWidth={1.5}
                />
              ) : (
                <Upload size={20} className="text-ink" strokeWidth={1.5} />
              )}
            </div>
            <p className="display text-2xl text-ink mb-1">
              {error ? "Something went wrong" : "Drop your file here"}
            </p>
            <p
              className={`text-[14px] ${error ? "text-red-600" : "text-ink-soft"}`}
            >
              {error || "or click to browse your files"}
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

      <div className="flex items-center gap-4 my-8">
        <div className="flex-1 h-px bg-line/60" />
        <span className="text-[10px] uppercase tracking-widest text-ink-soft font-semibold">
          or
        </span>
        <div className="flex-1 h-px bg-line/60" />
      </div>

      <button
        type="button"
        onClick={() => setPickerOpen(true)}
        disabled={uploading}
        className="w-full border border-line py-4 text-[12px] uppercase tracking-widest font-medium hover:border-ink transition-colors disabled:opacity-50"
      >
        {image
          ? "Choose a different design from our archive"
          : "Choose from our archive"}
      </button>

      {pickerOpen && (
        <ArchivePickerModal
          onSelect={handleArchiveSelect}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </div>
  );
}
