"use client";

import * as React from "react";
import { DropdownMenu as DM } from "radix-ui";
import { cn } from "@/lib/utils";

export const DropdownMenu = DM.Root;
export const DropdownMenuTrigger = DM.Trigger;

export function DropdownMenuContent({ className, align = "end", ...props }: React.ComponentProps<typeof DM.Content>) {
  return (
    <DM.Portal>
      <DM.Content
        align={align}
        sideOffset={8}
        className={cn("z-50 min-w-52 rounded-xl border border-line bg-white p-1.5 shadow-float", className)}
        {...props}
      />
    </DM.Portal>
  );
}

export function DropdownMenuItem({ className, ...props }: React.ComponentProps<typeof DM.Item>) {
  return (
    <DM.Item
      className={cn(
        "flex cursor-pointer select-none items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-ink/85 outline-none data-[highlighted]:bg-brand-50 data-[highlighted]:text-ink [&_svg]:size-4 [&_svg]:text-muted",
        className,
      )}
      {...props}
    />
  );
}

export function DropdownMenuLabel({ className, ...props }: React.ComponentProps<typeof DM.Label>) {
  return <DM.Label className={cn("px-2.5 py-2 text-sm", className)} {...props} />;
}

export function DropdownMenuSeparator({ className, ...props }: React.ComponentProps<typeof DM.Separator>) {
  return <DM.Separator className={cn("my-1 h-px bg-line", className)} {...props} />;
}
