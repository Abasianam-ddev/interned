import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { BadgeCheck, CircleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export const badgeVariants = cva(
  "inline-flex items-center gap-1 whitespace-nowrap rounded-full font-medium [&_svg]:size-3",
  {
    variants: {
      tone: {
        green: "bg-brand-100 text-brand-800",
        gray: "bg-slate-100 text-slate-600",
        amber: "bg-amber-50 text-amber-700",
        red: "bg-red-50 text-red-600",
        blue: "bg-sky-50 text-sky-700",
        purple: "bg-violet-50 text-violet-700",
        outline: "border border-line bg-white text-ink/75",
      },
      size: {
        sm: "px-2 py-0.5 text-[11px]",
        md: "px-2.5 py-1 text-xs",
      },
    },
    defaultVariants: { tone: "green", size: "sm" },
  },
);

export function Badge({
  className,
  tone,
  size,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ tone, size }), className)} {...props} />;
}

export function VerifiedBadge({ verified, className }: { verified: boolean; className?: string }) {
  return verified ? (
    <Badge tone="green" className={className}>
      <BadgeCheck className="fill-brand-600 text-white" /> Verified
    </Badge>
  ) : (
    <Badge tone="amber" className={className}>
      <CircleAlert /> Unverified
    </Badge>
  );
}

/** Light pill used for tags on opportunity cards (field, work mode, eligibility). */
export function Tag({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-medium text-brand-800 ring-1 ring-brand-100",
        className,
      )}
      {...props}
    />
  );
}
