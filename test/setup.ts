import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { server } from "./mocks/server";

server.listen({ onUnhandledRequest: "error" });

afterEach(() => {
  server.resetHandlers();
});
