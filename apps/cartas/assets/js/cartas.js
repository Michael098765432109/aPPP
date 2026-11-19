import { letters, loveLines, romanticNotes } from "../../../../packages/content/letters.js";
import {
  initReveal,
  initThemeToggle,
  prefersReducedMotion
} from "../../../../assets/js/ui.js";

const TONES = ["rose", "iris", "cyan", "amber", "rose"];

const grid = document.querySelector("#letters-grid");
const dialog = document.querySelector("#letter-dialog");
const scroll = document.querySelector("#letter-scroll");
const countEl = document.querySelector("#letter-count");
const kickerEl = document.querySelector("#letter-kicker");
const titleEl = document.querySelector("#letter-title");
const metaEl = document.querySelector("#letter-meta");
const bodyEl = document.querySelector("#letter-body");
const psEl = document.querySelector("#letter-ps");
const signEl = document.querySelector("#letter-sign");
const sectionTitleEl = document.querySelector("#letter-section-title");
const dotsEl = document.querySelector("#letter-dots");
const prevBtn = document.querySelector("[data-prev]");
const nextBtn = document.querySelector("[data-next]");
const closeBtn = document.querySelector("[data-close]");
const notesGrid = document.querySelector("#love-notes-grid");
const linesList = document.querySelector("#love-lines-list");

let current = 0;
let lastTrigger = null;
let opening = false;

initThemeToggle();
initReveal();

function envelopeMarkup(letter, index) {
  return `
    <span class="envelope__paper" aria-hidden="true"></span>
    <span class="envelope__pocket" aria-hidden="true"></span>
    <span class="envelope__seam" aria-hidden="true"></span>
    <span class="envelope__flap" aria-hidden="true"></span>
    <span class="envelope__face">
      <span class="envelope__num">Carta ${letter.number}</span>
      <span class="envelope__title">${letter.title}</span>
      <span class="envelope__open">
        Abrir
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
      </span>
    </span>
    <span class="envelope__seal" aria-hidden="true">${letter.seal}</span>
  `;
}

function renderEnvelopes() {
  grid.innerHTML = letters
    .map(
      (letter, index) => `
        <button
          class="envelope envelope--${TONES[index % TONES.length]}"
          type="button"
          data-index="${index}"
          style="--i: ${index}"
          aria-haspopup="dialog"
        >${envelopeMarkup(letter, index)}</button>
      `
    )
    .join("");

  grid.querySelectorAll(".envelope").forEach((button) => {
    button.addEventListener("click", () => openLetter(Number(button.dataset.index), button));
  });
}

function renderCounts() {
  const total = String(letters.length).padStart(2, "0");
  document.querySelectorAll("[data-letter-total]").forEach((element) => {
    element.textContent = total;
  });
  countEl.textContent = `Carta 01 / ${total}`;
}

function renderDots() {
  dotsEl.innerHTML = letters
    .map(
      (letter, index) => `
        <button
          class="letter__dot${index === current ? " is-active" : ""}"
          type="button"
          data-dot="${index}"
          aria-label="Carta ${index + 1}: ${letter.title}"
          ${index === current ? 'aria-current="true"' : ""}
        ></button>
      `
    )
    .join("");

  dotsEl.querySelectorAll("[data-dot]").forEach((dot) => {
    dot.addEventListener("click", () => showLetter(Number(dot.dataset.dot)));
  });
}

function fillLetter(index) {
  const letter = letters[index];
  current = index;

  kickerEl.textContent = letter.kicker;
  titleEl.textContent = letter.title;
  metaEl.textContent = `${letter.minutes} min de lectura · Para Alexandra`;
  const count = String(letters.length).padStart(2, "0");
  countEl.textContent = `Carta ${letter.number} / ${count}`;

  bodyEl.replaceChildren(
    ...letter.paragraphs.map((paragraph, i) => {
      const element = document.createElement("p");
      element.style.setProperty("--p", i);
      element.textContent = paragraph;
      return element;
    })
  );
  sectionTitleEl.textContent = letter.kicker;

  const delay = letter.paragraphs.length;
  signEl.style.setProperty("--p", delay);

  if (letter.ps) {
    psEl.hidden = false;
    psEl.textContent = letter.ps;
    psEl.style.setProperty("--p", delay);
  } else {
    psEl.hidden = true;
    psEl.textContent = "";
  }

  renderDots();
  scroll.scrollTop = 0;
}

function showLetter(index) {
  const total = letters.length;
  fillLetter(((index % total) + total) % total);
}

function openLetter(index, trigger) {
  if (opening) return;
  opening = true;
  lastTrigger = trigger;
  trigger.classList.add("is-opening");

  const wait = prefersReducedMotion() ? 0 : 460;

  window.setTimeout(() => {
    fillLetter(index);
    scroll.scrollTop = 0;
    dialog.showModal();
    closeBtn.focus({ preventScroll: true });
    opening = false;
  }, wait);
}

function closeLetter() {
  dialog.close();
}

closeBtn.addEventListener("click", closeLetter);

dialog.addEventListener("click", (event) => {
  if (event.target === dialog) closeLetter();
});

dialog.addEventListener("close", () => {
  if (lastTrigger) {
    lastTrigger.classList.remove("is-opening");
    lastTrigger.focus({ preventScroll: true });
    lastTrigger = null;
  }
});

prevBtn.addEventListener("click", () => showLetter(current - 1));
nextBtn.addEventListener("click", () => showLetter(current + 1));

dialog.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight") {
    event.preventDefault();
    showLetter(current + 1);
  } else if (event.key === "ArrowLeft") {
    event.preventDefault();
    showLetter(current - 1);
  }
});

renderEnvelopes();
renderCounts();

romanticNotes.forEach((note, index) => {
  const card = document.createElement("article");
  card.className = "love-note";
  card.dataset.reveal = "";
  card.style.setProperty("--delay", index * 80);
  const number = document.createElement("span");
  number.className = "love-note__number";
  number.setAttribute("aria-hidden", "true");
  number.textContent = String(index + 1).padStart(2, "0");
  const title = document.createElement("h3");
  title.textContent = note.title;
  const text = document.createElement("p");
  text.textContent = note.text;
  card.append(number, title, text);
  notesGrid.append(card);
});

loveLines.forEach((line, index) => {
  const item = document.createElement("li");
  item.dataset.reveal = "";
  item.style.setProperty("--delay", index * 70);
  item.textContent = line;
  linesList.append(item);
});

initReveal();
