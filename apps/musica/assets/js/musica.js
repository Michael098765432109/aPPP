import { AmbientEngine, MOODS } from "../../../../packages/audio/engine.js";
import {
  initReveal,
  initThemeToggle,
  prefersReducedMotion
} from "../../../../assets/js/ui.js";

const stage = document.querySelector("#stage");
const status = document.querySelector("#status");
const playBtn = document.querySelector("[data-play]");
const volume = document.querySelector("[data-volume]");
const volumeValue = document.querySelector("[data-volume-value]");
const fileInput = document.querySelector("[data-file]");
const fileName = document.querySelector("[data-file-name]");
const clearBtn = document.querySelector("[data-clear-file]");
const resumeBtn = document.querySelector("[data-file-resume]");
const canvas = document.querySelector("[data-viz]");
const ctx2d = canvas.getContext("2d");

const HUES = { amanecer: 28, lluvia: 190, estrellas: 262 };
const STILL = prefersReducedMotion();

const engine = new AmbientEngine();
engine.setVolume(Number(volume.value) / 100);

let mood = "amanecer";
let mode = "ambient";
let fileEl = null;
let fileSource = null;
let fileAnalyser = null;
let fileUrl = null;
let fileLabel = "";

let size = 0;
let dpr = 1;
let freq = new Uint8Array(512);
let lastLevel = -1;
let frame = 0;

initThemeToggle();
initReveal();

/* ---------- Estado visual ---------- */

const isPlaying = () =>
  mode === "file" ? Boolean(fileEl && !fileEl.paused) : engine.playing;

function activeAnalyser() {
  if (mode === "file") return isPlaying() ? fileAnalyser : null;
  return engine.playing ? engine.getAnalyser() : null;
}

function render() {
  const playing = isPlaying();

  stage.classList.toggle("is-playing", playing);
  playBtn.setAttribute("aria-pressed", String(playing));
  playBtn.setAttribute(
    "aria-label",
    playing ? "Pausar el ambiente" : "Reproducir el ambiente"
  );

  document.querySelectorAll("[data-mood-id]").forEach((button) => {
    const id = button.dataset.moodId;
    const selected = mode === "ambient" && id === mood;
    button.setAttribute("aria-pressed", String(selected));

    const state = button.querySelector("[data-state]");
    if (state) state.textContent = selected ? (playing ? "Sonando" : "Elegida") : "Elegir";
  });

  if (mode === "file" && fileLabel) {
    status.textContent = `${fileLabel} Â· tu canciÃ³n`;
  } else {
    const current = MOODS.find((item) => item.id === mood);
    status.textContent = `${current.label} Â· ${playing ? "en vivo" : "en pausa"}`;
  }

  fileName.textContent = fileLabel || "O escucha tu propia mÃºsica";
  clearBtn.hidden = !fileLabel;
  resumeBtn.hidden = !fileLabel || mode === "file";

  if (STILL) draw(performance.now());
}

/* ---------- Visualizador ---------- */

function resize() {
  const rect = canvas.getBoundingClientRect();
  if (!rect.width) return;
  size = rect.width;
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(size * dpr);
  canvas.height = Math.round(size * dpr);
  ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);
  if (STILL) draw(performance.now());
}

function setLevel(value) {
  const rounded = Math.round(value * 100) / 100;
  if (rounded === lastLevel) return;
  lastLevel = rounded;
  stage.style.setProperty("--level", rounded.toFixed(2));
}

function draw(time) {
  if (!size) return;

  const analyser = activeAnalyser();
  let level = 0;

  if (analyser) {
    if (freq.length !== analyser.frequencyBinCount) {
      freq = new Uint8Array(analyser.frequencyBinCount);
    }
    analyser.getByteFrequencyData(freq);
    let sum = 0;
    for (let i = 0; i < 48; i += 1) sum += freq[i];
    level = sum / 48 / 255;
  }

  setLevel(level);

  const center = size / 2;
  const radius = center;
  const hue = HUES[mood] ?? 28;
  const bars = 92;

  ctx2d.clearRect(0, 0, size, size);
  ctx2d.lineCap = "round";
  ctx2d.lineWidth = Math.max(1.2, size * 0.0035);

  for (let i = 0; i < bars; i += 1) {
    const angle = (i / bars) * Math.PI * 2 - Math.PI / 2;
    const bin = Math.min(
      freq.length - 1,
      Math.floor(Math.pow(i / bars, 1.6) * 150)
    );

    let value;
    if (analyser) {
      value = (freq[bin] || 0) / 255;
    } else {
      value =
        0.12 +
        0.07 * Math.sin(time / 1500 + i * 0.55) +
        0.04 * Math.sin(time / 760 + i * 1.7);
    }

    const reach = radius * (0.7 + 0.02 + value * 0.24);
    const inner = radius * 0.7;
    const x1 = center + Math.cos(angle) * inner;
    const y1 = center + Math.sin(angle) * inner;
    const x2 = center + Math.cos(angle) * reach;
    const y2 = center + Math.sin(angle) * reach;

    ctx2d.strokeStyle = `hsla(${hue + i * 0.55}, 88%, ${58 + value * 22}%, ${
      0.14 + value * 0.6
    })`;
    ctx2d.beginPath();
    ctx2d.moveTo(x1, y1);
    ctx2d.lineTo(x2, y2);
    ctx2d.stroke();
  }
}

