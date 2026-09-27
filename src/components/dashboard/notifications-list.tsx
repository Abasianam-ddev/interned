import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { Bell, BellRing, Briefcase, FileText, Flag, Mail, PartyPopper } from "lucide-react";
import { db } from "@/db";
import { notifications } from "@/db/schema";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "./page-header";
import { MarkAllRead } from "./mark-all-read";
import { cn, timeAgo } from "@/lib/utils";

const ICONS: Record<string, typeof Bell> = {
  application: FileText,
  opportunity: Briefcase,
  welcome: PartyPopper,
  report: Flag,
  message: Mail,
  alert: BellRing,
};

export async function NotificationsList({ userId }: { userId: string }) {
  const items = await db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt)).limit(100);
  const unread = items.filter((i) => !i.readAt).length;
  return (
    <>
      <PageHeader title="Notifications" description={unread ? `You have ${unread} unread notifications.` : "You're all caught up."} actions={unread > 0 && <MarkAllRead />} />
      {items.length ? (
        <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white shadow-card">
          {items.map((n) => {
            const Icon = ICONS[n.type] ?? Bell;
            const body = (
              <div className={cn("flex gap-4 px-5 py-4", !n.readAt && "bg-brand-50/50")}>
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                  <Icon className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{n.title}</p>
                  {n.body && <p className="text-[13px] text-muted">{n.body}</p>}
                  <p className="mt-0.5 text-[11px] text-muted">{timeAgo(n.createdAt)}</p>
                </div>
                {!n.readAt && <span className="mt-2 size-2 rounded-full bg-brand-600" />}
              </div>
            );
            return <li key={n.id}>{n.link ? <Link href={n.link} className="block hover:bg-canvas">{body}</Link> : body}</li>;
          })}
        </ul>
      ) : (
        <EmptyState icon={Bell} title="No notifications yet" />
      )}
    </>
  );
}
