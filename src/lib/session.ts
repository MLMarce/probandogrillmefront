const COOKIE_NAME = "rrhh_token";

export function setSession(token: string): void {
  const maxAge = decodeJwtExp(token) ?? 3600;
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(token)}; path=/; max-age=${maxAge}; samesite=lax`;
}

export function getSession(): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function clearSession(): void {
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0`;
}

function decodeJwtExp(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (typeof payload.exp !== "number") return null;
    return Math.max(payload.exp - Math.floor(Date.now() / 1000), 60);
  } catch {
    return null;
  }
}
