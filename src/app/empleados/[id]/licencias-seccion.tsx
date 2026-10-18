"use client";

import { FormEvent, useState } from "react";
import {
  ApiError,
  EmpleadoDetalle,
  LicenciaResponse,
  createLicencia,
  getEmpleado,
  listLicencias,
} from "@/api/client";
import { fecha } from "@/lib/fechas";
import { Button } from "@/components/ui/button";

interface Props {
  empleadoId: string;
  licencias: LicenciaResponse[];
  onActualizado: (licencias: LicenciaResponse[], empleado: EmpleadoDetalle) => void;
  onError: (mensaje: string | null) => void;
}

const inputCls = "rounded border px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900";
const labelCls = "flex flex-col gap-1 text-sm font-medium";

export function LicenciasSection({ empleadoId, licencias, onActualizado, onError }: Props) {
  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState({ desde: "", hasta: "", motivo: "" });
  const [guardando, setGuardando] = useState(false);

  async function onCrear(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onError(null);
    setGuardando(true);
    try {
      await createLicencia({
        empleadoId,
        desde: form.desde,
        hasta: form.hasta,
        motivo: form.motivo || undefined,
      });
      const [licenciasData, empleado] = await Promise.all([
        listLicencias(empleadoId),
        getEmpleado(empleadoId),
      ]);
      onActualizado(licenciasData, empleado);
      setForm({ desde: "", hasta: "", motivo: "" });
      setMostrarForm(false);
    } catch (e) {
      onError(e instanceof ApiError ? e.message : "No se pudo registrar la licencia");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <section className="rounded border bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center justify-between border-b px-4 py-3 dark:border-zinc-800">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Licencias</h2>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setMostrarForm((v) => !v);
            onError(null);
          }}
        >
          {mostrarForm ? "Cancelar" : "Registrar licencia"}
        </Button>
      </div>

      {mostrarForm && (
        <form
          onSubmit={onCrear}
          className="flex flex-col gap-3 border-b px-4 py-3 dark:border-zinc-800"
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <label className={labelCls}>
              Desde
              <input
                type="date"
                required
                value={form.desde}
                onChange={(e) => setForm((f) => ({ ...f, desde: e.target.value }))}
                className={inputCls}
              />
            </label>
            <label className={labelCls}>
              Hasta
              <input
                type="date"
                required
                value={form.hasta}
                onChange={(e) => setForm((f) => ({ ...f, hasta: e.target.value }))}
                className={inputCls}
              />
            </label>
            <label className={labelCls}>
              Motivo (opcional)
              <input
                value={form.motivo}
                onChange={(e) => setForm((f) => ({ ...f, motivo: e.target.value }))}
                className={inputCls}
              />
            </label>
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={guardando}>
              {guardando ? "Guardando…" : "Guardar licencia"}
            </Button>
          </div>
        </form>
      )}

      <ul className="divide-y dark:divide-zinc-800">
        {licencias.length === 0 && (
          <li className="px-4 py-3 text-sm text-zinc-500">Sin licencias registradas.</li>
        )}
        {licencias.map((l) => (
          <li
            key={l.id}
            className={`flex flex-wrap items-center justify-between gap-2 px-4 py-2 ${
              l.vigente
                ? "border-l-4 border-amber-500 bg-amber-50 dark:bg-amber-950/20"
                : ""
            }`}
          >
            <span className="text-sm">
              {fecha(l.desde)} – {fecha(l.hasta)}
            </span>
            <span className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
              {l.motivo ?? "Sin motivo"}
              {l.vigente && (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                  Vigente
                </span>
              )}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
