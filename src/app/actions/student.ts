"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq, inArray, isNull } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import {
  alerts,
  applicationEvents,
  applications,
  companies,
  notifications,
  opportunities,
  savedOpportunities,
  studentProfiles,
  users,
  type ExperienceItem,
  type ProjectItem,
} from "@/db/schema";
import { getCurrentUser, requireUser } from "@/lib/auth";
import { fail, success, zodFieldErrors, type ActionState } from "@/lib/action-state";
import { appUrl, sendMail } from "@/lib/mail";
import { notify } from "@/lib/notify";
import { UploadError, saveUpload } from "@/lib/uploads";
import { csv, optStr, safeUrl, str } from "@/lib/utils";

/* ------------------------------ saved ------------------------------ */

export async function toggleSaveAction(opportunityId: string): Promise<{ ok: boolean; saved?: boolean; error?: string }> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Please log in to save opportunities." };
  if (user.role !== "student") return { ok: false, error: "Only student accounts can save opportunities." };
  const existing = await db.query.savedOpportunities.findFirst({
    where: and(eq(savedOpportunities.userId, user.id), eq(savedOpportunities.opportunityId, opportunityId)),
  });
  if (existing) {
    await db
      .delete(savedOpportunities)
      .where(and(eq(savedOpportunities.userId, user.id), eq(savedOpportunities.opportunityId, opportunityId)));
  } else {
    const opp = await db.query.opportunities.findFirst({ where: eq(opportunities.id, opportunityId) });
    if (!opp) return { ok: false, error: "Opportunity not found." };
    await db.insert(savedOpportunities).values({ userId: user.id, opportunityId }).onConflictDoNothing();
  }
  revalidatePath("/dashboard/saved");
  return { ok: true, saved: !existing };
}

/* ------------------------------ profile ------------------------------ */

const profileSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name").max(80),
  phone: z.string().trim().max(30).optional(),
  headline: z.string().trim().max(120).optional(),
  school: z.string().trim().max(120).optional(),
  course: z.string().trim().max(120).optional(),
  level: z.string().trim().max(40).optional(),
  location: z.string().trim().max(80).optional(),
  bio: z.string().trim().max(1500).optional(),
});

export async function updateProfileAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser(["student"]);
  const parsed = profileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fail("Please check the highlighted fields.", zodFieldErrors(parsed.error.issues));
  const d = parsed.data;

  let avatar: Awaited<ReturnType<typeof saveUpload>> = null;
  let cv: Awaited<ReturnType<typeof saveUpload>> = null;
  try {
    avatar = await saveUpload(formData.get("avatar"), "image");
    cv = await saveUpload(formData.get("cv"), "document");
  } catch (e) {
    if (e instanceof UploadError) return fail(e.message);
    throw e;
  }

  const experience: ExperienceItem[] = [];
  const roles = formData.getAll("exp_role");
  const comps = formData.getAll("exp_company");
  const periods = formData.getAll("exp_period");
  const descs = formData.getAll("exp_description");
  roles.forEach((r, i) => {
    const role = str(r);
    const company = str(comps[i]);
    if (role || company) experience.push({ role, company, period: str(periods[i]), description: str(descs[i]) });
  });
  const projects: ProjectItem[] = [];
  const pTitles = formData.getAll("proj_title");
  const pUrls = formData.getAll("proj_url");
  const pDescs = formData.getAll("proj_description");
  pTitles.forEach((t, i) => {
    const title = str(t);
    if (title) projects.push({ title, url: safeUrl(str(pUrls[i])) ?? undefined, description: str(pDescs[i]) });
  });

  await db
    .update(users)
    .set({ name: d.name, phone: d.phone || null, ...(avatar ? { avatarUrl: avatar.url } : {}) })
    .where(eq(users.id, user.id));
  const values = {
    headline: d.headline || null,
    school: d.school || null,
    course: d.course || null,
    level: d.level || null,
    location: d.location || null,
    bio: d.bio || null,
    skills: csv(formData.get("skills")).slice(0, 30),
    interests: formData.getAll("interests").map(String).slice(0, 20),
    experience,
    projects,
    links: {
      linkedin: safeUrl(str(formData.get("linkedin"))) ?? undefined,
      github: safeUrl(str(formData.get("github"))) ?? undefined,
      portfolio: safeUrl(str(formData.get("portfolio"))) ?? undefined,
      twitter: safeUrl(str(formData.get("twitter"))) ?? undefined,
    },
    ...(cv ? { cvUrl: cv.url, cvName: cv.name } : {}),
  };
  await db
    .insert(studentProfiles)
    .values({ userId: user.id, ...values })
    .onConflictDoUpdate({ target: studentProfiles.userId, set: values });
  revalidatePath("/dashboard", "layout");
  return success("Profile saved.");
}

