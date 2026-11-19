import { letters } from "../../packages/content/letters.js";
import {
  initHeaderState,
  initOrbitParallax,
  initPointerGlow,
  initReveal,
  initThemeToggle
} from "./ui.js";

initThemeToggle();
initReveal();
initHeaderState();
initPointerGlow();
initOrbitParallax();

const letterMeta = document.querySelector("#letters-meta");
if (letterMeta) {
  const minutes = letters.reduce((total, letter) => total + letter.minutes, 0);
  letterMeta.textContent = `${letters.length} cartas · ${minutes} min`;
}

