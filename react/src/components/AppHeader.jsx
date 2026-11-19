import { useEffect, useRef, useState } from "react";
import { MoonIcon, SunIcon } from "./Icons.jsx";
import "../../../packages/audio/shared-music.js";
import defaultTrackUrl from "../../../assets/audio/hasta-ese-entonces.mp3?url";

function SharedMusicToggle() {
  const [playing, setPlaying] = useState(false);
  const buttonRef = useRef(null);

  useEffect(() => {
    const player = window.AlexandraMusic;
    const onState = (event) => setPlaying(event.detail.playing);
    document.addEventListener("alexandra:music-state", onState);
    player.init(defaultTrackUrl).then(() => player.bind(buttonRef.current));
    return () => document.removeEventListener("alexandra:music-state", onState);
  }, []);

  return (
    <button
      className={`icon-btn${playing ? " is-playing" : ""}`}
      type="button"
      ref={buttonRef}
      data-shared-music
      data-default-track={defaultTrackUrl}
      aria-pressed={playing}
      aria-label={playing ? "Pausar canción" : "Reproducir canción"}
    >
      <span className="sound-bars" aria-hidden="true">
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </span>
    </button>
  );
}

export default function AppHeader({ theme, onToggleTheme, back = true, floating = false }) {
  const nextTheme = theme === "light" ? "noche" : "alba";

  return (
    <header className={`app-header${floating ? " app-header--floating" : ""}`}>
      <div className="container app-header__inner">
        <a
          className="brand"
          href="index.html"
          aria-label={back ? "Volver a Para Alexandra" : "Para Alexandra, inicio"}
        >
          <img className="brand__logo" src="./logo.png" alt="Logo de Para Alexandra" width="36" height="36" />
          <span className="brand__text">Para Alexandra</span>
        </a>
        <div className="header-actions">
          <SharedMusicToggle />
          <button
            className="icon-btn"
            type="button"
            aria-label={`Cambiar a tema ${nextTheme}`}
            onClick={onToggleTheme}
          >
            <SunIcon className="icon-sun" />
            <MoonIcon className="icon-moon" />
          </button>
          {back ? (
            <a className="back-link" href="index.html">
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              <span>Inicio</span>
            </a>
          ) : null}
        </div>
      </div>
    </header>
  );
}
