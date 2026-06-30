"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { uploadToCloudinary } from "@/lib/upload";
import { downscaleImage } from "@/lib/image";
import { ARCHIVE_COLLECTIONS } from "@/data/collections";

type Status =
  | "pending"
  | "optimizing"
  | "uploading"
  | "saving"
  | "done"
  | "error";

interface Job {
  file: File;
  preview: string;
  status: Status;
  progress: number;
  error?: string;
}

function preCheck(file: File): string | null {
  if (!file.type.startsWith("image/")) return "Not an image file";
  if (file.size > 100 * 1024 * 1024) return "Over 100MB — too large to process";
  return null;
}

export default function ArchiveUploader() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [busy, setBusy] = useState(false);
  const [collection, setCollection] = useState<string>("");
  const fileRef = useRef<HTMLInputElement>(null);

  const addFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    const next: Job[] = Array.from(fileList).map((file) => {
      const err = preCheck(file);
      return {
        file,
        preview: URL.createObjectURL(file),
        status: err ? "error" : "pending",
        progress: 0,
        error: err ?? undefined,
      };
    });
    setJobs((prev) => [...prev, ...next]);
  };

  const update = (i: number, patch: Partial<Job>) =>
    setJobs((prev) =>
      prev.map((j, idx) => (idx === i ? { ...j, ...patch } : j)),
    );

  const uploadAll = async () => {
    setBusy(true);
    for (let i = 0; i < jobs.length; i++) {
      if (jobs[i].status === "done" || jobs[i].status === "error") continue;
      try {
        update(i, { status: "optimizing", progress: 0 });
        const optimized = await downscaleImage(jobs[i].file);

        update(i, { status: "uploading", progress: 0 });
        const result = await uploadToCloudinary(optimized, {
          signEndpoint: "/api/admin/cloudinary/sign",
          onProgress: (p) => update(i, { progress: p }),
        });

        update(i, { status: "saving" });
        const res = await fetch("/api/admin/archive-prints", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageUrl: result.url,
            imagePublicId: result.publicId,
            width: result.width,
            height: result.height,
            collection: collection || undefined,
          }),
        });
        if (!res.ok) throw new Error("Couldn't save this image");

        update(i, { status: "done", progress: 100 });
      } catch (e) {
        update(i, {
          status: "error",
          error: e instanceof Error ? e.message : "Upload failed",
        });
      }
    }
    setBusy(false);
  };

  const pendingCount = jobs.filter((j) => j.status === "pending").length;
  const allSettled =
    jobs.length > 0 &&
    jobs.every((j) => j.status === "done" || j.status === "error");
  const anyDone = jobs.some((j) => j.status === "done");

  return (
    <div>
      <div className="mb-6">
        <label className="text-xs uppercase tracking-[0.1em] text-muted block mb-2">
          Collection (applies to this batch)
        </label>
        <select
          value={collection}
          onChange={(e) => setCollection(e.target.value)}
          disabled={busy}
          className="border border-line bg-paper px-3 py-2 text-sm w-full sm:w-64"
        >
          <option value="">Uncategorized</option>
          {ARCHIVE_COLLECTIONS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div
        onClick={() => !busy && fileRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (!busy) addFiles(e.dataTransfer.files);
        }}
        className={`border-[1.5px] border-dashed border-line p-10 text-center ${
          busy ? "cursor-wait" : "cursor-pointer"
        }`}
      >
        <div className="w-12 h-12 rounded-full bg-paper flex items-center justify-center mx-auto mb-4">
          <Upload size={20} strokeWidth={1.5} />
        </div>
        <p className="display-italic text-xl">Drop images here</p>
        <p className="text-xs text-muted mt-1">
          or click to browse — large files are optimized automatically
        </p>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>

      {jobs.length > 0 && (
        <>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-6">
            {jobs.map((job, i) => (
              <div
                key={i}
                className="relative aspect-square bg-paper overflow-hidden border border-line"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={job.preview}
                  alt=""
                  className="w-full h-full object-cover"
                />
                {job.status === "optimizing" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <span className="text-cream text-[10px]">Optimizing…</span>
                  </div>
                )}
                {job.status === "uploading" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <span className="text-cream text-xs">{job.progress}%</span>
                  </div>
                )}
                {job.status === "saving" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <Loader2 className="animate-spin text-cream" size={18} />
                  </div>
                )}
                {job.status === "done" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <CheckCircle2 className="text-green-400" size={20} />
                  </div>
                )}
                {job.status === "error" && (
                  <div
                    className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 px-2 text-center"
                    title={job.error}
                  >
                    <AlertCircle className="text-red-400 mb-1" size={18} />
                    <span className="text-cream text-[10px] leading-tight">
                      {job.error}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4 mt-6">
            {!allSettled ? (
              <button
                onClick={uploadAll}
                disabled={busy || pendingCount === 0}
                className="bg-ink text-cream px-5 py-2 text-sm hover:bg-accent transition-colors disabled:opacity-50"
              >
                {busy
                  ? "Working…"
                  : `Upload ${pendingCount} image${pendingCount === 1 ? "" : "s"}`}
              </button>
            ) : (
              anyDone && (
                <button
                  onClick={() => router.push("/admin/archive-prints")}
                  className="bg-ink text-cream px-5 py-2 text-sm hover:bg-accent transition-colors"
                >
                  Done — view archive
                </button>
              )
            )}
            {!busy && (
              <button
                onClick={() => setJobs([])}
                className="text-sm text-ink-soft hover:text-ink"
              >
                Clear
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
