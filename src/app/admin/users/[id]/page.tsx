import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { applications, companies, studentProfiles, users } from "@/db/schema";
import { UserForm } from "@/components/admin/user-form";
import { PageHeader } from "@/components/dashboard/page-header";
import { CompanyLogo, UserAvatar } from "@/components/shared/company-logo";
import { ApplicationStatusBadge } from "@/components/shared/status-badge";
import { formatDate, formatDateTime } from "@/lib/utils";

export const metadata: Metadata = { title: "User" };

export default async function AdminUserPage({ params }: PageProps<"/admin/users/[id]">) {
  const { id } = await params;
  const user = await db.query.users.findFirst({ where: eq(users.id, id), columns: { passwordHash: false } });
  if (!user) notFound();
  const [profile, company, apps] = await Promise.all([
    db.query.studentProfiles.findFirst({ where: eq(studentProfiles.userId, id) }),
    db.query.companies.findFirst({ where: eq(companies.ownerId, id) }),
    db.query.applications.findMany({
      where: eq(applications.userId, id),
      with: { opportunity: { columns: { title: true } } },
      orderBy: desc(applications.updatedAt),
      limit: 20,
    }),
  ]);
  return (
    <>
      <PageHeader title={user.name} description={user.email} />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <UserForm user={user} />
        <aside className="space-y-6">
          <div className="rounded-2xl border border-line bg-white p-6 shadow-card">
            <UserAvatar name={user.name} src={user.avatarUrl} className="size-16 text-xl" />
            <dl className="mt-5 space-y-3 text-sm">
              <div>
                <dt className="text-xs text-muted">Joined</dt>
                <dd>{formatDateTime(user.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Last login</dt>
                <dd>{user.lastLoginAt ? formatDateTime(user.lastLoginAt) : "Never"}</dd>
              </div>
              {profile && (
                <div>
                  <dt className="text-xs text-muted">Education</dt>
                  <dd>{[profile.course, profile.school, profile.level].filter(Boolean).join(" · ") || "—"}</dd>
                </div>
              )}
              {profile?.cvUrl && (
                <div>
                  <dt className="text-xs text-muted">CV</dt>
                  <dd>
                    <a href={profile.cvUrl} target="_blank" rel="noreferrer" className="text-brand-700 hover:underline">
                      {profile.cvName ?? "Download"}
                    </a>
                  </dd>
                </div>
              )}
            </dl>
          </div>
          {company && (
            <Link href={`/admin/companies/${company.id}`} className="flex items-center gap-3 rounded-2xl border border-line bg-white p-5 shadow-card hover:border-brand-300">
              <CompanyLogo name={company.name} logoUrl={company.logoUrl} color={company.brandColor} size="md" rounded="xl" />
              <div>
                <p className="text-xs text-muted">Manages</p>
                <p className="font-semibold">{company.name}</p>
              </div>
            </Link>
          )}
          {apps.length > 0 && (
            <div className="rounded-2xl border border-line bg-white shadow-card">
              <h2 className="border-b border-line px-5 py-4 font-bold">Applications ({apps.length})</h2>
              <ul className="divide-y divide-line">
                {apps.map((a) => (
                  <li key={a.id}>
                    <Link href={`/admin/applications/${a.id}`} className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-canvas">
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium">{a.opportunity.title}</span>
                        <span className="text-xs text-muted">{formatDate(a.submittedAt ?? a.updatedAt)}</span>
                      </span>
                      <ApplicationStatusBadge status={a.status} />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </>
  );
}
