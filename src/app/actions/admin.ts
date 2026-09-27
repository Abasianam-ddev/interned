"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq, ne, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import {
  alerts,
  applications,
  companies,
  contactMessages,
  faqs,
  fields,
  opportunities,
  pages,
  reports,
  resources,
  settings,
  studentProfiles,
  users,
  type ApplicationStatus,
} from "@/db/schema";
import { hashPassword, requireUser } from "@/lib/auth";
import { fail, success, zodFieldErrors, type ActionState } from "@/lib/action-state";
import { dispatchInstantAlerts } from "@/lib/alerts";
import { applyStatusChange } from "@/lib/applications";
import { companyValuesFromForm } from "@/lib/company-form";
import { APPLICATION_STATUS, RESOURCE_CATEGORIES } from "@/lib/constants";
import { appUrl, sendMail } from "@/lib/mail";
import { notify } from "@/lib/notify";
import { parseOpportunityForm, uniqueOpportunitySlug } from "@/lib/opportunity-form";
import { DEFAULT_SETTINGS } from "@/lib/settings";
import { UploadError, saveUpload } from "@/lib/uploads";
import { optInt, optStr, randomSuffix, slugify, str } from "@/lib/utils";

const admin = () => requireUser(["admin"]);

function refreshPublic() {
  revalidatePath("/", "layout");
}

/* ------------------------------ opportunities ------------------------------ */

export async function saveAdminOpportunityAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const me = await admin();
  const id = str(formData.get("id"));
  const companyId = str(formData.get("companyId"));
  const parsed = parseOpportunityForm(formData);
  const errors = parsed.ok ? {} : parsed.fieldErrors;
  if (!companyId) errors.companyId = "Select a company";
  if (!parsed.ok || !companyId) return fail("Please fix the highlighted fields.", errors);

  const company = await db.query.companies.findFirst({ where: eq(companies.id, companyId) });
  if (!company) return fail("Company not found.", { companyId: "Company not found" });
  const status = z
    .enum(["draft", "pending", "published", "closed", "rejected"])
    .catch("published")
    .parse(str(formData.get("status")) || (str(formData.get("intent")) === "draft" ? "draft" : "published"));
  const existing = id ? await db.query.opportunities.findFirst({ where: eq(opportunities.id, id) }) : null;
  const firstPublish = status === "published" && !existing?.publishedAt;
  const values = {
    ...parsed.values,
    companyId,
    status,
    verified: formData.get("verified") === "on",
    featured: formData.get("featured") === "on",
    rejectionReason: status === "rejected" ? optStr(formData.get("rejectionReason")) : null,
    ...(firstPublish ? { publishedAt: new Date() } : {}),
  };
  let oppId = existing?.id;
  if (existing) {
    await db.update(opportunities).set(values).where(eq(opportunities.id, existing.id));
  } else {
    const slug = await uniqueOpportunitySlug(parsed.values.title, company.name);
    const [row] = await db.insert(opportunities).values({ ...values, slug, postedById: me.id }).returning({ id: opportunities.id });
    oppId = row.id;
  }
  if (firstPublish && oppId) await dispatchInstantAlerts(oppId);
  refreshPublic();
  redirect(`/admin/opportunities?saved=${encodeURIComponent(existing ? "Opportunity updated." : "Opportunity created.")}`);
}

