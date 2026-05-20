"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ORDER_STATUSES, STATUS_LABELS } from "@/lib/constants";
export default function OrderStatusSelect({
  id,
  currentStatus,
}: {
  id: number;
  currentStatus: string;
}) {
  const router = useRouter();
  const [updating, setUpdating] = useState(false);

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        alert("Failed to update status");
        return;
      }
      router.refresh();
    } catch {
      alert("Network error");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <select
      value={currentStatus}
      onChange={handleChange}
      disabled={updating}
      className="w-full px-3 py-2.5 border border-line bg-cream text-sm focus:border-ink outline-none disabled:opacity-60"
    >
      {ORDER_STATUSES.map((s) => (
        <option key={s} value={s}>
          {STATUS_LABELS[s]}
        </option>
      ))}
    </select>
  );
}
