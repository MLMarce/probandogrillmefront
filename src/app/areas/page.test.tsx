import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AreasPage from "./page";
import { setSession } from "@/lib/session";
import { makeToken } from "../../../test/mocks/handlers";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

describe("AreasPage", () => {
  beforeEach(() => {
    setSession(makeToken());
  });

  it("lista las áreas existentes", async () => {
    render(<AreasPage />);
    expect(await screen.findByText("Mantenimiento")).toBeInTheDocument();
    expect(screen.getByText("Administración")).toBeInTheDocument();
  });

  it("crea un área nueva", async () => {
    const user = userEvent.setup();
    render(<AreasPage />);
    await screen.findByText("Mantenimiento");

    await user.type(screen.getByPlaceholderText(/nombre del área/i), "Logística");
    await user.click(screen.getByRole("button", { name: /^crear$/i }));

    expect(await screen.findByText("Logística")).toBeInTheDocument();
  });

  it("edita un área existente", async () => {
    const user = userEvent.setup();
    render(<AreasPage />);
    await screen.findByText("Mantenimiento");

    const filas = screen.getAllByRole("listitem");
    const mantenimiento = filas.find((f) => f.textContent?.includes("Mantenimiento"));
    await user.click(within(mantenimiento!).getByRole("button", { name: /editar/i }));

    const input = screen.getByPlaceholderText(/nombre del área/i);
    expect(input).toHaveValue("Mantenimiento");
    await user.clear(input);
    await user.type(input, "Mantenimiento eléctrico");
    await user.click(screen.getByRole("button", { name: /^guardar$/i }));

    expect(await screen.findByText("Mantenimiento eléctrico")).toBeInTheDocument();
    expect(screen.queryByText("Mantenimiento")).not.toBeInTheDocument();
  });

  it("muestra el error del backend al borrar un área con Empleados", async () => {
    const user = userEvent.setup();
    render(<AreasPage />);
    await screen.findByText("Mantenimiento");

    const filas = screen.getAllByRole("listitem");
    const mantenimiento = filas.find((f) => f.textContent?.includes("Mantenimiento"));
    await user.click(within(mantenimiento!).getByRole("button", { name: /borrar/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/Empleados asignados/);
  });

  it("borra un área vacía", async () => {
    const user = userEvent.setup();
    render(<AreasPage />);
    await screen.findByText("Administración");

    const filas = screen.getAllByRole("listitem");
    const admin = filas.find((f) => f.textContent?.includes("Administración"));
    await user.click(within(admin!).getByRole("button", { name: /borrar/i }));

    expect(await screen.findByText("Mantenimiento")).toBeInTheDocument();
    expect(screen.queryByText("Administración")).not.toBeInTheDocument();
  });
});
