# Prompt para Codex (VS Code)

Pega esto en Codex con la carpeta de tu app abierta. Antes, copia la carpeta `icons/`, `logo.png` y `favicon.ico` de este pack a la raíz (o a `public/` / `assets/` si tu proyecto la usa).

---

Actúa como ingeniero web senior. Tengo una app ya construida en este repositorio y necesito que la **configures y adecues** para que quede lista como PWA instalable y desplegable. Los archivos de marca ya están en el proyecto: `logo.png`, `favicon.ico` e `icons/` (icon-192, icon-512, versiones `-maskable`, apple-touch-icon, favicon-16/32).

## Paso 0 — Diagnóstico (no cambies nada aún)
1. Explora el repo y dime en 5 líneas: stack (HTML puro / React / Vite / etc.), punto de entrada, rutas/pantallas y dependencias.
2. Lista qué falta de lo que pido abajo. Después procede con los cambios.

## Paso 1 — Identidad e iconos
- Usa `logo.png` como logo oficial: colócalo en el header/pantalla de inicio de la app con `alt` descriptivo, tamaño responsive y sin deformarse (`object-fit: cover`, `border-radius: 50%`).
- En el `<head>` de todas las páginas añade: favicon (`.ico` + png 16/32), `apple-touch-icon`, `theme-color` (#be185d), `viewport` correcto y `meta description`.

## Paso 2 — PWA completa
- Crea/actualiza `manifest.webmanifest` con: `name`, `short_name`, `description`, `start_url: "./"`, `scope: "./"`, `display: "standalone"`, `orientation: "portrait"`, `background_color`, `theme_color`, `lang: "es"` e iconos 192 y 512 (`purpose: "any"`) más 192 y 512 `-maskable` (`purpose: "maskable"`).
- Crea `sw.js` con versión de caché (`CACHE_VERSION`), precache de todos los archivos locales (HTML, CSS, JS, iconos, fuentes, imágenes), estrategia cache-first para estáticos y fallback offline. Debe borrar cachés antiguas en `activate`.
- Registra el service worker en el JS principal con comprobación de soporte.
- Usa rutas **relativas** (`./`) para que funcione tanto en Vercel como al empaquetar en APK.

## Paso 3 — Adecuación y calidad
- Haz la app responsive mobile-first (probar en 360px, 390px y 768px), sin scroll horizontal, con áreas táctiles ≥ 44px.
- Respeta `safe-area-inset-*` (notch) y `prefers-reduced-motion`.
- Accesibilidad básica: `lang="es"`, contraste suficiente, `alt` en imágenes, foco visible, `aria-label` en botones de solo icono.
- Elimina código muerto, `console.log` y dependencias no usadas. Evita recursos externos que rompan el modo offline (si hay CDN o fuentes remotas, descárgalas y sírvelas localmente).

## Paso 4 — Despliegue
- Prepara para **Vercel**: `vercel.json` si hace falta (rewrites, headers de caché para `sw.js` con `Cache-Control: no-cache`), y confirma el comando de build/carpeta de salida.
- Verifica los requisitos de **PWABuilder** para generar el APK (HTTPS, manifest válido, SW activo, iconos maskable).
- Crea un `README.md` con: qué es la app, cómo correrla en local, cómo desplegar en Vercel y cómo generar el APK con PWABuilder.

## Entrega
- No rompas funcionalidad existente: si vas a tocar algo delicado, explícamelo antes.
- Al final dame un resumen con: archivos creados, archivos modificados, y una checklist de pruebas manuales (instalar en el celular, abrir sin internet, rotar pantalla, actualizar versión del SW).
- Si algo es ambiguo, haz la suposición más razonable, anótala en el resumen y continúa en lugar de detenerte.

---

### Datos de mi app (rellena antes de pegar)
- Nombre de la app: ______
- Descripción corta: ______
- Color principal: #be185d (rosa) — cámbialo si quieres
- Hosting: Vercel
