import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import LoginPage from "./page";
import { clearSession, getSession } from "@/lib/session";
import { server } from "../../../test/mocks/server";
import { API_URL } from "@/api/client";

const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace: vi.fn() }),
}));

describe("LoginPage", () => {
  beforeEach(() => {
    push.mockClear();
    clearSession();
  });

  it("muestra el formulario de email y contraseña", () => {
    render(<LoginPage />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /ingresar/i })).toBeInTheDocument();
  });

  it("loguea, guarda la sesión y navega al home", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByLabelText(/email/i), "rrhh@empresa.com");
    await user.type(screen.getByLabelText(/contraseña/i), "secreto123");
    await user.click(screen.getByRole("button", { name: /ingresar/i }));

    expect(await screen.findByText(/ingresando|ingresar/i)).toBeInTheDocument();
    expect(getSession()).toBeTruthy();
    expect(push).toHaveBeenCalledWith("/");
  });

  it("muestra error con credenciales inválidas", async () => {
    server.use(
      http.post(`${API_URL}/auth/login`, () => {
        return HttpResponse.json({ message: "Credenciales inválidas" }, { status: 401 });
      }),
    );
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.type(screen.getByLabelText(/email/i), "rrhh@empresa.com");
    await user.type(screen.getByLabelText(/contraseña/i), "mala");
    await user.click(screen.getByRole("button", { name: /ingresar/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/credenciales inválidas/i);
    expect(push).not.toHaveBeenCalled();
  });
});
