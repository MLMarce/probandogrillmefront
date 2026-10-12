"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  AreaResponse,
  EmpleadoListItem,
  PaginatedEmpleados,
  listAreas,
  listEmpleados,
} from "@/api/client";
import { AuthGuard } from "@/components/auth-guard";
import { Button } from "@/components/ui/button";

export default function EmpleadosPage() {
  return (
    <AuthGuard>
      <EmpleadosContent />
    </AuthGuard>
  );
}

interface Query {
  search: string;
  areaId: string;
  estado: string;
  page: number;
}

const PAGE_SIZE = 10;

function EmpleadosContent() {
  const [query, setQuery] = useState<Query>({ search: "", areaId: "", estado: "", page: 1 });
  const [data, setData] = useState<PaginatedEmpleados | null>(null);
  const [areas, setAreas] = useState<AreaResponse[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listAreas()
      .then(setAreas)
      .catch(() => setAreas([]));
  }, []);

  useEffect(() => {
    let cancelled = false;
    listEmpleados({
      search: query.search || undefined,
      areaId: query.areaId || undefined,
      estado: query.estado || undefined,
      page: query.page,
      pageSize: PAGE_SIZE,
    })
      .then((result) => {
        if (!cancelled) {
          setData(result);
          setError(null);
        }
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "No se pudo cargar el listado");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [query]);

  function onSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setQuery((q) => ({ ...q, search: String(formData.get("search") ?? ""), page: 1 }));
  }

  const totalPaginas = data ? Math.max(Math.ceil(data.total / PAGE_SIZE), 1) : 1;

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-6 bg-zinc-50 p-8 dark:bg-black">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Empleados</h1>

      <form onSubmit={onSearch} className="flex flex-wrap gap-2">
        <input
          name="search"
          defaultValue={query.search}
          placeholder="Buscar por nombre, apellido o legajo"
          className="min-w-64 flex-1 rounded border px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
        <select
          value={query.areaId}
          onChange={(e) => setQuery((q) => ({ ...q, areaId: e.target.value, page: 1 }))}
          className="rounded border px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        >
          <option value="">Todas las áreas</option>
          {areas.map((area) => (
            <option key={area.id} value={area.id}>
              {area.nombre}
            </option>
          ))}
        </select>
        <select
          value={query.estado}
          onChange={(e) => setQuery((q) => ({ ...q, estado: e.target.value, page: 1 }))}
          className="rounded border px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        >
          <option value="">Todos los estados</option>
          <option value="activo">Activo</option>
          <option value="inactivo">Inactivo</option>
          <option value="licencia">Licencia</option>
        </select>
        <Button type="submit">Buscar</Button>
      </form>

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      <table className="w-full border-collapse rounded border bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <thead>
          <tr className="border-b text-left dark:border-zinc-800">
            <th className="px-3 py-2">Legajo</th>
            <th className="px-3 py-2">Nombre</th>
            <th className="px-3 py-2">Área</th>
            <th className="px-3 py-2">Puesto</th>
            <th className="px-3 py-2">Estado</th>
          </tr>
        </thead>
        <tbody>
          {data?.items.map((empleado: EmpleadoListItem) => (
            <tr key={empleado.id} className="border-b last:border-0 dark:border-zinc-800">
              <td className="px-3 py-2">{empleado.legajo}</td>
              <td className="px-3 py-2">
                {empleado.nombre} {empleado.apellido}
              </td>
              <td className="px-3 py-2">{empleado.areaNombre ?? "—"}</td>
              <td className="px-3 py-2">{empleado.puesto ?? "—"}</td>
              <td className="px-3 py-2">{empleado.estado}</td>
            </tr>
          ))}
          {data?.items.length === 0 && (
            <tr>
              <td colSpan={5} className="px-3 py-4 text-center text-sm text-zinc-500">
                No hay Empleados que coincidan.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <nav className="flex items-center justify-between text-sm">
        <span>
          {data ? `${data.total} Empleados · página ${data.page} de ${totalPaginas}` : "Cargando…"}
        </span>
        <span className="flex gap-2">
          <Button
            variant="outline"
            disabled={query.page <= 1}
            onClick={() => setQuery((q) => ({ ...q, page: q.page - 1 }))}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            disabled={query.page >= totalPaginas}
            onClick={() => setQuery((q) => ({ ...q, page: q.page + 1 }))}
          >
            Siguiente
          </Button>
        </span>
      </nav>
    </main>
  );
}
