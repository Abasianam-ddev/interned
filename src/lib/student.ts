import "server-only";
import { and, desc, eq, gte, notInArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { applications, companies, fields, opportunities, type StudentProfile } from "@/db/schema";
import type { CurrentUser } from "./auth";
import { cardColumns, publicOpportunityWhere, type OpportunityCardData } from "./queries";

export function profileCompletion(user: CurrentUser, p: StudentProfile | null | undefined) {
  const checks: [boolean, string][] = [
    [!!user.avatarUrl, "Add a profile photo"],
    [!!user.phone, "Add your phone number"],
    [!!p?.school, "Add your school"],
    [!!p?.course, "Add your course"],
    [!!p?.level, "Add your level"],
    [!!p?.location, "Add your location"],
    [!!p?.bio, "Write a short bio"],
    [(p?.skills.length ?? 0) >= 3, "Add at least 3 skills"],
    [(p?.interests.length ?? 0) > 0, "Choose fields you're interested in"],
    [!!p?.cvUrl, "Upload your CV"],
    [!!(p?.links.linkedin || p?.links.github || p?.links.portfolio), "Add a LinkedIn, GitHub or portfolio link"],
  ];
  const done = checks.filter(([ok]) => ok).length;
  return { percent: Math.round((done / checks.length) * 100), missing: checks.filter(([ok]) => !ok).map(([, t]) => t) };
}

export async function getRecommendations(userId: string, profile: StudentProfile | null | undefined, limit = 3) {
  const applied = db.select({ id: applications.opportunityId }).from(applications).where(eq(applications.userId, userId));
  const interests = profile?.interests ?? [];
  const skills = (profile?.skills ?? []).map((s) => s.toLowerCase());
  const interestsJson = JSON.stringify(interests);
  const skillsJson = JSON.stringify(skills);
  const score = sql`(case when ${opportunities.fieldId}::text in (select jsonb_array_elements_text(${interestsJson}::jsonb)) then 2 else 0 end)
    + (select count(*) from unnest(${opportunities.skills}) s where lower(s) in (select jsonb_array_elements_text(${skillsJson}::jsonb)))`;
  const rows = await db
    .select(cardColumns)
    .from(opportunities)
    .innerJoin(companies, eq(opportunities.companyId, companies.id))
    .leftJoin(fields, eq(opportunities.fieldId, fields.id))
    .where(and(publicOpportunityWhere(), notInArray(opportunities.id, applied)))
    .orderBy(desc(score), desc(opportunities.publishedAt))
    .limit(limit);
  return rows as OpportunityCardData[];
}

export async function countNewOpportunities(days = 7) {
  const since = new Date(Date.now() - days * 86400000);
  const [{ n }] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(opportunities)
    .innerJoin(companies, eq(opportunities.companyId, companies.id))
    .where(and(publicOpportunityWhere(), gte(opportunities.publishedAt, since)));
  return n;
}

