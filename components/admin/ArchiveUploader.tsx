"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  X,
} from "lucide-react";
import { uploadToCloudinary } from "@/lib/upload";
import { downscaleImage } from "@/lib/image";
import { ARCHIVE_CATEGORIES, type ArchiveCategory } from "@/data/collections";

type Status =
  | "pending"
  | "optimizing"
  | "uploading"
  | "saving"
  | "done"
  | "error";

type Mode = "individual" | "set";

interface Job {
  file: File;
  preview: string;
  status: Status;
  progress: number;
  error?: string;
  /** Read from the file itself before upload, so set mode can check shapes
   *  while the images are still cancellable. */
  width?: number;
  height?: number;
  /** Archive print id, once saved. Collected in order to build the set. */
  createdId?: number;
}

function preCheck(file: File): string | null {
  if (!file.type.startsWith("image/")) return "Not an image file";
  if (file.size > 100 * 1024 * 1024) return "Over 100MB — too large to process";
  return null;
}

/** Matches the server's rule: squares read portrait. */
function orientationOf(job: Job): "portrait" | "landscape" | null {
  if (!job.width || !job.height) return null;
  return job.width > job.height ? "landscape" : "portrait";
}

/** Intrinsic dimensions, read from the browser rather than guessed. */
function readDimensions(
  url: string,
): Promise<{ width: number; height: number } | null> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () =>
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

