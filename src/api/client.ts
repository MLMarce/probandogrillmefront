import type { paths } from "./schema";
import { clearSession, getSession, setSession } from "@/lib/session";

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export type HealthStatus =
  paths["/health"]["get"]["responses"]["200"]["content"]["application/json"];
export type LoginResponse =
  paths["/auth/login"]["post"]["responses"]["200"]["content"]["application/json"];
export type SessionUser =
  paths["/auth/session"]["get"]["responses"]["200"]["content"]["application/json"];
export type AreaResponse =
  paths["/areas"]["get"]["responses"]["200"]["content"]["application/json"][number];

export class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

async function readError(res: Response): Promise<ApiError> {
  let message = `Error ${res.status}`;
  try {
    const body = (await res.json()) as { message?: string };
    if (body.message) message = body.message;
  } catch {
    // respuesta sin cuerpo JSON
  }
  return new ApiError(message, res.status);
}

async function apiFetch(path: string, init: RequestInit = {}, withToken = false): Promise<Response> {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  if (withToken) {
    const token = getSession();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }
  return fetch(`${API_URL}${path}`, { ...init, headers });
}

export async function getHealth(): Promise<HealthStatus> {
  const res = await apiFetch("/health");
  if (!res.ok) {
    throw new Error(`Health check failed: ${res.status}`);
  }
  return (await res.json()) as HealthStatus;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const res = await apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    throw new Error("Credenciales inválidas");
  }
  const data = (await res.json()) as LoginResponse;
  setSession(data.access_token);
  return data;
}

export async function logout(): Promise<void> {
  try {
    await apiFetch("/auth/logout", { method: "POST" }, true);
  } finally {
    clearSession();
  }
}

export async function getSessionUser(): Promise<SessionUser> {
  const res = await apiFetch("/auth/session", {}, true);
  if (!res.ok) {
    throw new Error("Sesión inválida");
  }
  return (await res.json()) as SessionUser;
}

export async function recoverPassword(email: string): Promise<void> {
  const res = await apiFetch("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    throw await readError(res);
  }
}

export async function listAreas(): Promise<AreaResponse[]> {
  const res = await apiFetch("/areas");
  if (!res.ok) throw await readError(res);
  return (await res.json()) as AreaResponse[];
}

export async function createArea(nombre: string): Promise<AreaResponse> {
  const res = await apiFetch("/areas", {
    method: "POST",
    body: JSON.stringify({ nombre }),
  });
  if (!res.ok) throw await readError(res);
  return (await res.json()) as AreaResponse;
}

export async function updateArea(id: string, nombre: string): Promise<AreaResponse> {
  const res = await apiFetch(`/areas/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ nombre }),
  });
  if (!res.ok) throw await readError(res);
  return (await res.json()) as AreaResponse;
}

export async function deleteArea(id: string): Promise<void> {
  const res = await apiFetch(`/areas/${id}`, { method: "DELETE" });
  if (!res.ok) throw await readError(res);
}