export async function moderateOpportunityAction(id: string, decision: "approve" | "reject" | "close" | "publish", reason?: string) {
  await admin();
  const opp = await db.query.opportunities.findFirst({ where: eq(opportunities.id, id), with: { company: true } });
  if (!opp) return;
  if (decision === "approve" || decision === "publish") {
    const firstPublish = !opp.publishedAt;
    await db
      .update(opportunities)
      .set({ status: "published", rejectionReason: null, ...(firstPublish ? { publishedAt: new Date() } : {}) })
      .where(eq(opportunities.id, id));
    if (firstPublish) await dispatchInstantAlerts(id);
    if (opp.company.ownerId && decision === "approve") {
      await notify(opp.company.ownerId, {
        type: "opportunity",
        title: `"${opp.title}" was approved and is now live`,
        link: `/opportunities/${opp.slug}`,
      });
    }
  } else if (decision === "reject") {
    await db.update(opportunities).set({ status: "rejected", rejectionReason: reason || null }).where(eq(opportunities.id, id));
    if (opp.company.ownerId) {
      await notify(opp.company.ownerId, {
        type: "opportunity",
        title: `"${opp.title}" was not approved`,
        body: reason || undefined,
        link: `/company/opportunities/${opp.id}/edit`,
      });
      const owner = await db.query.users.findFirst({ where: eq(users.id, opp.company.ownerId) });
      if (owner)
        await sendMail({
          to: owner.email,
          subject: `Your opportunity "${opp.title}" needs changes`,
          text: `Hi ${owner.name},\n\nYour opportunity "${opp.title}" was not approved.${reason ? `\n\nReason: ${reason}` : ""}\n\nYou can update it and resubmit from your dashboard.`,
          cta: { label: "Edit opportunity", url: appUrl(`/company/opportunities/${opp.id}/edit`) },
        });
    }
  } else if (decision === "close") {
    await db.update(opportunities).set({ status: "closed" }).where(eq(opportunities.id, id));
  }
  refreshPublic();
}

export async function toggleOpportunityFlagAction(id: string, flag: "verified" | "featured", value: boolean) {
  await admin();
  await db
    .update(opportunities)
    .set(flag === "verified" ? { verified: value } : { featured: value })
    .where(eq(opportunities.id, id));
  refreshPublic();
}

export async function adminDeleteOpportunityAction(id: string) {
  await admin();
  await db.delete(opportunities).where(eq(opportunities.id, id));
  refreshPublic();
}

/* ------------------------------ companies ------------------------------ */

export async function saveAdminCompanyAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await admin();
  const id = str(formData.get("id"));
  const res = await companyValuesFromForm(formData);
  if ("error" in res) return res.error!;
  const ownerEmail = str(formData.get("ownerEmail")).toLowerCase();
  let ownerId: string | null | undefined;
  if (ownerEmail) {
    const owner = await db.query.users.findFirst({ where: sql`lower(${users.email}) = ${ownerEmail}` });
    if (!owner) return fail("No user with that email exists.", { ownerEmail: "User not found" });
    if (owner.role !== "company") return fail("The owner must be a company account.", { ownerEmail: "Not a company account" });
    const other = await db.query.companies.findFirst({ where: and(eq(companies.ownerId, owner.id), id ? ne(companies.id, id) : undefined) });
    if (other) return fail("That user already manages another company.", { ownerEmail: `Already owns ${other.name}` });
    ownerId = owner.id;
  } else if (formData.has("ownerEmail")) {
    ownerId = null;
  }
  const verified = formData.get("verified") === "on";
  const status = z.enum(["pending", "active", "suspended"]).catch("active").parse(str(formData.get("status")));
  const values = { ...res.values, verified, status, ...(ownerId !== undefined ? { ownerId } : {}) };
  if (id) {
    const before = await db.query.companies.findFirst({ where: eq(companies.id, id) });
    await db.update(companies).set(values).where(eq(companies.id, id));
    if (before && before.verified !== verified) {
      await db.update(opportunities).set({ verified }).where(eq(opportunities.companyId, id));
      if (verified && before.ownerId)
        await notify(before.ownerId, { type: "welcome", title: `${before.name} is now a Verified Company 🎉`, link: "/company" });
    }
  } else {
    let slug = slugify(res.values.name);
    if (await db.query.companies.findFirst({ where: eq(companies.slug, slug) })) slug = `${slug}-${randomSuffix()}`;
    await db.insert(companies).values({ ...values, slug });
  }
  refreshPublic();
  redirect(`/admin/companies?saved=${encodeURIComponent(id ? "Company updated." : "Company created.")}`);
}

