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

interface FakeEmpleado {
  id: string;
  legajo: string;
  nombre: string;
  apellido: string;
  dni?: string;
  email?: string | null;
  telefono?: string | null;
  direccion?: string | null;
  fechaNacimiento?: string | null;
  fechaIngreso?: string | null;
  puesto: string | null;
  estado: string;
  areaId: string | null;
  supervisorId?: string | null;
}

let empleadosStore: FakeEmpleado[] = seedEmpleados();

function seedEmpleados(): FakeEmpleado[] {
  const nombres = [
    ["Lucas", "Gómez", "Mantenimiento de electricidad", "a1", "activo"],
    ["Laura", "Pérez", "Administración", "a2", "activo"],
    ["Luis", "Rodríguez", "Mantenimiento de gas", "a1", "inactivo"],
    ["Ana", "Fernández", "Contabilidad", "a2", "activo"],
    ["Carlos", "López", "Mantenimiento de electricidad", "a1", "licencia"],
    ["María", "Martínez", "Recursos Humanos", "a2", "activo"],
    ["Jorge", "Díaz", "Mantenimiento preventivo", "a1", "activo"],
    ["Sofía", "Herrera", "Administración", "a2", "activo"],
    ["Diego", "Suárez", "Mantenimiento de gas", "a1", "activo"],
    ["Valentina", "Ramos", "Contabilidad", "a2", "inactivo"],
    ["Martín", "Álvarez", "Mantenimiento de electricidad", "a1", "activo"],
    ["Camila", "Torres", "Recursos Humanos", "a2", "activo"],
  ];
  const empleados: FakeEmpleado[] = nombres.map(([nombre, apellido, puesto, areaId, estado], i) => ({
    id: `e${i + 1}`,
    legajo: `L-${String(i + 1).padStart(4, "0")}`,
    nombre,
    apellido,
    puesto,
    estado,
    areaId,
  }));
  empleados[0].dni = "30111222";
  return empleados;
}

interface FakeLicencia {
  id: string;
  empleadoId: string;
  desde: string;
  hasta: string;
  motivo: string | null;
}

function seedLicencias(): FakeLicencia[] {
  return [
    {
      id: "lic1",
      empleadoId: "e5",
      desde: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      hasta: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      motivo: "Licencia médica",
    },
  ];
}

let licenciasStore: FakeLicencia[] = seedLicencias();

export function resetAreas(): void {
  areasStore = seedAreas();
  empleadosStore = seedEmpleados();
  licenciasStore = seedLicencias();
  nextEmpleadoId = 13;
}

let nextId = 3;
let nextEmpleadoId = 13;
let nextLicenciaId = 2;

function esVigente(l: { desde: string; hasta: string }): boolean {
  const ahora = Date.now();
  return new Date(l.desde).getTime() <= ahora && new Date(l.hasta).getTime() >= ahora;
}

const SOLO_FECHA = /^\d{4}-\d{2}-\d{2}$/;

function normalizarPeriodo(desdeIso: string, hastaIso: string): { desde: Date; hasta: Date } {
  const desde = new Date(desdeIso);
  const hasta = SOLO_FECHA.test(hastaIso)
    ? new Date(`${hastaIso}T23:59:59.999Z`)
    : new Date(hastaIso);
  return { desde, hasta };
}

