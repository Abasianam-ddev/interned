"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { Markdown } from "./markdown";
import { cn } from "@/lib/utils";

export function FaqList({ items }: { items: { id: string; question: string; answer: string }[] }) {
  const [open, setOpen] = React.useState<string | null>(items[0]?.id ?? null);
  return (
    <div className="divide-y divide-line rounded-2xl border border-line bg-white">
      {items.map((f) => {
        const isOpen = open === f.id;
        return (
          <div key={f.id}>
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? null : f.id)}
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left text-[15px] font-semibold"
            >
              {f.question}
              <Plus className={cn("size-5 shrink-0 text-brand-700 transition", isOpen && "rotate-45")} />
            </button>
            {isOpen && (
              <div className="px-6 pb-5 text-sm">
                <Markdown>{f.answer}</Markdown>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
