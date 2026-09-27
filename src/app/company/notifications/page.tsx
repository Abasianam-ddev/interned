import type { Metadata } from "next";
import { NotificationsList } from "@/components/dashboard/notifications-list";
import { requireCompany } from "@/lib/auth";

export const metadata: Metadata = { title: "Notifications" };

export default async function CompanyNotificationsPage() {
  const { user } = await requireCompany();
  return <NotificationsList userId={user.id} />;
}