function sincronizarEstadoPorLicencia(empleadoId: string): void {
  const empleado = empleadosStore.find((e) => e.id === empleadoId);
  if (!empleado) return;
  const vigente = licenciasStore.some((l) => l.empleadoId === empleadoId && esVigente(l));
  if (vigente && empleado.estado === "activo") empleado.estado = "licencia";
  else if (!vigente && empleado.estado === "licencia") empleado.estado = "activo";
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
  http.get(`${API_URL}/empleados`, ({ request }) => {
    const url = new URL(request.url);
    const search = url.searchParams.get("search")?.toLowerCase();
    const areaId = url.searchParams.get("areaId");
    const estado = url.searchParams.get("estado");
    const page = Number(url.searchParams.get("page") ?? "1");
    const pageSize = Number(url.searchParams.get("pageSize") ?? "10");

    let filtered = [...empleadosStore];
    if (search) {
      filtered = filtered.filter(
        (e) =>
          e.nombre.toLowerCase().includes(search) ||
          e.apellido.toLowerCase().includes(search) ||
          e.legajo.toLowerCase().includes(search),
      );
    }
    if (areaId) filtered = filtered.filter((e) => e.areaId === areaId);
    if (estado) filtered = filtered.filter((e) => e.estado === estado);

    const total = filtered.length;
    const items = filtered.slice((page - 1) * pageSize, page * pageSize).map((e) => ({
      ...e,
      areaNombre: areasStore.find((a) => a.id === e.areaId)?.nombre ?? null,
    }));
    return HttpResponse.json({ items, total, page, pageSize });
  }),
  http.post(`${API_URL}/empleados`, async ({ request }) => {
    const body = (await request.json()) as {
      legajo?: string;
      nombre: string;
      apellido: string;
      dni: string;
      puesto?: string;
      areaId?: string;
    };
    const legajo = body.legajo?.trim() || nextLegajo();
    if (empleadosStore.some((e) => e.legajo === legajo)) {
      return HttpResponse.json({ message: "Ya existe un Empleado con ese legajo" }, { status: 409 });
    }
    if (empleadosStore.some((e) => e.dni === body.dni)) {
      return HttpResponse.json({ message: "Ya existe un Empleado con ese DNI" }, { status: 409 });
    }
    const empleado: FakeEmpleado = {
      id: `e${nextEmpleadoId++}`,
      legajo,
      nombre: body.nombre.trim(),
      apellido: body.apellido.trim(),
      puesto: body.puesto ?? null,
      estado: "activo",
      areaId: body.areaId ?? null,
    };
    empleadosStore.push(empleado);
    return HttpResponse.json(
      {
        ...empleado,
        areaNombre: areasStore.find((a) => a.id === empleado.areaId)?.nombre ?? null,
      },
      { status: 201 },
    );
  }),
  http.get(`${API_URL}/empleados/:id`, ({ params }) => {
    const empleado = empleadosStore.find((e) => e.id === params.id || e.legajo === params.id);
    if (!empleado) {
      return HttpResponse.json({ message: "Empleado no encontrado" }, { status: 404 });
    }
    return HttpResponse.json(detalleDe(empleado));
  }),
  http.patch(`${API_URL}/empleados/:id`, async ({ params, request }) => {
    const empleado = empleadosStore.find((e) => e.id === params.id || e.legajo === params.id);
    if (!empleado) {
      return HttpResponse.json({ message: "Empleado no encontrado" }, { status: 404 });
    }
    const body = (await request.json()) as Partial<FakeEmpleado>;
    if (body.legajo && empleadosStore.some((e) => e.legajo === body.legajo && e.id !== empleado.id)) {
      return HttpResponse.json({ message: "Ya existe un Empleado con ese legajo" }, { status: 409 });
    }
    if (body.dni && empleadosStore.some((e) => e.dni === body.dni && e.id !== empleado.id)) {
      return HttpResponse.json({ message: "Ya existe un Empleado con ese DNI" }, { status: 409 });
    }
    if (body.supervisorId) {
      const supervisor = empleadosStore.find(
        (e) => e.id === body.supervisorId && e.estado === "activo",
      );
      if (!supervisor) {
        return HttpResponse.json(
          { message: "El supervisor debe ser un Empleado activo" },
          { status: 422 },
        );
      }
    }
    Object.assign(empleado, body);
    sincronizarEstadoPorLicencia(empleado.id);
    return HttpResponse.json(detalleDe(empleado));
  }),
  http.post(`${API_URL}/empleados/:id/baja`, ({ params }) => {
    const empleado = empleadosStore.find((e) => e.id === params.id || e.legajo === params.id);
    if (!empleado) {
      return HttpResponse.json({ message: "Empleado no encontrado" }, { status: 404 });
    }
    if (empleado.estado === "inactivo") {
      return HttpResponse.json({ message: "El Empleado ya está inactivo" }, { status: 409 });
    }
    const bloqueo = licenciaVigente(empleado.id);
    if (bloqueo) return bloqueo;
    empleado.estado = "inactivo";
    return HttpResponse.json(detalleDe(empleado));
  }),
  http.post(`${API_URL}/empleados/:id/reactivar`, ({ params }) => {
    const empleado = empleadosStore.find((e) => e.id === params.id || e.legajo === params.id);
    if (!empleado) {
      return HttpResponse.json({ message: "Empleado no encontrado" }, { status: 404 });
    }
    if (empleado.estado === "activo") {
      return HttpResponse.json({ message: "El Empleado ya está activo" }, { status: 409 });
    }
    const bloqueo = licenciaVigente(empleado.id);
    if (bloqueo) return bloqueo;
    empleado.estado = "activo";
    return HttpResponse.json(detalleDe(empleado));
  }),
  http.get(`${API_URL}/licencias`, ({ request }) => {
    const empleadoId = new URL(request.url).searchParams.get("empleadoId");
    if (!empleadoId) {
      return HttpResponse.json({ message: "empleadoId es obligatorio" }, { status: 400 });
    }
    const items = licenciasStore
      .filter((l) => l.empleadoId === empleadoId)
      .sort((a, b) => b.desde.localeCompare(a.desde))
      .map((l) => ({ ...l, vigente: esVigente(l) }));
    return HttpResponse.json(items);
  }),
  http.post(`${API_URL}/licencias`, async ({ request }) => {
    const body = (await request.json()) as {
      empleadoId: string;
      desde: string;
      hasta: string;
      motivo?: string;
    };
    const empleado = empleadosStore.find((e) => e.id === body.empleadoId);
    if (!empleado) {
      return HttpResponse.json({ message: "Empleado no encontrado" }, { status: 404 });
    }
    const { desde, hasta } = normalizarPeriodo(body.desde, body.hasta);
    if (desde.getTime() > hasta.getTime()) {
      return HttpResponse.json(
        { message: "La fecha desde debe ser anterior o igual a la fecha hasta" },
        { status: 422 },
      );
    }
    const vigente = esVigente({ desde: desde.toISOString(), hasta: hasta.toISOString() });
    if (vigente && empleado.estado === "inactivo") {
      return HttpResponse.json(
        { message: "El Empleado está inactivo: no se puede registrar una licencia vigente" },
        { status: 409 },
      );
    }
    const solape = licenciasStore.some(
      (l) =>
        l.empleadoId === body.empleadoId &&
        new Date(l.desde).getTime() <= hasta.getTime() &&
        new Date(l.hasta).getTime() >= desde.getTime(),
    );
    if (solape) {
      return HttpResponse.json(
        { message: "El Empleado ya tiene una licencia que se solapa con ese período" },
        { status: 409 },
      );
    }
    const licencia: FakeLicencia = {
      id: `lic${nextLicenciaId++}`,
      empleadoId: body.empleadoId,
      desde: desde.toISOString(),
      hasta: hasta.toISOString(),
      motivo: body.motivo?.trim() || null,
    };
    licenciasStore.push(licencia);
    sincronizarEstadoPorLicencia(licencia.empleadoId);
    return HttpResponse.json({ ...licencia, vigente: esVigente(licencia) }, { status: 201 });
  }),
];

