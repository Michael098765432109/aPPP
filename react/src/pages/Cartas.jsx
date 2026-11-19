import { useEffect, useRef, useState } from "react";
import { letters, loveLines, romanticNotes } from "../../../packages/content/letters.js";
import { AmbientEngine } from "../../../packages/audio/engine.js";
import { prefersReducedMotion } from "../../../assets/js/ui.js";
import { usePageEffects, useTheme } from "../lib/hooks.js";
import AppHeader from "../components/AppHeader.jsx";
import Footer from "../components/Footer.jsx";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpRightIcon,
  CloseIcon
} from "../components/Icons.jsx";

const TONES = ["rose", "iris", "cyan", "amber", "rose"];

function Envelope({ letter, index, opening, onOpen }) {
  return (
    <button
      className={`envelope envelope--${TONES[index % TONES.length]}${opening ? " is-opening" : ""}`}
      type="button"
      style={{ "--i": index }}
      aria-haspopup="dialog"
      onClick={onOpen}
    >
      <span className="envelope__paper" aria-hidden="true"></span>
      <span className="envelope__pocket" aria-hidden="true"></span>
      <span className="envelope__seam" aria-hidden="true"></span>
      <span className="envelope__flap" aria-hidden="true"></span>
      <span className="envelope__face">
        <span className="envelope__num">Carta {letter.number}</span>
        <span className="envelope__title">{letter.title}</span>
        <span className="envelope__open">
          Abrir
          <ArrowRightIcon size={13} />
        </span>
      </span>
      <span className="envelope__seal" aria-hidden="true">
        {letter.seal}
      </span>
    </button>
  );
}

