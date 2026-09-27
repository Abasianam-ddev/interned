import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Search } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { SafeImg } from "@/components/shared/safe-img";
import { RESOURCE_CATEGORIES, RESOURCE_CATEGORY_LABEL } from "@/lib/constants";
import { getPublishedResources } from "@/lib/queries";
import { cn, formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Career Resources",
  description: "Guides, tips and articles to help you build a successful career.",
};

export default async function ResourcesPage({ searchParams }: PageProps<"/resources">) {
  const sp = await searchParams;
  const category = typeof sp.category === "string" ? sp.category : "";
  const q = typeof sp.q === "string" ? sp.q : "";
  const list = await getPublishedResources({ category: category || undefined, q: q || undefined });
  const [featured, ...rest] = !category && !q ? list : [undefined, ...list];

  return (
    <div className="bg-canvas/60">
      <div className="container-page py-10">
        <h1 className="text-[28px] font-bold">Career Resources</h1>
        <p className="mt-1 text-sm text-muted">Guides, tips and articles to help you build a successful career.</p>
        <form className="relative mt-6 max-w-2xl">
          {category && <input type="hidden" name="category" value={category} />}
          <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-ink/60" />
          <input
            name="q"
            defaultValue={q}
            placeholder="Search resources..."
            className="h-12 w-full rounded-xl border border-line bg-white pl-12 pr-4 text-sm shadow-card focus:border-brand-500 focus:outline-none"
          />
        </form>
        <div className="scrollbar-none mt-6 flex gap-2 overflow-x-auto">
          {[{ value: "", label: "All" }, ...RESOURCE_CATEGORIES].map((c) => (
            <Link
              key={c.value}
              href={c.value ? `/resources?category=${c.value}` : "/resources"}
              className={cn(
                "whitespace-nowrap rounded-full px-4 py-2 text-[13px] font-medium ring-1 transition",
                category === c.value ? "bg-brand-700 text-white ring-brand-700" : "bg-white text-ink/80 ring-line hover:bg-brand-50",
              )}
            >
              {c.label}
            </Link>
          ))}
        </div>

        {featured && (
          <Link
            href={`/resources/${featured.slug}`}
            className="group mt-8 grid overflow-hidden rounded-2xl border border-line bg-white shadow-card md:grid-cols-2"
          >
            <SafeImg src={featured.coverUrl ?? undefined} alt="" className="aspect-[16/10] size-full object-cover md:aspect-auto" />
            <div className="flex flex-col justify-center p-8">
              <p className="text-xs font-semibold uppercase tracking-wider text-brand-700">
                Featured · {RESOURCE_CATEGORY_LABEL[featured.category]}
              </p>
              <h2 className="mt-3 text-2xl font-bold group-hover:text-brand-800">{featured.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted">{featured.excerpt}</p>
              <p className="mt-5 text-xs text-muted">
                {formatDate(featured.publishedAt)} · {featured.readMinutes} min read
              </p>
            </div>
          </Link>
        )}

        {rest.length ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((a) =>
              a ? (
                <Link key={a.id} href={`/resources/${a.slug}`} className="group overflow-hidden rounded-2xl border border-line bg-white shadow-card">
                  <SafeImg src={a.coverUrl ?? undefined} alt="" className="aspect-[16/9] w-full object-cover" />
                  <div className="p-5">
                    <p className="text-xs font-medium text-brand-700">
                      {RESOURCE_CATEGORY_LABEL[a.category]} · {a.readMinutes} min read
                    </p>
                    <h3 className="mt-2 font-semibold leading-snug group-hover:text-brand-800">{a.title}</h3>
                    {a.excerpt && <p className="mt-2 line-clamp-2 text-[13px] text-muted">{a.excerpt}</p>}
                    <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-brand-700">
                      Read more <ArrowRight className="size-4" />
                    </span>
                  </div>
                </Link>
              ) : null,
            )}
          </div>
        ) : (
          !featured && <EmptyState icon={BookOpen} title="No resources found" className="mt-8" />
        )}
      </div>
    </div>
  );
}
