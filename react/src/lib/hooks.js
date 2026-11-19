import { useCallback, useEffect, useState } from "react";
import { initHeaderState, initReveal } from "../../../assets/js/ui.js";

const THEME_KEY = "alexandra-theme";

export function useTheme() {
  const [theme, setTheme] = useState(() =>
    document.documentElement.dataset.theme === "light" ? "light" : "night"
  );

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      /* almacenamiento no disponible */
    }
  }, [theme]);

  const toggle = useCallback(() => {
    setTheme((current) => (current === "light" ? "night" : "light"));
  }, []);

  return { theme, toggle };
}

export function usePageEffects() {
  useEffect(() => {
    document.documentElement.classList.add("js");
    initReveal();
    initHeaderState();
  }, []);
}
