import type { Metadata } from "next";
import Link from "next/link";
import { FaqList } from "@/components/content/faq-list";
import { getPublishedFaqs } from "@/lib/queries";

export const metadata: Metadata = { title: "Frequently Asked Questions" };

export default async function FaqPage() {
  const items = await getPublishedFaqs();
  const categories = [...new Set(items.map((f) => f.category))];
  return (
    <div className="bg-canvas/60 py-12">
      <div className="container-page max-w-3xl!">
        <h1 className="text-[28px] font-bold">Frequently Asked Questions</h1>
        <p className="mt-1 text-sm text-muted">Find answers to common questions about Internly.</p>
        {categories.map((c) => (
          <section key={c} className="mt-8">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-brand-700">{c}</h2>
            <FaqList items={items.filter((f) => f.category === c)} />
          </section>
        ))}
        <p className="mt-10 text-center text-sm text-muted">
          Still have questions?{" "}
          <Link href="/contact" className="font-semibold text-brand-700 hover:underline">
            Contact us
          </Link>
        </p>
      </div>
    </div>
  );
}
