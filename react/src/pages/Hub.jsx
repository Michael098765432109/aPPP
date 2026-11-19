import { useEffect, useState } from "react";
import { AmbientEngine } from "../../../packages/audio/engine.js";
import { initOrbitParallax, initPointerGlow } from "../../../assets/js/ui.js";
import { usePageEffects, useTheme } from "../lib/hooks.js";
import AppHeader from "../components/AppHeader.jsx";
import Footer from "../components/Footer.jsx";
import { ArrowUpRightIcon } from "../components/Icons.jsx";
import { letters } from "../../../packages/content/letters.js";

const THREAD_WORDS = ["calma", "escucha", "tiempo", "verdad", "cercanía", "respeto"];

const APPS = [
  {
    slot: "cartas",
    tone: "rose",
    index: "01",
    kicker: "Palabras",
    title: "Cartas",
    desc: "Lo que siento, escrito sin atropellos. Ábrelas cuando quieras.",
    meta: `${letters.length} cartas · ${letters.reduce((total, letter) => total + letter.minutes, 0)} min`,
    href: "cartas.html",
    delay: 0,
    depth: "10px"
  },
  {
    slot: "musica",
    tone: "iris",
    index: "02",
    kicker: "Sonido",
    title: "Música",
    desc: "Un ambiente que se genera en vivo y no se repite. Para bajar el ruido.",
    meta: "3 atmósferas · en vivo",
    href: "musica.html",
    delay: 120,
    depth: "-14px"
  },
  {
    slot: "galeria",
    tone: "cyan",
    index: "03",
    kicker: "Luz",
    title: "Galería",
    desc: "Nueve instantes para mirar sin prisa: luz, noche y calma.",
    meta: "9 imágenes",
    href: "galeria.html",
    delay: 240,
    depth: "16px"
  }
];

function AppCard({ app }) {
  return (
    <div className={`orbit__slot orbit__slot--${app.slot}`}>
      <a
        className={`app-card app-card--${app.tone}`}
        href={app.href}
        data-reveal
        style={{ "--delay": app.delay, "--depth": app.depth }}
      >
        <span className="app-card__glow" aria-hidden="true"></span>
        <span className="app-card__top">
          <span className="app-card__index" aria-hidden="true">
            {app.index}
          </span>
          <span className="app-card__kicker">{app.kicker}</span>
        </span>
        <h3 className="app-card__title">{app.title}</h3>
        <p className="app-card__desc">{app.desc}</p>
        <span className="app-card__meta">
          <span>{app.meta}</span>
          <span className="app-card__arrow" aria-hidden="true">
            <ArrowUpRightIcon />
          </span>
        </span>
      </a>
    </div>
  );
}

