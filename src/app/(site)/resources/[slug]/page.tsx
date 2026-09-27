import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq, ne } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import { db } from "@/db";
import { resources } from "@/db/schema";
import { Markdown } from "@/components/content/markdown";
import { SafeImg } from "@/components/shared/safe-img";
import { ShareButtons } from "@/components/opportunity/share";
import { getCurrentUser } from "@/lib/auth";
import { RESOURCE_CATEGORY_LABEL } from "@/lib/constants";
import { appUrl } from "@/lib/mail";
import { formatDate } from "@/lib/utils";

async function load(slug: string) {
  return db.query.resources.findFirst({ where: eq(resources.slug, slug) });
}

export async function generateMetadata({ params }: PageProps<"/resources/[slug]">): Promise<Metadata> {
  const r = await load((await params).slug);
  return { title: r?.title ?? "Resource", description: r?.excerpt ?? undefined };
}

export default async function ResourcePage({ params }: PageProps<"/resources/[slug]">) {
  const { slug } = await params;
  const r = await load(slug);
  if (!r) notFound();
  if (!r.published && (await getCurrentUser())?.role !== "admin") notFound();
  const more = await db
    .select()
    .from(resources)
    .where(and(eq(resources.published, true), ne(resources.id, r.id), eq(resources.category, r.category)))
    .limit(3);

  return (
    <article className="container-page max-w-3xl! py-10">
      <Link href="/resources" className="inline-flex items-center gap-1.5 text-[13px] text-ink/70 hover:text-brand-700">
        <ArrowLeft className="size-4" /> Resources / {RESOURCE_CATEGORY_LABEL[r.category]}
      </Link>
      <h1 className="mt-5 text-3xl font-bold leading-tight sm:text-[40px]">{r.title}</h1>
      <p className="mt-4 text-sm text-muted">
        <span className="rounded-full bg-brand-100 px-2.5 py-1 text-xs font-medium text-brand-800">{RESOURCE_CATEGORY_LABEL[r.category]}</span>
        <span className="ml-3">
          {r.authorName} · {formatDate(r.publishedAt)} · {r.readMinutes} min read
        </span>
      </p>
      {r.coverUrl && <SafeImg src={r.coverUrl} alt="" className="mt-8 aspect-[16/8] w-full rounded-2xl object-cover" />}
      <Markdown className="mt-8">{r.content}</Markdown>
      <div className="mt-10 flex items-center justify-between border-t border-line pt-6">
        <span className="text-sm font-semibold">Share this article</span>
        <ShareButtons url={appUrl(`/resources/${r.slug}`)} title={r.title} />
      </div>
      {more.length > 0 && (
        <aside className="mt-12">
          <h2 className="text-lg font-bold">More in {RESOURCE_CATEGORY_LABEL[r.category]}</h2>
          <ul className="mt-4 divide-y divide-line rounded-2xl border border-line">
            {more.map((m) => (
              <li key={m.id}>
                <Link href={`/resources/${m.slug}`} className="block px-5 py-4 hover:bg-canvas">
                  <p className="font-semibold">{m.title}</p>
                  <p className="text-xs text-muted">{m.readMinutes} min read</p>
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      )}
    </article>
  );
}
