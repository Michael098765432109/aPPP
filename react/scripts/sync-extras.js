import { cp, mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const project = resolve(here, "../..");
const source = resolve(project, "apps");
const target = resolve(here, "../public/apps");
const audioSource = resolve(project, "assets/audio/hasta-ese-entonces.mp3");
const audioTarget = resolve(here, "../public/audio/hasta-ese-entonces.mp3");
const sharedMusicSource = resolve(project, "packages/audio/shared-music.js");
const sharedMusicTarget = resolve(here, "../public/packages/audio/shared-music.js");

await mkdir(target, { recursive: true });
await mkdir(dirname(audioTarget), { recursive: true });
await mkdir(dirname(sharedMusicTarget), { recursive: true });
await cp(audioSource, audioTarget, { force: true });
await cp(sharedMusicSource, sharedMusicTarget, { force: true });

for (const name of [
  "romantic-extras.css",
  "1-arbol-alexandra",
  "2-regalos-alexandra",
  "3-galaxia-corazon-alexandra",
  "4-universo-3d-alexandra",
  "5-historia-huella-alexandra"
]) {
  await cp(resolve(source, name), resolve(target, name), { recursive: true, force: true });
}

for (const name of [
  "1-arbol-alexandra",
  "2-regalos-alexandra",
  "3-galaxia-corazon-alexandra",
  "4-universo-3d-alexandra",
  "5-historia-huella-alexandra"
]) {
  const page = resolve(target, name, "index.html");
  const html = await readFile(page, "utf8");
  await writeFile(page, html
    .replaceAll("../cartas/index.html", "../../cartas.html")
    .replaceAll("../../assets/audio/hasta-ese-entonces.mp3", "../../audio/hasta-ese-entonces.mp3"), "utf8");
}

console.log("Experiencias románticas sincronizadas para React/Vite.");
