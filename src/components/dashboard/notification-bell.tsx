"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { markNotificationsReadAction } from "@/app/actions/student";
import { cn, timeAgo } from "@/lib/utils";

export type BellItem = { id: string; title: string; body: string | null; link: string | null; readAt: Date | null; createdAt: Date };

export function NotificationBell({ items, unread, allHref }: { items: BellItem[]; unread: number; allHref: string }) {
  const router = useRouter();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="relative flex size-10 items-center justify-center rounded-full hover:bg-brand-50" aria-label={`Notifications (${unread} unread)`}>
        <Bell className="size-5" />
        {unread > 0 && (
          <span className="absolute right-1.5 top-1.5 flex min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <p className="text-sm font-semibold">Notifications</p>
          {unread > 0 && (
            <button
              className="text-xs font-medium text-brand-700 hover:underline"
              onClick={async () => {
                await markNotificationsReadAction();
                router.refresh();
              }}
            >
              Mark all as read
            </button>
          )}
        </div>
        <div className="max-h-96 overflow-y-auto">
          {items.length === 0 && <p className="px-4 py-8 text-center text-sm text-muted">You&apos;re all caught up.</p>}
          {items.map((n) => (
            <Link
              key={n.id}
              href={n.link ?? allHref}
              onClick={() => !n.readAt && markNotificationsReadAction([n.id])}
              className={cn("flex gap-3 border-b border-line px-4 py-3 last:border-0 hover:bg-canvas", !n.readAt && "bg-brand-50/50")}
            >
              <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", n.readAt ? "bg-transparent" : "bg-brand-600")} />
              <span className="min-w-0">
                <span className="block text-[13px] font-medium leading-snug">{n.title}</span>
                {n.body && <span className="block truncate text-xs text-muted">{n.body}</span>}
                <span className="mt-0.5 block text-[11px] text-muted">{timeAgo(n.createdAt)}</span>
              </span>
            </Link>
          ))}
        </div>
        <Link href={allHref} className="block border-t border-line py-2.5 text-center text-xs font-semibold text-brand-700 hover:bg-canvas">
          View all
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
