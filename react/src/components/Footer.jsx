import { ArrowUpIcon } from "./Icons.jsx";

export default function Footer({ label, full = false }) {
  if (!full) {
    return (
      <footer className="footer">
        <div className="container">
          <div className="footer__bottom">
            <span>{label} · Para Alexandra</span>
            <a className="footer__top-link" href="#contenido">
              Volver arriba
              <ArrowUpIcon />
            </a>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__top">
          <div>
            <a className="brand" href="index.html" aria-label="Para Alexandra, inicio">
              <span className="brand__mark" aria-hidden="true">
                A
              </span>
              <span className="brand__text">Para Alexandra</span>
            </a>
            <p className="footer__tagline">Hecho con calma, para ti.</p>
          </div>
          <nav className="footer__nav" aria-label="Las apps">
            <div className="footer__col">
              <h3>Piezas</h3>
              <a href="cartas.html">Cartas y mensajes</a>
              <a href="musica.html">Música y ambiente</a>
              <a href="galeria.html">Galería visual</a>
            </div>
            <div className="footer__col">
              <h3>En esta página</h3>
              <a href="#apps">Las tres piezas</a>
              <a href="#note-title">La nota</a>
              <a href="#contenido">Volver arriba</a>
            </div>
          </nav>
        </div>
        <div className="footer__bottom">
          <span>© 2026 · Para Alexandra</span>
          <a className="footer__top-link" href="#contenido">
            Volver arriba
            <ArrowUpIcon />
          </a>
        </div>
      </div>
    </footer>
  );
}
