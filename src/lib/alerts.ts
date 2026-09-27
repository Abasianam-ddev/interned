import "server-only";
import { and, eq, gte, isNull, lte, or } from "drizzle-orm";
import { db } from "@/db";
import { alerts, companies, opportunities, studentProfiles, type Alert } from "@/db/schema";
import { appUrl, sendMail } from "./mail";
import { notify } from "./notify";
import { formatDate, formatStipend } from "./utils";

type OppForMatch = {
  id: string;
  slug: string;
  title: string;
  fieldId: string | null;
  location: string;
  type: string;
  workMode: string;
  skills: string[];
  stipend: number | null;
  paid: boolean;
  deadline: string | null;
  companyName: string;
};

export function alertMatches(a: Alert, o: OppForMatch) {
  if (a.fieldIds.length && (!o.fieldId || !a.fieldIds.includes(o.fieldId))) return false;
  if (a.types.length && !a.types.includes(o.type)) return false;
  if (a.workModes.length && !a.workModes.includes(o.workMode)) return false;
  if (a.locations.length) {
    const locs = a.locations.map((l) => l.toLowerCase());
    const ok = locs.includes(o.location.toLowerCase()) || (locs.includes("remote") && o.workMode === "remote");
    if (!ok) return false;
  }
  if (a.keywords) {
    const hay = `${o.title} ${o.companyName} ${o.skills.join(" ")}`.toLowerCase();
    const words = a.keywords.toLowerCase().split(/[,\s]+/).filter(Boolean);
    if (!words.some((w) => hay.includes(w))) return false;
  }
  return true;
}

async function wantsEmail(userId: string | null) {
  if (!userId) return true;
  const p = await db.query.studentProfiles.findFirst({ where: eq(studentProfiles.userId, userId), columns: { notificationPrefs: true } });
  return p?.notificationPrefs.emailAlerts ?? true;
}

function line(o: OppForMatch) {
  return `• ${o.title} — ${o.companyName} (${o.workMode === "remote" ? "Remote" : o.location}, ${formatStipend(o.stipend, o.paid)}). Deadline: ${formatDate(o.deadline)}\n  ${appUrl(`/opportunities/${o.slug}`)}`;
}

async function loadOpp(opportunityId: string): Promise<OppForMatch | null> {
  const row = await db
    .select({
      id: opportunities.id,
      slug: opportunities.slug,
      title: opportunities.title,
      fieldId: opportunities.fieldId,
      location: opportunities.location,
      type: opportunities.type,
      workMode: opportunities.workMode,
      skills: opportunities.skills,
      stipend: opportunities.stipend,
      paid: opportunities.paid,
      deadline: opportunities.deadline,
      companyName: companies.name,
    })
    .from(opportunities)
    .innerJoin(companies, eq(opportunities.companyId, companies.id))
    .where(eq(opportunities.id, opportunityId));
  return row[0] ?? null;
}

/** Called when an opportunity is published for the first time. */
export async function dispatchInstantAlerts(opportunityId: string) {
  const o = await loadOpp(opportunityId);
  if (!o) return;
  const active = await db.select().from(alerts).where(eq(alerts.active, true));
  const notified = new Set<string>();
  for (const a of active) {
    if (!alertMatches(a, o)) continue;
    if (a.userId && !notified.has(a.userId)) {
      notified.add(a.userId);
      await notify(a.userId, {
        type: "alert",
        title: `New opportunity: ${o.title}`,
        body: `${o.companyName} · matches your alert`,
        link: `/opportunities/${o.slug}`,
      });
    }
    if (a.frequency === "instant" && (await wantsEmail(a.userId))) {
      await sendMail({
        to: a.email,
        subject: `New opportunity: ${o.title} at ${o.companyName}`,
        text: `A new opportunity matches your Internly alert:\n\n${line(o)}`,
        cta: { label: "View opportunity", url: appUrl(`/opportunities/${o.slug}`) },
      });
      await db.update(alerts).set({ lastSentAt: new Date() }).where(eq(alerts.id, a.id));
    }
  }
}

/** Sends daily / weekly digests. Safe to call frequently: each alert is only emailed once per period. */
export async function sendAlertDigests() {
  const now = Date.now();
  let sent = 0;
  for (const frequency of ["daily", "weekly"] as const) {
    const period = frequency === "daily" ? 86400000 : 7 * 86400000;
    const due = await db
      .select()
      .from(alerts)
      .where(
        and(
          eq(alerts.active, true),
          eq(alerts.frequency, frequency),
          or(isNull(alerts.lastSentAt), lte(alerts.lastSentAt, new Date(now - period))),
        ),
      );
    if (!due.length) continue;
    const since = new Date(now - period);
    const recent = await db
      .select({ id: opportunities.id })
      .from(opportunities)
      .where(and(eq(opportunities.status, "published"), gte(opportunities.publishedAt, since)));
    const opps = (await Promise.all(recent.map((r) => loadOpp(r.id)))).filter(Boolean) as OppForMatch[];
    for (const a of due) {
      const matches = opps.filter((o) => alertMatches(a, o)).slice(0, 15);
      await db.update(alerts).set({ lastSentAt: new Date() }).where(eq(alerts.id, a.id));
      if (!matches.length || !(await wantsEmail(a.userId))) continue;
      await sendMail({
        to: a.email,
        subject: `${matches.length} new ${matches.length === 1 ? "opportunity" : "opportunities"} for you on Internly`,
        text: `Here are the latest opportunities matching your ${frequency} alert:\n\n${matches.map(line).join("\n\n")}`,
        cta: { label: "Browse all opportunities", url: appUrl("/opportunities") },
      });
      sent++;
    }
  }
  return sent;
}
