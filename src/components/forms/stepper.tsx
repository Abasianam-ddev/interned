import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function Stepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol className="flex items-start">
      {steps.map((label, i) => {
        const n = i + 1;
        const done = n < current;
        const active = n === current;
        return (
          <li key={label} className="relative flex flex-1 flex-col items-center text-center">
            {i > 0 && (
              <span
                className={cn("absolute right-1/2 top-4 h-0.5 w-full -translate-y-1/2", n <= current ? "bg-brand-600" : "bg-line")}
                aria-hidden
              />
            )}
            <span
              className={cn(
                "relative z-10 flex size-8 items-center justify-center rounded-full text-sm font-semibold",
                done && "bg-brand-600 text-white",
                active && "bg-brand-700 text-white ring-4 ring-brand-100",
                !done && !active && "border border-line bg-white text-muted",
              )}
            >
              {done ? <Check className="size-4" strokeWidth={3} /> : n}
            </span>
            <span className={cn("mt-2 text-xs", active ? "font-semibold text-ink" : "text-muted")}>{label}</span>
          </li>
        );
      })}
    </ol>
  );
}
