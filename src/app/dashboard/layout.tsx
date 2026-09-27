import { eq, and, count } from "drizzle-orm";
import { DashboardShell, type NavSection } from "@/components/dashboard/shell";
import { db } from "@/db";
import { applications } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { getBellData } from "@/lib/dashboard";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser(["student"], "/dashboard");
  const [bell, [{ drafts }]] = await Promise.all([
    getBellData(user.id),
    db
      .select({ drafts: count() })
      .from(applications)
      .where(and(eq(applications.userId, user.id), eq(applications.status, "draft"))),
  ]);
  const sections: NavSection[] = [
    {
      items: [
        { href: "/dashboard", label: "Dashboard", icon: "LayoutDashboard", exact: true },
        { href: "/opportunities", label: "Browse Internships", icon: "Search" },
        { href: "/dashboard/saved", label: "Saved Opportunities", icon: "Bookmark" },
        { href: "/dashboard/applications", label: "Applications", icon: "FileText", badge: drafts || undefined },
        { href: "/dashboard/alerts", label: "Alerts", icon: "Bell" },
        { href: "/dashboard/notifications", label: "Notifications", icon: "BellRing", badge: bell.unread || undefined },
        { href: "/dashboard/profile", label: "Profile", icon: "User" },
        { href: "/dashboard/settings", label: "Settings", icon: "Settings" },
      ],
    },
  ];
  return (
    <DashboardShell
      sections={sections}
      user={user}
      roleLabel="Student"
      notifications={bell.items}
      unread={bell.unread}
      notificationsHref="/dashboard/notifications"
    >
      {children}
    </DashboardShell>
  );
}