function loop(time) {
  draw(time);
  frame = requestAnimationFrame(loop);
}

function startLoop() {
  if (STILL) {
    draw(performance.now());
    return;
  }
  if (!frame) frame = requestAnimationFrame(loop);
}

/* ---------- Audio generativo ---------- */

async function togglePlayback() {
  try {
    if (isPlaying()) {
      if (mode === "file" && fileEl) window.AlexandraMusic.pause();
      else engine.stop();
    } else if (mode === "file" && fileEl) {
      engine.stop();
      if (engine.ctx?.state === "suspended") await engine.ctx.resume();
      attachFileGraph();
      await window.AlexandraMusic.play();
    } else {
      if (fileEl) fileEl.pause();
      await engine.start();
    }
  } catch (error) {
    console.error("No se pudo reproducir el audio:", error);
    status.textContent = "El navegador bloqueÃ³ el audio. Intenta de nuevo.";
  }

  render();
}

async function selectMood(id) {
  if (mode === "file" && fileEl) window.AlexandraMusic.pause();

  mode = "ambient";
  mood = id;
  stage.dataset.mood = id;
  engine.setMood(id);

  try {
    await engine.start();
  } catch (error) {
    console.error("No se pudo iniciar el ambiente:", error);
  }

  render();
}

/* ---------- CanciÃ³n propia ---------- */

function attachFileGraph() {
  if (!fileEl || fileSource || engine.ctx?.state !== "running") return;

  fileAnalyser = engine.ctx.createAnalyser();
  fileAnalyser.fftSize = 1024;
  fileAnalyser.smoothingTimeConstant = 0.86;
  fileAnalyser.connect(engine.ctx.destination);

  fileSource = engine.ctx.createMediaElementSource(fileEl);
  fileSource.connect(fileAnalyser);
}

async function loadFile(file) {
  if (!file) return;

  fileLabel = file.name.replace(/\.[^.]+$/, "");

  try {
    await engine.init();
    try {
      if (engine.ctx.state === "suspended") await engine.ctx.resume();
    } catch {
      /* el navegador pedirÃ¡ un gesto; el botÃ³n de play lo resuelve */
    }

    fileEl = window.AlexandraMusic.audio;
    fileEl.addEventListener("play", render);
    fileEl.addEventListener("pause", render);
    engine.stop();
    await window.AlexandraMusic.setUserTrack(file, { play: false });
    fileEl.volume = Number(volume.value) / 100;

    mode = "file";
    attachFileGraph();

    try {
      await window.AlexandraMusic.play();
    } catch {
      /* queda cargada y en pausa hasta que pulse play */
    }
  } catch (error) {
    console.error("No se pudo abrir la canciÃ³n:", error);
    fileLabel = "";
    status.textContent = "No se pudo abrir esa canciÃ³n. Prueba con otro archivo.";
  }

  render();
}

async function clearFile() {
  await window.AlexandraMusic.useDefault({ play: true });
  fileEl = window.AlexandraMusic.audio;
  fileLabel = "Hasta ese entonces";
  mode = "file";
  render();
}

async function resumeFile() {
  if (!fileEl || !fileLabel) return;
  try {
    await engine.init();
    if (engine.ctx.state === "suspended") await engine.ctx.resume();
    engine.stop();
    attachFileGraph();
    mode = "file";
    await window.AlexandraMusic.play();
  } catch (error) {
    console.error("No se pudo reanudar la canciÃ³n:", error);
  }
  render();
}

/* ---------- Eventos ---------- */

playBtn.addEventListener("click", togglePlayback);

document.querySelectorAll("[data-mood-id]").forEach((button) => {
  button.addEventListener("click", () => selectMood(button.dataset.moodId));
});

volume.addEventListener("input", () => {
  const value = Number(volume.value);
  volumeValue.textContent = String(value);
  engine.setVolume(value / 100);
  if (mode === "file") window.AlexandraMusic.setVolume(value / 100);
});

fileInput.addEventListener("change", () => {
  const file = fileInput.files?.[0];
  fileInput.value = "";
  loadFile(file);
});

clearBtn.addEventListener("click", clearFile);
resumeBtn.addEventListener("click", resumeFile);

document.addEventListener("keydown", (event) => {
  if (event.code !== "Space" || event.target !== document.body) return;
  event.preventDefault();
  togglePlayback();
});

const observer = new ResizeObserver(resize);
observer.observe(canvas);

window.addEventListener("pagehide", () => {
  engine.stop();
  if (mode === "file") fileEl?.pause();
});

render();
resize();
startLoop();

window.AlexandraMusic.init().then((player) => {
  if (localStorage.getItem("alexandra-user-track-set") !== "true") return;
  fileEl = player.audio;
  fileLabel = player.getTrackName();
  mode = "file";
  render();
}).catch((error) => console.warn("No se pudo recuperar la canción guardada:", error));

