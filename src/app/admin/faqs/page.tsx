import type { Metadata } from "next";
import { asc } from "drizzle-orm";
import { CircleHelp, Trash2 } from "lucide-react";
import { db } from "@/db";
import { faqs } from "@/db/schema";
import { deleteFaqAction } from "@/app/actions/admin";
import { ActionButton } from "@/components/admin/action-button";
import { FaqEditor } from "@/components/admin/faq-editor";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "FAQs" };

export default async function AdminFaqsPage() {
  const list = await db.select().from(faqs).orderBy(asc(faqs.category), asc(faqs.sortOrder));
  return (
    <>
      <PageHeader title="FAQs" description="Questions shown on the public FAQ page." actions={<FaqEditor />} />
      {list.length ? (
        <ul className="divide-y divide-line rounded-2xl border border-line bg-white shadow-card">
          {list.map((f) => (
            <li key={f.id} className="flex items-start gap-4 px-5 py-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold">{f.question}</p>
                  <Badge tone="outline">{f.category}</Badge>
                  {!f.published && <Badge tone="gray">Hidden</Badge>}
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-muted">{f.answer}</p>
              </div>
              <FaqEditor faq={f} />
              <ActionButton variant="ghost" size="icon-sm" aria-label="Delete" confirm="Delete this FAQ?" action={deleteFaqAction.bind(null, f.id)} successMessage="Deleted">
                <Trash2 className="text-red-500" />
              </ActionButton>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState icon={CircleHelp} title="No FAQs yet" />
      )}
    </>
  );
}
