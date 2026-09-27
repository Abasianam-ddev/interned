import { and, count, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { db } from "@/db";
import { applications, opportunities } from "@/db/schema";
import { DashboardShell, type NavSection } from "@/components/dashboard/shell";
import { Button } from "@/components/ui/button";
import { getCompanyForUser, requireUser } from "@/lib/auth";
import { getBellData } from "@/lib/dashboard";

export default async function CompanyLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser(["company"], "/company");
  const company = await getCompanyForUser(user.id);
  // Without a company only the setup page is reachable (other pages redirect there via requireCompany).
  if (!company) {
    return <div className="min-h-dvh bg-canvas/70">{children}</div>;
  }
  const [bell, [{ n: newApplicants }]] = await Promise.all([
    getBellData(user.id),
    db
      .select({ n: count() })
      .from(applications)
      .innerJoin(opportunities, eq(applications.opportunityId, opportunities.id))
      .where(and(eq(opportunities.companyId, company.id), eq(applications.status, "submitted"))),
  ]);
  if (company.status === "suspended") redirect("/?suspended=1");
  const sections: NavSection[] = [
    {
      items: [
        { href: "/company", label: "Dashboard", icon: "LayoutDashboard", exact: true },
        { href: "/company/opportunities", label: "My Opportunities", icon: "Briefcase" },
        { href: "/company/opportunities/new", label: "Post Opportunity", icon: "PlusCircle", exact: true },
        { href: "/company/applicants", label: "Applicants", icon: "Users", badge: newApplicants || undefined },
        { href: "/company/profile", label: "Company Profile", icon: "Building2" },
        { href: "/company/notifications", label: "Notifications", icon: "BellRing", badge: bell.unread || undefined },
        { href: "/company/settings", label: "Settings", icon: "Settings" },
      ],
    },
  ];
  return (
    <DashboardShell
      sections={sections}
      user={{ name: company.name, email: user.email, avatarUrl: company.logoUrl ?? user.avatarUrl }}
      roleLabel={user.name}
      notifications={bell.items}
      unread={bell.unread}
      notificationsHref="/company/notifications"
      headerAction={
        <Button asChild size="sm" className="hidden sm:inline-flex">
          <Link href="/company/opportunities/new">
            <PlusCircle /> Post Opportunity
          </Link>
        </Button>
      }
    >
      {children}
    </DashboardShell>
  );
}
