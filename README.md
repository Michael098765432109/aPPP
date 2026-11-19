# Para Alexandra

Un espacio hecho con calma: un hub y tres apps independientes (cartas, música y galería) que comparten
lenguaje visual, contenido y motor de audio. Incluye **dos versiones completas**:

- **Estática** (HTML, CSS y JavaScript puro) en la raíz del proyecto.
- **React + Vite** (multi-página) en [`react/`](react/).

Ambas se pueden personalizar sin tocar el diseño. Están pensadas para abrirse sin prisa, en móvil o en
escritorio, en tema noche o alba.

---

## Qué incluye

| Pieza | Ruta estática | Ruta React | Qué hace |
| --- | --- | --- | --- |
| Portada | [`index.html`](index.html) | `/` | Presentación, órbita de las tres apps y una nota tranquila. |
| Cartas | [`apps/cartas/`](apps/cartas/) | `/cartas.html` | Cinco sobres 3D; cada uno abre una carta en un visor con navegación. |
| Música | [`apps/musica/`](apps/musica/) | `/musica.html` | Ambiente generativo en vivo (Web Audio), tres atmósferas y canción propia opcional. |
| Galería | [`apps/galeria/`](apps/galeria/) | `/galeria.html` | Mosaico de nueve imágenes, filtros por categoría y visor con teclado y gesto. |

Detalles compartidos:

- Tema **noche** por defecto y tema **alba**, con preferencia guardada en `localStorage`.
- Reveals al hacer scroll, parallax suave y `prefers-reduced-motion` respetado.
- Diálogos accesibles (`<dialog>`), foco visible, cierre con `Esc`, flechas para navegar.
- Audio 100 % sintetizado en el navegador: no hay archivos de audio de terceros ni subidas a ningún lado.
- Tipografía fluida: **Fraunces** (display) y **Manrope** (texto).

---

## Ver la versión estática

Los módulos ES necesitan un servidor; abrir `index.html` con doble clic no funciona.

Desde la carpeta que contiene `para-alexandra/`:

```bash
python -m http.server 8080
```

Luego abre:

```
http://localhost:8080/para-alexandra/
```

También sirve `npx serve para-alexandra` o cualquier servidor estático. Si publicas el sitio, sube la
carpeta completa (sin `react/node_modules`).

## Ver la versión React

```bash
cd para-alexandra/react
npm install
npm run dev
```

Abre `http://localhost:5173/`. Para probar el build de producción:

```bash
npm run build
npm run preview
```

El resultado queda en `react/dist/`.

## PWA e instalación

El proyecto incluye `manifest.webmanifest`, iconos oficiales, `sw.js` y registro del service worker
tanto en la versión estática como en la React.

- **Nombre:** Para Alexandra
- **Color principal:** `#be185d`
- **Salida React:** `react/dist/`
- **Rutas:** relativas (`./`) para funcionar en Vercel y en empaquetados APK

Para una compilación de producción:

```bash
cd react
npm run build
npm run preview
```

En Vercel, puedes configurar el directorio raíz como `react/`, el comando de build `npm run build` y
la carpeta de salida `dist`. El `vercel.json` incluido evita que `sw.js` quede retenido en caché.
También puedes desplegar la versión estática desde la raíz del proyecto.

Para generar un APK, publica primero por HTTPS y abre la URL con PWABuilder. Comprueba que el
manifest sea válido, que el service worker esté activo y que exista al menos un icono maskable.

---

## Personalizar

### 1. Cartas

Todo el texto vive en [`packages/content/letters.js`](packages/content/letters.js). Cada carta tiene:

```js
{
  id: "lo-siento",
  number: "01",
  seal: "A",              // letra del sello de cera
  kicker: "Para empezar", // línea pequeña sobre el título
  title: "Lo siento.",
  minutes: 2,             // tiempo estimado de lectura
  paragraphs: ["...", "..."],
  ps: "..."               // opcional
}
```

Puedes añadir o quitar cartas: la cuadrícula, los puntos y el contador se ajustan solos en ambas
versiones. La firma «Con cariño.» está en el HTML de cartas y en
[`react/src/pages/Cartas.jsx`](react/src/pages/Cartas.jsx).

### 2. Galería

- Metadatos en [`packages/content/gallery.js`](packages/content/gallery.js): `title`, `category`,
  `caption` y `alt` (texto alternativo, importante para accesibilidad).
- Imágenes en [`assets/img/`](assets/img/). Puedes reemplazarlas manteniendo el nombre o cambiar el campo
  `file`.
- La versión React usa [`react/public/img/`](react/public/img/). Después de cambiar fotos:

  ```bash
  cd react
  npm run sync:images
  ```

