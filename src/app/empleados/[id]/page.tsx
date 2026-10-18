import { Suspense } from "react";
import { AuthGuard } from "@/components/auth-guard";
import { FichaEmpleado } from "./ficha";

export default function FichaEmpleadoPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-2xl p-8 text-sm text-zinc-500">Cargando ficha…</main>
      }
    >
      <FichaLoader params={params} />
    </Suspense>
  );
}

async function FichaLoader({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <AuthGuard>
      <FichaEmpleado id={id} />
    </AuthGuard>
  );
}
