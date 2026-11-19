import { gallery } from "../../../../packages/content/gallery.js";
import {
  initHeaderState,
  initReveal,
  initThemeToggle,
  prefersReducedMotion
} from "../../../../assets/js/ui.js";

const IMG_BASE = "../../assets/img/";

const SIZES = {
  "01-luz-atardecer.jpg": [1400, 1050],
  "02-luz-hora-dorada.jpg": [1400, 2100],
  "03-calma-playa.jpg": [1400, 933],
  "04-noche-estrellas.jpg": [1400, 933],
  "05-noche-galaxia.jpg": [1400, 933],
  "06-noche-ciudad.jpg": [1400, 933],
  "07-noche-luces.jpg": [1400, 2088],
  "08-detalle-flor.jpg": [1400, 933],
  "09-calma-oceano.jpg": [1400, 933]
};

const pad = (value) => String(value).padStart(2, "0");

const filtersEl = document.querySelector("#filters");
const masonryEl = document.querySelector("#masonry");
const emptyEl = document.querySelector("#gallery-empty");
const dialog = document.querySelector("#shot-dialog");
const shotImg = document.querySelector("#shot-img");
const shotCat = document.querySelector("#shot-cat");
const shotTitle = document.querySelector("#shot-title");
const shotCaption = document.querySelector("#shot-caption");
const shotCount = document.querySelector("#shot-count");
const prevBtn = dialog.querySelector("[data-prev]");
const nextBtn = dialog.querySelector("[data-next]");
const closeBtn = dialog.querySelector("[data-close]");
const stage = dialog.querySelector(".lightbox__stage");

const categories = [];
gallery.forEach((item) => {
  if (!categories.includes(item.category)) categories.push(item.category);
});

let activeFilter = "all";
let view = gallery.slice();
let current = 0;
let trigger = null;

/* ---------- Filtros ---------- */

function makeChip(label, value, total) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "chip";
  button.dataset.filter = value;
  button.setAttribute("aria-pressed", String(value === activeFilter));
  button.append(document.createTextNode(label));
  const count = document.createElement("span");
  count.className = "chip__count";
  count.setAttribute("aria-hidden", "true");
  count.textContent = String(total);
  const screenReader = document.createElement("span");
  screenReader.className = "sr-only";
  screenReader.textContent = " imágenes";
  button.append(count, screenReader);
  button.addEventListener("click", () => applyFilter(value));
  return button;
}

filtersEl.append(makeChip("Todo", "all", gallery.length));
categories.forEach((category) => {
  const total = gallery.filter((item) => item.category === category).length;
  filtersEl.append(makeChip(category, category, total));
});

/* ---------- Mosaico ---------- */

function makeShot(item, index) {
  const [width, height] = SIZES[item.file] || [1400, 933];

  const button = document.createElement("button");
  button.type = "button";
  button.className = "shot";
  button.dataset.id = item.id;
  button.dataset.category = item.category;
  button.style.setProperty("--i", String(index));
  button.setAttribute("aria-haspopup", "dialog");
  button.setAttribute("aria-label", `${item.title}, ${item.category}. Abrir imagen.`);

  const img = document.createElement("img");
  img.src = IMG_BASE + item.file;
  img.alt = item.alt;
  img.width = width;
  img.height = height;
  img.decoding = "async";
  img.loading = index < 3 ? "eager" : "lazy";
  if (index === 0) img.fetchPriority = "high";

  const indexEl = document.createElement("span");
  indexEl.className = "shot__index";
  indexEl.setAttribute("aria-hidden", "true");
  indexEl.textContent = pad(index + 1);

  const veil = document.createElement("span");
  veil.className = "shot__veil";
  veil.setAttribute("aria-hidden", "true");

  const info = document.createElement("span");
  info.className = "shot__info";
  const category = document.createElement("span");
  category.className = "shot__cat";
  category.textContent = item.category;
  const title = document.createElement("span");
  title.className = "shot__title";
  title.textContent = item.title;
  info.append(category, title);

  const expand = document.createElement("span");
  expand.className = "shot__expand";
  expand.setAttribute("aria-hidden", "true");
  const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  icon.setAttribute("width", "14");
  icon.setAttribute("height", "14");
  icon.setAttribute("viewBox", "0 0 24 24");
  icon.setAttribute("fill", "none");
  icon.setAttribute("stroke", "currentColor");
  icon.setAttribute("stroke-width", "2");
  icon.setAttribute("stroke-linecap", "round");
  icon.setAttribute("stroke-linejoin", "round");
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", "M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7");
  icon.append(path);
  expand.append(icon);

  button.append(img, veil, indexEl, info, expand);
  button.addEventListener("click", () => openLightbox(item.id, button));
  return button;
}

