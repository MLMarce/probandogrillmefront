"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { login, recoverPassword } from "@/api/client";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await login(email, password);
      router.push("/");
    } catch {
      setError("Credenciales inválidas");
    } finally {
      setBusy(false);
    }
  }

  async function onRecover() {
    setError(null);
    setNotice(null);
    try {
      await recoverPassword(email);
      setNotice("Si el email existe, se envió el link de recuperación.");
    } catch {
      setError("No se pudo enviar el email de recuperación");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 p-8 dark:bg-black">
      <form
        onSubmit={onSubmit}
        className="flex w-full max-w-sm flex-col gap-4 rounded-lg border bg-white p-8 dark:border-zinc-800 dark:bg-zinc-950"
      >
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Gestión de Empleados RRHH
        </h1>
        <label className="flex flex-col gap-1 text-sm">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded border px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Contraseña
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded border px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>
        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}
        {notice && (
          <p role="status" className="text-sm text-green-700">
            {notice}
          </p>
        )}
        <Button type="submit" disabled={busy}>
          {busy ? "Ingresando…" : "Ingresar"}
        </Button>
        <button
          type="button"
          onClick={onRecover}
          className="text-sm text-zinc-600 underline dark:text-zinc-400"
        >
          ¿Olvidaste tu contraseña?
        </button>
      </form>
    </main>
  );
}
