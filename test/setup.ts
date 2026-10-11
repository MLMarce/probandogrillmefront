import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import { server } from "./mocks/server";

server.listen({ onUnhandledRequest: "error" });

afterEach(() => {
  cleanup();
  server.resetHandlers();
});
