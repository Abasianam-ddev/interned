import { notFound } from "next/navigation";
import { Markdown } from "./markdown";
import { getPage } from "@/lib/pages";
import { formatDate } from "@/lib/utils";

export async function LegalPage({ slug }: { slug: string }) {
  const page = await getPage(slug);
  if (!page) notFound();
  return (
    <div className="bg-canvas/60 py-12">
      <div className="container-page max-w-3xl!">
        <div className="rounded-2xl border border-line bg-white p-6 shadow-card sm:p-10">
          <h1 className="text-3xl font-bold">{page.title}</h1>
          <p className="mt-2 text-sm text-muted">Last updated {formatDate(page.updatedAt)}</p>
          {page.summary && <p className="mt-6 text-base text-ink/80">{page.summary}</p>}
          <Markdown className="mt-4">{page.content}</Markdown>
        </div>
      </div>
    </div>
  );
}
