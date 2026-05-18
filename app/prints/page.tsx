import Configurator from "@/components/prints/Configurator";

export const metadata = {
  title: "Prints — Talk Canvas Gallery",
  description:
    "Upload your design, choose a frame, and preview it on your wall in AR.",
};

export default function PrintsPage() {
  return (
    <div className="fade-in">
      <section className="max-w-7xl mx-auto px-6 md:px-10 pt-16 pb-8">
        <p className="text-xs uppercase tracking-[0.15em] text-muted">
          Editions
        </p>
        <h1 className="display text-6xl md:text-8xl font-normal leading-none mt-4">
          Print your work.
        </h1>
        <p className="text-[17px] text-ink-soft max-w-2xl mt-6 leading-relaxed">
          Upload a design, choose your frame and size, and preview it on your
          wall before checkout. Archival paper, gallery-grade framing.
        </p>
      </section>

      <Configurator />
    </div>
  );
}
