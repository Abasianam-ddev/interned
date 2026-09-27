import "server-only";
import { and, asc, count, desc, eq, gte, ilike, inArray, isNull, lte, ne, or, sql, type SQL } from "drizzle-orm";
import { db } from "@/db";
import {
  applications,
  companies,
  faqs,
  fields,
  opportunities,
  resources,
  savedOpportunities,
  type OpportunityType,
  type WorkMode,
} from "@/db/schema";

export const PAGE_SIZE = 10;

export function today() {
  return new Date().toISOString().slice(0, 10);
}

export const cardColumns = {
  id: opportunities.id,
  slug: opportunities.slug,
  title: opportunities.title,
  location: opportunities.location,
  workMode: opportunities.workMode,
  type: opportunities.type,
  stipend: opportunities.stipend,
  paid: opportunities.paid,
  durationMonths: opportunities.durationMonths,
  eligibility: opportunities.eligibility,
  deadline: opportunities.deadline,
  verified: opportunities.verified,
  featured: opportunities.featured,
  publishedAt: opportunities.publishedAt,
  companyName: companies.name,
  companySlug: companies.slug,
  companyLogo: companies.logoUrl,
  companyColor: companies.brandColor,
  fieldName: fields.name,
  fieldSlug: fields.slug,
};

export type OpportunityCardData = {
  id: string;
  slug: string;
  title: string;
  location: string;
  workMode: WorkMode;
  type: OpportunityType;
  stipend: number | null;
  paid: boolean;
  durationMonths: number | null;
  eligibility: "students" | "graduates" | "both";
  deadline: string | null;
  verified: boolean;
  featured: boolean;
  publishedAt: Date | null;
  companyName: string;
  companySlug: string;
  companyLogo: string | null;
  companyColor: string;
  fieldName: string | null;
  fieldSlug: string | null;
};

/** Opportunities visible to the public: published, company not suspended and not past deadline. */
export function publicOpportunityWhere(): SQL {
  return and(
    eq(opportunities.status, "published"),
    ne(companies.status, "suspended"),
    or(isNull(opportunities.deadline), gte(opportunities.deadline, today())),
  )!;
}

export type OpportunityFilters = {
  q?: string;
  location?: string[];
  field?: string[];
  type?: string[];
  mode?: string[];
  duration?: string[];
  pay?: string[];
  company?: string;
  sort?: string;
  page?: number;
  perPage?: number;
};

function arr(v: string | string[] | undefined) {
  if (v == null) return [];
  return (Array.isArray(v) ? v : [v]).flatMap((s) => s.split(",")).filter(Boolean);
}

export function parseFilters(sp: Record<string, string | string[] | undefined>): OpportunityFilters {
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  return {
    q: one(sp.q)?.trim() || undefined,
    location: arr(sp.location),
    field: arr(sp.field),
    type: arr(sp.type),
    mode: arr(sp.mode),
    duration: arr(sp.duration),
    pay: arr(sp.pay),
    company: one(sp.company),
    sort: one(sp.sort),
    page: Math.max(1, Number.parseInt(one(sp.page) ?? "1", 10) || 1),
  };
}

function buildWhere(f: OpportunityFilters) {
  const conds: (SQL | undefined)[] = [publicOpportunityWhere()];
  if (f.q) {
    const like = `%${f.q.replace(/[%_]/g, "\\$&")}%`;
    conds.push(
      or(
        ilike(opportunities.title, like),
        ilike(companies.name, like),
        ilike(fields.name, like),
        ilike(opportunities.location, like),
        sql`array_to_string(${opportunities.skills}, ' ') ilike ${like}`,
      ),
    );
  }
  if (f.location?.length) {
    const locs = f.location.filter((l) => l.toLowerCase() !== "remote");
    const parts: SQL[] = [];
    if (locs.length) parts.push(inArray(sql`lower(${opportunities.location})`, locs.map((l) => l.toLowerCase())));
    if (locs.length !== f.location.length) parts.push(eq(opportunities.workMode, "remote"));
    conds.push(or(...parts));
  }
  if (f.field?.length) conds.push(inArray(fields.slug, f.field));
  if (f.type?.length) conds.push(inArray(opportunities.type, f.type as OpportunityType[]));
  if (f.mode?.length) conds.push(inArray(opportunities.workMode, f.mode as WorkMode[]));
  if (f.duration?.length) {
    const parts = f.duration.map((d) => {
      const n = Number(d);
      if (n <= 1) return lte(opportunities.durationMonths, 1);
      if (n === 3) return and(gte(opportunities.durationMonths, 2), lte(opportunities.durationMonths, 3));
      if (n === 6) return and(gte(opportunities.durationMonths, 4), lte(opportunities.durationMonths, 6));
      return gte(opportunities.durationMonths, 7);
    });
    conds.push(or(...parts));
  }
  if (f.pay?.length === 1) {
    conds.push(f.pay[0] === "paid" ? eq(opportunities.paid, true) : eq(opportunities.paid, false));
  }
  if (f.company) conds.push(eq(companies.slug, f.company));
  return and(...conds);
}

