import { CalendarDays, Clock3, MapPin, Wallet } from "lucide-react";
import { cn, formatDate, formatDuration, formatStipend } from "@/lib/utils";

export function OpportunityMeta({
  location,
  stipend,
  paid,
  durationMonths,
  className,
  size = "sm",
}: {
  location: string;
  stipend: number | null;
  paid: boolean;
  durationMonths: number | null;
  className?: string;
  size?: "sm" | "md";
}) {
  const icon = size === "md" ? "size-[18px]" : "size-4";
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-6 gap-y-2 text-ink/75",
        size === "md" ? "text-sm" : "text-[12.5px]",
        className,
      )}
    >
      <span className="inline-flex items-center gap-1.5">
        <MapPin className={cn(icon, "fill-ink/80 text-white")} strokeWidth={2} />
        {location}
      </span>
      <span className="inline-flex items-center gap-1.5">
        <Wallet className={cn(icon, "text-ink/70")} />
        {formatStipend(stipend, paid)}
      </span>
      <span className="inline-flex items-center gap-1.5">
        <CalendarDays className={cn(icon, "text-ink/70")} />
        {formatDuration(durationMonths)}
      </span>
    </div>
  );
}

export function Deadline({ date, className }: { date: string | null; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap text-[12px] text-ink/65", className)}>
      <CalendarDays className="size-4 text-ink/60" />
      Deadline: {date ? formatDate(date) : "Rolling"}
    </span>
  );
}

export function PostedAgo({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs text-muted">
      <Clock3 className="size-3.5" /> {label}
    </span>
  );
}
