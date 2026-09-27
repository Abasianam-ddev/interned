import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center rounded-2xl border border-dashed border-line bg-canvas/50 px-6 py-14 text-center", className)}>
      <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-brand-100 text-brand-700">
        <Icon className="size-6" />
      </div>
      <h3 className="text-base font-bold">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm text-muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