export default function ArchiveUploader() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<Mode>("individual");
  // Required, and deliberately not defaulted to a real category — an unset
  // select is a visible prompt, whereas a pre-filled one gets uploaded past.
  const [category, setCategory] = useState<ArchiveCategory | "">("");
  const [groupError, setGroupError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  // A second, hidden input dedicated to replacing one slot in place. The target
  // index is stashed here so the change handler knows which tile to swap.
  const replaceRef = useRef<HTMLInputElement>(null);
  const replaceIndex = useRef<number | null>(null);

  /** Build a Job (with preview) from a File, running the pre-check. */
  const makeJob = (file: File): Job => {
    const err = preCheck(file);
    return {
      file,
      preview: URL.createObjectURL(file),
      status: err ? "error" : "pending",
      progress: 0,
      error: err ?? undefined,
    };
  };

  const addFiles = async (fileList: FileList | null) => {
    if (!fileList) return;
    const next: Job[] = Array.from(fileList).map(makeJob);
    setJobs((prev) => [...prev, ...next]);

    // Fill in dimensions as they resolve. Doing this up front means a mixed
    // batch is caught before anything reaches Cloudinary — otherwise the
    // grouping fails afterwards and leaves loose prints behind.
    const measured = await Promise.all(
      next.map(async (job) => ({
        preview: job.preview,
        dims: await readDimensions(job.preview),
      })),
    );
    setJobs((prev) =>
      prev.map((job) => {
        const m = measured.find((x) => x.preview === job.preview);
        return m?.dims ? { ...job, ...m.dims } : job;
      }),
    );
  };

  const update = (i: number, patch: Partial<Job>) =>
    setJobs((prev) =>
      prev.map((j, idx) => (idx === i ? { ...j, ...patch } : j)),
    );

  /** Swap two positions. In set mode this IS the hanging order. */
  const move = (i: number, delta: number) => {
    setJobs((prev) => {
      const target = i + delta;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[target]] = [next[target], next[i]];
      return next;
    });
  };

  /** Drop a piece that isn't working before the batch uploads. */
  const remove = (i: number) => {
    setJobs((prev) => {
      const target = prev[i];
      if (target) URL.revokeObjectURL(target.preview);
      return prev.filter((_, idx) => idx !== i);
    });
    setGroupError(null);
  };

  /** Open the file picker to swap one slot in place, keeping its position. */
  const requestReplace = (i: number) => {
    replaceIndex.current = i;
    replaceRef.current?.click();
  };

  const onReplaceFile = async (fileList: FileList | null) => {
    const i = replaceIndex.current;
    replaceIndex.current = null;
    if (replaceRef.current) replaceRef.current.value = "";
    if (i === null || !fileList || !fileList[0]) return;

    const job = makeJob(fileList[0]);
    setJobs((prev) => {
      const old = prev[i];
      if (old) URL.revokeObjectURL(old.preview);
      return prev.map((j, idx) => (idx === i ? job : j));
    });
    setGroupError(null);

    // Measure the replacement so the set orientation check stays correct.
    const dims = await readDimensions(job.preview);
    if (dims) {
      setJobs((prev) =>
        prev.map((j, idx) =>
          idx === i && j.preview === job.preview ? { ...j, ...dims } : j,
        ),
      );
    }
  };

  const uploadAll = async () => {
    if (!category) return;
    setBusy(true);
    setGroupError(null);

    // Ids in job order, so the set is built in the order shown on screen.
    const createdIds: number[] = [];
    let anyFailed = false;

    for (let i = 0; i < jobs.length; i++) {
      if (jobs[i].status === "done") {
        if (jobs[i].createdId) createdIds.push(jobs[i].createdId!);
        continue;
      }
      if (jobs[i].status === "error") {
        anyFailed = true;
        continue;
      }
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
            category,
          }),
        });
        if (!res.ok) throw new Error("Couldn't save this image");
        const row: { id: number } = await res.json();

        createdIds.push(row.id);
        update(i, { status: "done", progress: 100, createdId: row.id });
      } catch (e) {
        anyFailed = true;
        update(i, {
          status: "error",
          error: e instanceof Error ? e.message : "Upload failed",
        });
      }
    }

    // Grouping happens last, once every piece exists. A set is all-or-nothing,
    // so a batch with a failed upload is left as loose prints rather than
    // grouped into something incomplete — staff can retry or group by hand.
    if (mode === "set") {
      if (anyFailed || createdIds.length < 2) {
        setGroupError(
          "Not every piece uploaded, so these were left as separate prints. Fix the failures, then group them from the archive grid.",
        );
      } else {
        try {
          const res = await fetch("/api/admin/archive-sets", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ids: createdIds }),
          });
          if (!res.ok) {
            const data = await res.json().catch(() => null);
            throw new Error(data?.error ?? "Couldn't group these pieces.");
          }
        } catch (e) {
          setGroupError(
            `${e instanceof Error ? e.message : "Couldn't group these pieces."} The images are uploaded — group them from the archive grid.`,
          );
        }
      }
    }

    setBusy(false);
  };

  const pendingCount = jobs.filter((j) => j.status === "pending").length;
  const allSettled =
    jobs.length > 0 &&
    jobs.every((j) => j.status === "done" || j.status === "error");
  const anyDone = jobs.some((j) => j.status === "done");

  // Set checks, run before upload so nothing lands in a bad state.
  const orientations = new Set(
    jobs
      .filter((j) => j.status !== "error")
      .map(orientationOf)
      .filter(Boolean),
  );
  const mixedOrientation = mode === "set" && orientations.size > 1;
  const tooFewForSet =
    mode === "set" && jobs.filter((j) => j.status !== "error").length < 2;

  const blocked = mixedOrientation || tooFewForSet;

  return (
    <div>
      <div className="mb-6">
        <label
          htmlFor="archive-category"
          className="text-xs uppercase tracking-[0.1em] text-muted block mb-2"
        >
          Category (applies to this batch)
        </label>
        <select
          id="archive-category"
          value={category}
          onChange={(e) => setCategory(e.target.value as ArchiveCategory | "")}
          disabled={busy}
          className="border border-line bg-paper px-3 py-2 text-sm w-full sm:w-64"
        >
          <option value="">Choose a category…</option>
          {ARCHIVE_CATEGORIES.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.label}
            </option>
          ))}
        </select>
        <p className="text-xs text-ink-soft mt-2 max-w-sm">
          Upload one category at a time. Portrait and landscape are read from
          each image automatically — you never tag them.
        </p>
      </div>

      {/* Grouping at upload rather than afterwards: once the archive runs to
          hundreds of pieces, finding the three panels again in a grid to group
          them is the slow part. */}
      <div className="mb-6">
        <span className="text-xs uppercase tracking-[0.1em] text-muted block mb-2">
          What is this batch?
        </span>
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["individual", "Separate pieces"],
              ["set", "One set, sold together"],
            ] as [Mode, string][]
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              disabled={busy}
              onClick={() => {
                setMode(value);
                setGroupError(null);
              }}
              className={`border px-4 py-2 text-sm transition-colors disabled:opacity-60 ${
                mode === value
                  ? "border-ink bg-ink text-cream"
                  : "border-line hover:border-ink"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        {mode === "set" && (
          <p className="text-xs text-ink-soft mt-2 max-w-md">
            Every piece takes the same frame and size, and customers must buy
            them together. Arrange them below in the order they hang, left to
            right — swap out any piece that isn&apos;t connecting before you
            upload.
          </p>
        )}
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

      {/* Dedicated single-file input for in-place replacement. */}
      <input
        ref={replaceRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onReplaceFile(e.target.files)}
      />

      {mixedOrientation && (
        <p className="text-[13px] text-amber-800 bg-amber-50/60 border border-amber-300 px-4 py-3 mt-4">
          These aren&apos;t all the same shape. A set takes one frame and one
          size, so every piece has to be portrait or every piece landscape.
        </p>
      )}

      {tooFewForSet && jobs.length > 0 && (
        <p className="text-[13px] text-amber-800 bg-amber-50/60 border border-amber-300 px-4 py-3 mt-4">
          A set needs at least two pieces.
        </p>
      )}

      {groupError && (
        <p className="text-[13px] text-red-600 border border-red-300 bg-red-50/60 px-4 py-3 mt-4">
          {groupError}
        </p>
      )}

      {jobs.length > 0 && (
        <>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-6">
            {jobs.map((job, i) => {
              // Remove/replace only make sense before a piece is committed —
              // once it's uploaded, the fix is on the server, not here.
              const editable =
                !busy && (job.status === "pending" || job.status === "error");
              return (
                <div key={job.preview}>
                  <div className="relative aspect-square bg-paper overflow-hidden border border-line">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={job.preview}
                      alt=""
                      className="w-full h-full object-cover"
                    />

                    {/* In set mode the number is the hanging position, so it
                        stays visible while the batch is being arranged. */}
                    {mode === "set" && job.status !== "error" && (
                      <span className="absolute top-1 left-1 w-6 h-6 rounded-full bg-ink text-cream text-[11px] flex items-center justify-center tabular-nums z-20">
                        {i + 1}
                      </span>
                    )}

                    {/* Drop this piece from the batch. */}
                    {editable && (
                      <button
                        type="button"
                        onClick={() => remove(i)}
                        aria-label="Remove this image"
                        title="Remove"
                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-cream flex items-center justify-center hover:bg-black/80 transition-colors z-20"
                      >
                        <X size={13} strokeWidth={2} />
                      </button>
                    )}

                    {job.status === "optimizing" && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <span className="text-cream text-[10px]">
                          Optimizing…
                        </span>
                      </div>
                    )}
                    {job.status === "uploading" && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <span className="text-cream text-xs">
                          {job.progress}%
                        </span>
                      </div>
                    )}
                    {job.status === "saving" && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <Loader2
                          className="animate-spin text-cream"
                          size={18}
                        />
                      </div>
                    )}
                    {job.status === "done" && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <CheckCircle2 className="text-green-400" size={20} />
                      </div>
                    )}
                    {job.status === "error" && (
                      <div
                        className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 px-2 text-center pointer-events-none"
                        title={job.error}
                      >
                        <AlertCircle className="text-red-400 mb-1" size={18} />
                        <span className="text-cream text-[10px] leading-tight">
                          {job.error}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Footer controls: reorder (set mode) on the left, swap the
                      slot in place on the right. Arrows rather than
                      drag-and-drop — this is used on a phone as often as a
                      laptop, and a two-tap swap needs no library. */}
                  {(editable ||
                    (mode === "set" && !busy && jobs.length > 1)) && (
                    <div className="flex justify-between items-center mt-1 gap-1">
                      {mode === "set" && !busy && jobs.length > 1 ? (
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => move(i, -1)}
                            disabled={i === 0}
                            aria-label="Move earlier"
                            className="border border-line p-1 disabled:opacity-30 hover:bg-ink hover:text-cream transition-colors"
                          >
                            <ChevronLeft size={13} strokeWidth={1.5} />
                          </button>
                          <button
                            type="button"
                            onClick={() => move(i, 1)}
                            disabled={i === jobs.length - 1}
                            aria-label="Move later"
                            className="border border-line p-1 disabled:opacity-30 hover:bg-ink hover:text-cream transition-colors"
                          >
                            <ChevronRight size={13} strokeWidth={1.5} />
                          </button>
                        </div>
                      ) : (
                        <span />
                      )}

                      {editable && (
                        <button
                          type="button"
                          onClick={() => requestReplace(i)}
                          aria-label="Replace this image"
                          title="Replace"
                          className="flex items-center gap-1 border border-line px-2 py-1 text-[11px] hover:bg-ink hover:text-cream transition-colors"
                        >
                          <RefreshCw size={12} strokeWidth={1.5} />
                          Swap
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-4 mt-6">
            {!allSettled ? (
              <>
                <button
                  onClick={uploadAll}
                  disabled={busy || pendingCount === 0 || !category || blocked}
                  className="bg-ink text-cream px-5 py-2 text-sm hover:bg-accent transition-colors disabled:opacity-50"
                >
                  {busy
                    ? "Working…"
                    : mode === "set"
                      ? `Upload and create set of ${pendingCount}`
                      : `Upload ${pendingCount} image${pendingCount === 1 ? "" : "s"}`}
                </button>
                {!category && (
                  <span className="text-xs text-ink-soft">
                    Choose a category first
                  </span>
                )}
              </>
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
                onClick={() => {
                  jobs.forEach((j) => URL.revokeObjectURL(j.preview));
                  setJobs([]);
                  setGroupError(null);
                }}
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
