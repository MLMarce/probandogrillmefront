"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ApiError,
  AreaResponse,
  EmpleadoDetalle,
  EmpleadoListItem,
  getEmpleado,
  listAreas,
  listEmpleadosActivos,
  updateEmpleado,
} from "@/api/client";
import { Button } from "@/components/ui/button";

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
  supervisorId: string;
}

function toForm(e: EmpleadoDetalle): FormState {
  const dia = (iso: string | null) => (iso ? iso.slice(0, 10) : "");
  return {
    legajo: e.legajo,
    nombre: e.nombre,
    apellido: e.apellido,
    dni: e.dni,
    fechaNacimiento: dia(e.fechaNacimiento),
    email: e.email ?? "",
    telefono: e.telefono ?? "",
    direccion: e.direccion ?? "",
    puesto: e.puesto ?? "",
    fechaIngreso: dia(e.fechaIngreso),
    areaId: e.areaId ?? "",
    supervisorId: e.supervisorId ?? "",
  };
}

export function FichaEmpleado({ id }: { id: string }) {
  const router = useRouter();
  const [empleado, setEmpleado] = useState<EmpleadoDetalle | null>(null);
  const [areas, setAreas] = useState<AreaResponse[]>([]);
  const [activos, setActivos] = useState<EmpleadoListItem[]>([]);
  const [form, setForm] = useState<FormState | null>(null);
  const [editando, setEditando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getEmpleado(id), listAreas(), listEmpleadosActivos()])
      .then(([data, areasData, activosData]) => {
        if (cancelled) return;
        setEmpleado(data);
        setForm(toForm(data));
        setAreas(areasData);
        setActivos(activosData);
        setError(null);
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setError(e instanceof ApiError ? e.message : "No se pudo cargar la ficha");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  function set(campo: keyof FormState, valor: string) {
    setForm((f) => (f ? { ...f, [campo]: valor } : f));
  }

  async function onGuardar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form) return;
    setError(null);
    setGuardando(true);
    try {
      const actualizado = await updateEmpleado(id, form);
      setEmpleado(actualizado);
      setForm(toForm(actualizado));
      setEditando(false);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "No se pudo guardar la ficha");
    } finally {
      setGuardando(false);
    }
  }

  const fecha = (iso: string | null) =>
    iso ? new Date(iso).toLocaleDateString("es-AR") : "—";

  const filas: [string, string][] = empleado
    ? [
        ["Legajo", empleado.legajo],
        ["Nombre", empleado.nombre],
        ["Apellido", empleado.apellido],
        ["DNI", empleado.dni],
        ["Fecha de nacimiento", fecha(empleado.fechaNacimiento)],
        ["Email", empleado.email ?? "—"],
        ["Teléfono", empleado.telefono ?? "—"],
        ["Dirección", empleado.direccion ?? "—"],
        ["Puesto", empleado.puesto ?? "—"],
        ["Fecha de ingreso", fecha(empleado.fechaIngreso)],
        ["Estado", empleado.estado],
        ["Área", empleado.areaNombre ?? "—"],
        ["Supervisor", empleado.supervisorNombre ?? "—"],
      ]
    : [];

  const inputCls = "rounded border px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900";
  const labelCls = "flex flex-col gap-1 text-sm font-medium";

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 bg-zinc-50 p-8 dark:bg-black">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          {empleado ? `${empleado.nombre} ${empleado.apellido}` : "Ficha de Empleado"}
        </h1>
        <Link href="/empleados" className="text-sm underline text-zinc-600 dark:text-zinc-400">
          Volver al listado
        </Link>
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      {!empleado && !error && <p className="text-sm text-zinc-500">Cargando…</p>}

      {empleado && !editando && (
        <section className="rounded border bg-white dark:border-zinc-800 dark:bg-zinc-950">
          <dl className="divide-y dark:divide-zinc-800">
            {filas.map(([campo, valor]) => (
              <div key={campo} className="flex justify-between gap-4 px-4 py-2">
                <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">{campo}</dt>
                <dd className="text-sm">{valor}</dd>
              </div>
            ))}
          </dl>
          <div className="border-t px-4 py-3 dark:border-zinc-800">
            <Button onClick={() => setEditando(true)}>Editar</Button>
          </div>
        </section>
      )}

      {empleado && editando && form && (
        <form onSubmit={onGuardar} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className={labelCls}>
              Legajo
              <input
                value={form.legajo}
                onChange={(e) => set("legajo", e.target.value)}
                required
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
              Nombre
              <input
                value={form.nombre}
                onChange={(e) => set("nombre", e.target.value)}
                required
                className={inputCls}
              />
            </label>
            <label className={labelCls}>
              Apellido
              <input
                value={form.apellido}
                onChange={(e) => set("apellido", e.target.value)}
                required
                className={inputCls}
              />
            </label>
            <label className={labelCls}>
              DNI
              <input
                value={form.dni}
                onChange={(e) => set("dni", e.target.value)}
                required
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
            <label className={labelCls}>
              Supervisor
              <select
                value={form.supervisorId}
                onChange={(e) => set("supervisorId", e.target.value)}
                className={inputCls}
              >
                <option value="">Sin supervisor</option>
                {form.supervisorId &&
                  !activos.some((c) => c.id === form.supervisorId) && (
                    <option value={form.supervisorId}>
                      {empleado.supervisorNombre ?? form.supervisorId} (no activo)
                    </option>
                  )}
                {activos
                  .filter((c) => c.id !== empleado.id)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre} {c.apellido} ({c.legajo})
                    </option>
                  ))}
              </select>
            </label>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={guardando}>
              {guardando ? "Guardando…" : "Guardar"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setForm(toForm(empleado));
                setEditando(false);
                setError(null);
              }}
            >
              Cancelar
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push("/empleados")}>
              Ir al listado
            </Button>
          </div>
        </form>
      )}
    </main>
  );
}
