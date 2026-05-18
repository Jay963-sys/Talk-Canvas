"use client";

import { useConfigurator } from "@/lib/store";
import Stepper from "./Stepper";
import StepUpload from "./StepUpload";
import StepFrame from "./StepFrame";
import StepSize from "./StepSize";
import StepReview from "./StepReview";
import Summary from "./Summary";
import ARModal from "./ARModal";
import { Check } from "lucide-react";

export default function Configurator() {
  const { step, ordered, arOpen } = useConfigurator();

  if (ordered) return <OrderSuccess />;

  return (
    <>
      <section className="max-w-7xl mx-auto px-6 md:px-10 pb-8">
        <Stepper />
      </section>

      <section className="max-w-7xl mx-auto px-6 md:px-10 pb-12">
        <div className="grid md:grid-cols-12 gap-10">
          <div className="md:col-span-8">
            {step === 0 && <StepUpload />}
            {step === 1 && <StepFrame />}
            {step === 2 && <StepSize />}
            {step === 3 && <StepReview />}
          </div>
          <div className="md:col-span-4">
            <Summary />
          </div>
        </div>
      </section>

      {arOpen && <ARModal />}
    </>
  );
}

function OrderSuccess() {
  return (
    <div className="fade-in max-w-2xl mx-auto px-6 py-32 text-center">
      <div className="w-16 h-16 rounded-full bg-accent text-cream flex items-center justify-center mx-auto mb-8">
        <Check size={28} strokeWidth={1.5} />
      </div>
      <h2 className="display text-5xl font-normal leading-tight">
        Order received.
        <br />
        <span className="display-italic">Thank you.</span>
      </h2>
      <p className="text-base text-ink-soft mt-6 leading-relaxed">
        You'll get a confirmation email shortly. Production typically takes 5-7
        days, with delivery in Lagos within 10 days of order.
      </p>
      <p className="text-xs text-muted mt-10 italic">
        (Prototype — no real payment processed. Paystack integration in Step 8.)
      </p>
    </div>
  );
}
