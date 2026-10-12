import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import { server } from "./mocks/server";
import { resetAreas } from "./mocks/handlers";

server.listen({ onUnhandledRequest: "error" });

afterEach(() => {
  cleanup();
  server.resetHandlers();
  resetAreas();
});
