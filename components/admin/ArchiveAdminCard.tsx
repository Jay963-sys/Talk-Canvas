"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Trash2, Loader2 } from "lucide-react";

interface Props {
  item: {
    id: number;
    imageUrl: string;
    isVisible: boolean;
    collection?: string | null;
  };
}

function thumb(url: string, width = 400): string {
  return url.replace("/upload/", `/upload/w_${width},c_fill,f_auto,q_auto/`);
}

export default function ArchiveAdminCard({ item }: Props) {
  const router = useRouter();
  const [visible, setVisible] = useState(item.isVisible);
  const [busy, setBusy] = useState(false);

  const toggle = async () => {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/archive-prints/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVisible: !visible }),
      });
      if (res.ok) setVisible(!visible);
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!confirm("Remove this print from the archive? This can't be undone."))
      return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/archive-prints/${item.id}`, {
        method: "DELETE",
      });
      if (res.ok) router.refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className={`relative aspect-square overflow-hidden border border-line group ${
        !visible ? "opacity-50" : ""
      }`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={thumb(item.imageUrl)}
        alt=""
        className="w-full h-full object-cover"
      />

      {/*
        Controls are always visible on touch (no hover there), and fall back to
        the cleaner hover reveal on desktop. The scrim behind them keeps the
        icons legible over these vivid images and follows the same rule.
      */}
      <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/30 opacity-100 transition-all md:bg-black/0 md:opacity-0 md:group-hover:bg-black/40 md:group-hover:opacity-100">
        <button
          onClick={toggle}
          disabled={busy}
          title={visible ? "Hide from archive" : "Show in archive"}
          aria-label={visible ? "Hide from archive" : "Show in archive"}
          className="bg-cream/90 p-2.5 rounded-full hover:bg-cream disabled:opacity-60"
        >
          {busy ? (
            <Loader2 size={16} className="animate-spin" />
          ) : visible ? (
            <Eye size={16} />
          ) : (
            <EyeOff size={16} />
          )}
        </button>
        <button
          onClick={remove}
          disabled={busy}
          title="Delete"
          aria-label="Delete print"
          className="bg-cream/90 p-2.5 rounded-full hover:bg-red-100 text-red-600 disabled:opacity-60"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {!visible && (
        <span className="absolute top-2 left-2 text-[10px] uppercase tracking-wide bg-ink text-cream px-2 py-0.5">
          Hidden
        </span>
      )}
    </div>
  );
}
