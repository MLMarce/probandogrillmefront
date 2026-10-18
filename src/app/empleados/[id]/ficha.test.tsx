import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FichaEmpleado } from "./ficha";
import { getEmpleado } from "@/api/client";
import { setSession } from "@/lib/session";
import { makeToken } from "../../../../test/mocks/handlers";

const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace: vi.fn() }),
}));

function renderFicha(id = "e1") {
  render(<FichaEmpleado id={id} />);
}

function diasDesdeHoy(dias: number): string {
  const base = new Date();
  base.setHours(12, 0, 0, 0);
  return new Date(base.getTime() + dias * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

describe("FichaEmpleadoPage", () => {
  beforeEach(() => {
    push.mockClear();
    setSession(makeToken());
  });

  it("renderiza los datos personales, contacto y laborales", async () => {
    renderFicha();

    expect(await screen.findByRole("heading", { name: "Lucas Gómez" })).toBeInTheDocument();
    expect(screen.getByText("Mantenimiento de electricidad")).toBeInTheDocument();
    expect(screen.getByText("Mantenimiento")).toBeInTheDocument();
    expect(screen.getByText("L-0001")).toBeInTheDocument();
    expect(screen.getByText("activo")).toBeInTheDocument();
    expect(screen.getAllByText("—").length).toBeGreaterThan(0);
  });

  it("permite editar y guarda los cambios", async () => {
    const user = userEvent.setup();
    renderFicha();
    await screen.findByRole("heading", { name: "Lucas Gómez" });

    await user.click(screen.getByRole("button", { name: /^editar$/i }));
    const puesto = screen.getByLabelText(/^puesto/i);
    await user.clear(puesto);
    await user.type(puesto, "Electricista senior");
    await user.click(screen.getByRole("button", { name: /^guardar$/i }));

    expect(await screen.findByText("Electricista senior")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^guardar$/i })).not.toBeInTheDocument();

    const enStore = await getEmpleado("e1");
    expect(enStore.puesto).toBe("Electricista senior");
  });

  it("muestra el error del backend si el guardado falla", async () => {
    const user = userEvent.setup();
    renderFicha();
    await screen.findByRole("heading", { name: "Lucas Gómez" });

    await user.click(screen.getByRole("button", { name: /^editar$/i }));
    const legajo = screen.getByLabelText(/^legajo/i);
    await user.clear(legajo);
    await user.type(legajo, "L-0002");
    await user.click(screen.getByRole("button", { name: /^guardar$/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/legajo/i);
    expect(screen.getByRole("button", { name: /^guardar$/i })).toBeInTheDocument();
  });

  it("da de baja con diálogo de confirmación", async () => {
    const user = userEvent.setup();
    renderFicha();
    await screen.findByRole("heading", { name: "Lucas Gómez" });

    await user.click(screen.getByRole("button", { name: /dar de baja/i }));
    const dialogo = screen.getByRole("alertdialog", { name: /confirmar baja/i });
    expect(dialogo).toHaveTextContent(/se conserva/i);

    await user.click(screen.getByRole("button", { name: /^cancelar$/i }));
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    expect((await getEmpleado("e1")).estado).toBe("activo");

    await user.click(screen.getByRole("button", { name: /dar de baja/i }));
    await user.click(screen.getByRole("button", { name: /confirmar baja/i }));

    expect(await screen.findByRole("button", { name: /^reactivar$/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /dar de baja/i })).not.toBeInTheDocument();
    expect((await getEmpleado("e1")).estado).toBe("inactivo");
  });

  it("reactiva un Empleado inactivo", async () => {
    const user = userEvent.setup();
    renderFicha("e3");
    await screen.findByRole("heading", { name: "Luis Rodríguez" });
    expect(screen.getByText("inactivo")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /^reactivar$/i }));

    expect(await screen.findByRole("button", { name: /dar de baja/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^reactivar$/i })).not.toBeInTheDocument();
    expect((await getEmpleado("e3")).estado).toBe("activo");
  });

  it("registra una licencia vigente y sincroniza el Estado a licencia", async () => {
    const user = userEvent.setup();
    renderFicha("e2");
    await screen.findByRole("heading", { name: "Laura Pérez" });
    expect(screen.getByText("Sin licencias registradas.")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /registrar licencia/i }));
    fireEvent.change(screen.getByLabelText(/^desde/i), { target: { value: diasDesdeHoy(0) } });
    fireEvent.change(screen.getByLabelText(/^hasta/i), { target: { value: diasDesdeHoy(5) } });
    await user.type(screen.getByLabelText(/^motivo/i), "Estudio");
    await user.click(screen.getByRole("button", { name: /guardar licencia/i }));

    expect(await screen.findByText(/–/)).toBeInTheDocument();
    expect(screen.getByText("Estudio")).toBeInTheDocument();
    expect(screen.getByText("Vigente")).toBeInTheDocument();
    expect(screen.queryByText("Sin licencias registradas.")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /guardar licencia/i })).not.toBeInTheDocument();

    expect(screen.getByText("licencia")).toBeInTheDocument();
    expect((await getEmpleado("e2")).estado).toBe("licencia");
  });

  it("muestra el histórico con la licencia vigente destacada", async () => {
    renderFicha("e5");
    await screen.findByRole("heading", { name: "Carlos López" });

    expect(screen.getByText("licencia")).toBeInTheDocument();
    expect(screen.getByText("Licencia médica")).toBeInTheDocument();
    expect(screen.getByText("Vigente")).toBeInTheDocument();
    expect(screen.queryByText("Sin licencias registradas.")).not.toBeInTheDocument();
  });

  it("rechaza una licencia que se solapa con la vigente", async () => {
    const user = userEvent.setup();
    renderFicha("e5");
    await screen.findByRole("heading", { name: "Carlos López" });

    await user.click(screen.getByRole("button", { name: /registrar licencia/i }));
    fireEvent.change(screen.getByLabelText(/^desde/i), { target: { value: diasDesdeHoy(0) } });
    fireEvent.change(screen.getByLabelText(/^hasta/i), { target: { value: diasDesdeHoy(3) } });
    await user.click(screen.getByRole("button", { name: /guardar licencia/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/solapa/i);
    expect(screen.getByRole("button", { name: /guardar licencia/i })).toBeInTheDocument();
  });

  it("rechaza una licencia vigente sobre un Empleado inactivo", async () => {
    const user = userEvent.setup();
    renderFicha("e10");
    await screen.findByRole("heading", { name: "Valentina Ramos" });

    await user.click(screen.getByRole("button", { name: /registrar licencia/i }));
    fireEvent.change(screen.getByLabelText(/^desde/i), { target: { value: diasDesdeHoy(0) } });
    fireEvent.change(screen.getByLabelText(/^hasta/i), { target: { value: diasDesdeHoy(3) } });
    await user.click(screen.getByRole("button", { name: /guardar licencia/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/inactivo/i);
    expect((await getEmpleado("e10")).estado).toBe("inactivo");
  });
});
