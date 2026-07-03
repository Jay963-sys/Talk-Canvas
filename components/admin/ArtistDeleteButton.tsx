"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export default function ArtistDeleteButton({ id }: { id: number }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (
      !confirm(
        "Delete this artist? Their works will remain but lose the linked artist page.",
      )
    ) {
      return;
    }
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/artists/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to delete");
      }
      router.push("/admin/artists");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
      setDeleting(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleDelete}
        disabled={deleting}
        className="inline-flex items-center gap-2 px-4 py-2 border border-line text-ink-soft text-xs uppercase tracking-[0.15em] hover:border-red-400 hover:text-red-600 transition-colors disabled:opacity-60"
      >
        <Trash2 size={14} strokeWidth={1.5} />
        {deleting ? "Deleting…" : "Delete artist"}
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
