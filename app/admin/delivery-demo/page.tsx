import type { Metadata } from "next";
import DistanceDemo from "@/components/delivery/DistanceDemo";

export const metadata: Metadata = {
  title: "Delivery fee demo",
  robots: { index: false, follow: false },
};

export default function DeliveryDemoPage() {
  return (
    <main className="mx-auto w-full max-w-2xl px-5 py-14 sm:py-20">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        Delivery by distance
      </h1>
      <p className="mt-3 max-w-prose text-neutral-600">
        Type a delivery address and pick it from the list. The fee is worked out
        from the driving distance between the studio and that address.
      </p>
      <DistanceDemo />
    </main>
  );
}