function licenciaVigente(empleadoId: string) {
  const hay = licenciasStore.some((l) => l.empleadoId === empleadoId && esVigente(l));
  if (!hay) return null;
  return HttpResponse.json(
    { message: "El Empleado tiene una licencia vigente: la operación queda bloqueada" },
    { status: 409 },
  );
}

function detalleDe(empleado: FakeEmpleado) {
  const area = areasStore.find((a) => a.id === empleado.areaId);
  const supervisor = empleadosStore.find((e) => e.id === empleado.supervisorId);
  return {
    ...empleado,
    email: empleado.email ?? null,
    telefono: empleado.telefono ?? null,
    direccion: empleado.direccion ?? null,
    fechaNacimiento: empleado.fechaNacimiento ?? null,
    fechaIngreso: empleado.fechaIngreso ?? null,
    supervisorId: empleado.supervisorId ?? null,
    areaNombre: area?.nombre ?? null,
    supervisorNombre: supervisor ? `${supervisor.nombre} ${supervisor.apellido}` : null,
  };
}

function nextLegajo(): string {
  let n = empleadosStore.length + 1;
  for (;;) {
    const legajo = `L-${String(n).padStart(4, "0")}`;
    if (!empleadosStore.some((e) => e.legajo === legajo)) return legajo;
    n += 1;
  }
}
