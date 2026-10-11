import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { HealthBadge } from "./health-badge";

describe("HealthBadge", () => {
  it("muestra el estado de la API cuando responde ok", async () => {
    render(<HealthBadge />);
    expect(await screen.findByText("API: ok")).toBeInTheDocument();
  });
});
