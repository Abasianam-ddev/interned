"use client";

import { useTransition } from "react";
import { CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { markNotificationsReadAction } from "@/app/actions/student";

export function MarkAllRead() {
  const [pending, start] = useTransition();
  return (
    <Button variant="secondary" disabled={pending} onClick={() => start(() => markNotificationsReadAction())}>
      <CheckCheck /> Mark all as read
    </Button>
  );
}
