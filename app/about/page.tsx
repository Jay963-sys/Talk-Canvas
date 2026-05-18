export const metadata = {
  title: "About — Talk Canvas Gallery",
};

export default function AboutPage() {
  return (
    <div className="fade-in max-w-4xl mx-auto px-6 md:px-10 pt-16 pb-32">
      <p className="text-xs uppercase tracking-[0.15em] text-muted">About</p>
      <h1 className="display text-6xl md:text-8xl font-normal leading-none mt-4">
        Looking, slowly.
      </h1>

      <div className="mt-12 grid md:grid-cols-2 gap-12 text-[17px] leading-relaxed text-ink-soft">
        <p>
          Talk Canvas Gallery opened in Lagos in 2021 with a simple intention:
          to make room for contemporary West African painting, and to let people
          live with it.
        </p>
        <p>
          Alongside our roster of represented artists, our print studio offers
          high-quality framed reproductions of your own designs — archival
          paper, hand-finished frames, and an AR tool that lets you see exactly
          how it'll sit on your wall before you buy.
        </p>
      </div>

      <div className="mt-20 grid md:grid-cols-3 gap-8 border-t border-line pt-10">
        <InfoBlock label="Visit">
          12 Akin Adesola Street
          <br />
          Victoria Island, Lagos
          <br />
          Tues — Sat, 11am — 6pm
        </InfoBlock>
        <InfoBlock label="Contact">
          hello@talkcanvas.gallery
          <br />
          +234 800 000 0000
        </InfoBlock>
        <InfoBlock label="Follow">@talkcanvasgallery</InfoBlock>
      </div>
    </div>
  );
}

function InfoBlock({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.15em] text-muted mb-3">
        {label}
      </p>
      <p className="text-[15px] leading-relaxed">{children}</p>
    </div>
  );
}
