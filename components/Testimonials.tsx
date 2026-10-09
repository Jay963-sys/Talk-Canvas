import type { ReactNode } from "react";
import { Star } from "lucide-react";
import { getTestimonials } from "@/lib/db/queries/testimonials";
import type { Testimonial } from "@/lib/db/schema";
import { videoPoster, videoSrc } from "@/lib/media";
import LoopVideo from "@/components/LoopVideo";

/**
 * Every photo and video box uses this one shape, so a row of reviews lines up
 * whatever mix of photos and videos it holds. Square is the middle ground:
 * landscape wall photos lose a little off the sides, portrait phone videos
 * get slim dark bars instead of being cropped. Try "aspect-[4/5]" for taller
 * boxes (better for portrait videos, crops landscape photos harder) or
 * "aspect-[4/3]" for wider ones.
 */
const MEDIA_ASPECT = "aspect-square";

function thumb(url: string, width = 900): string {
  return url.replace("/upload/", `/upload/w_${width},c_limit,f_auto,q_auto/`);
}

function Stars({ rating }: { rating: number }) {
  const n = Math.max(1, Math.min(5, rating));
  return (
    <div className="flex gap-1 text-ink">
      {[...Array(n)].map((_, i) => (
        <Star key={i} size={12} fill="currentColor" strokeWidth={0} />
      ))}
    </div>
  );
}

function Attribution({ t }: { t: Testimonial }) {
  return (
    <figcaption className="text-[11px] uppercase tracking-widest text-ink font-medium">
      {t.name}
      {t.location && (
        <>
          <span className="text-ink-soft/40 mx-2">|</span>
          {t.location}
        </>
      )}
    </figcaption>
  );
}

/** Photo of the piece on the customer's wall — the hero treatment. */
function PhotoCard({ t }: { t: Testimonial }) {
  return (
    <figure className="flex flex-col bg-paper rounded-2xl overflow-hidden">
      <div className={`relative w-full ${MEDIA_ASPECT} bg-line/40`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={thumb(t.imageUrl!)}
          alt={`A Talk Canvas piece on ${t.name}'s wall`}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
      <div className="flex flex-col items-center text-center p-8 md:p-10 grow">
        <div className="mb-6">
          <Stars rating={t.rating} />
        </div>
        <blockquote className="text-[14.5px] leading-relaxed text-ink-soft mb-8 grow">
          &ldquo;{t.quote}&rdquo;
        </blockquote>
        <Attribution t={t} />
      </div>
    </figure>
  );
}

/**
 * A customer video. Nothing downloads until play is pressed (preload="none").
 * The wall photo, if there is one, is the cover; otherwise a still from the
 * video. Phone videos are often vertical, so the whole frame is shown rather
 * than cropped.
 */
function VideoCard({ t }: { t: Testimonial }) {
  return (
    <figure className="flex flex-col bg-paper rounded-2xl overflow-hidden">
      <div className={`relative w-full ${MEDIA_ASPECT} bg-ink`}>
        {t.videoLoop ? (
          // Short clip: plays itself, muted, on a loop, while on screen.
          <LoopVideo
            src={videoSrc(t.videoUrl!, { width: 720 })}
            poster={t.imageUrl ? thumb(t.imageUrl) : videoPoster(t.videoUrl!)}
            label={`Video review from ${t.name}`}
            className="absolute inset-0 w-full h-full object-contain"
          />
        ) : (
          <video
            controls
            playsInline
            preload="none"
            poster={t.imageUrl ? thumb(t.imageUrl) : videoPoster(t.videoUrl!)}
            aria-label={`Video review from ${t.name}`}
            className="absolute inset-0 w-full h-full object-contain"
          >
            <source src={videoSrc(t.videoUrl!)} type="video/mp4" />
          </video>
        )}
      </div>
      <div className="flex flex-col items-center text-center p-8 md:p-10 grow">
        <div className="mb-6">
          <Stars rating={t.rating} />
        </div>
        <blockquote className="text-[14.5px] leading-relaxed text-ink-soft mb-8 grow">
          &ldquo;{t.quote}&rdquo;
        </blockquote>
        <Attribution t={t} />
      </div>
    </figure>
  );
}

/** No photo — the original centered treatment, so the two mix cleanly. */
function QuoteCard({ t }: { t: Testimonial }) {
  return (
    <figure className="flex flex-col items-center text-center p-8 md:p-10 bg-paper rounded-2xl">
      <div className="mb-6">
        <Stars rating={t.rating} />
      </div>
      <blockquote className="text-[14.5px] leading-relaxed text-ink-soft mb-8 grow">
        &ldquo;{t.quote}&rdquo;
      </blockquote>
      <Attribution t={t} />
    </figure>
  );
}

export default async function Testimonials({
  items,
  eyebrow = "From the gallery floor",
  title,
}: {
  items?: Testimonial[];
  eyebrow?: string;
  title?: ReactNode;
}) {
  // Defaults to the DB, so the gallery manages these from the admin.
  const all = items ?? (await getTestimonials());
  if (all.length === 0) return null;

  // Photos and videos lead — they're the strongest proof — then text-only quotes.
  const withMedia = all.filter((t) => t.videoUrl || t.imageUrl);
  const textOnly = all.filter((t) => !t.videoUrl && !t.imageUrl);
  const ordered = [...withMedia, ...textOnly];

  return (
    <section className="max-w-7xl mx-auto px-6 md:px-10 py-24">
      {/* Centered Header Section */}
      <div className="text-center mb-16">
        <p className="text-[11px] uppercase tracking-widest text-ink-soft font-semibold mb-4">
          {eyebrow}
        </p>
        {title && (
          <h2 className="display text-3xl md:text-4xl font-normal">{title}</h2>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-6 md:gap-8">
        {ordered.map((t) =>
          t.videoUrl ? (
            <VideoCard key={t.id} t={t} />
          ) : t.imageUrl ? (
            <PhotoCard key={t.id} t={t} />
          ) : (
            <QuoteCard key={t.id} t={t} />
          ),
        )}
      </div>
    </section>
  );
}
