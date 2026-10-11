"use client";

import { useRouter } from "next/navigation";
import { HealthBadge } from "@/components/health-badge";
import { AuthGuard } from "@/components/auth-guard";
import { Button } from "@/components/ui/button";
import { logout } from "@/api/client";

export default function Home() {
  const router = useRouter();

  async function onLogout() {
    try {
      await logout();
    } finally {
      router.push("/login");
    }
  }

  return (
    <AuthGuard>
      <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-zinc-50 p-8 dark:bg-black">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Gestión de Empleados RRHH
        </h1>
        <HealthBadge />
        <Button variant="outline" onClick={onLogout}>
          Cerrar sesión
        </Button>
      </main>
    </AuthGuard>
  );
}
