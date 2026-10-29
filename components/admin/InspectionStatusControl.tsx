"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  INSPECTION_STATUSES,
  INSPECTION_STATUS_LABELS as LABELS,
} from "@/lib/inspections";

export default function InspectionStatusControl({
  id,
  status,
  adminNotes,
}: {
  id: number;
  status: string;
  adminNotes: string | null;
}) {
  const router = useRouter();
  const [value, setValue] = useState(status);
  const [notes, setNotes] = useState(adminNotes ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dirty = value !== status || notes !== (adminNotes ?? "");

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/inspections/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: value, adminNotes: notes }),
      });
      if (!res.ok) throw new Error("Could not save");
      router.refresh();
    } catch {
      setError("Could not save. Try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-2">
      <select
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full px-3 py-2 border border-line bg-white text-sm"
      >
        {INSPECTION_STATUSES.map((s) => (
          <option key={s} value={s}>
            {LABELS[s]}
          </option>
        ))}
      </select>
      <textarea
        rows={2}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        maxLength={2000}
        placeholder="Internal notes (date agreed, fee...)"
        className="w-full px-3 py-2 border border-line bg-white text-sm resize-none"
      />
      {dirty && (
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="px-4 py-2 bg-ink text-cream text-[11px] uppercase tracking-widest disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      )}
      {error && <p className="text-xs text-red-700">{error}</p>}
    </div>
  );
}
