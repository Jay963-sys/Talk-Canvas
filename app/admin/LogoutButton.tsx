"use client";

import { useState } from "react";

export default function LogoutButton() {
  const [loading, setLoading] = useState(false);

  const logout = async () => {
    setLoading(true);
    await fetch("/api/auth/logout", { method: "POST" });

    // Forces a full page reload, wiping all state and caches
    window.location.href = "/admin/login";
  };

  return (
    <button
      onClick={logout}
      disabled={loading}
      className="text-ink-soft hover:text-ink transition-colors disabled:opacity-60"
    >
      {loading ? "Signing out…" : "Sign out"}
    </button>
  );
}
