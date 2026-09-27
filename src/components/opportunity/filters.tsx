"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { Sheet } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type FilterGroup = {
  key: string;
  title: string;
  options: { value: string; label: string; count?: number }[];
  initiallyShown?: number;
};

function useFilterNav() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, start] = React.useTransition();
  const selected = (key: string) => params.getAll(key).flatMap((v) => v.split(","));
  const push = (sp: URLSearchParams) => {
    sp.delete("page");
    const qs = sp.toString();
    start(() => router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false }));
  };
  const toggle = (key: string, value: string) => {
    const sp = new URLSearchParams(params.toString());
    const current = selected(key);
    sp.delete(key);
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    next.forEach((v) => sp.append(key, v));
    push(sp);
  };
  const set = (key: string, value: string | null) => {
    const sp = new URLSearchParams(params.toString());
    if (value) sp.set(key, value);
    else sp.delete(key);
    push(sp);
  };
  const clear = (keys: string[]) => {
    const sp = new URLSearchParams(params.toString());
    keys.forEach((k) => sp.delete(k));
    push(sp);
  };
  return { selected, toggle, set, clear, pending, params };
}

function Group({ group }: { group: FilterGroup }) {
  const { selected, toggle } = useFilterNav();
  const [expanded, setExpanded] = React.useState(false);
  const chosen = selected(group.key);
  const limit = group.initiallyShown ?? 5;
  const visible = expanded ? group.options : group.options.slice(0, limit);
  return (
    <div role="group" aria-label={group.title} className="border-t border-line py-5 first:border-t-0 first:pt-0">
      <h3 className="mb-3 text-sm font-semibold text-ink">{group.title}</h3>
      <div className="space-y-2.5">
        {visible.map((o) => (
          <label key={o.value} className="flex cursor-pointer items-center gap-2.5 text-[13.5px] text-ink/80">
            <input
              type="checkbox"
              className="size-4 rounded"
              checked={chosen.includes(o.value)}
              onChange={() => toggle(group.key, o.value)}
            />
            <span className="flex-1">{o.label}</span>
            {o.count != null && <span className="text-xs text-muted">{o.count}</span>}
          </label>
        ))}
      </div>
      {group.options.length > limit && (
        <button type="button" onClick={() => setExpanded((v) => !v)} className="mt-3 text-[13px] font-medium text-brand-700">
          {expanded ? "− Show less" : "+ Show more"}
        </button>
      )}
    </div>
  );
}

export function FilterPanel({ groups, className }: { groups: FilterGroup[]; className?: string }) {
  const { clear, pending } = useFilterNav();
  return (
    <div className={cn("transition-opacity", pending && "opacity-60", className)}>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-base font-bold">Filters</h2>
        <button
          type="button"
          onClick={() => clear(groups.map((g) => g.key))}
          className="text-[13px] font-medium text-brand-700 hover:underline"
        >
          Clear all
        </button>
      </div>
      {groups.map((g) => (
        <Group key={g.key} group={g} />
      ))}
    </div>
  );
}

export function MobileFilters({ groups, activeCount }: { groups: FilterGroup[]; activeCount: number }) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)} className="lg:hidden">
        <SlidersHorizontal /> Filters {activeCount > 0 && <span className="rounded-full bg-brand-600 px-1.5 text-xs text-white">{activeCount}</span>}
      </Button>
      <Sheet open={open} onOpenChange={setOpen} title="Filters" side="left">
        <div className="p-6 pt-14">
          <FilterPanel groups={groups} />
        </div>
      </Sheet>
    </>
  );
}

export function SortSelect() {
  const { params, set } = useFilterNav();
  return (
    <label className="flex items-center gap-2 text-sm text-muted">
      <span className="hidden sm:inline">Sort by</span>
      <select
        value={params.get("sort") ?? "newest"}
        onChange={(e) => set("sort", e.target.value === "newest" ? null : e.target.value)}
        className="h-9 cursor-pointer rounded-lg border border-line bg-white px-3 text-sm font-medium text-ink focus:border-brand-500 focus:outline-none"
      >
        <option value="newest">Newest first</option>
        <option value="deadline">Deadline soonest</option>
        <option value="stipend">Highest stipend</option>
      </select>
    </label>
  );
}

export function ActiveFilters({ chips }: { chips: { key: string; value: string; label: string }[] }) {
  const { toggle, clear } = useFilterNav();
  if (!chips.length) return null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((c) => (
        <button
          key={`${c.key}:${c.value}`}
          type="button"
          onClick={() => (c.key === "q" ? clear(["q"]) : toggle(c.key, c.value))}
          className="inline-flex items-center gap-1.5 rounded-full bg-brand-100 px-3 py-1.5 text-xs font-medium text-brand-800 hover:bg-brand-200"
        >
          {c.label} <X className="size-3.5" />
        </button>
      ))}
      <button
        type="button"
        onClick={() => clear([...new Set(chips.map((c) => c.key))])}
        className="text-xs font-medium text-brand-700 hover:underline"
      >
        Clear all
      </button>
    </div>
  );
}
