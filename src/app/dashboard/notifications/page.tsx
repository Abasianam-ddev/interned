import type { Metadata } from "next";
import { NotificationsList } from "@/components/dashboard/notifications-list";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Notifications" };

export default async function StudentNotificationsPage() {
  const user = await requireUser(["student"]);
  return <NotificationsList userId={user.id} />;
}
