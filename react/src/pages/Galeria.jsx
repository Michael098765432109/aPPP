import { useEffect, useMemo, useRef, useState } from "react";
import { gallery } from "../../../packages/content/gallery.js";
import { usePageEffects, useTheme } from "../lib/hooks.js";
import AppHeader from "../components/AppHeader.jsx";
import Footer from "../components/Footer.jsx";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpRightIcon,
  CloseIcon,
  ExpandIcon
} from "../components/Icons.jsx";

const IMG_BASE = `${import.meta.env.BASE_URL}img/`;

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

const CATEGORIES = gallery.reduce((list, item) => {
  if (!list.includes(item.category)) list.push(item.category);
  return list;
}, []);

const pad = (value) => String(value).padStart(2, "0");

export default function Galeria() {
  const { theme, toggle } = useTheme();
  const [filter, setFilter] = useState("all");
  const [active, setActive] = useState(null);
  const [loaded, setLoaded] = useState(false);

  const dialogRef = useRef(null);
  const triggerRef = useRef(null);
  const swipeStart = useRef(null);
  const preloaded = useRef(new Set());

  usePageEffects();

  const view = useMemo(
    () => (filter === "all" ? gallery : gallery.filter((item) => item.category === filter)),
    [filter]
  );

  useEffect(() => {
    const dialog = dialogRef.current;
    if (active === null || !dialog) return;
    if (!dialog.open) {
      dialog.showModal();
      document.body.classList.add("is-locked");
      dialog.querySelector("[data-close]")?.focus({ preventScroll: true });
    }
  }, [active]);

  useEffect(() => {
    if (active === null) return;
    const [before, after] = [
      view[(active - 1 + view.length) % view.length],
      view[(active + 1) % view.length]
    ];
    [before, after].forEach((item) => {
      if (!item || preloaded.current.has(item.id)) return;
      preloaded.current.add(item.id);
      const img = new Image();
      img.src = IMG_BASE + item.file;
    });
  }, [active, view]);

  const closeLightbox = () => dialogRef.current?.close();

  const handleClose = () => {
    setActive(null);
    setLoaded(false);
    document.body.classList.remove("is-locked");
    triggerRef.current?.focus({ preventScroll: true });
    triggerRef.current = null;
  };

  const step = (delta) => {
    if (view.length < 2) return;
    setLoaded(false);
    setActive((index) => (index === null ? null : (index + delta + view.length) % view.length));
  };

  const openShot = (id, event) => {
    const index = view.findIndex((item) => item.id === id);
    if (index === -1) return;
    triggerRef.current = event.currentTarget;
    setLoaded(false);
    setActive(index);
  };

  const item = active === null ? null : view[active];
  const [width, height] = item ? SIZES[item.file] || [1400, 933] : [1400, 933];

  return (
    <>
      <a className="skip-link" href="#contenido">
        Saltar al contenido
      </a>

      <AppHeader theme={theme} onToggleTheme={toggle} />

      <main id="contenido">
        <section className="gallery-hero" aria-labelledby="galeria-title">
          <div className="container">
            <p className="eyebrow" data-reveal>
              Galería visual
            </p>
            <h1 className="gallery-hero__title" id="galeria-title" data-reveal style={{ "--delay": 80 }}>
              Nueve instantes,
              <br />
              <em>ninguno con prisa.</em>
            </h1>
            <p className="gallery-hero__intro" data-reveal style={{ "--delay": 150 }}>
              Luz, noche y calma. No son recuerdos nuestros: son pausas para mirar. Toca una imagen para
              verla de cerca, o déjate llevar por el mosaico.
            </p>
          </div>
        </section>

        <section className="gallery" aria-label="Las imágenes">
          <div className="container">
            <div className="filters" role="group" aria-label="Filtrar por categoría">
              <button
                className="chip"
                type="button"
                aria-pressed={filter === "all"}
                onClick={() => setFilter("all")}
              >
                Todo
                <span className="chip__count" aria-hidden="true">
                  {gallery.length}
                </span>
                <span className="sr-only"> imágenes</span>
              </button>
              {CATEGORIES.map((category) => (
                <button
                  className="chip"
                  type="button"
                  key={category}
                  aria-pressed={filter === category}
                  onClick={() => setFilter(category)}
                >
                  {category}
                  <span className="chip__count" aria-hidden="true">
                    {gallery.filter((entry) => entry.category === category).length}
                  </span>
                  <span className="sr-only"> imágenes</span>
                </button>
              ))}
            </div>

            <div className="masonry">
              {view.map((entry, index) => {
                const [imgWidth, imgHeight] = SIZES[entry.file] || [1400, 933];
                return (
                  <button
                    className="shot"
                    type="button"
                    key={`${filter}-${entry.id}`}
                    style={{ "--i": index }}
                    aria-haspopup="dialog"
                    aria-label={`${entry.title}, ${entry.category}. Abrir imagen.`}
                    onClick={(event) => openShot(entry.id, event)}
                  >
                    <img
                      src={IMG_BASE + entry.file}
                      alt={entry.alt}
                      width={imgWidth}
                      height={imgHeight}
                      decoding="async"
                      loading={index < 3 ? "eager" : "lazy"}
                      fetchPriority={index === 0 ? "high" : undefined}
                    />
                    <span className="shot__veil" aria-hidden="true"></span>
                    <span className="shot__index" aria-hidden="true">
                      {pad(index + 1)}
                    </span>
                    <span className="shot__info">
                      <span className="shot__cat">{entry.category}</span>
                      <span className="shot__title">{entry.title}</span>
                    </span>
                    <span className="shot__expand" aria-hidden="true">
                      <ExpandIcon />
                    </span>
                  </button>
                );
              })}
            </div>

            {view.length === 0 ? (
              <p className="gallery__empty">No hay imágenes en esta categoría. Prueba con otra.</p>
            ) : null}

            <div className="gallery-close">
              <p className="gallery-close__text" data-reveal>
                A veces mirar algo bonito ya es suficiente.
              </p>
              <div className="gallery-close__actions" data-reveal style={{ "--delay": 90 }}>
                <a className="btn btn--ghost" href="musica.html">
                  <ArrowLeftIcon />
                  Volver a la música
                </a>
                <a className="btn btn--primary" href="index.html">
                  Volver al inicio
                  <ArrowUpRightIcon className="btn__arrow" />
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer label="Galería visual" />

      <dialog
        className="shot-dialog"
        aria-labelledby="shot-title"
        ref={dialogRef}
        onClose={handleClose}
        onClick={(event) => {
          if (event.target === dialogRef.current) closeLightbox();
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            step(-1);
          } else if (event.key === "ArrowRight") {
            event.preventDefault();
            step(1);
          }
        }}
      >
        <div className="lightbox">
          <div
            className="lightbox__stage"
            onPointerDown={(event) => {
              swipeStart.current = event.clientX;
            }}
            onPointerUp={(event) => {
              if (swipeStart.current === null) return;
              const delta = event.clientX - swipeStart.current;
              swipeStart.current = null;
              if (Math.abs(delta) < 48) return;
              step(delta > 0 ? -1 : 1);
            }}
            onPointerCancel={() => {
              swipeStart.current = null;
            }}
          >
            {item ? (
              <img
                className={`lightbox__img${loaded ? " is-swapping" : " is-loading"}`}
                key={`${item.id}-${active}`}
                src={IMG_BASE + item.file}
                alt={item.alt}
                width={width}
                height={height}
                onLoad={() => setLoaded(true)}
              />
            ) : null}
            <button
              className="lightbox__nav lightbox__nav--prev"
              type="button"
              aria-label="Imagen anterior"
              onClick={() => step(-1)}
            >
              <ArrowLeftIcon size={18} />
            </button>
            <button
              className="lightbox__nav lightbox__nav--next"
              type="button"
              aria-label="Imagen siguiente"
              onClick={() => step(1)}
            >
              <ArrowRightIcon size={18} />
            </button>
            <button
              className="lightbox__close"
              type="button"
              data-close
              aria-label="Cerrar la imagen"
              onClick={closeLightbox}
            >
              <CloseIcon />
            </button>
          </div>
          <div className="lightbox__bar">
            <div>
              <p className="lightbox__meta">
                <span>{item ? item.category : ""}</span>
                <span>Galería</span>
              </p>
              <h2 className="lightbox__title" id="shot-title">
                {item ? item.title : ""}
              </h2>
              <p className="lightbox__caption">{item ? item.caption : ""}</p>
            </div>
            <p className="lightbox__count">
              {active === null ? "" : `${pad(active + 1)} / ${pad(view.length)}`}
            </p>
          </div>
        </div>
      </dialog>
    </>
  );
}
