import type { paths } from "./schema";
import { clearSession, getSession, setSession } from "@/lib/session";

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export type HealthStatus =
  paths["/health"]["get"]["responses"]["200"]["content"]["application/json"];
export type LoginResponse =
  paths["/auth/login"]["post"]["responses"]["200"]["content"]["application/json"];
export type SessionUser =
  paths["/auth/session"]["get"]["responses"]["200"]["content"]["application/json"];

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
  await apiFetch("/auth/logout", { method: "POST" }, true);
  clearSession();
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
    throw new Error("No se pudo enviar el email de recuperación");
  }
}
