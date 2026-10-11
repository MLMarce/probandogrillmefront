"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/session";

function subscribe(callback: () => void) {
  window.addEventListener("focus", callback);
  return () => window.removeEventListener("focus", callback);
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const hasSession = useSyncExternalStore(
    subscribe,
    () => getSession() !== null,
    () => false,
  );

  useEffect(() => {
    if (!hasSession) {
      router.replace("/login");
    }
  }, [hasSession, router]);

  if (!hasSession) return null;
  return <>{children}</>;
}
