import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import ArtistForm from "@/components/admin/ArtistForm";
import ArtistDeleteButton from "@/components/admin/ArtistDeleteButton";
import { getArtistById } from "@/lib/db/queries/artists";

export const dynamic = "force-dynamic";

export default async function EditArtistPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numId = Number(id);
  if (!numId) notFound();

  const artist = await getArtistById(numId);
  if (!artist) notFound();

  return (
    <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
      <Link
        href="/admin/artists"
        className="inline-flex items-center gap-2 text-[11px] uppercase tracking-widest text-ink-soft hover:text-ink transition-colors mb-8"
      >
        <ArrowLeft size={14} strokeWidth={1.5} />
        Back to artists
      </Link>

      <div className="flex items-start justify-between mb-8 gap-4">
        <h1 className="display text-3xl font-normal">Edit artist</h1>
        <ArtistDeleteButton id={artist.id} />
      </div>

      <ArtistForm artist={artist} />
    </div>
  );
}
