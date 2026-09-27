import { desc } from "drizzle-orm";
import { db } from "@/db";
import { alerts } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

function csvCell(v: unknown) {
  const s = v == null ? "" : String(v);
  // Neutralise spreadsheet formula injection and escape quotes.
  const safe = /^[=+\-@]/.test(s) ? `'${s}` : s;
  return `"${safe.replace(/"/g, '""')}"`;
}

export async function GET() {
  const user = await getCurrentUser();
  if (user?.role !== "admin") return new Response("Forbidden", { status: 403 });
  const rows = await db.select().from(alerts).orderBy(desc(alerts.createdAt));
  const header = ["email", "type", "keywords", "locations", "types", "work_modes", "frequency", "active", "created_at"];
  const lines = rows.map((a) =>
    [a.email, a.userId ? "student" : "subscriber", a.keywords, a.locations.join("|"), a.types.join("|"), a.workModes.join("|"), a.frequency, a.active, a.createdAt.toISOString()]
      .map(csvCell)
      .join(","),
  );
  return new Response([header.join(","), ...lines].join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="internly-subscribers-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