export async function searchOpportunities(f: OpportunityFilters) {
  const perPage = f.perPage ?? PAGE_SIZE;
  const page = f.page ?? 1;
  const where = buildWhere(f);
  const order =
    f.sort === "deadline"
      ? [sql`${opportunities.deadline} asc nulls last`]
      : f.sort === "stipend"
        ? [sql`${opportunities.stipend} desc nulls last`]
        : [desc(opportunities.featured), desc(opportunities.publishedAt)];

  const [items, [{ total }]] = await Promise.all([
    db
      .select(cardColumns)
      .from(opportunities)
      .innerJoin(companies, eq(opportunities.companyId, companies.id))
      .leftJoin(fields, eq(opportunities.fieldId, fields.id))
      .where(where)
      .orderBy(...order)
      .limit(perPage)
      .offset((page - 1) * perPage),
    db
      .select({ total: count() })
      .from(opportunities)
      .innerJoin(companies, eq(opportunities.companyId, companies.id))
      .leftJoin(fields, eq(opportunities.fieldId, fields.id))
      .where(where),
  ]);
  return { items: items as OpportunityCardData[], total, page, totalPages: Math.max(1, Math.ceil(total / perPage)) };
}

export async function getLatestOpportunities(limit = 6) {
  const rows = await db
    .select(cardColumns)
    .from(opportunities)
    .innerJoin(companies, eq(opportunities.companyId, companies.id))
    .leftJoin(fields, eq(opportunities.fieldId, fields.id))
    .where(publicOpportunityWhere())
    .orderBy(desc(opportunities.featured), desc(opportunities.publishedAt))
    .limit(limit);
  return rows as OpportunityCardData[];
}

/** Counts used in the filter sidebar. */
export async function getFacetCounts() {
  const where = publicOpportunityWhere();
  const [loc, remote, field, type, mode, dur] = await Promise.all([
    db
      .select({ key: sql<string>`lower(${opportunities.location})`, n: count() })
      .from(opportunities)
      .innerJoin(companies, eq(opportunities.companyId, companies.id))
      .where(where)
      .groupBy(sql`lower(${opportunities.location})`),
    db
      .select({ n: count() })
      .from(opportunities)
      .innerJoin(companies, eq(opportunities.companyId, companies.id))
      .where(and(where, eq(opportunities.workMode, "remote"))),
    db
      .select({ key: fields.slug, n: count() })
      .from(opportunities)
      .innerJoin(companies, eq(opportunities.companyId, companies.id))
      .innerJoin(fields, eq(opportunities.fieldId, fields.id))
      .where(where)
      .groupBy(fields.slug),
    db
      .select({ key: opportunities.type, n: count() })
      .from(opportunities)
      .innerJoin(companies, eq(opportunities.companyId, companies.id))
      .where(where)
      .groupBy(opportunities.type),
    db
      .select({ key: opportunities.workMode, n: count() })
      .from(opportunities)
      .innerJoin(companies, eq(opportunities.companyId, companies.id))
      .where(where)
      .groupBy(opportunities.workMode),
    db
      .select({
        key: sql<string>`case when ${opportunities.durationMonths} <= 1 then '1' when ${opportunities.durationMonths} <= 3 then '3' when ${opportunities.durationMonths} <= 6 then '6' else '12' end`,
        n: count(),
      })
      .from(opportunities)
      .innerJoin(companies, eq(opportunities.companyId, companies.id))
      .where(where)
      .groupBy(sql`1`),
  ]);
  const toMap = (rows: { key: string | null; n: number }[]) =>
    Object.fromEntries(rows.filter((r) => r.key != null).map((r) => [r.key!, r.n]));
  return {
    location: { ...toMap(loc), remote: remote[0]?.n ?? 0 },
    field: toMap(field),
    type: toMap(type),
    mode: toMap(mode),
    duration: toMap(dur),
  };
}