gallery.forEach((item, index) => masonryEl.append(makeShot(item, index)));

/* ---------- Filtrado ---------- */

function applyFilter(value) {
  activeFilter = value;
  view = value === "all" ? gallery.slice() : gallery.filter((item) => item.category === value);

  filtersEl.querySelectorAll("[data-filter]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.filter === value));
  });

  const reduce = prefersReducedMotion();
  masonryEl.querySelectorAll(".shot").forEach((shot) => {
    const visible = view.some((item) => item.id === shot.dataset.id);
    shot.hidden = !visible;
    if (visible && !reduce) {
      shot.style.animation = "none";
      void shot.offsetWidth;
      shot.style.animation = "";
    }
  });

  emptyEl.hidden = view.length > 0;
}

/* ---------- Visor ---------- */

const preloaded = new Set();

function preload(item) {
  if (!item || preloaded.has(item.id)) return;
  preloaded.add(item.id);
  const img = new Image();
  img.src = IMG_BASE + item.file;
}

function fill(index) {
  const item = view[index];
  if (!item) return;
  current = index;

  const [width, height] = SIZES[item.file] || [1400, 933];
  shotImg.classList.remove("is-swapping");
  shotImg.classList.add("is-loading");
  shotImg.width = width;
  shotImg.height = height;
  shotImg.alt = item.alt;
  shotImg.src = IMG_BASE + item.file;

  shotCat.textContent = item.category;
  shotTitle.textContent = item.title;
  shotCaption.textContent = item.caption;
  shotCount.textContent = `${pad(index + 1)} / ${pad(view.length)}`;

  preload(view[(index + 1) % view.length]);
  preload(view[(index - 1 + view.length) % view.length]);
}

shotImg.addEventListener("load", () => {
  shotImg.classList.remove("is-loading");
  if (prefersReducedMotion()) return;
  shotImg.classList.remove("is-swapping");
  void shotImg.offsetWidth;
  shotImg.classList.add("is-swapping");
});

function openLightbox(id, button) {
  const index = view.findIndex((item) => item.id === id);
  if (index === -1) return;

  trigger = button;
  fill(index);
  dialog.showModal();
  document.body.classList.add("is-locked");
  closeBtn.focus({ preventScroll: true });
}

function closeLightbox() {
  if (dialog.open) dialog.close();
  document.body.classList.remove("is-locked");
  shotImg.classList.remove("is-swapping", "is-loading");
}

function step(delta) {
  if (view.length < 2) return;
  fill((current + delta + view.length) % view.length);
}

prevBtn.addEventListener("click", () => step(-1));
nextBtn.addEventListener("click", () => step(1));
closeBtn.addEventListener("click", () => closeLightbox());

dialog.addEventListener("click", (event) => {
  if (event.target === dialog) closeLightbox();
});

dialog.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") {
    event.preventDefault();
    step(-1);
  } else if (event.key === "ArrowRight") {
    event.preventDefault();
    step(1);
  }
});

dialog.addEventListener("close", () => {
  document.body.classList.remove("is-locked");
  if (trigger) trigger.focus({ preventScroll: true });
});

/* Swipe en móvil */

let startX = null;
stage.addEventListener(
  "pointerdown",
  (event) => {
    startX = event.clientX;
  },
  { passive: true }
);

stage.addEventListener(
  "pointerup",
  (event) => {
    if (startX === null) return;
    const delta = event.clientX - startX;
    startX = null;
    if (Math.abs(delta) < 48) return;
    step(delta > 0 ? -1 : 1);
  },
  { passive: true }
);

stage.addEventListener("pointercancel", () => {
  startX = null;
});

/* Estado visual de "vacío" inicial y utilidades */

emptyEl.hidden = true;
applyFilter("all");

initThemeToggle();
initReveal();
initHeaderState();
