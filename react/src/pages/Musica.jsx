import { useEffect, useRef, useState } from "react";
import { AmbientEngine, MOODS } from "../../../packages/audio/engine.js";
import { prefersReducedMotion } from "../../../assets/js/ui.js";
import { usePageEffects, useTheme } from "../lib/hooks.js";
import AppHeader from "../components/AppHeader.jsx";
import Footer from "../components/Footer.jsx";
import {
  ArrowLeftIcon,
  ArrowUpRightIcon,
  PauseIcon,
  PlayIcon
} from "../components/Icons.jsx";

const HUES = { amanecer: 28, lluvia: 190, estrellas: 262 };

const SOUND_CARDS = [
  {
    id: "amanecer",
    title: "Amanecer",
    desc: "Pads cÃ¡lidos que suben como la luz de la maÃ±ana. Para empezar sin prisa.",
    meta: "Tonalidad mayor Â· 15 s por acorde"
  },
  {
    id: "lluvia",
    title: "Lluvia",
    desc: "Ruido suave y notas bajas, como una ventana entreabierta. Para cuando la cabeza no se apaga.",
    meta: "Filtro oscuro Â· lluvia sintetizada"
  },
  {
    id: "estrellas",
    title: "Estrellas",
    desc: "Acordes lentos, casi suspendidos, con mucha reverberaciÃ³n. Para mirar el techo y respirar.",
    meta: "Registro grave Â· 19 s por acorde"
  }
];

function MoodIcon({ id }) {
  if (id === "lluvia") {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 15a4.5 4.5 0 0 1-.4-9A6 6 0 0 1 18 7.5 3.75 3.75 0 0 1 17.5 15H7Z" />
        <path d="M8 18.5v1.5M12 18v2M16 18.5v1.5" />
      </svg>
    );
  }
  if (id === "estrellas") {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3.5 13.8 9l5.7.4-4.4 3.6 1.4 5.5L12 15.4l-4.5 3.1 1.4-5.5L4.5 9.4 10.2 9 12 3.5Z" />
      </svg>
    );
  }
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 7 7M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4" />
    </svg>
  );
}

