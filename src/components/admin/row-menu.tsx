"use client";

import * as React from "react";
import Link from "next/link";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export type RowMenuItem =
  | { type: "link"; label: string; href: string }
  | {
      type: "action";
      label: string;
      action: (input?: string) => Promise<unknown>;
      confirm?: string;
      prompt?: string;
      success?: string;
      danger?: boolean;
    }
  | { type: "separator" };

export function RowMenu({ items }: { items: RowMenuItem[] }) {
  const [pending, start] = React.useTransition();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger disabled={pending} className="rounded-lg p-2 text-muted hover:bg-canvas hover:text-ink disabled:opacity-50" aria-label="Actions">
        <MoreHorizontal className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {items.map((item, i) => {
          if (item.type === "separator") return <DropdownMenuSeparator key={i} />;
          if (item.type === "link")
            return (
              <DropdownMenuItem key={i} asChild>
                <Link href={item.href}>{item.label}</Link>
              </DropdownMenuItem>
            );
          return (
            <DropdownMenuItem
              key={i}
              className={cn(item.danger && "text-red-600")}
              onSelect={() => {
                let input: string | undefined;
                if (item.prompt) {
                  const v = window.prompt(item.prompt);
                  if (v === null) return;
                  input = v;
                } else if (item.confirm && !window.confirm(item.confirm)) return;
                start(async () => {
                  await item.action(input);
                  if (item.success) toast.success(item.success);
                });
              }}
            >
              {item.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
