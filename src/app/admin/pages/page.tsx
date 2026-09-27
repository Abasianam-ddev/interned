import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { db } from "@/db";
import { pages } from "@/db/schema";
import { PageHeader } from "@/components/dashboard/page-header";
import { EDITABLE_PAGES } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Pages" };

export default async function AdminPagesPage() {
  const rows = await db.select().from(pages);
  return (
    <>
      <PageHeader title="Pages" description="Edit the content of static pages." />
      <ul className="divide-y divide-line rounded-2xl border border-line bg-white shadow-card">
        {EDITABLE_PAGES.map((p) => {
          const row = rows.find((r) => r.slug === p.slug);
          return (
            <li key={p.slug}>
              <Link href={`/admin/pages/${p.slug}`} className="flex items-center gap-4 px-5 py-4 hover:bg-canvas">
                <div className="flex-1">
                  <p className="font-semibold">{row?.title ?? p.title}</p>
                  <p className="text-xs text-muted">
                    {p.path} · {row ? `Updated ${formatDate(row.updatedAt)}` : "Not created yet"}
                  </p>
                </div>
                <ChevronRight className="size-4 text-muted" />
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}