export async function removeCvAction() {
  const user = await requireUser(["student"]);
  await db.update(studentProfiles).set({ cvUrl: null, cvName: null }).where(eq(studentProfiles.userId, user.id));
  revalidatePath("/dashboard/profile");
}

/* ------------------------------ settings ------------------------------ */

export async function updateAccountAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();
  const name = str(formData.get("name"));
  const email = str(formData.get("email")).toLowerCase();
  const phone = optStr(formData.get("phone"));
  if (name.length < 2) return fail("Enter your full name.", { name: "Required" });
  if (!z.string().email().safeParse(email).success) return fail("Enter a valid email.", { email: "Invalid email" });
  if (email !== user.email.toLowerCase()) {
    const taken = await db.query.users.findFirst({ where: eq(users.email, email) });
    if (taken) return fail("That email is already in use.", { email: "Already in use" });
  }
  await db.update(users).set({ name, email, phone }).where(eq(users.id, user.id));
  revalidatePath("/", "layout");
  return success("Account updated.");
}

export async function updatePreferencesAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser(["student"]);
  await db
    .update(studentProfiles)
    .set({
      notificationPrefs: {
        emailAlerts: formData.get("emailAlerts") === "on",
        applicationUpdates: formData.get("applicationUpdates") === "on",
        newsletter: formData.get("newsletter") === "on",
      },
      profileVisible: formData.get("profileVisible") === "on",
    })
    .where(eq(studentProfiles.userId, user.id));
  return success("Preferences saved.");
}

export async function deleteAccountAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser(["student", "company"]);
  if (str(formData.get("confirm")) !== "DELETE") return fail('Type "DELETE" to confirm.', { confirm: "Type DELETE" });
  if (user.role === "company") {
    await db.delete(companies).where(eq(companies.ownerId, user.id));
  }
  await db.delete(users).where(eq(users.id, user.id));
  const { destroySession } = await import("@/lib/auth");
  await destroySession();
  redirect("/?deleted=1");
}

/* ------------------------------ alerts ------------------------------ */

const alertSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  keywords: z.string().trim().max(120).optional(),
  frequency: z.enum(["instant", "daily", "weekly"]).default("weekly"),
});

/** Public "Get Opportunity Alerts" signup and dashboard alert creation. */
export async function createAlertAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  const raw = Object.fromEntries(formData);
  if (!raw.email && user) raw.email = user.email;
  const parsed = alertSchema.safeParse(raw);
  if (!parsed.success) return fail("Please check the highlighted fields.", zodFieldErrors(parsed.error.issues));
  const fieldIds = formData.getAll("fieldIds").map(String).filter(Boolean);
  const locations = formData.getAll("locations").map(String).filter(Boolean);
  const types = formData.getAll("types").map(String).filter(Boolean);
  const workModes = formData.getAll("workModes").map(String).filter(Boolean);

  if (!user) {
    const existing = await db.query.alerts.findFirst({ where: and(eq(alerts.email, parsed.data.email), isNull(alerts.userId)) });
    if (existing) return success("You're already subscribed. We'll keep sending you new opportunities.");
  }
  await db.insert(alerts).values({
    userId: user?.role === "student" ? user.id : null,
    email: parsed.data.email,
    keywords: parsed.data.keywords || null,
    frequency: parsed.data.frequency,
    fieldIds,
    locations,
    types,
    workModes,
  });
  revalidatePath("/dashboard/alerts");
  return success(user ? "Alert created." : "You're subscribed! We'll email you when new opportunities match.");
}

export async function toggleAlertAction(id: string, active: boolean) {
  const user = await requireUser(["student"]);
  await db.update(alerts).set({ active }).where(and(eq(alerts.id, id), eq(alerts.userId, user.id)));
  revalidatePath("/dashboard/alerts");
}

