import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import { db } from "@/db";
import { applicationEvents, applications, studentProfiles } from "@/db/schema";
import { updateApplicationStatusAction } from "@/app/actions/company";
import { ApplicantDetail } from "@/components/dashboard/applicant-detail";
import { applyStatusChange } from "@/lib/applications";
import { requireCompany } from "@/lib/auth";

export const metadata: Metadata = { title: "Applicant" };

async function load(id: string) {
  return db.query.applications.findFirst({
    where: eq(applications.id, id),
    with: { opportunity: true, user: { columns: { avatarUrl: true } }, events: { orderBy: asc(applicationEvents.createdAt) } },
  });
}

export default async function CompanyApplicantPage({ params }: PageProps<"/company/applicants/[id]">) {
  const { id } = await params;
  const { company } = await requireCompany();
  let app = await load(id);
  if (!app || app.opportunity.companyId !== company.id || app.status === "draft") notFound();
  if (app.status === "submitted") {
    // Opening a new application moves it into review and lets the student know.
    await applyStatusChange(app, { title: app.opportunity.title, companyName: company.name }, "under_review", null);
    app = (await load(id))!;
  }
  const profile = await db.query.studentProfiles.findFirst({ where: eq(studentProfiles.userId, app.userId) });
  return (
    <>
      <Link href="/company/applicants" className="mb-6 inline-flex items-center gap-1.5 text-sm text-ink/70 hover:text-brand-700">
        <ArrowLeft className="size-4" /> All applicants
      </Link>
      <ApplicantDetail
        app={app}
        user={app.user}
        profile={profile}
        events={app.events}
        opportunity={app.opportunity}
        action={updateApplicationStatusAction}
      />
    </>
  );
}
