import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { getAllOriginalsForAdmin } from "@/lib/db/queries/originals";
import DeleteButton from "@/components/admin/DeleteButton";
import VisibilityToggle from "@/components/admin/VisibilityToggle";
import { formatNaira } from "@/lib/store";
import Image from "next/image";

export default async function AdminDashboard() {
  const originals = await getAllOriginalsForAdmin();

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-10 py-12">
      <div className="flex items-baseline justify-between mb-10">
        <div>
          <p className="text-xs uppercase tracking-[0.15em] text-muted">
            Manage
          </p>
          <h1 className="display text-4xl md:text-5xl font-normal mt-2">
            Originals
          </h1>
        </div>
        <Link
          href="/admin/originals/new"
          className="px-5 py-3 bg-accent hover:bg-accent-dark text-cream text-sm font-medium tracking-wider transition-colors flex items-center gap-2"
        >
          <Plus size={16} strokeWidth={2} />
          Add original
        </Link>
      </div>

      {originals.length === 0 ? (
        <div className="text-center py-24 border border-dashed border-line">
          <p className="text-ink-soft">No originals yet.</p>
          <Link
            href="/admin/originals/new"
            className="inline-block mt-4 text-sm text-accent hover:text-accent-dark"
          >
            Add the first one →
          </Link>
        </div>
      ) : (
        <div className="border-t border-line">
          {originals.map((o) => (
            <div
              key={o.id}
              className="grid grid-cols-[80px_1fr_auto_auto] gap-6 items-center py-4 border-b border-line"
            >
              <div className="w-[60px] relative aspect-[4/5] bg-line overflow-hidden">
                {" "}
                <Image src={o.imageUrl} alt="" fill className="object-cover" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="display-italic text-lg leading-tight truncate">
                    {o.title}
                  </p>
                  {o.soldAt && (
                    <span className="px-1.5 py-0.5 text-[10px] uppercase tracking-wider bg-ink/85 text-cream shrink-0">
                      Sold
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted mt-1">
                  {o.artist} · {o.year} · {formatNaira(o.price)}
                </p>
                <p className="text-[11px] text-muted mt-1 font-mono">
                  /{o.slug}
                </p>
              </div>
              <div className="text-xs text-muted">Order: {o.displayOrder}</div>
              <div className="flex items-center gap-1">
                <VisibilityToggle id={o.id} isVisible={o.isVisible} />
                <Link
                  href={`/admin/originals/${o.id}`}
                  className="p-2 text-muted hover:text-ink transition-colors"
                  aria-label="Edit"
                >
                  <Pencil size={16} strokeWidth={1.5} />
                </Link>
                <DeleteButton id={o.id} title={o.title} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
