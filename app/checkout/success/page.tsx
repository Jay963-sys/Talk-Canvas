import { Suspense } from "react";
import SuccessView from "./SuccessView";

export const metadata = {
  title: "Order Confirmed — Talk Canvas Gallery",
};

export default function SuccessPage() {
  return (
    // Replaced bg-black with bg-cream to prevent a harsh layout flash during suspense
    <Suspense fallback={<div className="min-h-screen bg-cream" />}>
      <SuccessView />
    </Suspense>
  );
}
