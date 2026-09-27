import type { Metadata } from "next";
import { desc, eq } from "drizzle-orm";
import { Archive, Check, Mail, Reply, Trash2 } from "lucide-react";
import { db } from "@/db";
import { contactMessages } from "@/db/schema";
import { deleteMessageAction, setMessageStatusAction } from "@/app/actions/admin";
import { ActionButton } from "@/components/admin/action-button";
import { ListToolbar } from "@/components/admin/list-toolbar";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Messages" };
const TONE = { new: "blue", read: "gray", replied: "green", archived: "gray" } as const;

export default async function AdminMessagesPage({ searchParams }: PageProps<"/admin/messages">) {
  const sp = await searchParams;
  const status = typeof sp.status === "string" && sp.status in TONE ? (sp.status as keyof typeof TONE) : undefined;
  const list = await db
    .select()
    .from(contactMessages)
    .where(status ? eq(contactMessages.status, status) : undefined)
    .orderBy(desc(contactMessages.createdAt))
    .limit(200);
  return (
    <>
      <PageHeader title="Messages" description="Messages sent through the contact form." />
      <ListToolbar
        basePath="/admin/messages"
        params={sp}
        tabs={[
          { value: "", label: "All" },
          { value: "new", label: "New" },
          { value: "read", label: "Read" },
          { value: "replied", label: "Replied" },
          { value: "archived", label: "Archived" },
        ]}
      />
      {list.length ? (
        <div className="space-y-4">
          {list.map((m) => (
            <article key={m.id} className="rounded-2xl border border-line bg-white p-5 shadow-card">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{m.name}</p>
                    <Badge tone={TONE[m.status]} size="md" className="capitalize">
                      {m.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted">
                    {m.email} · {formatDateTime(m.createdAt)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <Button asChild size="xs" variant="secondary">
                    <a href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.subject ?? "Your message to Internly"}`)}`}>
                      <Reply /> Reply
                    </a>
                  </Button>
                  {m.status !== "replied" && (
                    <ActionButton size="xs" variant="secondary" action={setMessageStatusAction.bind(null, m.id, "replied")}>
                      <Check /> Mark replied
                    </ActionButton>
                  )}
                  {m.status === "new" && (
                    <ActionButton size="xs" variant="secondary" action={setMessageStatusAction.bind(null, m.id, "read")}>
                      Mark read
                    </ActionButton>
                  )}
                  {m.status !== "archived" && (
                    <ActionButton size="xs" variant="secondary" action={setMessageStatusAction.bind(null, m.id, "archived")}>
                      <Archive /> Archive
                    </ActionButton>
                  )}
                  <ActionButton size="xs" variant="danger-outline" confirm="Delete this message?" action={deleteMessageAction.bind(null, m.id)}>
                    <Trash2 />
                  </ActionButton>
                </div>
              </div>
              {m.subject && <p className="mt-3 text-sm font-semibold">{m.subject}</p>}
              <p className="mt-1 whitespace-pre-line text-sm text-ink/80">{m.message}</p>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState icon={Mail} title="No messages" />
      )}
    </>
  );
}
