import { writeFileSync, mkdirSync, existsSync, copyFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import openapiTS, { astToString } from "openapi-typescript";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const backendSpec = resolve(scriptDir, "../../backend/openapi/openapi.json");
const localSpec = join(scriptDir, "../openapi/openapi.json");
const outPath = join(scriptDir, "../src/api/schema.d.ts");

const specPath = existsSync(backendSpec) ? backendSpec : localSpec;
if (specPath === backendSpec) {
  mkdirSync(dirname(localSpec), { recursive: true });
  copyFileSync(backendSpec, localSpec);
}

const output = await openapiTS(pathToFileURL(specPath));
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, astToString(output));
console.log(`Tipos generados desde ${specPath} -> ${outPath}`);
