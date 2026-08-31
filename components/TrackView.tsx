"use client";

import { useEffect, useRef } from "react";
import { viewContent } from "@/lib/meta/pixel";

/**
 * Fires a Meta ViewContent event once when a product detail page mounts.
 * Drop it into a server component (it's a client child) — see the originals
 * page snippet. Renders nothing.
 */
export default function TrackView({
  id,
  name,
  value,
}: {
  id: string;
  name?: string;
  value: number;
}) {
  const fired = useRef(false);
  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    viewContent({ id, name, value });
  }, [id, name, value]);
  return null;
}
