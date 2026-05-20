"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

export default function VisibilityToggle({
  id,
  isVisible,
}: {
  id: number;
  isVisible: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const toggle = async () => {
    setPending(true);
    try {
      const res = await fetch(`/api/admin/originals/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVisible: !isVisible }),
      });
      if (!res.ok) {
        alert("Update failed");
        return;
      }
      router.refresh();
    } catch {
      alert("Network error");
    } finally {
      setPending(false);
    }
  };

  return (
    <button
      onClick={toggle}
      disabled={pending}
      className={`p-2 transition-colors disabled:opacity-50 ${
        isVisible ? "text-ink-soft hover:text-ink" : "text-muted hover:text-ink"
      }`}
      aria-label={isVisible ? "Hide from site" : "Show on site"}
      title={isVisible ? "Visible — click to hide" : "Hidden — click to show"}
    >
      {isVisible ? (
        <Eye size={16} strokeWidth={1.5} />
      ) : (
        <EyeOff size={16} strokeWidth={1.5} />
      )}
    </button>
  );
}
