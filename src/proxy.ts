import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/session";

const protectedAreas: { prefix: string; roles: string[] }[] = [
  { prefix: "/dashboard", roles: ["student"] },
  { prefix: "/company", roles: ["company"] },
  { prefix: "/admin", roles: ["admin"] },
];

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const area = protectedAreas.find((a) => pathname === a.prefix || pathname.startsWith(`${a.prefix}/`));
  if (!area) return NextResponse.next();

  const session = await verifySession(request.cookies.get(SESSION_COOKIE)?.value);
  if (!session) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", pathname + search);
    return NextResponse.redirect(url);
  }
  if (!area.roles.includes(session.role)) {
    const home = session.role === "admin" ? "/admin" : session.role === "company" ? "/company" : "/dashboard";
    return NextResponse.redirect(new URL(home, request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/company/:path*", "/admin/:path*"],
};
