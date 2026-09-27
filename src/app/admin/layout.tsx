import { count, eq } from "drizzle-orm";
import { db } from "@/db";
import { contactMessages, opportunities, reports } from "@/db/schema";
import { DashboardShell, type NavSection } from "@/components/dashboard/shell";
import { requireUser } from "@/lib/auth";
import { getBellData } from "@/lib/dashboard";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser(["admin"], "/admin");
  const [bell, [{ pending }], [{ openReports }], [{ newMessages }]] = await Promise.all([
    getBellData(user.id),
    db.select({ pending: count() }).from(opportunities).where(eq(opportunities.status, "pending")),
    db.select({ openReports: count() }).from(reports).where(eq(reports.status, "open")),
    db.select({ newMessages: count() }).from(contactMessages).where(eq(contactMessages.status, "new")),
  ]);
  const sections: NavSection[] = [
    { items: [{ href: "/admin", label: "Overview", icon: "LayoutDashboard", exact: true }] },
    {
      title: "Marketplace",
      items: [
        { href: "/admin/opportunities", label: "Opportunities", icon: "Briefcase", badge: pending || undefined },
        { href: "/admin/companies", label: "Companies", icon: "Building2" },
        { href: "/admin/applications", label: "Applications", icon: "FileText" },
        { href: "/admin/users", label: "Users", icon: "Users" },
        { href: "/admin/reports", label: "Reports", icon: "Flag", badge: openReports || undefined },
      ],
    },
    {
      title: "Content",
      items: [
        { href: "/admin/resources", label: "Resources", icon: "BookOpen" },
        { href: "/admin/fields", label: "Fields", icon: "Tags" },
        { href: "/admin/faqs", label: "FAQs", icon: "CircleHelp" },
        { href: "/admin/pages", label: "Pages", icon: "NotebookText" },
      ],
    },
    {
      title: "Engagement",
      items: [
        { href: "/admin/messages", label: "Messages", icon: "Mail", badge: newMessages || undefined },
        { href: "/admin/subscribers", label: "Alert Subscribers", icon: "BellRing" },
        { href: "/admin/settings", label: "Site Settings", icon: "Settings" },
      ],
    },
  ];
  return (
    <DashboardShell
      sections={sections}
      user={user}
      roleLabel="Administrator"
      notifications={bell.items}
      unread={bell.unread}
      notificationsHref="/admin/notifications"
    >
      {children}
    </DashboardShell>
  );
}
