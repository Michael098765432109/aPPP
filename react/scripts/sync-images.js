import { cp, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const source = resolve(here, "../../assets/img");
const target = resolve(here, "../public/img");

await mkdir(target, { recursive: true });
await cp(source, target, { recursive: true });
console.log(`Imágenes sincronizadas en ${target}`);