export default function Hub() {
  const { theme, toggle } = useTheme();
  const [engine] = useState(() => {
    const instance = new AmbientEngine();
    instance.setMood("amanecer");
    return instance;
  });

  usePageEffects();

  useEffect(() => {
    initPointerGlow();
    initOrbitParallax();
    window.addEventListener("pagehide", () => engine.stop());
    return () => engine.stop();
  }, [engine]);

  return (
    <>
      <a className="skip-link" href="#contenido">
        Saltar al contenido
      </a>

      <AppHeader theme={theme} onToggleTheme={toggle} engine={engine} back={false} floating />

      <div className="cursor-glow" aria-hidden="true"></div>

      <main id="contenido">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero__bg" aria-hidden="true"></div>
          <div className="hero__grid" aria-hidden="true"></div>
          <div className="hero__orb hero__orb--rose" aria-hidden="true"></div>
          <div className="hero__orb hero__orb--iris" aria-hidden="true"></div>
          <div className="hero__orb hero__orb--cyan" aria-hidden="true"></div>

          <div className="hero__inner">
            <p className="eyebrow hero__eyebrow" data-reveal>
              Un espacio hecho con calma
            </p>
            <h1 className="hero__title" id="hero-title" data-reveal style={{ "--delay": 90 }}>
              <span className="hero__name">Alexandra,</span>
              <span className="hero__accent">todo lo que no supe decirte.</span>
            </h1>
            <p className="hero__intro" data-reveal style={{ "--delay": 180 }}>
              No es una página. Es una pausa para nosotros: cartas, música y luz. Sin prisa. Sin presión.
            </p>
            <div className="hero__actions" data-reveal style={{ "--delay": 270 }}>
              <a className="btn btn--primary btn--lg" href="cartas.html">
                Abrir las cartas
                <ArrowUpRightIcon size={16} className="btn__arrow" />
              </a>
              <a className="btn btn--ghost btn--lg" href="musica.html">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M9 18V6l10-2v12" />
                  <circle cx="6" cy="18" r="3" />
                  <circle cx="16" cy="16" r="3" />
                </svg>
                Solo respirar
              </a>
            </div>
            <p className="hero__micro" data-reveal style={{ "--delay": 340 }}>
              Puedes ir a tu ritmo. Nada aquí te pide una respuesta.
            </p>
          </div>

          <a className="hero__scroll" href="#apps">
            <span>Explora</span>
            <span className="hero__scroll-line" aria-hidden="true"></span>
          </a>
        </section>

        <div className="thread" aria-hidden="true">
          <div className="thread__track">
            {[0, 1].map((group) => (
              <div className="thread__group" key={group}>
                {THREAD_WORDS.concat(THREAD_WORDS).map((word, index) => (
                  <span key={index}>{word}</span>
                ))}
              </div>
            ))}
          </div>
        </div>

        <section className="apps section" id="apps" aria-labelledby="apps-title">
          <div className="container">
            <div className="apps__head">
              <div className="section-head">
                <p className="eyebrow">Tres piezas</p>
                <h2 className="section-title" id="apps-title" data-reveal>
                  Tres formas de estar cerca.
                </h2>
                <p className="section-sub" data-reveal style={{ "--delay": 90 }}>
                  Cada una vive en su propio espacio, con su propio tiempo. Puedes entrar y salir cuando
                  quieras.
                </p>
              </div>
              <p className="apps__hint">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M12 3v18M5 8l7-5 7 5M5 16l7 5 7-5" />
                </svg>
                Elige por dónde empezar
              </p>
            </div>

            <div className="orbit" data-orbit>
              <div className="orbit__ring orbit__ring--outer" aria-hidden="true"></div>
              <div className="orbit__ring orbit__ring--inner" aria-hidden="true"></div>

              <a className="orbit__core" href="cartas.html" aria-label="Empezar por las cartas">
                <span className="orbit__monogram" aria-hidden="true">
                  A
                </span>
                <small>Para ti</small>
              </a>

              {APPS.map((app) => (
                <AppCard key={app.slot} app={app} />
              ))}
            </div>
          </div>
        </section>

        <section className="note" aria-labelledby="note-title">
          <div className="container">
            <div className="note__panel" data-reveal>
              <div className="note__head">
                <p className="eyebrow">Una nota antes de entrar</p>
                <h2 className="note__title" id="note-title">
                  No vengo a exigirte nada.
                </h2>
              </div>
              <div className="note__body">
                <p>
                  No vengo a pedirte que olvides, ni a convencerte de que todo está bien. Vengo a decirte
                  que lo siento, que te escucho y que quiero hacer las cosas distinto.
                </p>
                <p>
                  Si quieres hablar, aquí estoy. Si necesitas tiempo, tómalo. Si un día decides que no,
                  también voy a respetarlo.
                </p>
                <p>Esto es solo una forma más tranquila de acercarme. El resto es tuyo.</p>
                <p className="note__sign">Con cariño.</p>
              </div>
              <span className="note__seal" aria-hidden="true">
                A
              </span>
            </div>
          </div>
        </section>
      </main>

      <Footer full />
    </>
  );
}
