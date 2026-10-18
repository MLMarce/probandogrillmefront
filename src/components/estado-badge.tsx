const CLASES: Record<string, string> = {
  activo: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  inactivo: "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  licencia: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
};

export function EstadoBadge({ estado }: { estado: string }) {
  const clases = CLASES[estado] ?? CLASES.inactivo;
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${clases}`}
    >
      {estado}
    </span>
  );
}
