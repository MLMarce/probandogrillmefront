import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { AuthGuard } from "./auth-guard";
import { clearSession, setSession } from "@/lib/session";
import { makeToken } from "../../test/mocks/handlers";

const replace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace }),
}));

describe("AuthGuard", () => {
  beforeEach(() => {
    replace.mockClear();
    clearSession();
  });

  it("redirige al login cuando no hay sesión", () => {
    render(
      <AuthGuard>
        <p>contenido protegido</p>
      </AuthGuard>,
    );
    expect(replace).toHaveBeenCalledWith("/login");
    expect(screen.queryByText("contenido protegido")).not.toBeInTheDocument();
  });

  it("renderiza los hijos cuando hay sesión", async () => {
    setSession(makeToken());
    render(
      <AuthGuard>
        <p>contenido protegido</p>
      </AuthGuard>,
    );
    expect(await screen.findByText("contenido protegido")).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });
});
