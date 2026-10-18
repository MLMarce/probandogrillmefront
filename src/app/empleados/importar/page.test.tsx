import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ImportarPage from "./page";
import { listEmpleados } from "@/api/client";
import { setSession } from "@/lib/session";
import { makeToken } from "../../../../test/mocks/handlers";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

const CSV = [
  "legajo,nombre,apellido,dni,email,area",
  ",Nueva,Alta,77000001,nueva@empresa.com,Mantenimiento",
  ",Mala,Mail,77000002,malo-email,",
  "L-0001,Dup,Lega,77000003,ok@empresa.com,",
].join("\n");

function csvFile(content: string): File {
  return new File([content], "empleados.csv", { type: "text/csv" });
}

describe("ImportarPage", () => {
  beforeEach(() => {
    setSession(makeToken());
  });

  it("recorre el flujo upload → preview → confirmación → resumen", async () => {
    const user = userEvent.setup();
    render(<ImportarPage />);

    expect(screen.getByRole("link", { name: /descargar plantilla/i })).toHaveAttribute("download");

    await user.upload(screen.getByLabelText(/archivo csv/i), csvFile(CSV));

    expect(await screen.findByText(/3 filas/)).toBeInTheDocument();
    expect(screen.getByText("1 válidas")).toBeInTheDocument();
    expect(screen.getByText("1 errores")).toBeInTheDocument();
    expect(screen.getByText("1 omitidas")).toBeInTheDocument();
    expect(screen.getByText("valida")).toBeInTheDocument();
    expect(screen.getByText("error")).toBeInTheDocument();
    expect(screen.getByText("omitida")).toBeInTheDocument();

    expect((await listEmpleados({ pageSize: 100 })).total).toBe(12);

    await user.click(screen.getByRole("button", { name: /confirmar importación/i }));

    expect(await screen.findByText("Importación finalizada")).toBeInTheDocument();
    expect(screen.getByText("1 creados")).toBeInTheDocument();
    expect(screen.getByText("1 omitidos")).toBeInTheDocument();
    expect(screen.getByText("1 errores")).toBeInTheDocument();

    expect((await listEmpleados({ pageSize: 100 })).total).toBe(13);
    expect((await listEmpleados({ search: "Nueva" })).total).toBe(1);
  });

  it("muestra el error del backend si faltan columnas requeridas", async () => {
    const user = userEvent.setup();
    render(<ImportarPage />);

    await user.upload(
      screen.getByLabelText(/archivo csv/i),
      csvFile("nombre,apellido\nAna,Prueba"),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(/columnas/i);
    expect(screen.getByLabelText(/archivo csv/i)).toBeInTheDocument();
  });

  it("no habilita la confirmación sin filas válidas", async () => {
    const user = userEvent.setup();
    render(<ImportarPage />);

    await user.upload(
      screen.getByLabelText(/archivo csv/i),
      csvFile("legajo,nombre,apellido,dni\nL-0001,Dup,Lega,77000009"),
    );

    expect(await screen.findByText(/1 filas/)).toBeInTheDocument();
    expect(screen.getByText("1 omitidas")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /confirmar importación/i })).toBeDisabled();
  });
});