- Si las nuevas fotos tienen otra proporción, actualiza el mapa `SIZES` en
  [`apps/galeria/assets/js/galeria.js`](apps/galeria/assets/js/galeria.js) y en
  [`react/src/pages/Galeria.jsx`](react/src/pages/Galeria.jsx). Solo evita saltos de maquetación.

### 3. Portada y textos de cada app

- Portada estática: [`index.html`](index.html) y estilos en [`assets/css/hub.css`](assets/css/hub.css).
- Portada React: [`react/src/pages/Hub.jsx`](react/src/pages/Hub.jsx).
- Textos de cada app: el HTML de cada carpeta en la versión estática y el archivo equivalente en
  `react/src/pages/`. Los textos de cabecera están duplicados a propósito: cada versión es independiente.

Mantén la línea de tono: sincero, adulto y sin presión. Es mejor una frase honesta que una promesa
grande. La página evita inventar recuerdos concretos; si añades alguno, que sea real.

### 4. Apariencia

- Colores, tipografías, radios y sombras: [`assets/css/tokens.css`](assets/css/tokens.css).
- Estilos compartidos: [`assets/css/base.css`](assets/css/base.css).
- Estilos por app: [`assets/css/hub.css`](assets/css/hub.css),
  [`apps/cartas/assets/css/cartas.css`](apps/cartas/assets/css/cartas.css),
  [`apps/musica/assets/css/musica.css`](apps/musica/assets/css/musica.css) y
  [`apps/galeria/assets/css/galeria.css`](apps/galeria/assets/css/galeria.css).
- Los estilos son los mismos para las dos versiones: React los importa desde `assets/` y `apps/`.

### 5. Música

El motor está en [`packages/audio/engine.js`](packages/audio/engine.js). Cada atmósfera define raíz,
acordes, filtro, duración y cantidad de lluvia. Se puede ajustar sin tocar la interfaz. La reproducción
siempre requiere un gesto del usuario (política de los navegadores); el botón de play o el de ambiente
del header lo resuelven.

La opción «Poner una canción» carga un archivo local en el reproductor del navegador. Ese archivo nunca
sale del dispositivo.

---

## Accesibilidad y movimiento

- Diálogos con `showModal`, foco devuelto al sobre o miniatura que los abrió.
- Navegación con flechas dentro de cartas y galería; `Esc` cierra.
- Botones con `aria-pressed`, regiones `role="status"` y textos alternativos en las imágenes.
- `prefers-reduced-motion` desactiva animaciones de entrada y el bucle del visualizador.
- Contraste revisado en ambos temas; foco visible en todos los controles.

---

## Estructura

```
para-alexandra/
├─ index.html                  # portada estática
├─ apps/
│  ├─ cartas/                  # HTML + CSS + JS de cartas
│  ├─ musica/                  # HTML + CSS + JS de música
│  └─ galeria/                 # HTML + CSS + JS de galería
├─ assets/
│  ├─ css/                     # tokens, base y estilos del hub
│  ├─ js/                      # utilidades compartidas (tema, reveal, sonido)
│  └─ img/                     # fotos de la galería
├─ packages/
│  ├─ content/                 # letters.js y gallery.js (contenido editable)
│  └─ audio/engine.js          # motor de audio generativo
└─ react/                      # versión React + Vite (multi-página)
   ├─ index.html, cartas.html, musica.html, galeria.html
   ├─ public/img/              # copia de imágenes para el build
   ├─ scripts/sync-images.js   # sincroniza assets/img → public/img
   └─ src/
      ├─ components/           # header, footer, iconos
      ├─ entries/              # puntos de entrada por página + CSS importado
      ├─ lib/hooks.js          # tema y efectos compartidos
      └─ pages/                # Hub, Cartas, Música y Galería en React
```

---

## Créditos

- Fotografías de la galería: **Unsplash**, bajo la [licencia de Unsplash](https://unsplash.com/license).
  Están descargadas localmente para que el sitio no dependa de terceros.
- Tipografías: **Fraunces** y **Manrope**, vía Google Fonts (SIL Open Font License).
- Audio: sintetizado con la Web Audio API en `packages/audio/engine.js`; no se usan pistas externas.

## Antes de entregarla

1. Revisa las cartas y ajusta cualquier frase que no suene a ti.
2. Decide si quieres cambiar las fotos por propias (y sincroniza la versión React).
3. Prueba ambas versiones en móvil y escritorio, en tema noche y alba.
4. Comprueba que el volumen del ambiente y el botón de sonido se sienten bien en tu equipo.
5. Publica la versión estática o el `dist/` de React en un hosting estático (Netlify, Vercel, GitHub
   Pages, etc.). Si el sitio no vive en la raíz del dominio, configura `base` en `react/vite.config.js`
   y ajusta los enlaces absolutos de la versión React.
