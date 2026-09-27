"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Bookmark } from "lucide-react";
import { toast } from "sonner";
import { toggleSaveAction } from "@/app/actions/student";
import { cn } from "@/lib/utils";

export function SaveButton({
  opportunityId,
  saved: initial,
  loggedIn,
  className,
  withLabel = false,
}: {
  opportunityId: string;
  saved: boolean;
  loggedIn: boolean;
  className?: string;
  withLabel?: boolean;
}) {
  const router = useRouter();
  const [saved, setSaved] = React.useState(initial);
  const [pending, start] = React.useTransition();
  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? "Remove from saved" : "Save opportunity"}
      disabled={pending}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!loggedIn) {
          router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
          return;
        }
        const next = !saved;
        setSaved(next);
        start(async () => {
          const res = await toggleSaveAction(opportunityId);
          if (!res.ok) {
            setSaved(!next);
            toast.error(res.error ?? "Could not update saved opportunities");
          } else {
            toast.success(res.saved ? "Saved to your list" : "Removed from saved");
            setSaved(!!res.saved);
          }
        });
      }}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg border transition",
        withLabel ? "h-10 px-4 text-sm font-semibold" : "size-10",
        saved ? "border-brand-200 bg-brand-50 text-brand-700" : "border-line bg-white text-ink/70 hover:border-brand-300 hover:text-brand-700",
        className,
      )}
    >
      <Bookmark className={cn("size-[18px]", saved && "fill-brand-600 text-brand-600")} />
      {withLabel && (saved ? "Saved" : "Save")}
    </button>
  );
}
