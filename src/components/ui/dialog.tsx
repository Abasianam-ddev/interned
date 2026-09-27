"use client";

import * as React from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

export function DialogContent({
  className,
  children,
  title,
  description,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & { title: React.ReactNode; description?: React.ReactNode }) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-brand-950/40 backdrop-blur-[2px] data-[state=open]:animate-in" />
      <DialogPrimitive.Content
        className={cn(
          "fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl bg-white p-6 shadow-float focus:outline-none",
          className,
        )}
        {...props}
      >
        <div className="mb-5 pr-8">
          <DialogPrimitive.Title className="font-display text-lg font-bold text-ink">{title}</DialogPrimitive.Title>
          {description ? (
            <DialogPrimitive.Description className="mt-1 text-sm text-muted">{description}</DialogPrimitive.Description>
          ) : (
            <DialogPrimitive.Description className="sr-only">{String(title)}</DialogPrimitive.Description>
          )}
        </div>
        {children}
        <DialogPrimitive.Close className="absolute right-4 top-4 rounded-md p-1.5 text-muted hover:bg-canvas hover:text-ink">
          <X className="size-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export function Sheet({
  open,
  onOpenChange,
  children,
  title,
  side = "right",
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  children: React.ReactNode;
  title: string;
  side?: "left" | "right";
}) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-brand-950/40" />
        <DialogPrimitive.Content
          className={cn(
            "fixed inset-y-0 z-50 flex w-[85%] max-w-sm flex-col overflow-y-auto bg-white shadow-float focus:outline-none",
            side === "right" ? "right-0" : "left-0",
          )}
        >
          <DialogPrimitive.Title className="sr-only">{title}</DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">{title}</DialogPrimitive.Description>
          {children}
          <DialogPrimitive.Close className="absolute right-4 top-4 rounded-md p-1.5 text-muted hover:bg-canvas">
            <X className="size-5" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
