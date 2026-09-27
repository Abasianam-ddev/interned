"use client";

import * as React from "react";
import { toast } from "sonner";
import { Button, type ButtonProps } from "@/components/ui/button";

/** Button that runs a (pre-bound) server action with optional confirm and success toast. */
export function ActionButton({
  action,
  confirm,
  successMessage,
  prompt,
  children,
  ...props
}: Omit<ButtonProps, "onClick" | "action"> & {
  action: (input?: string) => Promise<unknown>;
  confirm?: string;
  successMessage?: string;
  /** Ask for a text input (e.g. a rejection reason) that is passed to the action. */
  prompt?: string;
}) {
  const [pending, start] = React.useTransition();
  return (
    <Button
      {...props}
      disabled={pending || props.disabled}
      onClick={() => {
        let input: string | undefined;
        if (prompt) {
          const v = window.prompt(prompt);
          if (v === null) return;
          input = v;
        } else if (confirm && !window.confirm(confirm)) return;
        start(async () => {
          try {
            await action(input);
            if (successMessage) toast.success(successMessage);
          } catch (e) {
            if (e && typeof e === "object" && "digest" in e && String((e as { digest: string }).digest).startsWith("NEXT_REDIRECT")) throw e;
            toast.error("Something went wrong. Please try again.");
          }
        });
      }}
    >
      {children}
    </Button>
  );
}
