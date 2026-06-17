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
      // Optimize before upload: cap at 4000px on the long edge at q0.9. This
      // keeps files under Cloudinary's per-image limit (and the 25MP transform
      // cap) while staying sharp at standard print sizes. Re-encoding also
      // applies EXIF orientation, so phone photos don't upload sideways.
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

  // An archive design slots into the same image state an upload would fill —
  // already a Cloudinary asset, so no upload step needed. The user then
  // continues to Frame via the usual Continue button.
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
    ? "border-accent bg-paper"
    : error
      ? "border-red-400"
      : "border-line";

  return (
    <div className="slide-up">
      <h2 className="display text-3xl font-normal mb-2">Upload your design</h2>
      <p className="text-sm text-ink-soft mb-6">
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
              alt="Selected"
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

      {/* Archive alternative */}
      <div className="flex items-center gap-4 mt-6 mb-4">
        <div className="flex-1 h-px bg-line" />
        <span className="text-xs uppercase tracking-[0.15em] text-muted">
          or
        </span>
        <div className="flex-1 h-px bg-line" />
      </div>

      <button
        type="button"
        onClick={() => setPickerOpen(true)}
        disabled={uploading}
        className="w-full border-[1.5px] border-line py-4 text-sm tracking-wide hover:border-ink transition-colors disabled:opacity-50"
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
