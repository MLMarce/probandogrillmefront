/** Fecha corta en es-AR evaluada sobre el día UTC guardado (coincide con lo que se envía al backend). */
export function fecha(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-AR", { timeZone: "UTC" });
}
