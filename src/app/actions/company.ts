"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { applications, companies, opportunities, users } from "@/db/schema";
import { getCompanyForUser, requireUser } from "@/lib/auth";
import { fail, success, zodFieldErrors, type ActionState } from "@/lib/action-state";
import { dispatchInstantAlerts } from "@/lib/alerts";
import { applyStatusChange } from "@/lib/applications";
import { companyValuesFromForm } from "@/lib/company-form";
import { APPLICATION_STATUS } from "@/lib/constants";
import { notify } from "@/lib/notify";
import { parseOpportunityForm, uniqueOpportunitySlug } from "@/lib/opportunity-form";
import { randomSuffix, slugify, str } from "@/lib/utils";

async function ctx() {
  const user = await requireUser(["company"]);
  const company = await getCompanyForUser(user.id);
  if (!company) redirect("/company/setup");
  if (company.status === "suspended") throw new Error("Your company account is suspended.");
  return { user, company };
}

async function notifyAdmins(title: string, link: string) {
  const admins = await db.select({ id: users.id }).from(users).where(eq(users.role, "admin"));
  await Promise.all(admins.map((a) => notify(a.id, { type: "opportunity", title, link })));
}

/* ------------------------------ opportunities ------------------------------ */

export async function saveCompanyOpportunityAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { user, company } = await ctx();
  const id = str(formData.get("id"));
  const intent = str(formData.get("intent")) === "draft" ? "draft" : "submit";
  const parsed = parseOpportunityForm(formData);
  if (!parsed.ok) return fail("Please fix the highlighted fields.", parsed.fieldErrors);

  const existing = id
    ? await db.query.opportunities.findFirst({ where: and(eq(opportunities.id, id), eq(opportunities.companyId, company.id)) })
    : null;
  if (id && !existing) return fail("Opportunity not found.");

  let status: typeof opportunities.$inferSelect.status;
  if (intent === "draft") status = existing && existing.status !== "draft" ? existing.status : "draft";
  else if (existing?.status === "closed") status = "closed";
  else status = company.verified ? "published" : "pending";

  const firstPublish = status === "published" && !existing?.publishedAt;
  const values = {
    ...parsed.values,
    status,
    verified: company.verified,
    rejectionReason: status === "pending" ? null : existing?.rejectionReason ?? null,
    ...(firstPublish ? { publishedAt: new Date() } : {}),
  };

  let oppId: string;
  let slug: string;
  if (existing) {
    await db.update(opportunities).set(values).where(eq(opportunities.id, existing.id));
    oppId = existing.id;
    slug = existing.slug;
  } else {
    slug = await uniqueOpportunitySlug(parsed.values.title, company.name);
    const [row] = await db
      .insert(opportunities)
      .values({ ...values, slug, companyId: company.id, postedById: user.id })
      .returning({ id: opportunities.id });
    oppId = row.id;
  }

  if (firstPublish) await dispatchInstantAlerts(oppId);
  if (status === "pending" && existing?.status !== "pending") {
    await notifyAdmins(`${company.name} submitted "${parsed.values.title}" for review`, "/admin/opportunities?status=pending");
  }
  revalidatePath("/company", "layout");
  revalidatePath("/opportunities");
  revalidatePath("/");
  const msg =
    status === "draft"
      ? "Draft saved."
      : status === "published"
        ? "Your opportunity is live!"
        : status === "pending"
          ? "Submitted for review. We'll notify you once it's approved."
          : "Opportunity updated.";
  redirect(`/company/opportunities?saved=${encodeURIComponent(msg)}&slug=${slug}`);
}

export async function setOpportunityStatusAction(id: string, next: "closed" | "reopen") {
  const { company } = await ctx();
  const opp = await db.query.opportunities.findFirst({ where: and(eq(opportunities.id, id), eq(opportunities.companyId, company.id)) });
  if (!opp) return;
  if (next === "closed") {
    await db.update(opportunities).set({ status: "closed" }).where(eq(opportunities.id, id));
  } else {
    const status = company.verified || opp.publishedAt ? "published" : "pending";
    await db.update(opportunities).set({ status }).where(eq(opportunities.id, id));
  }
  revalidatePath("/company", "layout");
  revalidatePath("/opportunities");
}

export async function deleteOpportunityAction(id: string) {
  const { company } = await ctx();
  await db.delete(opportunities).where(and(eq(opportunities.id, id), eq(opportunities.companyId, company.id)));
  revalidatePath("/company", "layout");
  revalidatePath("/opportunities");
}

/* ------------------------------ applicants ------------------------------ */

const statusSchema = z.object({
  applicationId: z.string().uuid(),
  status: z.enum(["under_review", "shortlisted", "interview", "accepted", "rejected"]),
  note: z.string().trim().max(2000).optional(),
});

export async function updateApplicationStatusAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { company } = await ctx();
  const parsed = statusSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fail("Choose a valid status.", zodFieldErrors(parsed.error.issues));
  const app = await db.query.applications.findFirst({
    where: eq(applications.id, parsed.data.applicationId),
    with: { opportunity: true },
  });
  if (!app || app.opportunity.companyId !== company.id) return fail("Application not found.");
  if (app.status === "withdrawn" || app.status === "draft") return fail("This application can no longer be updated.");
  await applyStatusChange(app, { title: app.opportunity.title, companyName: company.name }, parsed.data.status, parsed.data.note || null);
  revalidatePath("/company", "layout");
  return success(`Status updated to ${APPLICATION_STATUS[parsed.data.status].label}. The applicant has been notified.`);
}


/* ------------------------------ company profile ------------------------------ */

export async function updateCompanyProfileAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { company } = await ctx();
  const res = await companyValuesFromForm(formData);
  if ("error" in res) return res.error!;
  const values = { ...res.values };
  if (formData.get("removeLogo") === "on") Object.assign(values, { logoUrl: null });
  await db.update(companies).set(values).where(eq(companies.id, company.id));
  revalidatePath("/company", "layout");
  revalidatePath(`/companies/${company.slug}`);
  return success("Company profile saved.");
}

export async function createCompanyAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser(["company"]);
  if (await getCompanyForUser(user.id)) redirect("/company");
  const res = await companyValuesFromForm(formData);
  if ("error" in res) return res.error!;
  let slug = slugify(res.values.name);
  if (await db.query.companies.findFirst({ where: eq(companies.slug, slug) })) slug = `${slug}-${randomSuffix()}`;
  await db.insert(companies).values({ ...res.values, slug, ownerId: user.id, status: "active" });
  redirect("/company");
}
