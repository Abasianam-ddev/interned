"use client";

import { useTransition } from "react";
import { withdrawApplicationAction } from "@/app/actions/student";
import { Button } from "@/components/ui/button";

export function WithdrawButton({ id, label = "Cancel Application" }: { id: string; label?: string }) {
  const [pending, start] = useTransition();
  return (
    <Button
      variant="danger-outline"
      disabled={pending}
      onClick={() => {
        if (confirm("Are you sure you want to withdraw this application? This cannot be undone.")) start(() => withdrawApplicationAction(id));
      }}
    >
      {label}
    </Button>
  );
}
