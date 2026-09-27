import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { FacebookIcon, InstagramIcon, LinkedInIcon, XIcon } from "@/components/shared/brand-icons";
import { Logo } from "@/components/shared/logo";
import type { SiteSettings } from "@/lib/settings";

const COLUMNS = [
  {
    title: "For Students",
    links: [
      { href: "/opportunities", label: "Browse Opportunities" },
      { href: "/fields", label: "Explore by Field" },
      { href: "/opportunities?type=siwes", label: "SIWES / IT Placements" },
      { href: "/dashboard/alerts", label: "Opportunity Alerts" },
      { href: "/resources", label: "Career Resources" },
    ],
  },
  {
    title: "For Companies",
    links: [
      { href: "/post-opportunity", label: "Post an Opportunity" },
      { href: "/signup?as=company", label: "Create Company Account" },
      { href: "/companies", label: "Company Directory" },
      { href: "/company", label: "Company Dashboard" },
    ],
  },
  {
    title: "Internly",
    links: [
      { href: "/about", label: "About Us" },
      { href: "/contact", label: "Contact" },
      { href: "/faq", label: "FAQ" },
      { href: "/report", label: "Report an Opportunity" },
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms of Service" },
    ],
  },
];

export function SiteFooter({ settings }: { settings: SiteSettings }) {
  const socials = [
    { href: settings.social.twitter, icon: XIcon, label: "X (Twitter)" },
    { href: settings.social.instagram, icon: InstagramIcon, label: "Instagram" },
    { href: settings.social.linkedin, icon: LinkedInIcon, label: "LinkedIn" },
    { href: settings.social.facebook, icon: FacebookIcon, label: "Facebook" },
  ].filter((s) => s.href);
  return (
    <footer className="bg-brand-950 text-white/80">
      <div className="container-page grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo light />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/65">
            Real opportunities. Real experience. A better you. Internly connects students and young professionals
            with verified internships across Nigeria.
          </p>
          <ul className="mt-6 space-y-2.5 text-sm">
            <li className="flex items-center gap-2.5">
              <Mail className="size-4 text-brand-300" /> {settings.contactEmail}
            </li>
            <li className="flex items-center gap-2.5">
              <Phone className="size-4 text-brand-300" /> {settings.contactPhone}
            </li>
            <li className="flex items-center gap-2.5">
              <MapPin className="size-4 text-brand-300" /> {settings.contactAddress}
            </li>
          </ul>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h3 className="mb-4 text-sm font-semibold text-white">{col.title}</h3>
            <ul className="space-y-2.5 text-sm">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-white/65 transition hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10">
        <div className="container-page flex flex-col items-center justify-between gap-4 py-6 text-xs text-white/55 sm:flex-row">
          <p>© {new Date().getFullYear()} Internly. Find Your Next Internship.</p>
          <div className="flex gap-2">
            {socials.map(({ href, icon: Icon, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="flex size-9 items-center justify-center rounded-full border border-white/15 text-white/75 transition hover:border-brand-300 hover:text-white"
              >
                <Icon className="size-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
