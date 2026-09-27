"use server";

import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { contactMessages, opportunities, reports, users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { fail, success, zodFieldErrors, type ActionState } from "@/lib/action-state";
import { REPORT_REASONS } from "@/lib/constants";
import { notify } from "@/lib/notify";

const contactSchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(80),
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  subject: z.string().trim().max(150).optional(),
  message: z.string().trim().min(10, "Message should be at least 10 characters").max(5000),
});

export async function contactAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = contactSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fail("Please check the highlighted fields.", zodFieldErrors(parsed.error.issues));
  await db.insert(contactMessages).values({ ...parsed.data, subject: parsed.data.subject || null });
  const admins = await db.select({ id: users.id }).from(users).where(eq(users.role, "admin"));
  await Promise.all(
    admins.map((a) =>
      notify(a.id, { type: "message", title: `New message from ${parsed.data.name}`, body: parsed.data.subject, link: "/admin/messages" }),
    ),
  );
  return success("Thanks! Your message has been sent. We'll get back to you soon.");
}

const reportSchema = z.object({
  opportunity: z.string().trim().optional(),
  reason: z.enum(REPORT_REASONS as [string, ...string[]], { message: "Select a reason" }),
  details: z.string().trim().max(3000).optional(),
  email: z.union([z.literal(""), z.string().trim().toLowerCase().email("Enter a valid email address")]).optional(),
});

export async function reportAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = reportSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fail("Please check the highlighted fields.", zodFieldErrors(parsed.error.issues));
  const user = await getCurrentUser();
  let opportunityId: string | null = null;
  if (parsed.data.opportunity) {
    const opp = await db.query.opportunities.findFirst({ where: eq(opportunities.slug, parsed.data.opportunity) });
    opportunityId = opp?.id ?? null;
  }
  if (!opportunityId && !parsed.data.details) {
    return fail("Tell us which opportunity or company you're reporting.", { details: "Please add details" });
  }
  await db.insert(reports).values({
    opportunityId,
    reporterId: user?.id ?? null,
    email: parsed.data.email || user?.email || null,
    reason: parsed.data.reason,
    details: parsed.data.details || null,
  });
  const admins = await db.select({ id: users.id }).from(users).where(eq(users.role, "admin"));
  await Promise.all(
    admins.map((a) => notify(a.id, { type: "report", title: "New opportunity report", body: parsed.data.reason, link: "/admin/reports" })),
  );
  return success("Thank you. Our trust & safety team will review your report.");
}
