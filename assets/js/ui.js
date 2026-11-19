const THEME_KEY = "alexandra-theme";

export const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const canHover = () =>
  window.matchMedia("(hover: hover) and (pointer: fine)").matches;

export function getTheme() {
  return document.documentElement.dataset.theme === "light" ? "light" : "night";
}

export function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    /* almacenamiento no disponible */
  }
  updateThemeLabels();
}

export function updateThemeLabels() {
  const next = getTheme() === "light" ? "noche" : "alba";
  document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
    button.setAttribute("aria-label", `Cambiar a tema ${next}`);
  });
}

export function initThemeToggle() {
  updateThemeLabels();
  document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      setTheme(getTheme() === "light" ? "night" : "light");
    });
  });
}

export function initReveal() {
  const elements = document.querySelectorAll("[data-reveal]");
  if (!elements.length) return;

  if (!("IntersectionObserver" in window) || prefersReducedMotion()) {
    elements.forEach((element) => element.classList.add("is-in"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
  );

  elements.forEach((element) => observer.observe(element));
}

export function initHeaderState() {
  const header = document.querySelector(".app-header");
  if (!header) return;

  const update = () => header.classList.toggle("is-scrolled", window.scrollY > 12);
  update();
  window.addEventListener("scroll", update, { passive: true });
}

export function initSoundToggle(engine) {
  const buttons = Array.from(document.querySelectorAll("[data-sound-toggle]"));
  if (!buttons.length) return;

  let busy = false;

  const render = (playing) => {
    buttons.forEach((button) => {
      button.classList.toggle("is-playing", playing);
      button.setAttribute("aria-pressed", String(playing));
      button.setAttribute("aria-label", playing ? "Pausar ambiente sonoro" : "Activar ambiente sonoro");
    });
  };

  buttons.forEach((button) => {
    button.addEventListener("click", async () => {
      if (busy) return;
      busy = true;
      try {
        render(await engine.toggle());
      } catch (error) {
        console.error("No se pudo iniciar el audio:", error);
      } finally {
        busy = false;
      }
    });
  });
}

export function initPointerGlow() {
  const glow = document.querySelector(".cursor-glow");
  if (!glow || !canHover() || prefersReducedMotion()) return;

  let frame = 0;
  let lastX = 0;
  let lastY = 0;

  window.addEventListener(
    "pointermove",
    (event) => {
      lastX = event.clientX;
      lastY = event.clientY;
      if (frame) return;
      frame = requestAnimationFrame(() => {
        glow.classList.add("is-active");
        glow.style.transform = `translate3d(${lastX}px, ${lastY}px, 0)`;
        frame = 0;
      });
    },
    { passive: true }
  );
}

export function initOrbitParallax() {
  const orbit = document.querySelector("[data-orbit]");
  if (!orbit || !canHover() || prefersReducedMotion()) return;

  orbit.addEventListener(
    "pointermove",
    (event) => {
      const rect = orbit.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      orbit.style.setProperty("--mx", (x * 2).toFixed(3));
      orbit.style.setProperty("--my", (y * 2).toFixed(3));
    },
    { passive: true }
  );

  orbit.addEventListener("pointerleave", () => {
    orbit.style.setProperty("--mx", "0");
    orbit.style.setProperty("--my", "0");
  });
}