export async function getOpportunityBySlug(slug: string) {
  return db.query.opportunities.findFirst({
    where: eq(opportunities.slug, slug),
    with: { company: true, field: true },
  });
}

export async function getSimilarOpportunities(opp: { id: string; fieldId: string | null; companyId: string }, limit = 4) {
  const rows = await db
    .select(cardColumns)
    .from(opportunities)
    .innerJoin(companies, eq(opportunities.companyId, companies.id))
    .leftJoin(fields, eq(opportunities.fieldId, fields.id))
    .where(and(publicOpportunityWhere(), ne(opportunities.id, opp.id)))
    .orderBy(
      sql`case when ${opportunities.fieldId} = ${opp.fieldId} then 0 when ${opportunities.companyId} = ${opp.companyId} then 1 else 2 end`,
      desc(opportunities.publishedAt),
    )
    .limit(limit);
  return rows as OpportunityCardData[];
}

export async function getFieldsWithCounts() {
  const rows = await db
    .select({
      id: fields.id,
      slug: fields.slug,
      name: fields.name,
      icon: fields.icon,
      description: fields.description,
      count: sql<number>`count(${opportunities.id}) filter (where ${opportunities.status} = 'published' and (${opportunities.deadline} is null or ${opportunities.deadline} >= ${today()}))`.mapWith(
        Number,
      ),
    })
    .from(fields)
    .leftJoin(opportunities, eq(opportunities.fieldId, fields.id))
    .groupBy(fields.id)
    .orderBy(asc(fields.sortOrder), asc(fields.name));
  return rows;
}

export async function getAllFields() {
  return db.select().from(fields).orderBy(asc(fields.sortOrder), asc(fields.name));
}

export async function getCompaniesWithCounts(opts: { q?: string; industry?: string; location?: string; limit?: number } = {}) {
  const conds: (SQL | undefined)[] = [eq(companies.status, "active")];
  if (opts.q) conds.push(ilike(companies.name, `%${opts.q}%`));
  if (opts.industry) conds.push(eq(companies.industry, opts.industry));
  if (opts.location) conds.push(ilike(companies.location, `%${opts.location}%`));
  const q = db
    .select({
      id: companies.id,
      slug: companies.slug,
      name: companies.name,
      logoUrl: companies.logoUrl,
      brandColor: companies.brandColor,
      industry: companies.industry,
      location: companies.location,
      verified: companies.verified,
      tagline: companies.tagline,
      openings: sql<number>`count(${opportunities.id}) filter (where ${opportunities.status} = 'published' and (${opportunities.deadline} is null or ${opportunities.deadline} >= ${today()}))`.mapWith(
        Number,
      ),
    })
    .from(companies)
    .leftJoin(opportunities, eq(opportunities.companyId, companies.id))
    .where(and(...conds))
    .groupBy(companies.id)
    .orderBy(desc(companies.verified), sql`6 desc`, asc(companies.name))
    .$dynamic();
  if (opts.limit) q.limit(opts.limit);
  return q;
}

export async function getCompanyBySlug(slug: string) {
  return db.query.companies.findFirst({ where: eq(companies.slug, slug) });
}

export async function getSavedIds(userId: string | undefined) {
  if (!userId) return new Set<string>();
  const rows = await db
    .select({ id: savedOpportunities.opportunityId })
    .from(savedOpportunities)
    .where(eq(savedOpportunities.userId, userId));
  return new Set(rows.map((r) => r.id));
}

export async function getAppliedIds(userId: string | undefined) {
  if (!userId) return new Set<string>();
  const rows = await db
    .select({ id: applications.opportunityId })
    .from(applications)
    .where(and(eq(applications.userId, userId), ne(applications.status, "draft")));
  return new Set(rows.map((r) => r.id));
}

export async function getPublishedResources(opts: { category?: string; q?: string; limit?: number } = {}) {
  const conds: (SQL | undefined)[] = [eq(resources.published, true)];
  if (opts.category) conds.push(eq(resources.category, opts.category));
  if (opts.q) conds.push(or(ilike(resources.title, `%${opts.q}%`), ilike(resources.excerpt, `%${opts.q}%`)));
  const q = db
    .select()
    .from(resources)
    .where(and(...conds))
    .orderBy(desc(resources.featured), desc(resources.publishedAt))
    .$dynamic();
  if (opts.limit) q.limit(opts.limit);
  return q;
}

export async function getPublishedFaqs() {
  return db.select().from(faqs).where(eq(faqs.published, true)).orderBy(asc(faqs.sortOrder), asc(faqs.createdAt));
}
