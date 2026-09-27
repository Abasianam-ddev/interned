import type { Metadata } from "next";
import { desc, ilike } from "drizzle-orm";
import { BellRing, Download, Trash2 } from "lucide-react";
import { db } from "@/db";
import { alerts } from "@/db/schema";
import { deleteAlertAdminAction } from "@/app/actions/admin";
import { ActionButton } from "@/components/admin/action-button";
import { ListToolbar, TableCard, Td, Th } from "@/components/admin/list-toolbar";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getAllFields } from "@/lib/queries";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Alert Subscribers" };

export default async function AdminSubscribersPage({ searchParams }: PageProps<"/admin/subscribers">) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const [list, allFields] = await Promise.all([
    db.select().from(alerts).where(q ? ilike(alerts.email, `%${q}%`) : undefined).orderBy(desc(alerts.createdAt)).limit(500),
    getAllFields(),
  ]);
  const fieldName = Object.fromEntries(allFields.map((f) => [f.id, f.name]));
  return (
    <>
      <PageHeader
        title="Alert Subscribers"
        description={`${list.length} opportunity alerts from students and email subscribers.`}
        actions={
          <Button asChild variant="secondary">
            <a href="/api/admin/subscribers">
              <Download /> Export CSV
            </a>
          </Button>
        }
      />
      <ListToolbar basePath="/admin/subscribers" params={sp} placeholder="Search by email" />
      {list.length ? (
        <TableCard minWidth={760}>
          <thead className="border-b border-line">
            <tr>
              <Th>Email</Th>
              <Th>Preferences</Th>
              <Th>Frequency</Th>
              <Th>Created</Th>
              <Th />
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {list.map((a) => (
              <tr key={a.id}>
                <Td>
                  <p className="font-medium">{a.email}</p>
                  <p className="text-xs text-muted">{a.userId ? "Student account" : "Email subscriber"}</p>
                </Td>
                <Td className="max-w-xs text-xs text-ink/75">
                  {[a.keywords && `“${a.keywords}”`, ...a.fieldIds.map((id) => fieldName[id]), ...a.locations, ...a.types, ...a.workModes]
                    .filter(Boolean)
                    .join(" · ") || "All opportunities"}
                </Td>
                <Td>
                  <Badge tone={a.active ? "green" : "gray"} size="md" className="capitalize">
                    {a.active ? a.frequency : "paused"}
                  </Badge>
                </Td>
                <Td className="whitespace-nowrap text-ink/75">{formatDate(a.createdAt)}</Td>
                <Td className="text-right">
                  <ActionButton variant="ghost" size="icon-sm" aria-label="Delete" confirm="Remove this subscriber?" action={deleteAlertAdminAction.bind(null, a.id)}>
                    <Trash2 className="text-red-500" />
                  </ActionButton>
                </Td>
              </tr>
            ))}
          </tbody>
        </TableCard>
      ) : (
        <EmptyState icon={BellRing} title="No subscribers yet" />
      )}
    </>
  );
}
