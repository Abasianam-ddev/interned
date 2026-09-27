import type { Metadata } from "next";
import Link from "next/link";
import { and, count, desc, eq, ilike, or, type SQL } from "drizzle-orm";
import { UserPlus, Users } from "lucide-react";
import { db } from "@/db";
import { users } from "@/db/schema";
import { deleteUserAction, setUserStatusAction } from "@/app/actions/admin";
import { ListToolbar, TableCard, Td, Th } from "@/components/admin/list-toolbar";
import { RowMenu } from "@/components/admin/row-menu";
import { PageHeader } from "@/components/dashboard/page-header";
import { UserAvatar } from "@/components/shared/company-logo";
import { EmptyState } from "@/components/shared/empty-state";
import { FlashToast } from "@/components/shared/flash-toast";
import { Pagination } from "@/components/shared/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { requireUser } from "@/lib/auth";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Manage Users" };
const PER_PAGE = 25;

export default async function AdminUsersPage({ searchParams }: PageProps<"/admin/users">) {
  const me = await requireUser(["admin"]);
  const sp = await searchParams;
  const role = typeof sp.role === "string" && ["student", "company", "admin"].includes(sp.role) ? (sp.role as "student") : undefined;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const page = Math.max(1, Number(sp.page ?? 1) || 1);
  const conds: SQL[] = [];
  if (role) conds.push(eq(users.role, role));
  if (sp.status === "suspended") conds.push(eq(users.status, "suspended"));
  if (q) conds.push(or(ilike(users.name, `%${q}%`), ilike(users.email, `%${q}%`))!);
  const where = conds.length ? and(...conds) : undefined;
  const [rows, [{ total }], roleCounts] = await Promise.all([
    db.select().from(users).where(where).orderBy(desc(users.createdAt)).limit(PER_PAGE).offset((page - 1) * PER_PAGE),
    db.select({ total: count() }).from(users).where(where),
    db.select({ role: users.role, n: count() }).from(users).groupBy(users.role),
  ]);
  const rc = (r: string) => roleCounts.find((x) => x.role === r)?.n ?? 0;
  return (
    <>
      <FlashToast />
      <PageHeader
        title="Users"
        description="Students, company accounts and administrators."
        actions={
          <Button asChild>
            <Link href="/admin/users/new">
              <UserPlus /> New User
            </Link>
          </Button>
        }
      />
      <ListToolbar
        basePath="/admin/users"
        params={sp}
        tabKey="role"
        placeholder="Search by name or email"
        tabs={[
          { value: "", label: "All", count: roleCounts.reduce((a, r) => a + r.n, 0) },
          { value: "student", label: "Students", count: rc("student") },
          { value: "company", label: "Companies", count: rc("company") },
          { value: "admin", label: "Admins", count: rc("admin") },
        ]}
      />
      {rows.length ? (
        <TableCard>
          <thead className="border-b border-line">
            <tr>
              <Th>User</Th>
              <Th>Role</Th>
              <Th>Status</Th>
              <Th>Joined</Th>
              <Th>Last login</Th>
              <Th />
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((u) => (
              <tr key={u.id} className="hover:bg-canvas/60">
                <Td>
                  <div className="flex items-center gap-3">
                    <UserAvatar name={u.name} src={u.avatarUrl} className="size-9 text-xs" />
                    <div className="min-w-0">
                      <Link href={`/admin/users/${u.id}`} className="block font-semibold hover:text-brand-700">
                        {u.name} {u.id === me.id && <span className="text-xs font-normal text-muted">(you)</span>}
                      </Link>
                      <p className="truncate text-xs text-muted">{u.email}</p>
                    </div>
                  </div>
                </Td>
                <Td>
                  <Badge tone={u.role === "admin" ? "purple" : u.role === "company" ? "blue" : "green"} size="md" className="capitalize">
                    {u.role}
                  </Badge>
                </Td>
                <Td>
                  <Badge tone={u.status === "active" ? "green" : "red"} size="md" className="capitalize">
                    {u.status}
                  </Badge>
                </Td>
                <Td className="whitespace-nowrap text-ink/75">{formatDate(u.createdAt)}</Td>
                <Td className="whitespace-nowrap text-ink/75">{u.lastLoginAt ? formatDate(u.lastLoginAt) : "—"}</Td>
                <Td className="text-right">
                  {u.id !== me.id && (
                    <RowMenu
                      items={[
                        { type: "link", label: "View / edit", href: `/admin/users/${u.id}` },
                        {
                          type: "action",
                          label: u.status === "active" ? "Suspend" : "Reactivate",
                          action: setUserStatusAction.bind(null, u.id, u.status === "active" ? "suspended" : "active"),
                          confirm: u.status === "active" ? "Suspended users can't log in. Continue?" : undefined,
                          success: "Updated",
                        },
                        { type: "separator" },
                        {
                          type: "action",
                          label: "Delete",
                          danger: true,
                          confirm: "Permanently delete this user and their data?",
                          action: deleteUserAction.bind(null, u.id),
                          success: "User deleted",
                        },
                      ]}
                    />
                  )}
                </Td>
              </tr>
            ))}
          </tbody>
        </TableCard>
      ) : (
        <EmptyState icon={Users} title="No users found" />
      )}
      <Pagination page={page} totalPages={Math.ceil(total / PER_PAGE)} basePath="/admin/users" params={sp} />
    </>
  );
}
