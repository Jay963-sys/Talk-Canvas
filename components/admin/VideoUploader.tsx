"use client";

import { useRef, useState } from "react";
import { Film, Loader2, X } from "lucide-react";
import { uploadToCloudinary, validateVideoFile } from "@/lib/upload";
import { videoPoster, videoSrc } from "@/lib/media";

interface UploadedVideo {
  url: string;
  publicId: string;
  /** Seconds — set on a fresh upload only. */
  duration?: number;
}

interface Props {
  value: UploadedVideo | null;
  onChange: (video: UploadedVideo | null) => void;
}

/** Same flow as ImageUploader, for a short customer video. */
export default function VideoUploader({ value, onChange }: Props) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setError(null);

    const validationError = validateVideoFile(file);
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
        resourceType: "video",
        signBody: { kind: "video" },
      });
      onChange({
        url: result.url,
        publicId: result.publicId,
        duration: result.duration,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const input = (
    <input
      ref={fileRef}
      type="file"
      accept="video/mp4,video/quicktime,video/webm"
      className="hidden"
      onChange={(e) => handleFile(e.target.files?.[0])}
    />
  );

  if (value && !uploading) {
    return (
      <div className="inline-block max-w-full">
        <video
          src={videoSrc(value.url)}
          poster={videoPoster(value.url)}
          controls
          playsInline
          preload="metadata"
          className="max-h-80 max-w-full bg-ink border border-line"
        />
        <p className="text-xs text-muted mt-2">
          The first play can take a few seconds while the video is prepared.
        </p>
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
        {error && <p className="text-xs text-red-600 mt-3">{error}</p>}
        {input}
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
          <p className="text-sm">Uploading video… {progress}%</p>
          <div className="mt-3 w-48 h-1 bg-line mx-auto overflow-hidden">
            <div
              className="h-full bg-accent transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-muted mt-3">
            Keep this page open until it finishes.
          </p>
        </>
      ) : (
        <>
          <Film
            className="mx-auto text-ink-soft mb-3"
            size={28}
            strokeWidth={1.5}
          />
          <p className="text-sm font-medium">Click to upload a video</p>
          <p className="text-xs text-muted mt-1">MP4, MOV or WebM, max 100MB</p>
          {error && <p className="text-xs text-red-600 mt-3">{error}</p>}
        </>
      )}
      {input}
    </div>
  );
}
