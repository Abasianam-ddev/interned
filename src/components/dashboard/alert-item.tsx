"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { deleteAlertAction, toggleAlertAction } from "@/app/actions/student";

export function AlertItem({ id, active, title, summary, frequency }: { id: string; active: boolean; title: string; summary: string; frequency: string }) {
  const [pending, start] = useTransition();
  return (
    <li className="flex items-center gap-4 px-5 py-4">
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">{title}</p>
        <p className="truncate text-xs text-muted">{summary}</p>
        <p className="mt-0.5 text-[11px] capitalize text-brand-700">{frequency} emails</p>
      </div>
      <Switch checked={active} disabled={pending} onCheckedChange={(v) => start(() => toggleAlertAction(id, v))} aria-label="Alert active" />
      <button
        disabled={pending}
        onClick={() => confirm("Delete this alert?") && start(() => deleteAlertAction(id))}
        className="rounded-lg p-2 text-muted hover:bg-red-50 hover:text-red-600"
        aria-label="Delete alert"
      >
        <Trash2 className="size-4" />
      </button>
    </li>
  );
}
