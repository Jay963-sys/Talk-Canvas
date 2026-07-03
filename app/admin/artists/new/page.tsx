import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ArtistForm from "@/components/admin/ArtistForm";

export const dynamic = "force-dynamic";

export default function NewArtistPage() {
  return (
    <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
      <Link
        href="/admin/artists"
        className="inline-flex items-center gap-2 text-[11px] uppercase tracking-widest text-ink-soft hover:text-ink transition-colors mb-8"
      >
        <ArrowLeft size={14} strokeWidth={1.5} />
        Back to artists
      </Link>
      <h1 className="display text-3xl font-normal mb-8">New artist</h1>
      <ArtistForm />
    </div>
  );
}
