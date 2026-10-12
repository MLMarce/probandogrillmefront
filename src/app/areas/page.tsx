"use client";

import { FormEvent, useEffect, useState } from "react";
import { ApiError, AreaResponse, createArea, deleteArea, listAreas, updateArea } from "@/api/client";
import { AuthGuard } from "@/components/auth-guard";
import { Button } from "@/components/ui/button";

export default function AreasPage() {
  return (
    <AuthGuard>
      <AreasContent />
    </AuthGuard>
  );
}

function AreasContent() {
  const [areas, setAreas] = useState<AreaResponse[]>([]);
  const [nombre, setNombre] = useState("");
  const [editando, setEditando] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    try {
      setAreas(await listAreas());
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudieron cargar las áreas");
    }
  }

  useEffect(() => {
    let cancelled = false;
    listAreas()
      .then((data) => {
        if (!cancelled) setAreas(data);
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "No se pudieron cargar las áreas");
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    try {
      if (editando) {
        await updateArea(editando, nombre);
      } else {
        await createArea(nombre);
      }
      setNombre("");
      setEditando(null);
      await refresh();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "No se pudo guardar el área");
    }
  }

  async function onDelete(id: string) {
    setError(null);
    try {
      await deleteArea(id);
      await refresh();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "No se pudo borrar el área");
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 bg-zinc-50 p-8 dark:bg-black">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Áreas</h1>

      <form onSubmit={onSubmit} className="flex gap-2">
        <input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Nombre del área"
          required
          minLength={2}
          className="flex-1 rounded border px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
        <Button type="submit">{editando ? "Guardar" : "Crear"}</Button>
        {editando && (
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setEditando(null);
              setNombre("");
            }}
          >
            Cancelar
          </Button>
        )}
      </form>

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      <ul className="flex flex-col gap-2">
        {areas.map((area) => (
          <li
            key={area.id}
            className="flex items-center justify-between rounded border bg-white px-4 py-2 dark:border-zinc-800 dark:bg-zinc-950"
          >
            <span>{area.nombre}</span>
            <span className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setEditando(area.id);
                  setNombre(area.nombre);
                }}
              >
                Editar
              </Button>
              <Button variant="destructive" onClick={() => void onDelete(area.id)}>
                Borrar
              </Button>
            </span>
          </li>
        ))}
        {areas.length === 0 && <li className="text-sm text-zinc-500">No hay áreas cargadas.</li>}
      </ul>
    </main>
  );
}
