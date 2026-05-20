"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export default function DeleteButton({
  id,
  title,
}: {
  id: number;
  title: string;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/originals/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        alert("Delete failed");
        setDeleting(false);
        return;
      }
      router.refresh();
    } catch {
      alert("Network error");
      setDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      className="p-2 text-muted hover:text-red-600 transition-colors disabled:opacity-50"
      aria-label="Delete"
    >
      <Trash2 size={16} strokeWidth={1.5} />
    </button>
  );
}
