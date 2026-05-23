"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";

export default function LoginForm() {
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Login failed");
        setLoading(false);
        return;
      }

      window.location.href = from;
    } catch {
      setError("Network error — try again");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-cream">
      <div className="max-w-sm w-full">
        <p className="text-xs uppercase tracking-[0.15em] text-muted text-center mb-4">
          Admin
        </p>
        <h1 className="display text-4xl font-normal text-center mb-12">
          Sign in
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-xs uppercase tracking-[0.1em] text-muted mb-2"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full px-4 py-3 bg-cream border border-line focus:border-ink outline-none transition-colors text-[15px]"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-xs uppercase tracking-[0.1em] text-muted mb-2"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full px-4 py-3 bg-cream border border-line focus:border-ink outline-none transition-colors text-[15px]"
            />
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-accent hover:bg-accent-dark text-cream text-sm font-medium tracking-wider transition-colors disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
