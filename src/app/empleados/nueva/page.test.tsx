import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NuevoEmpleadoPage from "./page";
import { setSession } from "@/lib/session";
import { listEmpleados } from "@/api/client";
import { makeToken } from "../../../../test/mocks/handlers";

const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace: vi.fn() }),
}));

async function fillObligatorios(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/^nombre/i), "Nuevo");
  await user.type(screen.getByLabelText(/^apellido/i), "Test");
  await user.type(screen.getByLabelText(/^dni/i), "99888777");
}

describe("NuevoEmpleadoPage", () => {
  beforeEach(() => {
    push.mockClear();
    setSession(makeToken());
  });

  it("crea el Empleado y redirige al listado", async () => {
    const user = userEvent.setup();
    render(<NuevoEmpleadoPage />);

    await fillObligatorios(user);
    await user.type(screen.getByLabelText(/^puesto/i), "Analista");
    await user.click(screen.getByRole("button", { name: /crear empleado/i }));

    expect(await screen.findByText(/guardando/i)).toBeInTheDocument();
    expect(push).toHaveBeenCalledWith("/empleados");

    const listado = await listEmpleados({ search: "nuevo" });
    expect(listado.total).toBe(1);
    expect(listado.items[0]).toMatchObject({
      nombre: "Nuevo",
      apellido: "Test",
      puesto: "Analista",
      estado: "activo",
      legajo: "L-0013",
    });
  });

  it("muestra el error de legajo duplicado y no navega", async () => {
    const user = userEvent.setup();
    render(<NuevoEmpleadoPage />);

    await fillObligatorios(user);
    await user.type(screen.getByLabelText(/legajo/i), "L-0001");
    await user.click(screen.getByRole("button", { name: /crear empleado/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/legajo/i);
    expect(push).not.toHaveBeenCalled();
  });

  it("muestra el error de DNI duplicado", async () => {
    const user = userEvent.setup();
    render(<NuevoEmpleadoPage />);

    await fillObligatorios(user);
    await user.clear(screen.getByLabelText(/^dni/i));
    await user.type(screen.getByLabelText(/^dni/i), "30111222");
    await user.click(screen.getByRole("button", { name: /crear empleado/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/dni/i);
    expect(push).not.toHaveBeenCalled();
  });
});
