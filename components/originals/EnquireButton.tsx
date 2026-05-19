"use client";

import { useState } from "react";
import EnquiryModal from "./EnquiryModal";

interface Work {
  id: string;
  title: string;
  artist: string;
  price: string;
}

export default function EnquireButton({ work }: { work: Work }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex-1 py-4 bg-accent text-cream text-sm font-medium tracking-wider hover:bg-accent-dark transition-colors"
      >
        Enquire about this work
      </button>
      {open && <EnquiryModal work={work} onClose={() => setOpen(false)} />}
    </>
  );
}