export async function setCompanyVerifiedAction(id: string, verified: boolean) {
  await admin();
  const c = await db.query.companies.findFirst({ where: eq(companies.id, id) });
  if (!c) return;
  await db.update(companies).set({ verified }).where(eq(companies.id, id));
  await db.update(opportunities).set({ verified }).where(eq(opportunities.companyId, id));
  if (verified && c.ownerId) await notify(c.ownerId, { type: "welcome", title: `${c.name} is now a Verified Company 🎉`, link: "/company" });
  refreshPublic();
}

export async function setCompanyStatusAction(id: string, status: "active" | "suspended") {
  await admin();
  await db.update(companies).set({ status }).where(eq(companies.id, id));
  refreshPublic();
}

export async function deleteCompanyAction(id: string) {
  await admin();
  await db.delete(companies).where(eq(companies.id, id));
  refreshPublic();
}

/* ------------------------------ users ------------------------------ */

const userSchema = z.object({
  name: z.string().trim().min(2, "Enter a name"),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  role: z.enum(["student", "company", "admin"]),
  status: z.enum(["active", "suspended"]),
  phone: z.string().trim().optional(),
  password: z.string().optional(),
});

export async function saveUserAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const me = await admin();
  const id = str(formData.get("id"));
  const parsed = userSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fail("Please check the highlighted fields.", zodFieldErrors(parsed.error.issues));
  const d = parsed.data;
  if (id === me.id && (d.role !== "admin" || d.status !== "active")) return fail("You can't demote or suspend your own account.");
  const clash = await db.query.users.findFirst({ where: sql`lower(${users.email}) = ${d.email}` });
  if (clash && clash.id !== id) return fail("Another account uses this email.", { email: "Already in use" });
  if (d.password && d.password.length < 8) return fail("Password must be at least 8 characters.", { password: "Too short" });
  if (!id && !d.password) return fail("Set an initial password.", { password: "Required" });
  const values = {
    name: d.name,
    email: d.email,
    role: d.role,
    status: d.status,
    phone: d.phone || null,
    ...(d.password ? { passwordHash: await hashPassword(d.password) } : {}),
  };
  if (id) {
    await db.update(users).set(values).where(eq(users.id, id));
    if (d.role === "student") await db.insert(studentProfiles).values({ userId: id }).onConflictDoNothing();
  } else {
    const [u] = await db
      .insert(users)
      .values({ ...values, passwordHash: values.passwordHash! })
      .returning();
    if (u.role === "student") await db.insert(studentProfiles).values({ userId: u.id });
  }
  revalidatePath("/admin/users");
  redirect(`/admin/users?saved=${encodeURIComponent(id ? "User updated." : "User created.")}`);
}

export async function setUserStatusAction(id: string, status: "active" | "suspended") {
  const me = await admin();
  if (id === me.id) return;
  await db.update(users).set({ status }).where(eq(users.id, id));
  revalidatePath("/admin/users");
}

export async function deleteUserAction(id: string) {
  const me = await admin();
  if (id === me.id) return;
  await db.delete(users).where(eq(users.id, id));
  revalidatePath("/admin/users");
}

/* ------------------------------ applications ------------------------------ */

export async function adminUpdateApplicationAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await admin();
  const applicationId = str(formData.get("applicationId"));
  const status = str(formData.get("status")) as ApplicationStatus;
  if (!(status in APPLICATION_STATUS) || status === "draft") return fail("Choose a valid status.");
  const app = await db.query.applications.findFirst({
    where: eq(applications.id, applicationId),
    with: { opportunity: { with: { company: true } } },
  });
  if (!app) return fail("Application not found.");
  await applyStatusChange(app, { title: app.opportunity.title, companyName: app.opportunity.company.name }, status, optStr(formData.get("note")));
  revalidatePath("/admin/applications");
  return success("Application updated and applicant notified.");
}

