import Link from "next/link";
import { Plus, Star, ImageIcon } from "lucide-react";
import { getAllTestimonialsForAdmin } from "@/lib/db/queries/testimonials";

export const dynamic = "force-dynamic";

export default async function AdminTestimonialsPage() {
  const items = await getAllTestimonialsForAdmin();
  const withPhoto = items.filter((t) => t.imageUrl).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="display text-3xl font-normal">Testimonials</h1>
          <p className="text-sm text-ink-soft mt-1">
            {items.length} total · {withPhoto} with a wall photo
          </p>
        </div>
        <Link
          href="/admin/testimonials/new"
          className="inline-flex items-center gap-2 px-5 py-3 bg-ink text-cream text-xs uppercase tracking-[0.15em] hover:bg-ink-soft transition-colors"
        >
          <Plus size={14} strokeWidth={1.5} />
          New testimonial
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="border border-dashed border-line p-16 text-center">
          <p className="text-sm text-ink-soft">
            No testimonials yet. Add one to show reviews on the site.
          </p>
        </div>
      ) : (
        <div className="border border-line divide-y divide-line">
          {items.map((t) => (
            <Link
              key={t.id}
              href={`/admin/testimonials/${t.id}`}
              className="flex items-center gap-4 p-4 hover:bg-paper transition-colors"
            >
              <div className="w-14 h-14 bg-paper border border-line overflow-hidden shrink-0 flex items-center justify-center">
                {t.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={t.imageUrl}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon
                    size={16}
                    className="text-line"
                    strokeWidth={1.5}
                  />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1 mb-1 text-ink">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star
                      key={i}
                      size={10}
                      fill="currentColor"
                      strokeWidth={0}
                    />
                  ))}
                </div>
                <p className="text-sm text-ink truncate">{t.quote}</p>
                <p className="text-xs text-muted truncate">
                  {t.name}
                  {t.location ? ` · ${t.location}` : ""}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {!t.isVisible && (
                  <span className="px-2 py-1 border border-line text-ink-soft text-[10px] uppercase tracking-widest">
                    Hidden
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
