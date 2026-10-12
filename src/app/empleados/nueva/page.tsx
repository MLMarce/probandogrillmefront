"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ApiError, AreaResponse, createEmpleado, listAreas } from "@/api/client";
import { AuthGuard } from "@/components/auth-guard";
import { Button } from "@/components/ui/button";

export default function NuevoEmpleadoPage() {
  return (
    <AuthGuard>
      <NuevoEmpleadoContent />
    </AuthGuard>
  );
}

interface FormState {
  legajo: string;
  nombre: string;
  apellido: string;
  dni: string;
  fechaNacimiento: string;
  email: string;
  telefono: string;
  direccion: string;
  puesto: string;
  fechaIngreso: string;
  areaId: string;
}

const INITIAL: FormState = {
  legajo: "",
  nombre: "",
  apellido: "",
  dni: "",
  fechaNacimiento: "",
  email: "",
  telefono: "",
  direccion: "",
  puesto: "",
  fechaIngreso: "",
  areaId: "",
};

function NuevoEmpleadoContent() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(INITIAL);
  const [areas, setAreas] = useState<AreaResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    let cancelled = false;
    listAreas()
      .then((data) => {
        if (!cancelled) setAreas(data);
      })
      .catch(() => {
        if (!cancelled) setAreas([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function set(campo: keyof FormState, valor: string) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setGuardando(true);
    try {
      await createEmpleado({
        legajo: form.legajo || undefined,
        nombre: form.nombre,
        apellido: form.apellido,
        dni: form.dni,
        fechaNacimiento: form.fechaNacimiento || undefined,
        email: form.email || undefined,
        telefono: form.telefono || undefined,
        direccion: form.direccion || undefined,
        puesto: form.puesto || undefined,
        fechaIngreso: form.fechaIngreso || undefined,
        areaId: form.areaId || undefined,
      });
      router.push("/empleados");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "No se pudo crear el Empleado");
      setGuardando(false);
    }
  }

  const inputCls = "rounded border px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900";
  const labelCls = "flex flex-col gap-1 text-sm font-medium";

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 bg-zinc-50 p-8 dark:bg-black">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Nuevo Empleado</h1>
        <Link href="/empleados" className="text-sm underline text-zinc-600 dark:text-zinc-400">
          Volver al listado
        </Link>
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className={labelCls}>
            Legajo (opcional)
            <input
              value={form.legajo}
              onChange={(e) => set("legajo", e.target.value)}
              placeholder="Se autgenera si queda vacío"
              className={inputCls}
            />
          </label>
          <label className={labelCls}>
            Área
            <select
              value={form.areaId}
              onChange={(e) => set("areaId", e.target.value)}
              className={inputCls}
            >
              <option value="">Sin área</option>
              {areas.map((area) => (
                <option key={area.id} value={area.id}>
                  {area.nombre}
                </option>
              ))}
            </select>
          </label>
          <label className={labelCls}>
            Nombre *
            <input
              value={form.nombre}
              onChange={(e) => set("nombre", e.target.value)}
              required
              minLength={1}
              className={inputCls}
            />
          </label>
          <label className={labelCls}>
            Apellido *
            <input
              value={form.apellido}
              onChange={(e) => set("apellido", e.target.value)}
              required
              minLength={1}
              className={inputCls}
            />
          </label>
          <label className={labelCls}>
            DNI *
            <input
              value={form.dni}
              onChange={(e) => set("dni", e.target.value)}
              required
              minLength={7}
              className={inputCls}
            />
          </label>
          <label className={labelCls}>
            Fecha de nacimiento
            <input
              type="date"
              value={form.fechaNacimiento}
              onChange={(e) => set("fechaNacimiento", e.target.value)}
              className={inputCls}
            />
          </label>
          <label className={labelCls}>
            Email
            <input
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              className={inputCls}
            />
          </label>
          <label className={labelCls}>
            Teléfono
            <input
              value={form.telefono}
              onChange={(e) => set("telefono", e.target.value)}
              className={inputCls}
            />
          </label>
          <label className={labelCls}>
            Dirección
            <input
              value={form.direccion}
              onChange={(e) => set("direccion", e.target.value)}
              className={inputCls}
            />
          </label>
          <label className={labelCls}>
            Puesto
            <input
              value={form.puesto}
              onChange={(e) => set("puesto", e.target.value)}
              className={inputCls}
            />
          </label>
          <label className={labelCls}>
            Fecha de ingreso
            <input
              type="date"
              value={form.fechaIngreso}
              onChange={(e) => set("fechaIngreso", e.target.value)}
              className={inputCls}
            />
          </label>
        </div>

        <div className="flex gap-2">
          <Button type="submit" disabled={guardando}>
            {guardando ? "Guardando…" : "Crear Empleado"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push("/empleados")}>
            Cancelar
          </Button>
        </div>
      </form>
    </main>
  );
}
