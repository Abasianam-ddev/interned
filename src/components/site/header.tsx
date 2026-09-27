"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, PlusCircle, Search } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { UserMenu, type MenuUser } from "./user-menu";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/opportunities", label: "Opportunities" },
  { href: "/companies", label: "Companies" },
  { href: "/resources", label: "Resources" },
];

export function SiteHeader({ user }: { user: MenuUser | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [searching, setSearching] = React.useState(false);
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const postHref = user?.role === "company" ? "/company/opportunities/new" : "/post-opportunity";

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-white/95 backdrop-blur">
      <div className="container-page flex h-[72px] items-center gap-6">
        <div className="flex items-center gap-6">
          <Logo />
          <p className="hidden items-center gap-2 text-xs text-muted 2xl:flex">
            Internships <span className="size-1 rounded-full bg-muted/50" /> Opportunities
            <span className="size-1 rounded-full bg-muted/50" /> Growth
          </p>
        </div>

        <nav className="mx-auto hidden items-center gap-7 lg:flex" aria-label="Main">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative py-6 text-[14px] font-medium text-ink/85 transition hover:text-brand-700",
                isActive(item.href) &&
                  "font-semibold text-brand-700 after:absolute after:inset-x-0 after:bottom-[18px] after:h-0.5 after:rounded-full after:bg-brand-600",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2.5 lg:ml-0">
          {searching ? (
            <form
              className="hidden items-center md:flex"
              onSubmit={(e) => {
                e.preventDefault();
                const q = new FormData(e.currentTarget).get("q");
                setSearching(false);
                router.push(`/opportunities?q=${encodeURIComponent(String(q ?? ""))}`);
              }}
            >
              <input
                autoFocus
                name="q"
                placeholder="Search opportunities…"
                onBlur={(e) => !e.currentTarget.value && setSearching(false)}
                className="h-10 w-56 rounded-lg border border-line px-3 text-sm focus:border-brand-500 focus:outline-none"
              />
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setSearching(true)}
              className="hidden size-10 items-center justify-center rounded-lg text-ink hover:bg-brand-50 md:flex"
              aria-label="Search"
            >
              <Search className="size-5" />
            </button>
          )}
          {user ? (
            <UserMenu user={user} />
          ) : (
            <>
              <Button asChild variant="outline" size="md" className="hidden sm:inline-flex">
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild variant="dark" size="md" className="hidden sm:inline-flex">
                <Link href="/signup">Sign up</Link>
              </Button>
            </>
          )}
          {user?.role !== "student" && user?.role !== "admin" && (
            <Button asChild variant="primary" size="md" className="ml-2 hidden xl:inline-flex">
              <Link href={postHref}>
                <PlusCircle /> Post Opportunity
              </Link>
            </Button>
          )}
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex size-10 items-center justify-center rounded-lg hover:bg-brand-50 lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </button>
        </div>
      </div>

      <Sheet open={open} onOpenChange={setOpen} title="Menu">
        <div className="flex h-[72px] items-center border-b border-line px-5">
          <Logo />
        </div>
        <form action="/opportunities" className="border-b border-line p-5" onSubmit={() => setOpen(false)}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <input
              name="q"
              placeholder="Search opportunities…"
              className="h-11 w-full rounded-lg border border-line pl-9 pr-3 text-sm focus:border-brand-500 focus:outline-none"
            />
          </div>
        </form>
        <nav className="flex flex-col p-3" aria-label="Mobile">
          {[...NAV, { href: "/fields", label: "Explore by Field" }, { href: "/about", label: "About" }, { href: "/contact", label: "Contact" }].map(
            (item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-lg px-3 py-3 text-[15px] font-medium",
                  isActive(item.href) ? "bg-brand-50 text-brand-700" : "text-ink hover:bg-canvas",
                )}
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>
        <div className="mt-auto flex flex-col gap-2.5 border-t border-line p-5">
          {!user && (
            <>
              <Button asChild variant="outline" size="lg">
                <Link href="/login" onClick={() => setOpen(false)}>
                  Log in
                </Link>
              </Button>
              <Button asChild variant="dark" size="lg">
                <Link href="/signup" onClick={() => setOpen(false)}>
                  Sign up
                </Link>
              </Button>
            </>
          )}
          {user?.role !== "student" && user?.role !== "admin" && (
            <Button asChild size="lg">
              <Link href={postHref} onClick={() => setOpen(false)}>
                <PlusCircle /> Post Opportunity
              </Link>
            </Button>
          )}
        </div>
      </Sheet>
    </header>
  );
}
