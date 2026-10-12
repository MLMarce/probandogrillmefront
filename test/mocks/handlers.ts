import { http, HttpResponse } from "msw";
import { API_URL } from "@/api/client";

export function makeToken(expSeconds = 3600): string {
  const payload = {
    exp: Math.floor(Date.now() / 1000) + expSeconds,
  };
  return `header.${btoa(JSON.stringify(payload))}.signature`;
}

interface FakeArea {
  id: string;
  nombre: string;
  supervisorId: string | null;
  empleados: number;
}

let areasStore: FakeArea[] = seedAreas();

function seedAreas(): FakeArea[] {
  return [
    { id: "a1", nombre: "Mantenimiento", supervisorId: null, empleados: 2 },
    { id: "a2", nombre: "Administración", supervisorId: null, empleados: 0 },
  ];
}

export function resetAreas(): void {
  areasStore = seedAreas();
}

let nextId = 3;

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
  http.get(`${API_URL}/areas`, () => {
    return HttpResponse.json(areasStore.map(({ empleados: _e, ...a }) => a));
  }),
  http.post(`${API_URL}/areas`, async ({ request }) => {
    const body = (await request.json()) as { nombre: string };
    const norm = body.nombre.trim().toLowerCase();
    if (areasStore.some((a) => a.nombre.toLowerCase() === norm)) {
      return HttpResponse.json({ message: "Ya existe un Área con ese nombre" }, { status: 409 });
    }
    const area: FakeArea = {
      id: `a${nextId++}`,
      nombre: body.nombre.trim(),
      supervisorId: null,
      empleados: 0,
    };
    areasStore.push(area);
    const { empleados: _e, ...rest } = area;
    return HttpResponse.json(rest, { status: 201 });
  }),
  http.patch(`${API_URL}/areas/:id`, async ({ params, request }) => {
    const area = areasStore.find((a) => a.id === params.id);
    if (!area) {
      return HttpResponse.json({ message: "Área no encontrada" }, { status: 404 });
    }
    const body = (await request.json()) as { nombre?: string };
    if (body.nombre) area.nombre = body.nombre.trim();
    const { empleados: _e, ...rest } = area;
    return HttpResponse.json(rest);
  }),
  http.delete(`${API_URL}/areas/:id`, ({ params }) => {
    const area = areasStore.find((a) => a.id === params.id);
    if (!area) {
      return HttpResponse.json({ message: "Área no encontrada" }, { status: 404 });
    }
    if (area.empleados > 0) {
      return HttpResponse.json(
        { message: "El área todavía tiene Empleados asignados" },
        { status: 409 },
      );
    }
    areasStore = areasStore.filter((a) => a.id !== params.id);
    return new HttpResponse(null, { status: 204 });
  }),
];
