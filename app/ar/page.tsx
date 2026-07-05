"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Camera, Rotate3d } from "lucide-react";
import ARViewer from "@/components/prints/ARViewer";

function ArLanding() {
  const params = useSearchParams();
  const glb = params.get("glb");
  const usdz = params.get("usdz") ?? undefined;
  const label = params.get("label") ?? "Your framed piece";

  if (!glb) {
    return (
      <div className="fixed inset-0 bg-[#1a1814] flex flex-col items-center justify-center text-cream/80 px-6 text-center">
        <p className="display-italic text-2xl mb-2">Nothing to preview</p>
        <p className="text-sm text-muted">
          This link is missing its model. Head back and tap “See it on your
          wall” again.
        </p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#1a1814] flex flex-col">
      <div className="relative flex-1 overflow-hidden">
        <div className="absolute top-4 left-4 z-10 inline-flex items-center gap-2 bg-black/40 backdrop-blur-sm text-cream/90 rounded-full px-3 py-1.5">
          <Rotate3d size={14} strokeWidth={1.5} />
          <span className="text-[11px] uppercase tracking-widest">
            3D preview
          </span>
        </div>

        <ARViewer src={glb} iosSrc={usdz} alt={label}>
          <button
            slot="ar-button"
            className="flex items-center gap-2 bg-cream text-ink text-[12px] uppercase tracking-widest font-medium px-5 py-3 rounded-full shadow-lg"
            style={{
              position: "absolute",
              bottom: "24px",
              left: "50%",
              transform: "translateX(-50%)",
              whiteSpace: "nowrap",
            }}
          >
            <Camera size={16} strokeWidth={1.5} />
            See it on your wall
          </button>
        </ARViewer>
      </div>

      <div className="shrink-0 p-5 text-center text-cream">
        <p className="display-italic text-xl">{label}</p>
        <p className="text-xs text-muted mt-2 max-w-sm mx-auto leading-relaxed">
          Drag to rotate the preview. Tap{" "}
          <span className="text-cream/90">See it on your wall</span> to place it
          in your room at true size.
        </p>
      </div>
    </div>
  );
}

export default function ArPage() {
  return (
    <Suspense fallback={null}>
      <ArLanding />
    </Suspense>
  );
}
