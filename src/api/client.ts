import type { paths } from "./schema";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export type HealthStatus =
  paths["/health"]["get"]["responses"]["200"]["content"]["application/json"];

export async function getHealth(): Promise<HealthStatus> {
  const res = await fetch(`${API_URL}/health`);
  if (!res.ok) {
    throw new Error(`Health check failed: ${res.status}`);
  }
  return (await res.json()) as HealthStatus;
}
