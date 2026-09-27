import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { ArrowLeft, Trash2 } from "lucide-react";
import { db } from "@/db";
import { applicationEvents, applications, studentProfiles } from "@/db/schema";
import { adminDeleteApplicationAction, adminUpdateApplicationAction } from "@/app/actions/admin";
import { ActionButton } from "@/components/admin/action-button";
import { ApplicantDetail } from "@/components/dashboard/applicant-detail";

export const metadata: Metadata = { title: "Application" };

export default async function AdminApplicationPage({ params }: PageProps<"/admin/applications/[id]">) {
  const { id } = await params;
  const app = await db.query.applications.findFirst({
    where: eq(applications.id, id),
    with: {
      opportunity: { with: { company: true } },
      user: { columns: { avatarUrl: true } },
      events: { orderBy: asc(applicationEvents.createdAt) },
    },
  });
  if (!app) notFound();
  const profile = await db.query.studentProfiles.findFirst({ where: eq(studentProfiles.userId, app.userId) });
  return (
    <>
      <div className="mb-6 flex items-center justify-between gap-4">
        <Link href="/admin/applications" className="inline-flex items-center gap-1.5 text-sm text-ink/70 hover:text-brand-700">
          <ArrowLeft className="size-4" /> All applications
        </Link>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-muted">
            Company:{" "}
            <Link href={`/admin/companies/${app.opportunity.companyId}`} className="font-medium text-brand-700 hover:underline">
              {app.opportunity.company.name}
            </Link>
          </span>
          <ActionButton
            size="sm"
            variant="danger-outline"
            confirm="Delete this application permanently?"
            action={adminDeleteApplicationAction.bind(null, app.id)}
          >
            <Trash2 /> Delete
          </ActionButton>
        </div>
      </div>
      <ApplicantDetail app={app} user={app.user} profile={profile} events={app.events} opportunity={app.opportunity} action={adminUpdateApplicationAction} />
    </>
  );
}
