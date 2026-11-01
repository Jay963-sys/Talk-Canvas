import Link from "next/link";
import { Ruler } from "lucide-react";

/**
 * "Not sure what size?" prompt pointing to /inspection. Lives wherever a
 * customer is choosing a size, so the service isn't only found by people who
 * happen to open the custom-order page.
 */
export default function InspectionLink({
  className = "",
  variant = "inline",
}: {
  className?: string;
  /** "inline": one line of text. "card": boxed, for page sections. */
  variant?: "inline" | "card";
}) {
  if (variant === "card") {
    return (
      <div
        className={`flex items-start gap-4 border border-line bg-paper p-5 ${className}`}
      >
        <Ruler size={20} strokeWidth={1.5} className="text-ink shrink-0 mt-0.5" />
        <div>
          <p className="text-[14px] text-ink font-medium">
            Not sure what size suits your wall?
          </p>
          <p className="text-[13px] text-ink-soft mt-1 leading-relaxed">
            In Lagos, we can visit, measure your space and recommend sizes.{" "}
            <Link
              href="/inspection"
              prefetch={false}
              className="text-ink underline underline-offset-4"
            >
              Book an inspection
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <p className={`text-[13px] text-ink-soft ${className}`}>
      Not sure what size suits your wall?{" "}
      <Link
        href="/inspection"
        prefetch={false}
        className="text-ink underline underline-offset-4"
      >
        Book a space inspection
      </Link>{" "}
      (Lagos only).
    </p>
  );
}
