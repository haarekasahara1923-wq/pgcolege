"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AutoRefresh() {
  const router = useRouter();

  useEffect(() => {
    // 1. Refresh on window focus
    const onFocus = () => {
      router.refresh();
    };

    window.addEventListener("focus", onFocus);

    // 2. Poll every 30 seconds for live updates
    const interval = setInterval(() => {
      router.refresh();
    }, 30000);

    return () => {
      window.removeEventListener("focus", onFocus);
      clearInterval(interval);
    };
  }, [router]);

  return null;
}
