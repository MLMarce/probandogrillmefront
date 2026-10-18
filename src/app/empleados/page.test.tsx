import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EmpleadosPage from "./page";
import { setSession } from "@/lib/session";
import { makeToken } from "../../../test/mocks/handlers";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

describe("EmpleadosPage", () => {
  beforeEach(() => {
    setSession(makeToken());
  });

  it("lista los Empleados con sus datos clave", async () => {
    render(<EmpleadosPage />);
    expect(await screen.findByText("Lucas Gómez")).toBeInTheDocument();
    expect((screen.getAllByText("Mantenimiento de electricidad")).length).toBeGreaterThan(0);
    expect(screen.getByText(/12 Empleados/)).toBeInTheDocument();
  });

  it("filtra por búsqueda y estado", async () => {
    const user = userEvent.setup();
    render(<EmpleadosPage />);
    await screen.findByText("Lucas Gómez");

    await user.type(screen.getByPlaceholderText(/buscar por nombre/i), "lucas");
    await user.click(screen.getByRole("button", { name: /^buscar$/i }));
    expect(await screen.findByText(/1 Empleados/)).toBeInTheDocument();
    expect(screen.getByText("Lucas Gómez")).toBeInTheDocument();

    await user.selectOptions(screen.getByDisplayValue(/todos los estados/i), "inactivo");
    expect(await screen.findByText(/No hay Empleados/)).toBeInTheDocument();
  });

  it("filtra por área", async () => {
    const user = userEvent.setup();
    render(<EmpleadosPage />);
    await screen.findByText("Lucas Gómez");

    await user.selectOptions(screen.getByDisplayValue(/todas las áreas/i), "a2");
    expect(await screen.findByText(/6 Empleados/)).toBeInTheDocument();
    expect(screen.getByText("Laura Pérez")).toBeInTheDocument();
    expect(screen.queryByText("Lucas Gómez")).not.toBeInTheDocument();
  });

  it("muestra el estado licencia como badge", async () => {
    render(<EmpleadosPage />);
    expect(await screen.findByText("Lucas Gómez")).toBeInTheDocument();
    expect(screen.getByText("licencia")).toBeInTheDocument();
    expect(screen.getAllByText("activo").length).toBeGreaterThan(0);
    expect(screen.getAllByText("inactivo").length).toBeGreaterThan(0);
  });

  it("pagina el listado", async () => {
    const user = userEvent.setup();
    render(<EmpleadosPage />);
    await screen.findByText("Lucas Gómez");

    await user.click(screen.getByRole("button", { name: /siguiente/i }));
    expect(await screen.findByText(/página 2 de 2/)).toBeInTheDocument();
    expect(screen.queryByText("Lucas Gómez")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /siguiente/i })).toBeDisabled();
  });
});