export async function adminDeleteApplicationAction(id: string) {
  await admin();
  await db.delete(applications).where(eq(applications.id, id));
  revalidatePath("/admin/applications");
  redirect("/admin/applications");
}

/* ------------------------------ reports ------------------------------ */

export async function updateReportAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await admin();
  const id = str(formData.get("id"));
  const status = z.enum(["open", "reviewing", "resolved", "dismissed"]).safeParse(str(formData.get("status")));
  if (!status.success) return fail("Choose a valid status.");
  await db.update(reports).set({ status: status.data, adminNote: optStr(formData.get("adminNote")) }).where(eq(reports.id, id));
  revalidatePath("/admin/reports");
  return success("Report updated.");
}

/* ------------------------------ resources ------------------------------ */

const resourceSchema = z.object({
  title: z.string().trim().min(4, "Enter a title").max(160),
  category: z.enum(RESOURCE_CATEGORIES.map((c) => c.value) as [string, ...string[]], { message: "Choose a category" }),
  excerpt: z.string().trim().max(400).optional(),
  content: z.string().trim().min(20, "Write some content"),
  authorName: z.string().trim().max(80).optional(),
  readMinutes: z.string().optional(),
  coverUrl: z.string().trim().optional(),
});

export async function saveResourceAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await admin();
  const id = str(formData.get("id"));
  const parsed = resourceSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fail("Please check the highlighted fields.", zodFieldErrors(parsed.error.issues));
  let cover: Awaited<ReturnType<typeof saveUpload>> = null;
  try {
    cover = await saveUpload(formData.get("cover"), "image");
  } catch (e) {
    if (e instanceof UploadError) return fail(e.message);
    throw e;
  }
  const d = parsed.data;
  const words = d.content.split(/\s+/).length;
  const values = {
    title: d.title,
    category: d.category,
    excerpt: d.excerpt || null,
    content: d.content,
    authorName: d.authorName || "Internly Team",
    readMinutes: optInt(d.readMinutes ?? null) ?? Math.max(1, Math.round(words / 200)),
    coverUrl: cover?.url ?? (d.coverUrl || null),
    published: formData.get("published") === "on",
    featured: formData.get("featured") === "on",
  };
  if (id) {
    const before = await db.query.resources.findFirst({ where: eq(resources.id, id) });
    await db
      .update(resources)
      .set({ ...values, ...(values.published && !before?.published ? { publishedAt: new Date() } : {}) })
      .where(eq(resources.id, id));
  } else {
    let slug = slugify(d.title);
    if (await db.query.resources.findFirst({ where: eq(resources.slug, slug) })) slug = `${slug}-${randomSuffix()}`;
    await db.insert(resources).values({ ...values, slug, publishedAt: new Date() });
  }
  refreshPublic();
  redirect(`/admin/resources?saved=${encodeURIComponent(id ? "Resource updated." : "Resource created.")}`);
}

export async function deleteResourceAction(id: string) {
  await admin();
  await db.delete(resources).where(eq(resources.id, id));
  refreshPublic();
}

/* ------------------------------ faqs ------------------------------ */

export async function saveFaqAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await admin();
  const id = str(formData.get("id"));
  const question = str(formData.get("question"));
  const answer = str(formData.get("answer"));
  if (question.length < 5) return fail("Enter the question.", { question: "Required" });
  if (answer.length < 5) return fail("Enter the answer.", { answer: "Required" });
  const values = {
    question,
    answer,
    category: str(formData.get("category")) || "General",
    sortOrder: optInt(formData.get("sortOrder")) ?? 0,
    published: formData.get("published") === "on",
  };
  if (id) await db.update(faqs).set(values).where(eq(faqs.id, id));
  else await db.insert(faqs).values(values);
  revalidatePath("/admin/faqs");
  revalidatePath("/faq");
  return success(id ? "FAQ updated." : "FAQ added.");
}

export async function deleteFaqAction(id: string) {
  await admin();
  await db.delete(faqs).where(eq(faqs.id, id));
  revalidatePath("/admin/faqs");
  revalidatePath("/faq");
}