export default function Cartas() {
  const { theme, toggle } = useTheme();
  const [engine] = useState(() => {
    const instance = new AmbientEngine();
    instance.setMood("amanecer");
    return instance;
  });

  const [current, setCurrent] = useState(null);
  const [opening, setOpening] = useState(null);
  const dialogRef = useRef(null);
  const scrollRef = useRef(null);
  const closeButtonRef = useRef(null);
  const triggerRef = useRef(null);
  const openingRef = useRef(false);

  usePageEffects();

  useEffect(() => {
    window.addEventListener("pagehide", () => engine.stop());
    return () => engine.stop();
  }, [engine]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (current === null || !dialog) return;
    if (!dialog.open) {
      dialog.showModal();
      closeButtonRef.current?.focus({ preventScroll: true });
    }
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [current]);

  const step = (delta) => {
    setCurrent((index) =>
      index === null ? null : (index + delta + letters.length) % letters.length
    );
  };

  const openLetter = (index, event) => {
    if (openingRef.current) return;
    openingRef.current = true;
    triggerRef.current = event.currentTarget;
    setOpening(index);
    setCurrent(index);

    window.setTimeout(
      () => { openingRef.current = false; },
      prefersReducedMotion() ? 0 : 460
    );
  };

  const closeLetter = () => dialogRef.current?.close();

  const handleClose = () => {
    setCurrent(null);
    setOpening(null);
    openingRef.current = false;
    triggerRef.current?.focus({ preventScroll: true });
    triggerRef.current = null;
  };

  const handleKeyDown = (event) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      step(1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      step(-1);
    }
  };

  const letter = current === null ? null : letters[current];

  return (
    <>
      <a className="skip-link" href="#contenido">
        Saltar al contenido
      </a>

      <AppHeader theme={theme} onToggleTheme={toggle} engine={engine} />

      <main id="contenido">
        <section className="app-hero" aria-labelledby="cartas-title">
          <div className="container">
            <p className="eyebrow" data-reveal>
              Cartas y mensajes
            </p>
            <h1 className="app-hero__title" id="cartas-title" data-reveal style={{ "--delay": 80 }}>
              {letters.length} cartas,
              <br />
              <em>y un cariño sin prisa.</em>
            </h1>
            <p className="app-hero__intro" data-reveal style={{ "--delay": 160 }}>
              Escribí esto despacio, pensando en ti. Puedes abrirlas en orden, saltarte alguna o volver
              otro día. También encontrarás pequeñas notas sobre el cariño que quiero cuidar. Nada aquí
              espera una respuesta.
            </p>
            <p className="app-hero__hint" data-reveal style={{ "--delay": 220 }}>
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 3v18M5 8l7-5 7 5M5 16l7 5 7-5" />
              </svg>
              Toca un sobre para abrirlo
            </p>
          </div>
        </section>

        <section className="letters" aria-label="Las cartas">
          <div className="container">
            <div className="letters__grid">
              {letters.map((item, index) => (
                <Envelope
                  key={item.id}
                  letter={item}
                  index={index}
                  opening={opening === index}
                  onOpen={(event) => openLetter(index, event)}
                />
              ))}
            </div>
            <noscript>
              <p className="app-hero__intro">
                Esta parte necesita JavaScript para abrir las cartas. Si lo prefieres, puedes leerlas en
                <code>packages/content/letters.js</code>.
              </p>
            </noscript>
          </div>
        </section>

        <section className="love-notes" aria-labelledby="love-notes-title">
          <div className="container">
            <div className="love-notes__heading">
              <p className="eyebrow" data-reveal>Pequeñas cosas que quería decirte</p>
              <h2 className="section-title" id="love-notes-title" data-reveal>
                El cariño también vive en lo sencillo.
              </h2>
              <p className="section-sub" data-reveal style={{ "--delay": 90 }}>
                No son recuerdos inventados ni promesas grandiosas; son formas de nombrar el cuidado que
                me gustaría ofrecerte.
              </p>
            </div>
            <div className="love-notes__grid">
              {romanticNotes.map((note, index) => (
                <article className="love-note" key={note.title} data-reveal style={{ "--delay": index * 80 }}>
                  <span className="love-note__number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                  <h3>{note.title}</h3>
                  <p>{note.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="love-lines" aria-labelledby="love-lines-title">
          <div className="container love-lines__inner">
            <p className="eyebrow" data-reveal>Unas líneas para guardar</p>
            <h2 className="love-lines__title" id="love-lines-title" data-reveal>
              A veces, querer es dejar que el otro respire.
            </h2>
            <ul className="love-lines__list">
              {loveLines.map((line, index) => (
                <li key={line} data-reveal style={{ "--delay": index * 70 }}>{line}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="extra-experiences" aria-labelledby="extra-experiences-title">
          <div className="container">
            <div className="love-notes__heading">
              <p className="eyebrow" data-reveal>Más rincones para descubrir</p>
              <h2 className="section-title" id="extra-experiences-title" data-reveal>
                Pequeñas experiencias hechas para ti.
              </h2>
              <p className="section-sub" data-reveal style={{ "--delay": 90 }}>
                Puedes entrar a cualquiera y volver aquí cuando quieras. Cada rincón tiene su propio ritmo.
              </p>
            </div>
            <nav className="extra-experiences__grid" aria-label="Experiencias románticas para Alexandra">
              <a className="extra-experience" href="apps/1-arbol-alexandra/index.html" data-reveal>
                <span className="extra-experience__icon" aria-hidden="true">🌳</span>
                <span><strong>Un árbol de amor</strong><small>Un corazón que florece y una dedicatoria.</small></span>
                <span className="extra-experience__arrow" aria-hidden="true">↗</span>
              </a>
              <a className="extra-experience" href="apps/2-regalos-alexandra/index.html" data-reveal style={{ "--delay": 60 }}>
                <span className="extra-experience__icon" aria-hidden="true">🎁</span>
                <span><strong>Regalitos para ti</strong><small>Recuerdos, una melodía y una carta.</small></span>
                <span className="extra-experience__arrow" aria-hidden="true">↗</span>
              </a>
              <a className="extra-experience" href="apps/3-galaxia-corazon-alexandra/index.html" data-reveal style={{ "--delay": 120 }}>
                <span className="extra-experience__icon" aria-hidden="true">💗</span>
                <span><strong>Galaxia corazón</strong><small>Una pausa bajo un cielo lleno de estrellas.</small></span>
                <span className="extra-experience__arrow" aria-hidden="true">↗</span>
              </a>
              <a className="extra-experience" href="apps/4-universo-3d-alexandra/index.html" data-reveal style={{ "--delay": 180 }}>
                <span className="extra-experience__icon" aria-hidden="true">🌌</span>
                <span><strong>Nuestro universo</strong><small>Explora un pequeño universo interactivo.</small></span>
                <span className="extra-experience__arrow" aria-hidden="true">↗</span>
              </a>
              <a className="extra-experience" href="apps/5-historia-huella-alexandra/index.html" data-reveal style={{ "--delay": 240 }}>
                <span className="extra-experience__icon" aria-hidden="true">✨</span>
                <span><strong>Una historia para ti</strong><small>Un recorrido de momentos y palabras.</small></span>
                <span className="extra-experience__arrow" aria-hidden="true">↗</span>
              </a>
            </nav>
          </div>
        </section>

        <section className="cartas-note" aria-labelledby="cartas-note-title">
          <div className="container cartas-note__inner">
            <p className="cartas-note__quote" data-reveal>
              El cariño sincero también sabe dar espacio.
            </p>
            <p className="cartas-note__text" data-reveal style={{ "--delay": 90 }}>
              <span id="cartas-note-title">
                Cuando termines, puedes quedarte un rato en silencio o seguir con la música.
              </span>{" "}
              Nada de esto es una prueba que tengas que aprobar.
            </p>
            <div className="cartas-note__actions" data-reveal style={{ "--delay": 160 }}>
              <a className="btn btn--ghost" href="index.html">
                <ArrowLeftIcon />
                Volver al inicio
              </a>
              <a className="btn btn--primary" href="musica.html">
                Seguir con la música
                <ArrowUpRightIcon className="btn__arrow" />
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer label="Cartas y mensajes" />

      <dialog
        className="letter-dialog"
        aria-labelledby="letter-title"
        ref={dialogRef}
        onClose={handleClose}
        onKeyDown={handleKeyDown}
        onClick={(event) => {
          if (event.target === dialogRef.current) closeLetter();
        }}
      >
        <article className="letter">
          <header className="letter__bar">
            <span>
              Carta {letter ? letter.number : "01"} / {String(letters.length).padStart(2, "0")}
            </span>
            <button
              className="icon-btn"
              type="button"
              aria-label="Cerrar la carta"
              ref={closeButtonRef}
              onClick={closeLetter}
            >
              <CloseIcon />
            </button>
          </header>
          <div className="letter__scroll" tabIndex={-1} ref={scrollRef}>
            {letter ? (
              <>
                <p className="letter__kicker">{letter.kicker}</p>
                <h2 className="letter__title" id="letter-title">
                  {letter.title}
                </h2>
                <p className="letter__meta">
                  {letter.minutes} min de lectura · Para Alexandra
                </p>
                <h3 className="letter__section-title">{letter.kicker}</h3>
                <div className="letter__body">
                  {letter.paragraphs.map((paragraph, index) => (
                    <p key={index} style={{ "--p": index }}>
                      {paragraph}
                    </p>
                  ))}
                </div>
                {letter.ps ? (
                  <p className="letter__ps" style={{ "--p": letter.paragraphs.length }}>
                    {letter.ps}
                  </p>
                ) : null}
                <p className="letter__sign" style={{ "--p": letter.paragraphs.length }}>
                  Con cariño.
                </p>
              </>
            ) : null}
          </div>
          <footer className="letter__nav">
            <button className="letter__btn" type="button" onClick={() => step(-1)}>
              <ArrowLeftIcon />
              <span>Anterior</span>
            </button>
            <div className="letter__dots" role="group" aria-label="Ir a una carta">
              {letters.map((item, index) => (
                <button
                  key={item.id}
                  className={`letter__dot${index === current ? " is-active" : ""}`}
                  type="button"
                  aria-label={`Carta ${index + 1}: ${item.title}`}
                  aria-current={index === current ? "true" : undefined}
                  onClick={() => setCurrent(index)}
                ></button>
              ))}
            </div>
            <button className="letter__btn" type="button" onClick={() => step(1)}>
              <span>Siguiente</span>
              <ArrowRightIcon />
            </button>
          </footer>
        </article>
      </dialog>
    </>
  );
}
