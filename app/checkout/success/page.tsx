import { Suspense } from "react";
import SuccessView from "./SuccessView";

export const metadata = {
  title: "Order received — Talk Canvas Gallery",
};

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      {" "}
      <SuccessView />
    </Suspense>
  );
}
