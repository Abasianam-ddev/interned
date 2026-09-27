import "server-only";
import { and, count, desc, eq, ilike, inArray, ne, or, sql, sum, type SQL } from "drizzle-orm";
import { db } from "@/db";
import { applications, opportunities, users, type ApplicationStatus } from "@/db/schema";

export async function getCompanyStats(companyId: string) {
  const [[opps], [apps]] = await Promise.all([
    db
      .select({
        active: sql<number>`count(*) filter (where ${opportunities.status} = 'published')`.mapWith(Number),
        pending: sql<number>`count(*) filter (where ${opportunities.status} = 'pending')`.mapWith(Number),
        views: sum(opportunities.views).mapWith(Number),
      })
      .from(opportunities)
      .where(eq(opportunities.companyId, companyId)),
    db
      .select({
        total: count(),
        fresh: sql<number>`count(*) filter (where ${applications.status} = 'submitted')`.mapWith(Number),
        shortlisted: sql<number>`count(*) filter (where ${applications.status} = 'shortlisted')`.mapWith(Number),
        interview: sql<number>`count(*) filter (where ${applications.status} = 'interview')`.mapWith(Number),
        accepted: sql<number>`count(*) filter (where ${applications.status} = 'accepted')`.mapWith(Number),
      })
      .from(applications)
      .innerJoin(opportunities, eq(applications.opportunityId, opportunities.id))
      .where(and(eq(opportunities.companyId, companyId), ne(applications.status, "draft"))),
  ]);
  return { ...opps, views: opps.views ?? 0, ...apps };
}

export async function getCompanyOpportunities(companyId: string, status?: string) {
  const conds: SQL[] = [eq(opportunities.companyId, companyId)];
  if (status) conds.push(eq(opportunities.status, status as typeof opportunities.$inferSelect.status));
  return db
    .select({
      id: opportunities.id,
      slug: opportunities.slug,
      title: opportunities.title,
      status: opportunities.status,
      location: opportunities.location,
      workMode: opportunities.workMode,
      deadline: opportunities.deadline,
      views: opportunities.views,
      createdAt: opportunities.createdAt,
      rejectionReason: opportunities.rejectionReason,
      applicants: sql<number>`(select count(*) from ${applications} a where a.opportunity_id = ${opportunities.id} and a.status <> 'draft')`.mapWith(Number),
      newApplicants: sql<number>`(select count(*) from ${applications} a where a.opportunity_id = ${opportunities.id} and a.status = 'submitted')`.mapWith(Number),
    })
    .from(opportunities)
    .where(and(...conds))
    .orderBy(desc(opportunities.createdAt));
}

export async function getApplicants(
  companyId: string | null,
  f: { opportunityId?: string; status?: string; q?: string; limit?: number; offset?: number } = {},
) {
  const conds: SQL[] = [ne(applications.status, "draft")];
  if (companyId) conds.push(eq(opportunities.companyId, companyId));
  if (f.opportunityId) conds.push(eq(applications.opportunityId, f.opportunityId));
  if (f.status) {
    const statuses = f.status.split(",") as ApplicationStatus[];
    conds.push(inArray(applications.status, statuses));
  }
  if (f.q) conds.push(or(ilike(applications.fullName, `%${f.q}%`), ilike(applications.email, `%${f.q}%`), ilike(applications.school, `%${f.q}%`))!);
  const where = and(...conds);
  const [rows, [{ total }]] = await Promise.all([
    db
      .select({
        id: applications.id,
        fullName: applications.fullName,
        email: applications.email,
        school: applications.school,
        course: applications.course,
        level: applications.level,
        status: applications.status,
        submittedAt: applications.submittedAt,
        cvUrl: applications.cvUrl,
        opportunityId: opportunities.id,
        opportunityTitle: opportunities.title,
        opportunitySlug: opportunities.slug,
        avatarUrl: users.avatarUrl,
      })
      .from(applications)
      .innerJoin(opportunities, eq(applications.opportunityId, opportunities.id))
      .innerJoin(users, eq(applications.userId, users.id))
      .where(where)
      .orderBy(desc(applications.submittedAt))
      .limit(f.limit ?? 50)
      .offset(f.offset ?? 0),
    db
      .select({ total: count() })
      .from(applications)
      .innerJoin(opportunities, eq(applications.opportunityId, opportunities.id))
      .where(where),
  ]);
  return { rows, total };
}
