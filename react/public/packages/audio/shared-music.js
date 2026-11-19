/* Reproductor comÃºn para todas las pÃ¡ginas. El archivo elegido se guarda en IndexedDB. */
(function () {
  if (window.AlexandraMusic) return;

  const DB_NAME = "para-alexandra-audio";
  const DB_VERSION = 1;
  const STORE = "tracks";
  const TRACK_KEY = "selected";
  const PLAY_KEY = "alexandra-music-enabled";
  let databasePromise;
  let trackLoadPromise = null;
  let sourceInitialized = false;
  let objectUrl = null;
  let defaultUrl = "";
  let trackName = "Hasta ese entonces";
  let retryOnGesture = false;
  let activationPrompt = null;

  const audio = new Audio();
  audio.loop = true;
  audio.preload = "auto";
  audio.volume = 0.38;

  function openDatabase() {
    if (databasePromise) return databasePromise;
    databasePromise = new Promise((resolve, reject) => {
      if (!("indexedDB" in window)) return reject(new Error("IndexedDB no disponible"));
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains(STORE)) {
          request.result.createObjectStore(STORE);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    return databasePromise;
  }

  async function readTrack() {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const request = db.transaction(STORE, "readonly").objectStore(STORE).get(TRACK_KEY);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async function writeTrack(value) {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE, "readwrite");
      transaction.objectStore(STORE).put(value, TRACK_KEY);
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async function deleteTrack() {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE, "readwrite");
      transaction.objectStore(STORE).delete(TRACK_KEY);
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error);
    });
  }

  function updateControls() {
    const playing = !audio.paused;
    document.querySelectorAll("[data-shared-music], [data-default-track]").forEach((button) => {
      button.setAttribute("aria-pressed", String(playing));
      button.setAttribute("aria-label", `${playing ? "Pausar" : "Reproducir"}: ${trackName}`);
      button.classList.toggle("is-playing", playing);
      const glyph = button.querySelector("[data-music-glyph]");
      if (glyph) glyph.textContent = playing ? "âšâš" : "â–¶";
    });
    document.querySelectorAll("[data-shared-track-name]").forEach((node) => {
      node.textContent = trackName;
    });
    document.dispatchEvent(new CustomEvent("alexandra:music-state", {
      detail: { playing, name: trackName }
    }));
  }

  function hideActivationPrompt() {
    activationPrompt?.remove();
    activationPrompt = null;
  }

  function showActivationPrompt() {
    if (activationPrompt || !document.body) return;
    activationPrompt = document.createElement("button");
    activationPrompt.type = "button";
    activationPrompt.textContent = "Toca para escuchar la música";
    activationPrompt.setAttribute("aria-label", `Reproducir ${trackName}`);
    Object.assign(activationPrompt.style, {
      position: "fixed",
      zIndex: "99999",
      left: "50%",
      bottom: "max(18px, env(safe-area-inset-bottom))",
      transform: "translateX(-50%)",
      border: "1px solid rgba(255,255,255,.3)",
      borderRadius: "999px",
      padding: "12px 18px",
      background: "#24182d",
      color: "#fff",
      boxShadow: "0 8px 28px rgba(0,0,0,.35)",
      font: "600 14px/1.2 system-ui, sans-serif",
      cursor: "pointer"
    });
    activationPrompt.addEventListener("click", () => {
      play().catch((error) => console.warn("No se pudo reproducir la canción:", error));
    });
    document.body.appendChild(activationPrompt);
  }

  function setSource(url, name, temporaryUrl = null) {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    objectUrl = temporaryUrl;
    audio.pause();
    audio.src = url;
    trackName = name || "Hasta ese entonces";
    sourceInitialized = true;
    updateControls();
  }

  function stopGestureRetry() {
    if (!retryOnGesture) return;
    document.removeEventListener("pointerdown", resumeAfterGesture, true);
    document.removeEventListener("keydown", resumeAfterGesture, true);
    retryOnGesture = false;
  }

  function resumeAfterGesture(event) {
    if (event.target?.closest?.("[data-shared-music], [data-default-track]")) return;
    if (event.type === "keydown" && !["Enter", " "].includes(event.key)) return;
    if (event.target?.matches?.("input, textarea, select, [contenteditable='true']")) return;
    audio.play().then(() => {
      stopGestureRetry();
      hideActivationPrompt();
    }).catch(() => {});
  }

  function waitForGesture() {
    if (retryOnGesture) return;
    retryOnGesture = true;
    document.addEventListener("pointerdown", resumeAfterGesture, true);
    document.addEventListener("keydown", resumeAfterGesture, true);
  }

  async function init(fallbackUrl) {
    const button = document.querySelector("[data-default-track]");
    defaultUrl = fallbackUrl || button?.dataset.defaultTrack || defaultUrl;
    if (!trackLoadPromise) {
      trackLoadPromise = readTrack().then((saved) => {
        if (sourceInitialized || !saved?.blob) return;
        const url = URL.createObjectURL(saved.blob);
        setSource(url, saved.name || "CanciÃ³n de Alexandra", url);
      }).catch((error) => {
        console.warn("No se pudo recuperar la canciÃ³n guardada:", error);
      });
    }
    await trackLoadPromise;
    if (!sourceInitialized && defaultUrl) setSource(defaultUrl, "Hasta ese entonces");

    localStorage.setItem(PLAY_KEY, "true");
    if (audio.src && audio.paused) {
      try {
        await audio.play();
        hideActivationPrompt();
      } catch {
        waitForGesture();
        showActivationPrompt();
        /* El navegador puede requerir otro toque tras cambiar de pÃ¡gina. */
      }
    }
    updateControls();
    return api;
  }

  async function play() {
    if (!audio.src && defaultUrl) setSource(defaultUrl, "Hasta ese entonces");
    if (!audio.src) throw new Error("No hay una canciÃ³n disponible");
    localStorage.setItem(PLAY_KEY, "true");
    await audio.play();
    hideActivationPrompt();
    updateControls();
    return true;
  }

  function pause() {
    stopGestureRetry();
    audio.pause();
    updateControls();
    return false;
  }

  async function toggle() {
    if (!audio.paused) return pause();
    return play();
  }

  async function setUserTrack(file, options = {}) {
    if (!file) return false;
    const name = file.name.replace(/\.[^.]+$/, "") || "CanciÃ³n de Alexandra";
    await writeTrack({ blob: file, name, type: file.type || "audio/mpeg" });
    const url = URL.createObjectURL(file);
    setSource(url, name, url);
    localStorage.setItem("alexandra-user-track-set", "true");
    if (options.play !== false) await play();
    return true;
  }

  async function useDefault(options = {}) {
    await deleteTrack();
    localStorage.removeItem("alexandra-user-track-set");
    if (!defaultUrl) return false;
    setSource(defaultUrl, "Hasta ese entonces");
    if (options.play) await play();
    return true;
  }

  function bind(button) {
    if (!button || button.dataset.sharedBound === "true") return;
    button.dataset.sharedBound = "true";
    button.addEventListener("click", () => toggle().catch((error) => {
      console.warn("No se pudo reproducir la canciÃ³n:", error);
      button.setAttribute("aria-label", "No se pudo reproducir. Vuelve a intentarlo.");
    }));
    updateControls();
  }

  const api = {
    audio,
    init,
    bind,
    play,
    pause,
    toggle,
    setUserTrack,
    useDefault,
    isPlaying: () => !audio.paused,
    getTrackName: () => trackName,
    setVolume: (value) => { audio.volume = Math.max(0, Math.min(1, value)); }
  };

  audio.addEventListener("play", updateControls);
  audio.addEventListener("play", hideActivationPrompt);
  audio.addEventListener("pause", updateControls);
  window.AlexandraMusic = api;

  function start() {
    document.querySelectorAll("[data-shared-music]").forEach(bind);
    init().catch((error) => console.warn("No se pudo iniciar el reproductor comÃºn:", error));
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();