export async function deleteAlertAction(id: string) {
  const user = await requireUser(["student"]);
  await db.delete(alerts).where(and(eq(alerts.id, id), eq(alerts.userId, user.id)));
  revalidatePath("/dashboard/alerts");
}

/* ------------------------------ notifications ------------------------------ */

export async function markNotificationsReadAction(ids?: string[]) {
  const user = await requireUser();
  const where = ids?.length
    ? and(eq(notifications.userId, user.id), inArray(notifications.id, ids))
    : eq(notifications.userId, user.id);
  await db.update(notifications).set({ readAt: new Date() }).where(and(where, isNull(notifications.readAt)));
  revalidatePath("/", "layout");
}

/* ------------------------------ applications ------------------------------ */

async function loadApplyContext(opportunityId: string) {
  const user = await requireUser(["student"]);
  const opp = await db.query.opportunities.findFirst({
    where: eq(opportunities.id, opportunityId),
    with: { company: true },
  });
  if (!opp || opp.status !== "published") return { user, opp: null };
  return { user, opp };
}

const personalSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name").max(80),
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  phone: z.string().trim().min(7, "Enter a valid phone number").max(30),
  course: z.string().trim().min(2, "Enter your course or field of study").max(120),
  school: z.string().trim().min(2, "Enter your school").max(120),
  level: z.string().trim().min(1, "Select your current level"),
});

export async function saveApplicationStepAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const opportunityId = str(formData.get("opportunityId"));
  const step = Number(formData.get("step"));
  const intent = str(formData.get("intent")); // "next" | "save"
  const { user, opp } = await loadApplyContext(opportunityId);
  if (!opp) return fail("This opportunity is no longer accepting applications.");

  const existing = await db.query.applications.findFirst({
    where: and(eq(applications.opportunityId, opp.id), eq(applications.userId, user.id)),
  });
  if (existing && existing.status !== "draft") return fail("You have already applied for this opportunity.");

  if (step === 1) {
    const parsed = personalSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) return fail("Please check the highlighted fields.", zodFieldErrors(parsed.error.issues));
    const values = { ...parsed.data, step: Math.max(existing?.step ?? 1, 2) };
    if (existing) await db.update(applications).set(values).where(eq(applications.id, existing.id));
    else await db.insert(applications).values({ ...values, opportunityId: opp.id, userId: user.id, status: "draft" });
    // Keep the student's profile in sync with what they just typed.
    await db
      .update(studentProfiles)
      .set({ school: parsed.data.school, course: parsed.data.course, level: parsed.data.level })
      .where(eq(studentProfiles.userId, user.id));
    if (intent === "save") return success("Progress saved. You can continue later from your dashboard.");
    redirect(`/opportunities/${opp.slug}/apply?step=2`);
  }

  if (step === 2) {
    if (!existing) redirect(`/opportunities/${opp.slug}/apply?step=1`);
    let cv: Awaited<ReturnType<typeof saveUpload>> = null;
    let letter: Awaited<ReturnType<typeof saveUpload>> = null;
    try {
      cv = await saveUpload(formData.get("cv"), "document");
      letter = await saveUpload(formData.get("coverLetterFile"), "document");
    } catch (e) {
      if (e instanceof UploadError) return fail(e.message);
      throw e;
    }
    const useProfileCv = formData.get("useProfileCv") === "on";
    let cvUrl = cv?.url ?? existing.cvUrl;
    let cvName = cv?.name ?? existing.cvName;
    if (!cv && useProfileCv) {
      const profile = await db.query.studentProfiles.findFirst({ where: eq(studentProfiles.userId, user.id) });
      cvUrl = profile?.cvUrl ?? cvUrl;
      cvName = profile?.cvName ?? cvName;
    }
    const coverLetter = optStr(formData.get("coverLetter"));
    const portfolioRaw = str(formData.get("portfolioUrl"));
    const portfolioUrl = portfolioRaw ? safeUrl(portfolioRaw) : null;
    if (portfolioRaw && !portfolioUrl) return fail("Enter a valid portfolio link.", { portfolioUrl: "Invalid URL" });
    if (intent !== "save") {
      if (!cvUrl) return fail("Please upload your CV to continue.", { cv: "Your CV is required" });
      if (opp.requireCoverLetter && !coverLetter && !letter && !existing.coverLetterUrl)
        return fail("This opportunity requires a cover letter.", { coverLetter: "Cover letter is required" });
    }
    await db
      .update(applications)
      .set({
        cvUrl,
        cvName,
        coverLetter,
        portfolioUrl,
        ...(letter ? { coverLetterUrl: letter.url, coverLetterName: letter.name } : {}),
        step: intent === "save" ? existing.step : 3,
      })
      .where(eq(applications.id, existing.id));
    if (cv) {
      // Remember the most recent CV on the profile if none exists yet.
      await db
        .update(studentProfiles)
        .set({ cvUrl: cv.url, cvName: cv.name })
        .where(and(eq(studentProfiles.userId, user.id), isNull(studentProfiles.cvUrl)));
    }
    if (intent === "save") return success("Progress saved. You can continue later from your dashboard.");
    redirect(`/opportunities/${opp.slug}/apply?step=3`);
  }

  if (step === 3) {
    if (!existing || !existing.cvUrl) redirect(`/opportunities/${opp.slug}/apply?step=2`);
    if (formData.get("agree") !== "on") return fail("Please confirm that your information is accurate.", { agree: "Required" });
    const now = new Date();
    await db.update(applications).set({ status: "submitted", submittedAt: now, step: 3 }).where(eq(applications.id, existing.id));
    await db.insert(applicationEvents).values({ applicationId: existing.id, status: "submitted", note: "Application submitted" });
    await notify(user.id, {
      type: "application",
      title: `Your application to ${opp.title} was submitted`,
      body: `${opp.company.name} will review your application.`,
      link: `/dashboard/applications/${existing.id}`,
    });
    if (opp.company.ownerId) {
      await notify(opp.company.ownerId, {
        type: "application",
        title: `New application for ${opp.title}`,
        body: `${existing.fullName} just applied.`,
        link: `/company/applicants/${existing.id}`,
      });
      const owner = await db.query.users.findFirst({ where: eq(users.id, opp.company.ownerId) });
      if (owner)
        await sendMail({
          to: owner.email,
          subject: `New application: ${opp.title}`,
          text: `${existing.fullName} applied for ${opp.title}.`,
          cta: { label: "Review application", url: appUrl(`/company/applicants/${existing.id}`) },
        });
    }
    await sendMail({
      to: existing.email,
      subject: `Application submitted: ${opp.title}`,
      text: `Hi ${existing.fullName.split(" ")[0]},\n\nYour application for ${opp.title} at ${opp.company.name} has been submitted successfully. We'll notify you when the status changes.`,
      cta: { label: "Track your application", url: appUrl(`/dashboard/applications/${existing.id}`) },
    });
    revalidatePath("/dashboard", "layout");
    redirect(`/opportunities/${opp.slug}/apply/success`);
  }
  return fail("Unknown step.");
}

