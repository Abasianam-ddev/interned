import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { getCurrentUser } from "@/lib/auth";
import { getSettings } from "@/lib/settings";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [user, settings] = await Promise.all([getCurrentUser(), getSettings()]);
  return (
    <div className="flex min-h-dvh flex-col">
      {settings.announcement && (
        <div className="bg-brand-900 px-4 py-2 text-center text-xs font-medium text-white">{settings.announcement}</div>
      )}
      <SiteHeader
        user={user ? { name: user.name, email: user.email, role: user.role, avatarUrl: user.avatarUrl } : null}
      />
      <main className="flex-1">{children}</main>
      <SiteFooter settings={settings} />
    </div>
  );
}
