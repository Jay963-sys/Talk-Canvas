import { CONTACT } from "@/data/contact";

function InstagramIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="shrink-0"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

/**
 * Tells customers they aren't limited to the archive: any image on the
 * gallery's Instagram can be screenshotted and uploaded as their design.
 * Used on the prints page and the upload step.
 */
export default function InstagramHint({
  className = "",
}: {
  className?: string;
}) {
  return (
    <p
      className={`flex items-start gap-2 text-[13px] text-ink-soft leading-relaxed ${className}`}
    >
      <InstagramIcon />
      <span>
        More on our Instagram, too. Screenshot any image you love on{" "}
        <a
          href={CONTACT.instagram.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-ink underline underline-offset-2 hover:text-ink-soft transition-colors"
        >
          {CONTACT.instagram.handle}
        </a>{" "}
        and upload it here as your design.
      </span>
    </p>
  );
}
