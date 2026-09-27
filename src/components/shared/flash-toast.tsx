"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

/** Shows a toast for a `?<param>=message` query string and then removes it from the URL. */
export function FlashToast({ param = "saved" }: { param?: string }) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const msg = params.get(param);
  useEffect(() => {
    if (!msg) return;
    toast.success(msg);
    const sp = new URLSearchParams(params.toString());
    sp.delete(param);
    sp.delete("slug");
    router.replace(sp.size ? `${pathname}?${sp}` : pathname, { scroll: false });
  }, [msg, param, params, pathname, router]);
  return null;
}
