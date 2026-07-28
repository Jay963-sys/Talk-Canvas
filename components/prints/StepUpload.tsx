"use client";

import { useState, useRef } from "react";
import { Upload, Loader2, AlertCircle } from "lucide-react";
import { useConfigurator } from "@/lib/store";
import { uploadToCloudinary, validateFile } from "@/lib/upload";
import { downscaleImage } from "@/lib/image";
import ArchivePickerModal, { ArchiveItem } from "./ArchivePickerModal";

/** Shape of GET /api/archive-sets/[setId]. */
interface SetResponse {
  setId: number;
  pieces: {
    imageUrl: string;
    imagePublicId: string;
    width: number;
    height: number;
  }[];
}

export default function StepUpload() {
  const { image, set, setImage, selectSet } = useConfigurator();
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [loadingSet, setLoadingSet] = useState(false);
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

  const handleArchiveSelect = async (item: ArchiveItem) => {
    setError(null);

    if (!item.setId) {
      setImage({
        url: item.imageUrl,
        publicId: item.imagePublicId,
        width: item.width,
        height: item.height,
      });
      setPickerOpen(false);
      return;
    }

    // The grid only carries the leading panel, so the rest are fetched here —
    // and from the server, never assembled client-side, so the pieces the
    // customer configures are the pieces the order will contain.
    setLoadingSet(true);
    try {
      const res = await fetch(`/api/archive-sets/${item.setId}`);
      if (!res.ok) throw new Error("That set is no longer available.");
      const data: SetResponse = await res.json();
      selectSet({
        setId: data.setId,
        pieces: data.pieces.map((p) => ({
          url: p.imageUrl,
          publicId: p.imagePublicId,
          width: p.width,
          height: p.height,
        })),
      });
      setPickerOpen(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Couldn't load that set.",
      );
      setPickerOpen(false);
    } finally {
      setLoadingSet(false);
    }
  };

  const borderColor = dragging
    ? "border-ink bg-paper"
    : error
      ? "border-red-400 bg-red-50/30"
      : "border-line/60 bg-paper";

  const busy = uploading || loadingSet;

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
          if (!busy) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (!busy) handleFile(e.dataTransfer.files[0]);
        }}
        onClick={() => !busy && fileRef.current?.click()}
        className={`border text-center rounded-2xl min-h-[400px] flex flex-col items-center justify-center transition-all ${
          busy ? "cursor-wait" : "cursor-pointer hover:border-ink/50"
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
        ) : loadingSet ? (
          <>
            <Loader2
              size={28}
              className="animate-spin text-ink mb-5"
              strokeWidth={1.5}
            />
            <p className="display text-xl text-ink">Loading the set…</p>
          </>
        ) : set ? (
          <>
            {/* All panels, so it's obvious at a glance how many pieces are
                being bought — the price about to appear is for all of them. */}
            <div className="flex items-center justify-center gap-3 p-6 flex-wrap">
              {set.pieces.map((piece, i) => (
                <img
                  key={i}
                  src={piece.url}
                  alt=""
                  className="max-h-64 max-w-[30%] object-contain"
                />
              ))}
            </div>
            <p className="text-[12px] text-ink-soft mt-2">
              Set of {set.pieces.length} — click to choose something else
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

      {set && (
        <p className="mt-4 text-[13px] text-ink-soft leading-relaxed">
          This design comes as a set of {set.pieces.length}. Every piece takes
          the same frame and size, and they&apos;re sold together — delivery is
          arranged separately and we&apos;ll quote it after you order.
        </p>
      )}

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
        disabled={busy}
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