/** Track an application that was made on an external site or via email. */
export async function trackExternalApplicationAction(opportunityId: string) {
  const { user, opp } = await loadApplyContext(opportunityId);
  if (!opp) return { ok: false };
  const profile = await db.query.studentProfiles.findFirst({ where: eq(studentProfiles.userId, user.id) });
  const [app] = await db
    .insert(applications)
    .values({
      opportunityId: opp.id,
      userId: user.id,
      fullName: user.name,
      email: user.email,
      phone: user.phone,
      school: profile?.school,
      course: profile?.course,
      level: profile?.level,
      status: "submitted",
      submittedAt: new Date(),
      companyNote: "Applied externally",
    })
    .onConflictDoNothing()
    .returning();
  if (app) {
    await db.insert(applicationEvents).values({ applicationId: app.id, status: "submitted", note: "Applied via external link" });
  }
  revalidatePath("/dashboard", "layout");
  return { ok: true };
}

export async function withdrawApplicationAction(applicationId: string) {
  const user = await requireUser(["student"]);
  const app = await db.query.applications.findFirst({
    where: and(eq(applications.id, applicationId), eq(applications.userId, user.id)),
  });
  if (!app) return;
  if (app.status === "draft") {
    await db.delete(applications).where(eq(applications.id, app.id));
  } else if (!["accepted", "rejected", "withdrawn"].includes(app.status)) {
    await db.update(applications).set({ status: "withdrawn" }).where(eq(applications.id, app.id));
    await db.insert(applicationEvents).values({ applicationId: app.id, status: "withdrawn", note: "Withdrawn by applicant" });
  }
  revalidatePath("/dashboard", "layout");
  redirect("/dashboard/applications");
}
