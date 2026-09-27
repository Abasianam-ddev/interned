import Link from "next/link";
import { Compass } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-canvas px-6 text-center">
      <Logo />
      <div className="mt-12 flex size-16 items-center justify-center rounded-full bg-brand-100 text-brand-700">
        <Compass className="size-8" />
      </div>
      <h1 className="mt-6 text-3xl font-bold">Page not found</h1>
      <p className="mt-2 max-w-sm text-muted">The page you&apos;re looking for doesn&apos;t exist or may have been moved.</p>
      <div className="mt-8 flex gap-3">
        <Button asChild>
          <Link href="/">Go home</Link>
        </Button>
        <Button asChild variant="secondary">
          <Link href="/opportunities">Browse opportunities</Link>
        </Button>
      </div>
    </div>
  );
}
