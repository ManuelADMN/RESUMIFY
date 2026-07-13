# Log de migración a estático (Vercel) + validación

**Fecha:** 2026-07-12
**Rama:** `vercel-prod`
**Objetivo:** Dejar Resumify como sitio estático desplegable en Vercel (sin backend), eliminar todo lo referente a Google/Gemini, mejorar el botón "copiar prompt" y refrescar la estética sin romper nada.

---

## 1. Eliminación de Google / Gemini

| Acción | Detalle |
|---|---|
| Borrado `.env.local` | Contenía `GEMINI_API_KEY=PLACEHOLDER_API_KEY` (nunca se usaba en código). |
| Borrada carpeta `migrated_prompt_history/` | Historial de Google AI Studio. |
| `metadata.json` | Se quitó "con asistencia de IA"; descripción actualizada. |
| Fuentes de Google | Se eliminaron `fonts.googleapis.com` / `fonts.gstatic.com` de `index.html`. Ahora self-hosted vía `@fontsource` (solo Inter + Merriweather, las 2 realmente usadas de las 7 anteriores). |
| Verificación | Test automatizado confirma que **no quedan referencias a googleapis/gstatic en el DOM**. |

> Nota: no había backend real. El único vestigio de IA era el placeholder de API key. La app siempre fue 100% client-side.

## 2. Tailwind: CDN → dependencia (build autocontenido)

- Instalado `tailwindcss@3.4`, `postcss`, `autoprefixer`.
- Nuevos: `tailwind.config.js`, `postcss.config.js`, `index.css`.
- Los estilos inline de `index.html` (`:root` vars, `body`, `@media print`, `.font-serif-custom`, scrollbar) se movieron a `index.css`.
- Se usó **Tailwind v3 stock** (lo que servía el CDN) para garantizar **paridad visual 1:1**: los tokens shadcn (`bg-primary`, `text-foreground`, `border-border`, `animate-in`…) que el CDN sin config ya trataba como no-ops se mantienen igual — no se mapearon para no introducir estilos nuevos.
- Verificación: captura visual comparada (`shot_main_es.png`) — sidebar, editor, toolbar y canvas idénticos.

## 3. Limpieza de `index.html`

- Quitado el `<script src="https://cdn.tailwindcss.com">`.
- Quitado el `importmap` (esm.sh de React/lucide) — redundante con el bundle de Vite.
- Quitado el `<link rel="stylesheet" href="/index.css">` fantasma (el archivo no existía → 404). Ahora `index.css` se importa desde `index.tsx`.

## 4. Vercel

- Añadido `vercel.json`: framework `vite`, `outputDirectory: dist`, y **rewrite SPA** (`/(.*) → /index.html`) para evitar 404 al refrescar rutas.

## 5. Code-split de `@react-pdf/renderer`

- `PrintPreviewModal` y `TestingPanel` ahora se cargan con `React.lazy` + `Suspense`.
- **Resultado:** bundle inicial **1.779 kB → 291 kB** (gzip 580 kB → **83 kB**). `react-pdf` (1.468 kB) queda en un chunk aparte que solo carga al abrir "Vista" o "Descargar PDF".

## 6. Export JSON

- Nombre del archivo exportado: `<nombre>_data.json` → **`denoise_cv.json`**.
- Se añadió aviso (`alert`) tras exportar: el CV queda en la carpeta de **Descargas** del navegador. Textos i18n ES/EN.

## 7. Botón "Copiar prompt" (mejorado)

- Antes: copiaba solo el JSON vacío.
- Ahora: diálogo con **2 pestañas** — `Prompt para IA` y `Estructura JSON`.
  - **Prompt para IA:** instrucciones completas (reglas: solo JSON válido, no inventar datos, mantener ids/orden, verbos de acción) + la plantilla.
  - **Estructura JSON:** la plantilla pura.
- Dos botones de copia contextuales con feedback accesible (`aria-live`, "¡Copiado!" + check verde). Textos i18n ES/EN.

## 8. Refresh estético (sutil, sin romper nada)

- Header del sidebar y toolbar: gradiente suave `#0f172a → #131f38`, bordes `border-white/10` más finos.
- Punto acento esmeralda con glow junto al logo RESUMIFY.
- Botón "Descargar PDF": sombra + transición.
- Diálogo de prompt: pestañas modernas, `ring`, mejor espaciado.
- Focus rings accesibles en botones de icono.
- Solo se tocaron clases de estilo; **cero cambios** en `ResumeCanvas` / PDF (para no arriesgar el ATS).

---

## Validación automatizada (Playwright, build de producción en `vite preview`)

**Resultado: 19/19 checks OK.**

```
[PASS] Página carga (title)
[PASS] Logo RESUMIFY visible
[PASS] Fuente Inter aplicada (self-hosted)           → "Inter Variable", Inter, system-ui
[PASS] Font face Inter cargada
[PASS] Sin referencias a googleapis/gstatic en DOM
[PASS] Sin CDN de Tailwind (cdn.tailwindcss.com)
[PASS] Sidebar panel presente
[PASS] ResumeCanvas render
[PASS] Menú ⋯ abre (Ver estructura JSON visible)
[PASS] Diálogo prompting abre (pestaña Prompt IA)
[PASS] Pestaña Estructura JSON visible
[PASS] Botón 'Copiar prompt para IA' visible
[PASS] Botón 'Copiar solo JSON' visible tras cambiar pestaña
[PASS] Feedback '¡Copiado!' tras copiar
[PASS] Portapapeles contiene el JSON copiado          → len=3434
[PASS] Toggle idioma a EN
[PASS] Export JSON descarga 'denoise_cv.json'         → denoise_cv.json
[PASS] Vista de exportación (react-pdf) carga
[PASS] Sin errores de consola
```

