import "server-only";
import { db } from "@/db";
import { notifications } from "@/db/schema";

export async function notify(userId: string, n: { type: string; title: string; body?: string; link?: string }) {
  await db.insert(notifications).values({ userId, ...n });
}
