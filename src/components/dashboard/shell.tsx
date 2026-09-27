"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  BellRing,
  BookOpen,
  Bookmark,
  Briefcase,
  Building2,
  CircleHelp,
  FileText,
  Flag,
  Globe,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  NotebookText,
  PlusCircle,
  Search,
  Settings,
  Tags,
  User,
  Users,
  type LucideIcon,
} from "lucide-react";

const NAV_ICONS = {
  Bell,
  BellRing,
  BookOpen,
  Bookmark,
  Briefcase,
  Building2,
  CircleHelp,
  FileText,
  Flag,
  LayoutDashboard,
  Mail,
  NotebookText,
  PlusCircle,
  Search,
  Settings,
  Tags,
  User,
  Users,
} satisfies Record<string, LucideIcon>;
import { Logo } from "@/components/shared/logo";
import { UserAvatar } from "@/components/shared/company-logo";
import { Sheet } from "@/components/ui/dialog";
import { logoutAction } from "@/app/actions/auth";
import { cn } from "@/lib/utils";
import { NotificationBell, type BellItem } from "./notification-bell";

export type NavItem = { href: string; label: string; icon: keyof typeof NAV_ICONS; badge?: number; exact?: boolean };
export type NavSection = { title?: string; items: NavItem[] };

function Nav({ sections, onNavigate }: { sections: NavSection[]; onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-6">
      {sections.map((s, i) => (
        <div key={i}>
          {s.title && <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted">{s.title}</p>}
          <ul className="space-y-1">
            {s.items.map((item) => {
              const Icon = NAV_ICONS[item.icon];
              const active = item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
                      active ? "bg-brand-100 text-brand-800" : "text-ink/75 hover:bg-canvas hover:text-ink",
                    )}
                  >
                    <Icon className={cn("size-[18px]", active ? "text-brand-700" : "text-ink/55")} />
                    <span className="flex-1">{item.label}</span>
                    {!!item.badge && (
                      <span className="rounded-full bg-brand-600 px-1.5 py-0.5 text-[10px] font-bold text-white">{item.badge}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

export function DashboardShell({
  sections,
  user,
  notifications,
  unread,
  notificationsHref,
  children,
  roleLabel,
  headerAction,
}: {
  sections: NavSection[];
  user: { name: string; email: string; avatarUrl: string | null };
  notifications: BellItem[];
  unread: number;
  notificationsHref: string;
  children: React.ReactNode;
  roleLabel: string;
  headerAction?: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  const footer = (
    <div className="border-t border-line p-4">
      <div className="mb-3 flex items-center gap-3 px-1">
        <UserAvatar name={user.name} src={user.avatarUrl} className="size-9" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{user.name}</p>
          <p className="truncate text-xs text-muted">{roleLabel}</p>
        </div>
      </div>
      <button
        onClick={() => logoutAction()}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-ink/70 hover:bg-red-50 hover:text-red-600"
      >
        <LogOut className="size-[18px]" /> Log out
      </button>
    </div>
  );
  return (
    <div className="min-h-dvh bg-canvas/70">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-line bg-white lg:flex">
        <div className="flex h-[72px] items-center px-6">
          <Logo />
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <Nav sections={sections} />
        </div>
        {footer}
      </aside>
      <Sheet open={open} onOpenChange={setOpen} title="Navigation" side="left">
        <div className="flex h-[72px] items-center px-6">
          <Logo />
        </div>
        <div className="flex-1 px-4 py-4">
          <Nav sections={sections} onNavigate={() => setOpen(false)} />
        </div>
        {footer}
      </Sheet>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-[72px] items-center gap-3 border-b border-line bg-white/95 px-4 backdrop-blur sm:px-8">
          <button className="rounded-lg p-2 hover:bg-canvas lg:hidden" onClick={() => setOpen(true)} aria-label="Open navigation">
            <Menu className="size-5" />
          </button>
          <Link href="/" className="hidden items-center gap-1.5 text-sm text-muted hover:text-brand-700 sm:flex">
            <Globe className="size-4" /> View site
          </Link>
          <div className="ml-auto flex items-center gap-2">
            {headerAction}
            <NotificationBell items={notifications} unread={unread} allHref={notificationsHref} />
            <UserAvatar name={user.name} src={user.avatarUrl} className="size-9" />
          </div>
        </header>
        <main className="mx-auto max-w-[1280px] px-4 py-8 sm:px-8">{children}</main>
      </div>
    </div>
  );
}
