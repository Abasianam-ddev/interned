import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { applicationEvents, applications, studentProfiles, type ApplicationStatus } from "@/db/schema";
import { APPLICATION_STATUS } from "./constants";
import { appUrl, sendMail } from "./mail";
import { notify } from "./notify";

const STATUS_MESSAGES: Partial<Record<ApplicationStatus, string>> = {
  under_review: "is now being reviewed",
  shortlisted: "has been shortlisted 🎉",
  interview: "has moved to the interview stage",
  accepted: "has been accepted — congratulations! 🎉",
  rejected: "was not successful this time",
};

/** Shared by company and admin: moves an application to a new status and informs the student. */
export async function applyStatusChange(
  app: { id: string; userId: string; email: string; fullName: string; status: ApplicationStatus },
  opp: { title: string; companyName: string },
  status: ApplicationStatus,
  note: string | null,
) {
  if (app.status === status && !note) return;
  await db.update(applications).set({ status, ...(note ? { companyNote: note } : {}) }).where(eq(applications.id, app.id));
  await db.insert(applicationEvents).values({ applicationId: app.id, status, note });
  const phrase = STATUS_MESSAGES[status] ?? `was updated to ${APPLICATION_STATUS[status].label}`;
  await notify(app.userId, {
    type: "application",
    title: `Your application to ${opp.title} ${phrase}`,
    body: note ?? undefined,
    link: `/dashboard/applications/${app.id}`,
  });
  const profile = await db.query.studentProfiles.findFirst({ where: eq(studentProfiles.userId, app.userId), columns: { notificationPrefs: true } });
  if (profile?.notificationPrefs.applicationUpdates ?? true) {
    await sendMail({
      to: app.email,
      subject: `Application update: ${opp.title}`,
      text: `Hi ${app.fullName.split(" ")[0]},\n\nYour application for ${opp.title} at ${opp.companyName} ${phrase}.${note ? `\n\nMessage from ${opp.companyName}:\n${note}` : ""}`,
      cta: { label: "View application", url: appUrl(`/dashboard/applications/${app.id}`) },
    });
  }
}

