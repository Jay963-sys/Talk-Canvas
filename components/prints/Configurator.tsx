"use client";

import { useConfigurator } from "@/lib/store";
import Stepper from "./Stepper";
import StepUpload from "./StepUpload";
import StepFrame from "./StepFrame";
import StepSize from "./StepSize";
import StepReview from "./StepReview";
import Summary from "./Summary";
import ARModal from "./ARModal";

export default function Configurator() {
  const { step, arOpen } = useConfigurator();

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
