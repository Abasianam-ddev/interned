import type { Metadata } from "next";
import { NotificationsList } from "@/components/dashboard/notifications-list";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Notifications" };

export default async function AdminNotificationsPage() {
  const user = await requireUser(["admin"]);
  return <NotificationsList userId={user.id} />;
}
