import type { Metadata } from "next";
import Link from "next/link";
import { desc, ilike } from "drizzle-orm";
import { BookOpen, PlusCircle } from "lucide-react";
import { db } from "@/db";
import { resources } from "@/db/schema";
import { deleteResourceAction } from "@/app/actions/admin";
import { ListToolbar, TableCard, Td, Th } from "@/components/admin/list-toolbar";
import { RowMenu } from "@/components/admin/row-menu";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { FlashToast } from "@/components/shared/flash-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RESOURCE_CATEGORY_LABEL } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Resources" };

export default async function AdminResourcesPage({ searchParams }: PageProps<"/admin/resources">) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const list = await db
    .select()
    .from(resources)
    .where(q ? ilike(resources.title, `%${q}%`) : undefined)
    .orderBy(desc(resources.publishedAt));
  return (
    <>
      <FlashToast />
      <PageHeader
        title="Career Resources"
        description="Articles and guides shown on the Resources page."
        actions={
          <Button asChild>
            <Link href="/admin/resources/new">
              <PlusCircle /> New Resource
            </Link>
          </Button>
        }
      />
      <ListToolbar basePath="/admin/resources" params={sp} placeholder="Search resources" />
      {list.length ? (
        <TableCard minWidth={720}>
          <thead className="border-b border-line">
            <tr>
              <Th>Title</Th>
              <Th>Category</Th>
              <Th>Status</Th>
              <Th>Published</Th>
              <Th />
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {list.map((r) => (
              <tr key={r.id} className="hover:bg-canvas/60">
                <Td>
                  <Link href={`/admin/resources/${r.id}`} className="font-semibold hover:text-brand-700">
                    {r.title}
                  </Link>
                  <p className="text-xs text-muted">
                    {r.authorName} · {r.readMinutes} min read
                  </p>
                </Td>
                <Td className="text-ink/75">{RESOURCE_CATEGORY_LABEL[r.category] ?? r.category}</Td>
                <Td>
                  <div className="flex gap-1.5">
                    <Badge tone={r.published ? "green" : "gray"} size="md">
                      {r.published ? "Published" : "Draft"}
                    </Badge>
                    {r.featured && (
                      <Badge tone="amber" size="md">
                        Featured
                      </Badge>
                    )}
                  </div>
                </Td>
                <Td className="whitespace-nowrap text-ink/75">{formatDate(r.publishedAt)}</Td>
                <Td className="text-right">
                  <RowMenu
                    items={[
                      { type: "link", label: "View", href: `/resources/${r.slug}` },
                      { type: "link", label: "Edit", href: `/admin/resources/${r.id}` },
                      { type: "separator" },
                      { type: "action", label: "Delete", danger: true, confirm: "Delete this resource?", action: deleteResourceAction.bind(null, r.id), success: "Deleted" },
                    ]}
                  />
                </Td>
              </tr>
            ))}
          </tbody>
        </TableCard>
      ) : (
        <EmptyState icon={BookOpen} title="No resources yet" />
      )}
    </>
  );
}
