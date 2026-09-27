import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FieldIcon } from "@/components/shared/field-icon";
import { getFieldsWithCounts } from "@/lib/queries";

export const metadata: Metadata = { title: "Explore by Field" };

export default async function FieldsPage() {
  const list = await getFieldsWithCounts();
  return (
    <div className="bg-canvas/60">
      <div className="container-page py-10">
        <h1 className="text-[28px] font-bold">Explore by Field</h1>
        <p className="mt-1 text-sm text-muted">Find opportunities in your area of interest.</p>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((f) => (
            <Link
              key={f.id}
              href={`/opportunities?field=${f.slug}`}
              className="group flex gap-4 rounded-2xl border border-line bg-white p-6 shadow-card transition hover:border-brand-200"
            >
              <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
                <FieldIcon name={f.icon} className="size-7" />
              </div>
              <div className="flex-1">
                <h2 className="font-bold">{f.name}</h2>
                <p className="text-sm font-medium text-brand-700">{f.count} opportunities</p>
                {f.description && <p className="mt-2 text-[13px] leading-relaxed text-muted">{f.description}</p>}
              </div>
              <ArrowRight className="size-5 self-center text-muted transition group-hover:translate-x-1 group-hover:text-brand-700" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
