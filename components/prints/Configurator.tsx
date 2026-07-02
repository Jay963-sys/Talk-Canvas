"use client";

import { useEffect, useRef } from "react";
import { useConfigurator } from "@/lib/store";
import Stepper from "./Stepper";
import StepUpload from "./StepUpload";
import StepFrame from "./StepFrame";
import StepSize from "./StepSize";
import StepReview from "./StepReview";
import Summary from "./Summary";
import ARModal from "./ARModal";

export default function Configurator() {
  const { step, arOpen, image, setStep } = useConfigurator();
  const topRef = useRef<HTMLDivElement>(null);

  // Scroll to the top of the configurator whenever the step changes
  useEffect(() => {
    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [step]);

  useEffect(() => {
    if (step > 0 && !image) setStep(0);
  }, [step, image, setStep]);

  return (
    <div ref={topRef} className="scroll-mt-32">
      {/* Stepper Section */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 pb-12">
        <Stepper />
      </section>

      {/* Main Studio Area */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 pb-12">
        {/* Matched the gap-12 lg:gap-20 spacing from the Checkout page */}
        <div className="grid md:grid-cols-12 gap-12 lg:gap-20 items-start">
          {/* Active Step Area */}
          <div className="md:col-span-7 lg:col-span-8">
            {step === 0 && <StepUpload />}
            {step === 1 && <StepFrame />}
            {step === 2 && <StepSize />}
            {step === 3 && <StepReview />}
          </div>

          {/* Summary Area - Made sticky so it stays visible as users scroll through options */}
          <div className="md:col-span-5 lg:col-span-4 sticky top-[120px]">
            <Summary />
          </div>
        </div>
      </section>

      {arOpen && <ARModal />}
    </div>
  );
}
