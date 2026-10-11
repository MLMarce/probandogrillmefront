import { http, HttpResponse } from "msw";
import { API_URL } from "@/api/client";

export function makeToken(expSeconds = 3600): string {
  const payload = {
    exp: Math.floor(Date.now() / 1000) + expSeconds,
  };
  return `header.${btoa(JSON.stringify(payload))}.signature`;
}

export const handlers = [
  http.get(`${API_URL}/health`, () => {
    return HttpResponse.json({ status: "ok" });
  }),
  http.post(`${API_URL}/auth/login`, () => {
    return HttpResponse.json({
      access_token: makeToken(),
      token_type: "bearer",
      user: { id: "uuid-1", email: "rrhh@empresa.com" },
    });
  }),
  http.post(`${API_URL}/auth/logout`, () => {
    return new HttpResponse(null, { status: 200 });
  }),
  http.get(`${API_URL}/auth/session`, () => {
    return HttpResponse.json({ id: "uuid-1", email: "rrhh@empresa.com" });
  }),
  http.post(`${API_URL}/auth/reset-password`, () => {
    return new HttpResponse(null, { status: 202 });
  }),
];
