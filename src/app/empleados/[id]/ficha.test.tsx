import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
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
});
