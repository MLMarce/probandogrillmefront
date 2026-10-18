"use client";

import { ChangeEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ApiError,
  ConfirmacionImportacion,
  PreviewImportacion,
  confirmarImportacion,
  previewImportacion,
} from "@/api/client";
import { AuthGuard } from "@/components/auth-guard";
import { Button, buttonVariants } from "@/components/ui/button";

const PLANTILLA = [
  "legajo,nombre,apellido,dni,email,telefono,direccion,puesto,fechaNacimiento,fechaIngreso,area",
  "L-9001,Juana,Pérez,30111222,juana@empresa.com,1122334455,Calle Falsa 123,Contadora,1990-05-12,2024-03-01,Administración",
  "",
].join("\n");

const PLANTILLA_URL = `data:text/csv;charset=utf-8,${encodeURIComponent(PLANTILLA)}`;

type Fase = "carga" | "preview" | "resumen";

type EstadoFilaImportacion = "valida" | "error" | "omitida" | "creada";

const CLASES_ESTADO: Record<EstadoFilaImportacion, string> = {
  valida: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  creada: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  error: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  omitida: "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
};

function EstadoFila({ estado }: { estado: EstadoFilaImportacion }) {
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${CLASES_ESTADO[estado]}`}
    >
      {estado}
    </span>
  );
}

const TONOS_CONTADOR = {
  verde: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  rojo: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  gris: "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
} as const;

function Contador({
  n,
  label,
  tono,
}: {
  n: number;
  label: string;
  tono: keyof typeof TONOS_CONTADOR;
}) {
  return (
    <span className={`rounded-full px-3 py-1 text-sm font-medium ${TONOS_CONTADOR[tono]}`}>
      {n} {label}
    </span>
  );
}

export default function ImportarPage() {
  return (
    <AuthGuard>
      <ImportarContent />
    </AuthGuard>
  );
}

function ImportarContent() {
  const router = useRouter();
  const [fase, setFase] = useState<Fase>("carga");
  const [csv, setCsv] = useState("");
  const [preview, setPreview] = useState<PreviewImportacion | null>(null);
  const [resumen, setResumen] = useState<ConfirmacionImportacion | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  async function onArchivo(event: ChangeEvent<HTMLInputElement>) {
    const archivo = event.target.files?.[0];
    event.target.value = "";
    if (!archivo) return;
    setError(null);
    setCargando(true);
    try {
      const texto = await archivo.text();
      const resultado = await previewImportacion(texto);
      setCsv(texto);
      setPreview(resultado);
      setFase("preview");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "No se pudo procesar el archivo");
    } finally {
      setCargando(false);
    }
  }

  async function onConfirmar() {
    setError(null);
    setCargando(true);
    try {
      const resultado = await confirmarImportacion(csv);
      setResumen(resultado);
      setFase("resumen");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "No se pudo confirmar la importación");
    } finally {
      setCargando(false);
    }
  }

  function reiniciar() {
    setFase("carga");
    setCsv("");
    setPreview(null);
    setResumen(null);
    setError(null);
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-6 bg-zinc-50 p-8 dark:bg-black">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Importar Empleados (CSV)
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

      {fase === "carga" && (
        <section className="flex flex-col gap-4 rounded border bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Subí un CSV con una fila de encabezados y una fila por Empleado. Antes de importar vas a
            ver una preview con la validación de cada fila; nada se escribe hasta que confirmes.
          </p>
          <a
            href={PLANTILLA_URL}
            download="empleados-plantilla.csv"
            className={`${buttonVariants({ variant: "outline" })} w-fit no-underline`}
          >
            Descargar plantilla
          </a>
          <label className="flex flex-col gap-1 text-sm font-medium">
            Archivo CSV
            <input
              type="file"
              accept=".csv,text/csv"
              aria-label="Archivo CSV"
              onChange={(e) => void onArchivo(e)}
              className="rounded border px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
            />
          </label>
          {cargando && <p className="text-sm text-zinc-500">Validando el archivo…</p>}
        </section>
      )}

      {fase === "preview" && preview && (
        <section className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3 rounded border bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
            <span className="text-sm font-medium">{preview.resumen.total} filas</span>
            <Contador n={preview.resumen.validas} label="válidas" tono="verde" />
            <Contador n={preview.resumen.errores} label="errores" tono="rojo" />
            <Contador n={preview.resumen.omitidas} label="omitidas" tono="gris" />
          </div>

          <div className="overflow-x-auto rounded border bg-white dark:border-zinc-800 dark:bg-zinc-950">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b text-left dark:border-zinc-800">
                  <th className="px-3 py-2">Fila</th>
                  <th className="px-3 py-2">Legajo</th>
                  <th className="px-3 py-2">Nombre</th>
                  <th className="px-3 py-2">Apellido</th>
                  <th className="px-3 py-2">DNI</th>
                  <th className="px-3 py-2">Email</th>
                  <th className="px-3 py-2">Área</th>
                  <th className="px-3 py-2">Estado</th>
                  <th className="px-3 py-2">Motivo</th>
                </tr>
              </thead>
              <tbody>
                {preview.filas.map((fila) => (
                  <tr key={fila.fila} className="border-b last:border-0 dark:border-zinc-800">
                    <td className="px-3 py-2">{fila.fila}</td>
                    <td className="px-3 py-2">{fila.legajo ?? "— (auto)"}</td>
                    <td className="px-3 py-2">{fila.nombre}</td>
                    <td className="px-3 py-2">{fila.apellido}</td>
                    <td className="px-3 py-2">{fila.dni}</td>
                    <td className="px-3 py-2">{fila.email ?? "—"}</td>
                    <td className="px-3 py-2">{fila.area ?? "—"}</td>
                    <td className="px-3 py-2">
                      <EstadoFila estado={fila.estado} />
                    </td>
                    <td className="px-3 py-2 text-sm text-zinc-600 dark:text-zinc-400">
                      {fila.motivo ?? ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => void onConfirmar()}
              disabled={cargando || preview.resumen.validas === 0}
            >
              {cargando ? "Importando…" : "Confirmar importación"}
            </Button>
            <Button variant="outline" onClick={reiniciar} disabled={cargando}>
              Cancelar
            </Button>
          </div>
        </section>
      )}

      {fase === "resumen" && resumen && (
        <section className="flex flex-col gap-4 rounded border bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Importación finalizada
          </h2>
          <div className="flex flex-wrap gap-3">
            <Contador n={resumen.creados} label="creados" tono="verde" />
            <Contador n={resumen.omitidos} label="omitidos" tono="gris" />
            <Contador n={resumen.errores} label="errores" tono="rojo" />
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              de {resumen.totalFilas} filas
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b text-left dark:border-zinc-800">
                  <th className="px-3 py-2">Fila</th>
                  <th className="px-3 py-2">Nombre</th>
                  <th className="px-3 py-2">DNI</th>
                  <th className="px-3 py-2">Legajo</th>
                  <th className="px-3 py-2">Estado</th>
                  <th className="px-3 py-2">Motivo</th>
                </tr>
              </thead>
              <tbody>
                {resumen.detalle.map((fila) => (
                  <tr key={fila.fila} className="border-b last:border-0 dark:border-zinc-800">
                    <td className="px-3 py-2">{fila.fila}</td>
                    <td className="px-3 py-2">
                      {fila.nombre} {fila.apellido}
                    </td>
                    <td className="px-3 py-2">{fila.dni}</td>
                    <td className="px-3 py-2">{fila.legajo ?? "—"}</td>
                    <td className="px-3 py-2">
                      <EstadoFila estado={fila.estado} />
                    </td>
                    <td className="px-3 py-2 text-sm text-zinc-600 dark:text-zinc-400">
                      {fila.motivo ?? ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex gap-2">
            <Button onClick={() => router.push("/empleados")}>Ir al listado</Button>
            <Button variant="outline" onClick={reiniciar}>
              Importar otro archivo
            </Button>
          </div>
        </section>
      )}
    </main>
  );
}
