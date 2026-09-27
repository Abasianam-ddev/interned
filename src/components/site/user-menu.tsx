"use client";

import Link from "next/link";
import { Bell, Bookmark, FileText, LayoutDashboard, LogOut, Settings, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserAvatar } from "@/components/shared/company-logo";
import { logoutAction } from "@/app/actions/auth";

export type MenuUser = { name: string; email: string; role: "student" | "company" | "admin"; avatarUrl: string | null };

export function UserMenu({ user }: { user: MenuUser }) {
  const home = user.role === "admin" ? "/admin" : user.role === "company" ? "/company" : "/dashboard";
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
        <UserAvatar name={user.name} src={user.avatarUrl} className="size-9" />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>
          <div className="font-semibold text-ink">{user.name}</div>
          <div className="truncate text-xs text-muted">{user.email}</div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={home}>
            <LayoutDashboard /> Dashboard
          </Link>
        </DropdownMenuItem>
        {user.role === "student" && (
          <>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/saved">
                <Bookmark /> Saved Opportunities
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/applications">
                <FileText /> My Applications
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/alerts">
                <Bell /> Alerts
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/profile">
                <User /> Profile
              </Link>
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuItem asChild>
          <Link href={`${home}/settings`}>
            <Settings /> Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => logoutAction()} className="text-red-600 [&_svg]:text-red-500">
          <LogOut /> Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
