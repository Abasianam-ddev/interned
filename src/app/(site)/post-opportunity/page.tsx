import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, CheckCircle2, ClipboardList, Megaphone, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Post an Opportunity" };

export default async function PostOpportunityPage() {
  const user = await getCurrentUser();
  if (user?.role === "company") redirect("/company/opportunities/new");
  if (user?.role === "admin") redirect("/admin/opportunities/new");
  return (
    <div className="bg-canvas/60">
      <section className="container-page grid items-center gap-10 py-16 lg:grid-cols-2">
        <div>
          <span className="rounded-full bg-brand-100 px-3.5 py-1.5 text-xs font-semibold text-brand-800">For companies & organizations</span>
          <h1 className="mt-5 text-4xl font-bold leading-tight sm:text-5xl">
            Find talented interns <span className="text-brand-700">ready to grow.</span>
          </h1>
          <p className="mt-5 max-w-lg text-lg text-ink/75">
            Post internships, SIWES placements and graduate programs for free. Reach thousands of motivated students and
            manage every applicant in one place.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/signup?as=company&next=/company/opportunities/new">
                Create company account <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/login?next=/company/opportunities/new">I already have an account</Link>
            </Button>
          </div>
          {user?.role === "student" && (
            <p className="mt-4 text-sm text-amber-700">
              You&apos;re logged in as a student. Log out and create a company account to post opportunities.
            </p>
          )}
        </div>
        <div className="grid gap-4">
          {[
            { icon: ClipboardList, title: "Post in minutes", text: "A guided form covers role details, requirements and application settings." },
            { icon: UserCheck, title: "Review applicants", text: "See CVs, cover letters and profiles. Shortlist, interview and hire." },
            { icon: Megaphone, title: "Reach the right students", text: "Matching students get alerts the moment your opportunity is live." },
            { icon: CheckCircle2, title: "Build trust", text: "Get verified to earn the Verified badge and publish instantly." },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex gap-4 rounded-2xl border border-line bg-white p-5 shadow-card">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
                <Icon className="size-6" />
              </div>
              <div>
                <h2 className="font-semibold">{title}</h2>
                <p className="mt-1 text-sm text-muted">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