Script: `scratchpad/validate.py`. Capturas: `shot_main_es.png`, `shot_preview.png`.

### Nota importante (pre-existente, fuera de alcance)

`npx tsc --noEmit` reporta **53 errores de tipos** en `components/Editor.tsx` (52× `Property 'X' does not exist on type 'unknown'` + 1× `TS2322`). Todos provienen de una **limitación de inferencia genérica de `SortableList`**: cuando `items`/`renderItem` son complejos (p. ej. `sectionOrder || DEFAULT_SECTION_ORDER` combinado con el `switch` grande), TypeScript colapsa el genérico `T` a `unknown`, así que accesos como `item.category` / `keyExtractor={(id) => id}` se marcan como error **en tiempo de tipos**. En JavaScript esas propiedades existen y funcionan.

- **Ya existían en el commit `HEAD` antes de estos cambios** — no los introdujo esta migración.
- **No afectan el despliegue**: Vercel usa `npm run build` (`vite build`/esbuild, que pasa), no `tsc`.
- Fix opcional (tarea aparte): anotar los genéricos, p. ej. `<SortableList<string> …>` en el listado de secciones y `<SortableList<EducationItem> …>` etc. en cada sección.

---

## Validación 2 — los errores NO rompen nada (texto + exports intactos)

Se ejercitaron **exactamente las secciones que producen los 53 errores** (todos los callbacks de `SortableList` en `Editor.tsx`) importando un JSON rico con tokens únicos por sección, un **bullet de 400+ caracteres** (para detectar truncado) y un nombre muy largo. Script: `scratchpad/validate_exports.py`.

**Resultado: 19/19 checks OK.**

```
[PASS] Import JSON no lanza excepcion (app viva)
[PASS] Canvas muestra todas las secciones importadas          -- 17 tokens OK
[PASS] Bullet largo completo en canvas (sin truncar)
[PASS] Editor (sidebar) refleja items importados
[PASS] Anadir Technical Skill via modal (aparece en canvas)   -- openModal/saveModal OK
[PASS] Export JSON se llama denoise_cv.json
[PASS] JSON export es objeto valido con todas las secciones
[PASS] JSON: summary intacto
[PASS] JSON: fullName intacto
[PASS] JSON: bullet largo intacto (sin truncar)
[PASS] JSON: skill anadido por modal presente
[PASS] JSON: todos los tokens de seccion presentes
[PASS] PDF export descarga (.pdf)
[PASS] PDF tiene texto real seleccionable (no imagen)         -- 2357 chars, 2 pag
[PASS] PDF: todas las secciones presentes en el texto
[PASS] PDF: bullet largo completo (sin truncar)               -- "...durante toda la transicion."
[PASS] PDF: skill anadido por modal presente
[PASS] PDF: nombre completo largo presente
[PASS] Sin errores de consola en todo el flujo
```

**Conclusión:** los 53 errores son puramente de tipado. El render de todas las secciones, la edición vía modales, el **texto** (nada se corta, ni el bullet de 400+ chars ni el nombre largo) y **ambos exports** (JSON `denoise_cv.json` íntegro y PDF con **texto real seleccionable**, no imagen) funcionan al 100%. Artefactos guardados: `scratchpad/exported_denoise_cv.json`, `scratchpad/exported_pdf_text.txt`.

---

## Ajustes posteriores (ronda 2) + validación

1. **Copiar prompt "que diga la verdad"**: la descripción ahora es honesta — "Resumify funciona 100% en tu navegador y no se conecta a ningún servicio…". Se eliminó toda mención a servicios externos (Gemini/ChatGPT/Claude/"tu IA favorita"). Pestaña renombrada a *Prompt de ayuda*; botón *Copiar prompt* movido a su propia fila (ya no se solapa con el código).
2. **Luz verde eliminada**: se quitó el punto acento esmeralda con glow del header (parecía indicador de conexión).
3. **Responsividad**: `h-[100dvh]`, sidebar `h-[45vh]` en móvil (editor scrollable arriba, preview abajo), esquinas/bordes solo en desktop; toolbar compacto en móvil (padding/gap reducidos, ES/EN y Vista solo-icono, select de fuente oculto <sm, botón PDF acortado a "PDF"); área de preview con paneo horizontal para el A4 (210 mm).
4. **ATS más óptimo**: encabezado de talleres sin barra `/` (`Talleres y Conferencias` / `Workshops and Conferences`) para evitar que algunos parsers partan el título. Se verificó que el PDF exporta títulos limpios en MAYÚSCULAS, uno por línea: `RESUMEN · HABILIDADES TÉCNICAS · EDUCACIÓN · EXPERIENCIA · PROYECTOS · CERTIFICACIONES · HABILIDADES · IDIOMAS · TALLERES Y CONFERENCIAS · ENLACES`.

**Validación (Playwright, desktop 1280 + móvil 390): 18/18 OK** — sin luz verde, copy-prompt honesto y sin nombres de servicios, sin overflow horizontal (desktop y móvil), botón PDF dentro del viewport móvil, select de fuente oculto en móvil, encabezado ATS sin `/`, PDF con texto real y secciones completas, bullet largo sin truncar, cero errores de consola. Script: `scratchpad/validate_adjust.py`.

## Cómo desplegar en Vercel

1. Push de la rama.
2. En Vercel: *New Project* → importar el repo. Detecta Vite automáticamente (o usa `vercel.json`).
3. Build: `npm run build` · Output: `dist`. Sin variables de entorno.
