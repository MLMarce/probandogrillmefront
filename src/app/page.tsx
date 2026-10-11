"use client";

import { HealthBadge } from "@/components/health-badge";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-zinc-50 p-8 dark:bg-black">
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        Gestión de Empleados RRHH
      </h1>
      <HealthBadge />
      <Button>Comenzar</Button>
    </main>
  );
}
