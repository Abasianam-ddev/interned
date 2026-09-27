import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { requireUser } from "@/lib/auth";
import { getOpportunityBySlug } from "@/lib/queries";

export const metadata: Metadata = { title: "Application Submitted" };

export default async function ApplySuccessPage({ params }: PageProps<"/opportunities/[slug]/apply/success">) {
  const { slug } = await params;
  await requireUser(["student"]);
  const opp = await getOpportunityBySlug(slug);
  if (!opp) notFound();
  return (
    <div className="bg-canvas/60 py-20">
      <div className="container-page max-w-xl! text-center">
        <div className="rounded-2xl border border-line bg-white px-6 py-14 shadow-card">
          <div className="relative mx-auto flex size-24 items-center justify-center">
            <span className="absolute inset-0 animate-ping rounded-full bg-brand-200 opacity-40" />
            <span className="absolute inset-2 rounded-full bg-brand-100" />
            <span className="relative flex size-16 items-center justify-center rounded-full bg-brand-600 text-white shadow-float">
              <Check className="size-8" strokeWidth={3} />
            </span>
          </div>
          <h1 className="mt-8 text-2xl font-bold">Application Submitted!</h1>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted">
            Your application for <strong className="text-ink">{opp.title}</strong> at{" "}
            <strong className="text-ink">{opp.company.name}</strong> has been submitted successfully. We&apos;ll notify you when
            its status changes.
          </p>
          <Button asChild size="lg" className="mt-8 bg-brand-800 hover:bg-brand-900">
            <Link href="/dashboard/applications">
              View My Applications <ArrowRight />
            </Link>
          </Button>
          <div className="mt-4">
            <Link href="/opportunities" className="text-sm font-medium text-brand-700 hover:underline">
              Back to Opportunities
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
