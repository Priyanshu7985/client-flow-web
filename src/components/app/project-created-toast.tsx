"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";

/** Shows a success toast after redirect from project creation, then cleans the URL. */
export function ProjectCreatedToast() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (params.get("created") === "1") {
      toast.success("Project created successfully");
      router.replace(pathname);
    }
  }, [params, router, pathname]);

  return null;
}