/* ------------------------------ fields ------------------------------ */

export async function saveFieldAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await admin();
  const id = str(formData.get("id"));
  const name = str(formData.get("name"));
  if (name.length < 2) return fail("Enter a name.", { name: "Required" });
  const slug = slugify(str(formData.get("slug")) || name);
  const clash = await db.query.fields.findFirst({ where: eq(fields.slug, slug) });
  if (clash && clash.id !== id) return fail("Another field uses that slug.", { slug: "Already in use" });
  const values = {
    name,
    slug,
    icon: str(formData.get("icon")) || "briefcase",
    description: optStr(formData.get("description")),
    sortOrder: optInt(formData.get("sortOrder")) ?? 0,
  };
  if (id) await db.update(fields).set(values).where(eq(fields.id, id));
  else await db.insert(fields).values(values);
  refreshPublic();
  return success(id ? "Field updated." : "Field added.");
}

export async function deleteFieldAction(id: string) {
  await admin();
  await db.delete(fields).where(eq(fields.id, id));
  refreshPublic();
}

/* ------------------------------ pages ------------------------------ */

export async function savePageAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await admin();
  const slug = str(formData.get("slug"));
  const title = str(formData.get("title"));
  const content = str(formData.get("content"));
  if (!title) return fail("Enter a title.", { title: "Required" });
  if (content.length < 10) return fail("Add some content.", { content: "Required" });
  await db
    .insert(pages)
    .values({ slug, title, content, summary: optStr(formData.get("summary")) })
    .onConflictDoUpdate({ target: pages.slug, set: { title, content, summary: optStr(formData.get("summary")), updatedAt: new Date() } });
  refreshPublic();
  return success("Page saved.");
}

/* ------------------------------ messages & subscribers ------------------------------ */

export async function setMessageStatusAction(id: string, status: "new" | "read" | "replied" | "archived") {
  await admin();
  await db.update(contactMessages).set({ status }).where(eq(contactMessages.id, id));
  revalidatePath("/admin/messages");
}

export async function deleteMessageAction(id: string) {
  await admin();
  await db.delete(contactMessages).where(eq(contactMessages.id, id));
  revalidatePath("/admin/messages");
}

export async function deleteAlertAdminAction(id: string) {
  await admin();
  await db.delete(alerts).where(eq(alerts.id, id));
  revalidatePath("/admin/subscribers");
}

/* ------------------------------ settings ------------------------------ */

export async function saveSettingsAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await admin();
  let hero: Awaited<ReturnType<typeof saveUpload>> = null;
  try {
    hero = await saveUpload(formData.get("heroImageFile"), "image");
  } catch (e) {
    if (e instanceof UploadError) return fail(e.message);
    throw e;
  }
  const textKeys = [
    "heroBadge",
    "heroTitleLine1",
    "heroTitleLine2",
    "heroSubtitle",
    "heroScript",
    "heroImage",
    "statOpportunities",
    "statCompanies",
    "statStudents",
    "contactEmail",
    "contactPhone",
    "contactAddress",
    "businessHours",
    "announcement",
  ] as const;
  const entries: { key: string; value: unknown }[] = textKeys.map((k) => ({
    key: k,
    value: str(formData.get(k)) || (k === "announcement" ? "" : DEFAULT_SETTINGS[k]),
  }));
  if (hero) entries.find((e) => e.key === "heroImage")!.value = hero.url;
  entries.push({
    key: "social",
    value: {
      twitter: str(formData.get("social_twitter")),
      instagram: str(formData.get("social_instagram")),
      linkedin: str(formData.get("social_linkedin")),
      facebook: str(formData.get("social_facebook")),
    },
  });
  for (const e of entries) {
    await db
      .insert(settings)
      .values({ key: e.key, value: e.value })
      .onConflictDoUpdate({ target: settings.key, set: { value: e.value, updatedAt: new Date() } });
  }
  refreshPublic();
  return success("Site settings saved.");
}
