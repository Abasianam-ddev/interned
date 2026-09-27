import "server-only";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { opportunities } from "@/db/schema";
import { csv, lines, randomSuffix, safeUrl, slugify, str } from "./utils";
import { zodFieldErrors } from "./action-state";

const schema = z
  .object({
    title: z.string().trim().min(4, "Enter a descriptive title").max(120),
    fieldId: z.string().uuid("Select a field").or(z.literal("")).optional(),
    type: z.enum(["internship", "siwes", "graduate", "remote_internship", "volunteer", "entry_level"]),
    workMode: z.enum(["remote", "onsite", "hybrid"]),
    location: z.string().trim().min(2, "Enter a location").max(80),
    eligibility: z.enum(["students", "graduates", "both"]),
    paid: z.enum(["paid", "unpaid"]),
    stipend: z.string().optional(),
    durationMonths: z.string().optional(),
    openings: z.string().optional(),
    summary: z.string().trim().max(240).optional(),
    description: z.string().trim().min(40, "Describe the opportunity (at least 40 characters)").max(8000),
    applicationMethod: z.enum(["internal", "external", "email"]),
    externalUrl: z.string().trim().optional(),
    applicationEmail: z.string().trim().optional(),
    deadline: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a deadline"),
    startDate: z.string().optional(),
  })
  .superRefine((d, ctx) => {
    if (d.paid === "paid") {
      const n = Number(String(d.stipend ?? "").replace(/[,\s₦]/g, ""));
      if (!Number.isFinite(n) || n <= 0) ctx.addIssue({ code: "custom", path: ["stipend"], message: "Enter the monthly stipend" });
    }
    if (d.applicationMethod === "external" && !safeUrl(d.externalUrl)) {
      ctx.addIssue({ code: "custom", path: ["externalUrl"], message: "Enter a valid application link" });
    }
    if (d.applicationMethod === "email" && !z.string().email().safeParse(d.applicationEmail).success) {
      ctx.addIssue({ code: "custom", path: ["applicationEmail"], message: "Enter a valid email address" });
    }
  });

export type ParsedOpportunity = Omit<
  typeof opportunities.$inferInsert,
  "id" | "slug" | "companyId" | "status" | "createdAt" | "updatedAt"
>;

export function parseOpportunityForm(formData: FormData):
  | { ok: true; values: ParsedOpportunity }
  | { ok: false; fieldErrors: Record<string, string> } {
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, fieldErrors: zodFieldErrors(parsed.error.issues) };
  const d = parsed.data;
  const paid = d.paid === "paid";
  const int = (v?: string) => {
    const n = Number.parseInt(String(v ?? "").replace(/[,\s₦]/g, ""), 10);
    return Number.isFinite(n) && n > 0 ? n : null;
  };
  return {
    ok: true,
    values: {
      title: d.title,
      fieldId: d.fieldId || null,
      type: d.type,
      workMode: d.workMode,
      location: d.location,
      eligibility: d.eligibility,
      paid,
      stipend: paid ? int(d.stipend) : null,
      durationMonths: int(d.durationMonths),
      openings: int(d.openings) ?? 1,
      summary: d.summary || null,
      description: d.description,
      requirements: lines(formData.get("requirements")).slice(0, 20),
      responsibilities: lines(formData.get("responsibilities")).slice(0, 20),
      learnings: lines(formData.get("learnings")).slice(0, 20),
      benefits: lines(formData.get("benefits")).slice(0, 20),
      skills: csv(formData.get("skills")).slice(0, 20),
      applicationMethod: d.applicationMethod,
      externalUrl: d.applicationMethod === "external" ? safeUrl(d.externalUrl) : null,
      applicationEmail: d.applicationMethod === "email" ? str(d.applicationEmail) : null,
      requireCoverLetter: formData.get("requireCoverLetter") === "on",
      deadline: d.deadline,
      startDate: d.startDate && /^\d{4}-\d{2}-\d{2}$/.test(d.startDate) ? d.startDate : null,
    },
  };
}

export async function uniqueOpportunitySlug(title: string, companyName: string) {
  const base = slugify(`${title} ${companyName.split(" ")[0]}`);
  const exists = await db.query.opportunities.findFirst({ where: eq(opportunities.slug, base), columns: { id: true } });
  return exists ? `${base}-${randomSuffix()}` : base;
}
