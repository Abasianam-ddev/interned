import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { pages } from "@/db/schema";

export async function getPage(slug: string) {
  return (await db.query.pages.findFirst({ where: eq(pages.slug, slug) })) ?? null;
}
