import { redirect } from "next/navigation";
import { BadgeCheck, Briefcase, GraduationCap } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { getCurrentUser, homeFor } from "@/lib/auth";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (user) redirect(homeFor(user.role));
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1fr_minmax(0,560px)] xl:grid-cols-[1fr_640px]">
      <div className="flex flex-col px-5 py-8 sm:px-10">
        <Logo />
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-md">{children}</div>
        </div>
        <p className="text-center text-xs text-muted">© {new Date().getFullYear()} Internly. Real opportunities. Real experience.</p>
      </div>
      <aside className="relative hidden overflow-hidden bg-brand-900 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-24 -top-24 size-96 rounded-full bg-brand-700/40" />
        <div className="absolute -bottom-32 -left-20 size-96 rounded-full bg-brand-800" />
        <div className="relative">
          <Logo light />
        </div>
        <div className="relative">
          <p className="font-script text-4xl text-brand-300">Learn. Gain experience. Grow.</p>
          <h2 className="mt-4 max-w-md text-4xl font-bold leading-tight">Find Your Next Internship.</h2>
          <p className="mt-4 max-w-sm text-white/70">
            Join thousands of students discovering verified internships and SIWES placements across Nigeria.
          </p>
          <ul className="mt-10 space-y-4 text-sm">
            {[
              { icon: BadgeCheck, text: "Every opportunity reviewed for legitimacy" },
              { icon: GraduationCap, text: "Built for students and fresh graduates" },
              { icon: Briefcase, text: "Apply and track applications in one place" },
            ].map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-full bg-white/10">
                  <Icon className="size-4 text-brand-300" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>
        <svg viewBox="0 0 200 40" className="relative w-48 text-brand-300" aria-hidden>
          <path d="M2 30 C60 10 120 5 190 12" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M175 4 L192 12 L178 22" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />
        </svg>
      </aside>
    </div>
  );
}