export default function Musica() {
  const { theme, toggle } = useTheme();
  const [engine] = useState(() => new AmbientEngine());

  const [mood, setMood] = useState("amanecer");
  const [mode, setMode] = useState("ambient");
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(55);
  const [fileLabel, setFileLabel] = useState("");
  const [error, setError] = useState(null);

  const stageRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const fileElRef = useRef(null);
  const fileSourceRef = useRef(null);
  const fileAnalyserRef = useRef(null);
  const fileUrlRef = useRef(null);
  const drawRef = useRef(null);
  const stateRef = useRef({ mood, mode, playing });

  usePageEffects();

  useEffect(() => {
    let active = true;
    window.AlexandraMusic.init().then((player) => {
      if (!active || localStorage.getItem("alexandra-user-track-set") !== "true") return;
      fileElRef.current = player.audio;
      setFileLabel(player.getTrackName());
      setMode("file");
      setPlaying(player.isPlaying());
    }).catch((caught) => console.warn("No se pudo recuperar la canción guardada:", caught));
    return () => { active = false; };
  }, []);

  useEffect(() => {
    engine.setVolume(volume / 100);
  }, [engine, volume]);

  useEffect(() => {
    stateRef.current = { mood, mode, playing };
    if (prefersReducedMotion()) drawRef.current?.(performance.now());
  }, [mood, mode, playing]);

  /* ---------- Visualizador ---------- */

  useEffect(() => {
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    if (!canvas || !stage) return undefined;
    const ctx2d = canvas.getContext("2d");
    const still = prefersReducedMotion();

    let size = 0;
    let dpr = 1;
    let freq = new Uint8Array(512);
    let lastLevel = -1;
    let frame = 0;

    const activeAnalyser = () => {
      const { mode: currentMode, playing: isOn } = stateRef.current;
      if (currentMode === "file") return isOn ? fileAnalyserRef.current : null;
      return engine.playing ? engine.getAnalyser() : null;
    };

    const setLevel = (value) => {
      const rounded = Math.round(value * 100) / 100;
      if (rounded === lastLevel) return;
      lastLevel = rounded;
      stage.style.setProperty("--level", rounded.toFixed(2));
    };

    const draw = (time) => {
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
      const hue = HUES[stateRef.current.mood] ?? 28;
      const bars = 92;

      ctx2d.clearRect(0, 0, size, size);
      ctx2d.lineCap = "round";
      ctx2d.lineWidth = Math.max(1.2, size * 0.0035);

      for (let i = 0; i < bars; i += 1) {
        const angle = (i / bars) * Math.PI * 2 - Math.PI / 2;
        const bin = Math.min(freq.length - 1, Math.floor(Math.pow(i / bars, 1.6) * 150));

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
    };

    drawRef.current = draw;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width) return;
      size = rect.width;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(size * dpr);
      canvas.height = Math.round(size * dpr);
      ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (still) draw(performance.now());
    };

    const loop = (time) => {
      draw(time);
      frame = requestAnimationFrame(loop);
    };

    resize();
    if (still) {
      draw(performance.now());
    } else {
      frame = requestAnimationFrame(loop);
    }

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      drawRef.current = null;
    };
  }, [engine]);

  /* ---------- Audio ---------- */

  const isPlaying = () =>
    mode === "file" ? Boolean(fileElRef.current && !fileElRef.current.paused) : engine.playing;

  const attachFileGraph = () => {
    const audio = fileElRef.current;
    if (!audio || fileSourceRef.current || engine.ctx?.state !== "running") return;

    const analyser = engine.ctx.createAnalyser();
    analyser.fftSize = 1024;
    analyser.smoothingTimeConstant = 0.86;
    analyser.connect(engine.ctx.destination);

    const source = engine.ctx.createMediaElementSource(audio);
    source.connect(analyser);

    fileAnalyserRef.current = analyser;
    fileSourceRef.current = source;
  };

  const togglePlayback = async () => {
    try {
      if (isPlaying()) {
        if (mode === "file" && fileElRef.current) window.AlexandraMusic.pause();
        else engine.stop();
        setPlaying(false);
      } else if (mode === "file" && fileElRef.current) {
        engine.stop();
        if (engine.ctx?.state === "suspended") await engine.ctx.resume();
        attachFileGraph();
        await window.AlexandraMusic.play();
        setPlaying(true);
      } else {
        if (fileElRef.current) fileElRef.current.pause();
        await engine.start();
        setPlaying(true);
      }
      setError(null);
    } catch (caught) {
      console.error("No se pudo reproducir el audio:", caught);
      setError("El navegador bloqueÃ³ el audio. Intenta de nuevo.");
    }
  };

  const selectMood = async (id) => {
    if (mode === "file" && fileElRef.current) window.AlexandraMusic.pause();

    setMode("ambient");
    setMood(id);
    setError(null);
    engine.setMood(id);

    try {
      await engine.start();
      setPlaying(true);
    } catch (caught) {
      console.error("No se pudo iniciar el ambiente:", caught);
    }
  };

  const loadFile = async (file) => {
    if (!file) return;
    const label = file.name.replace(/\.[^.]+$/, "");

    try {
      await engine.init();
      try {
        if (engine.ctx.state === "suspended") await engine.ctx.resume();
      } catch {
        /* el navegador pedirÃ¡ un gesto; el botÃ³n de play lo resuelve */
      }

      fileElRef.current = window.AlexandraMusic.audio;
      fileElRef.current.addEventListener("play", () => setPlaying(true));
      fileElRef.current.addEventListener("pause", () => setPlaying(false));
      engine.stop();
      const audio = fileElRef.current;
      await window.AlexandraMusic.setUserTrack(file, { play: false });
      window.AlexandraMusic.setVolume(volume / 100);

      setMode("file");
      setFileLabel(label);
      setError(null);
      attachFileGraph();

      try {
        await window.AlexandraMusic.play();
        setPlaying(true);
      } catch {
        /* queda cargada y en pausa hasta que pulse play */
      }
    } catch (caught) {
      console.error("No se pudo abrir la canciÃ³n:", caught);
      setFileLabel("");
      setError("No se pudo abrir esa canciÃ³n. Prueba con otro archivo.");
    }
  };

  const clearFile = async () => {
    await window.AlexandraMusic.useDefault({ play: true });
    fileElRef.current = window.AlexandraMusic.audio;
    setFileLabel("Hasta ese entonces");
    setMode("file");
    setPlaying(true);
    setError(null);
  };

  const resumeFile = async () => {
    if (!fileElRef.current || !fileLabel) return;
    try {
      await engine.init();
      if (engine.ctx.state === "suspended") await engine.ctx.resume();
      engine.stop();
      attachFileGraph();
      setMode("file");
      await window.AlexandraMusic.play();
      setPlaying(true);
      setError(null);
    } catch (caught) {
      console.error("No se pudo reanudar la canciÃ³n:", caught);
    }
  };

  /* ---------- Atajos y limpieza ---------- */

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.code !== "Space" || event.target !== document.body) return;
      event.preventDefault();
      togglePlayback();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  });

  useEffect(() => {
    const onPageHide = () => {
      engine.stop();
      if (stateRef.current.mode === "file") fileElRef.current?.pause();
    };
    window.addEventListener("pagehide", onPageHide);
    return () => {
      window.removeEventListener("pagehide", onPageHide);
      engine.stop();
      if (stateRef.current.mode === "file") fileElRef.current?.pause();
      if (fileUrlRef.current) URL.revokeObjectURL(fileUrlRef.current);
    };
  }, [engine]);

  const currentMood = MOODS.find((item) => item.id === mood) ?? MOODS[0];
  const status = error
    ? error
    : mode === "file" && fileLabel
      ? `${fileLabel} Â· tu canciÃ³n`
      : `${currentMood.label} Â· ${playing ? "en vivo" : "en pausa"}`;

  return (
    <>
      <a className="skip-link" href="#contenido">
        Saltar al contenido
      </a>

      <AppHeader theme={theme} onToggleTheme={toggle} />

      <main id="contenido">
        <section
          className={`stage${playing ? " is-playing" : ""}`}
          id="stage"
          data-mood={mood}
          aria-labelledby="musica-title"
          ref={stageRef}
        >
          <div className="container stage__inner">
            <div className="stage__copy">
              <p className="eyebrow" data-reveal>
                MÃºsica y ambiente
              </p>
              <h1 className="stage__title" id="musica-title" data-reveal style={{ "--delay": 80 }}>
                Baja el ruido.
                <em>QuÃ©date un rato.</em>
              </h1>
              <p className="stage__intro" data-reveal style={{ "--delay": 150 }}>
                No es una playlist. Es un ambiente que se genera en vivo, con notas que aparecen y se van.
                Puedes dejarlo de fondo mientras lees, respiras o no haces nada.
              </p>

              <div className="now" data-reveal style={{ "--delay": 210 }}>
                <span className="now__dot" aria-hidden="true"></span>
                <span role="status" aria-live="polite">
                  {status}
                </span>
              </div>

              <div className="transport" data-reveal style={{ "--delay": 260 }}>
                <button
                  className="play"
                  type="button"
                  aria-pressed={playing}
                  aria-label={playing ? "Pausar el ambiente" : "Reproducir el ambiente"}
                  onClick={togglePlayback}
                >
                  <PlayIcon className="icon-play" />
                  <PauseIcon className="icon-pause" />
                </button>
                <div className="volume">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M11 5 6.5 8.5H3v7h3.5L11 19V5Z" />
                    <path d="M15 9a4 4 0 0 1 0 6M17.8 6.2a8 8 0 0 1 0 11.6" />
                  </svg>
                  <label className="sr-only" htmlFor="volume">
                    Volumen
                  </label>
                  <input
                    id="volume"
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={volume}
                    onChange={(event) => {
                      const value = Number(event.target.value);
                      setVolume(value);
                      if (mode === "file") window.AlexandraMusic.setVolume(value / 100);
                    }}
                  />
                  <span className="volume__value">{volume}</span>
                </div>
              </div>

              <div
                className="moods"
                role="group"
                aria-label="Elegir una atmÃ³sfera"
                data-reveal
                style={{ "--delay": 310 }}
              >
                {MOODS.map((item) => (
                  <button
                    className="mood"
                    type="button"
                    key={item.id}
                    data-mood-id={item.id}
                    aria-pressed={mode === "ambient" && mood === item.id}
                    onClick={() => selectMood(item.id)}
                  >
                    <span className="mood__icon" aria-hidden="true">
                      <MoodIcon id={item.id} />
                    </span>
                    <span className="mood__label">{item.label}</span>
                    <span className="mood__hint">{item.hint}</span>
                  </button>
                ))}
              </div>

              <div className="upload" data-reveal style={{ "--delay": 350 }}>
                <input
                  className="sr-only"
                  type="file"
                  id="audio-file"
                  accept="audio/*"
                  ref={fileInputRef}
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    event.target.value = "";
                    loadFile(file);
                  }}
                />
                <label className="btn btn--ghost btn--sm" htmlFor="audio-file">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M12 16V4M7 9l5-5 5 5M4 20h16" />
                  </svg>
                  Poner una canciÃ³n
                </label>
                {fileLabel && mode !== "file" ? (
                  <button className="btn btn--quiet btn--sm" type="button" onClick={resumeFile}>
                    Mi canciÃ³n
                  </button>
                ) : null}
                {fileLabel ? (
                  <button className="btn btn--quiet btn--sm" type="button" onClick={clearFile}>
                    Volver a Hasta ese entonces
                  </button>
                ) : null}
                <span className="upload__name">{fileLabel || "O escucha tu propia mÃºsica"}</span>
              </div>
              <p className="stage__note">
                El ambiente se sintetiza en tu navegador. Nada se sube a ningÃºn lado.
              </p>
            </div>

            <div className="stage__visual" data-reveal style={{ "--delay": 200 }}>
              <div className="orb-shell">
                <canvas className="viz" aria-hidden="true" ref={canvasRef}></canvas>
                <div className="orb-breathe" aria-hidden="true">
                  <span className="orb"></span>
                </div>
                <span className="orb-caption" aria-hidden="true">
                  Respira con el cÃ­rculo
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="music-info" aria-labelledby="sounds-title">
          <div className="container">
            <div className="music-info__head">
              <p className="eyebrow">Tres atmÃ³sferas</p>
              <h2 className="section-title" id="sounds-title" data-reveal>
                Tres formas de bajar el ruido.
              </h2>
              <p className="section-sub" data-reveal style={{ "--delay": 80 }}>
                Cada una cambia el filtro, el pulso y la lluvia. Nunca suena exactamente igual dos veces.
              </p>
            </div>

            <div className="sounds">
              {SOUND_CARDS.map((card, index) => {
                const selected = mode === "ambient" && mood === card.id;
                return (
                  <button
                    className={`sound-card sound-card--${card.id}`}
                    type="button"
                    key={card.id}
                    data-mood-id={card.id}
                    aria-pressed={selected}
                    data-reveal
                    style={{ "--delay": index * 100 }}
                    onClick={() => selectMood(card.id)}
                  >
                    <span className="sound-card__top">
                      <span className="sound-card__icon" aria-hidden="true">
                        <MoodIcon id={card.id} />
                      </span>
                      <span className="sound-card__state">
                        {selected ? (playing ? "Sonando" : "Elegida") : "Elegir"}
                      </span>
                    </span>
                    <span className="sound-card__title">{card.title}</span>
                    <span className="sound-card__desc">{card.desc}</span>
                    <span className="sound-card__meta">{card.meta}</span>
                  </button>
                );
              })}
            </div>

            <div className="music-close" data-reveal>
              <p className="music-close__text">
                No hay ninguna canciÃ³n que tengas que escuchar hasta el final.
              </p>
              <div className="music-close__actions">
                <a className="btn btn--ghost" href="index.html">
                  <ArrowLeftIcon />
                  Volver al inicio
                </a>
                <a className="btn btn--primary" href="galeria.html">
                  Ver la galerÃ­a
                  <ArrowUpRightIcon className="btn__arrow" />
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer label="MÃºsica y ambiente" />
    </>
  );
}

