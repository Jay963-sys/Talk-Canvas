"use client";

import { useState } from "react";
import { Upload, Check, Loader2, X } from "lucide-react";
import { uploadToCloudinary, validateFile } from "@/lib/upload";
import { FRAMES } from "@/data/frames";

export default function CustomOrderForm() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [unit, setUnit] = useState<"inches" | "cm">("inches");
  const [framePreference, setFramePreference] = useState("");
  const [message, setMessage] = useState("");

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const result = await uploadToCloudinary(file, {
        onProgress: setUploadProgress,
      });
      setImageUrl(result.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/custom-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          width: width.trim(),
          height: height.trim(),
          unit,
          framePreference: framePreference.trim(),
          message: message.trim(),
          imageUrl,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to send request");
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send request");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-16 border border-line bg-paper">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mb-6">
          <Check size={28} strokeWidth={1.5} className="text-accent" />
        </div>
        <h2 className="display text-3xl font-normal">Request received.</h2>
        <p className="text-ink-soft mt-4 max-w-md mx-auto leading-relaxed">
          A member of our team will review your request and be in touch shortly
          to discuss the details and pricing.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      {/* Contact */}
      <section>
        <h2 className="text-xs uppercase tracking-[0.15em] text-muted mb-4">
          Your details
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-ink-soft mb-2">Name</label>
            <input
              required
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-line bg-cream focus:border-ink outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-ink-soft mb-2">Email</label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-line bg-cream focus:border-ink outline-none"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm text-ink-soft mb-2">
              Phone <span className="text-muted">(WhatsApp preferred)</span>
            </label>
            <input
              required
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 border border-line bg-cream focus:border-ink outline-none"
            />
          </div>
        </div>
      </section>

      {/* Design upload */}
      <section>
        <h2 className="text-xs uppercase tracking-[0.15em] text-muted mb-4">
          Your design{" "}
          <span className="text-muted normal-case tracking-normal">
            (optional)
          </span>
        </h2>
        {imageUrl ? (
          <div className="flex items-start gap-4 p-4 border border-line bg-paper">
            <img
              src={imageUrl}
              alt="Uploaded design"
              className="w-20 h-20 object-cover"
            />
            <div className="flex-1">
              <p className="text-sm text-ink">Design uploaded</p>
              <button
                type="button"
                onClick={() => setImageUrl(null)}
                className="inline-flex items-center gap-1 text-xs text-muted hover:text-ink mt-1"
              >
                <X size={12} strokeWidth={1.5} />
                Remove
              </button>
            </div>
          </div>
        ) : uploading ? (
          <div className="p-8 border border-line bg-paper text-center">
            <Loader2
              size={24}
              className="animate-spin mx-auto mb-3 text-muted"
            />
            <p className="text-sm text-ink-soft">
              Uploading... {uploadProgress}%
            </p>
          </div>
        ) : (
          <label className="block p-8 border border-dashed border-line bg-paper hover:bg-cream cursor-pointer transition-colors text-center">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="sr-only"
            />
            <Upload
              size={20}
              strokeWidth={1.5}
              className="mx-auto mb-2 text-muted"
            />
            <p className="text-sm text-ink-soft">Click to upload a design</p>
            <p className="text-xs text-muted mt-1">
              JPG or PNG — or skip and describe it in your message
            </p>
          </label>
        )}
      </section>

      {/* Dimensions */}
      <section>
        <h2 className="text-xs uppercase tracking-[0.15em] text-muted mb-4">
          Dimensions{" "}
          <span className="text-muted normal-case tracking-normal">
            (optional)
          </span>
        </h2>
        <div className="flex items-end gap-3 flex-wrap">
          <div>
            <label className="block text-sm text-ink-soft mb-2">Width</label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
              className="w-28 px-4 py-3 border border-line bg-cream focus:border-ink outline-none"
            />
          </div>
          <span className="text-muted pb-3 text-lg">×</span>
          <div>
            <label className="block text-sm text-ink-soft mb-2">Height</label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="w-28 px-4 py-3 border border-line bg-cream focus:border-ink outline-none"
            />
          </div>
          <div className="flex border border-line bg-cream">
            <button
              type="button"
              onClick={() => setUnit("inches")}
              className={`px-4 py-3 text-sm transition-colors ${
                unit === "inches"
                  ? "bg-ink text-cream"
                  : "text-ink-soft hover:bg-paper"
              }`}
            >
              inches
            </button>
            <button
              type="button"
              onClick={() => setUnit("cm")}
              className={`px-4 py-3 text-sm transition-colors ${
                unit === "cm"
                  ? "bg-ink text-cream"
                  : "text-ink-soft hover:bg-paper"
              }`}
            >
              cm
            </button>
          </div>
        </div>
        <p className="text-xs text-muted mt-3">
          Leave blank if you'd like to discuss sizing with our team.
        </p>
      </section>

      {/* Frame preference */}
      <section>
        <h2 className="text-xs uppercase tracking-[0.15em] text-muted mb-4">
          Frame style{" "}
          <span className="text-muted normal-case tracking-normal">
            (optional)
          </span>
        </h2>
        <select
          value={framePreference}
          onChange={(e) => setFramePreference(e.target.value)}
          className="w-full px-4 py-3 border border-line bg-cream focus:border-ink outline-none"
        >
          <option value="">I'd like to discuss with the team</option>
          {FRAMES.map((f) => (
            <option key={f.id} value={f.name}>
              {f.name}
            </option>
          ))}
        </select>
      </section>

      {/* Message */}
      <section>
        <h2 className="text-xs uppercase tracking-[0.15em] text-muted mb-4">
          Tell us more
        </h2>
        <textarea
          required
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={2000}
          placeholder="Special finishes, deadline, occasion, references, the vision in your head..."
          className="w-full px-4 py-3 border border-line bg-cream focus:border-ink outline-none resize-none"
        />
      </section>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting || uploading}
        className="w-full px-8 py-4 bg-ink text-cream uppercase text-xs tracking-[0.15em] hover:bg-ink-soft transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {submitting ? "Sending..." : "Send request"}
      </button>

      <p className="text-xs text-muted text-center">
        No payment is taken at this stage. A team member will respond with
        details and pricing.
      </p>
    </form>
  );
}
