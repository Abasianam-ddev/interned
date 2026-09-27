"use client";

import * as React from "react";
import { Switch as SwitchPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";

export function Switch({ className, ...props }: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full bg-slate-200 transition data-[state=checked]:bg-brand-600",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb className="block size-5 translate-x-0.5 rounded-full bg-white shadow transition data-[state=checked]:translate-x-[22px]" />
    </SwitchPrimitive.Root>
  );
}
