"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/** Chip input that submits its values as a comma-separated hidden field. */
export function TagInput({
  name,
  defaultValue = [],
  placeholder = "Type and press Enter",
  suggestions = [],
  max = 30,
}: {
  name: string;
  defaultValue?: string[];
  placeholder?: string;
  suggestions?: string[];
  max?: number;
}) {
  const [tags, setTags] = React.useState<string[]>(defaultValue);
  const [draft, setDraft] = React.useState("");
  const add = (raw: string) => {
    const v = raw.trim().replace(/,$/, "");
    if (!v || tags.some((t) => t.toLowerCase() === v.toLowerCase()) || tags.length >= max) return;
    setTags([...tags, v]);
  };
  const remaining = suggestions.filter((s) => !tags.some((t) => t.toLowerCase() === s.toLowerCase())).slice(0, 8);
  return (
    <div>
      <input type="hidden" name={name} value={tags.join(",")} />
      <div className="flex min-h-11 flex-wrap items-center gap-1.5 rounded-lg border border-line bg-white px-2 py-1.5 focus-within:border-brand-500 focus-within:ring-3 focus-within:ring-brand-500/15">
        {tags.map((t) => (
          <span key={t} className="inline-flex items-center gap-1 rounded-md bg-brand-100 px-2 py-1 text-xs font-medium text-brand-800">
            {t}
            <button type="button" onClick={() => setTags(tags.filter((x) => x !== t))} aria-label={`Remove ${t}`}>
              <X className="size-3" />
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              add(draft);
              setDraft("");
            } else if (e.key === "Backspace" && !draft && tags.length) {
              setTags(tags.slice(0, -1));
            }
          }}
          onBlur={() => {
            add(draft);
            setDraft("");
          }}
          placeholder={tags.length ? "" : placeholder}
          className="min-w-32 flex-1 bg-transparent px-1.5 py-1 text-sm outline-none"
        />
      </div>
      {remaining.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {remaining.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => add(s)}
              className={cn("rounded-md border border-dashed border-line px-2 py-0.5 text-xs text-muted hover:border-brand-400 hover:text-brand-700")}
            >
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
