"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";

export interface FaqItem {
  q: string;
  a: string;
}

export interface FaqGroup {
  title: string;
  items: FaqItem[];
}

export default function FaqAccordion({ groups }: { groups: FaqGroup[] }) {
  const [open, setOpen] = useState<string | null>(null);
  const toggle = (key: string) => setOpen((cur) => (cur === key ? null : key));

  return (
    <div className="space-y-14">
      {groups.map((group) => (
        <section key={group.title}>
          <p className="text-[11px] uppercase tracking-widest text-ink-soft font-semibold mb-5">
            {group.title}
          </p>
          <div className="border-t border-line">
            {group.items.map((item, i) => {
              const key = `${group.title}-${i}`;
              const isOpen = open === key;
              return (
                <div key={key} className="border-b border-line">
                  <button
                    type="button"
                    onClick={() => toggle(key)}
                    aria-expanded={isOpen}
                    className="w-full flex items-start justify-between gap-4 py-5 text-left group"
                  >
                    <span className="text-[15px] md:text-base text-ink font-medium group-hover:text-ink-soft transition-colors">
                      {item.q}
                    </span>
                    <span className="shrink-0 mt-0.5 text-ink-soft">
                      {isOpen ? (
                        <Minus size={18} strokeWidth={1.5} />
                      ) : (
                        <Plus size={18} strokeWidth={1.5} />
                      )}
                    </span>
                  </button>
                  <div
                    className={`grid transition-all duration-300 ease-out ${
                      isOpen
                        ? "grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="text-[14.5px] text-ink-soft leading-relaxed pb-6 pr-6 md:pr-10">
                        {item.a}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
