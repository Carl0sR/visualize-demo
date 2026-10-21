# Instrucciones para agentes (AGENTS.md)

## Idioma de trabajo

Escribe siempre en español: respuestas, mensajes de commit y documentación. Para nombres de variables y código, conserva las convenciones existentes del repositorio sin traducirlas ni forzarlas a español.

## Reglas fundamentales (no negociables)

1. Una petición del usuario autoriza los cambios necesarios para completarla. Antes de editar, consulta `git status` e identifica los cambios existentes. Conserva los cambios ajenos a la tarea; no los sobrescribas ni reviertas. Un árbol con cambios pendientes no impide continuar si puedes trabajar sin interferir con ellos.
2. **Conservar las fuentes.** `datos/justicia-juvenil.json` y `datos/original-pptx.json` son las fuentes de verdad; los CSV oficiales están en `datos/origen/ine-26027…26030-2025.csv`. No editar a mano `assets/data.js`: se genera con `scripts/build-data.py`.
3. **Distinguir datos de interpretaciones.** Los datos son recuentos, tasas y fuentes oficiales (INE 26027–26030, memorias de Fiscalía). Las interpretaciones, editorializaciones y análisis van en `docs/` y en la biblioteca del sitio, nunca en el JSON de datos.
4. **No inventar cifras.** Cada valor numérico debe tener origen en las fuentes citadas en `datos/justicia-juvenil.json` (campo `sources`) o en los CSV oficiales. Si falta un dato, no rellenar: preguntar al usuario.
5. **Mantener coherentes documentación, datos y presentación.** Cualquier cambio en `datos/justicia-juvenil.json` debe reflejarse en `docs/metodologia.md` y `docs/verificacion.md` cuando afecte a fuentes, unidades o correcciones, y en `assets/data.js` tras regenerar.
6. **Preservar íntegro `archivo/decision-studio.html`.** Nunca editar ese archivo; su SHA-256 (`7dace552af35222a67e4d58a22ef9525b50d7afeacfc992093d6a46887cb2f39`) es una aserción dura en `scripts/check-data.cjs`.
7. **Ejecutar las comprobaciones pertinentes tras cada cambio:**
   - `node scripts/check-data.cjs` (o `npm test`) tras tocar `datos/` o `assets/`.
   - `python3 scripts/build-data.py` + `node scripts/check-data.cjs` tras editar JSON.
   - Pruebas de navegador (`scripts/browser-test.cjs` con Playwright/Chrome) o inspección equivalente con las herramientas `browser.*` de Code Mode si no hay Node/Playwright, tras cambios en `index.html`, `assets/app.js`, `assets/styles.css` o `visualize/`.
8. **Distinguir pruebas ejecutadas de comprobaciones pendientes y de revisión visual real:**
   - Señalar explícitamente qué comprobaciones se ejecutaron y con qué resultado (código de salida, mensajes de consola, HTTP 200, etc.).
   - Señalar qué comprobaciones quedan pendientes (p. ej. matriz de anchos 320/390/768/1024/1440 px si no se pudo cubrir toda).
   - No presentar deducciones del código como revisión visual real. La revisión visual real requiere ver la captura renderizada; las mediciones DOM (scrollWidth, visible, overflow) son deducciones del código, no ojo humano.

## Decisiones rutinarias (resolver sin consultar)

- Realiza autónomamente los pasos necesarios para completar cada tarea; no pidas confirmación para decisiones rutinarias. Las restricciones de publicación y eliminación siguen vigentes, salvo autorización expresa del usuario que ya cubra esas acciones.
- Arrancar servidor local con `python3 -m http.server 8000` desde la raíz para inspeccionar `index.html`.
- Usar `assets/data.js` solo como salida generada; nunca editar directamente.
- Regenerar `assets/data.js` con `python3 scripts/build-data.py` tras cualquier edición de `datos/justicia-juvenil.json` o `datos/original-pptx.json`.
- Usar `npm test` como atajo de `node scripts/check-data.cjs`.
- Reportar siempre `git status --short` antes y después de cualquier escritura para demostrar que no hubo cambios no intencionados.

## Cuándo preguntar al usuario (no decidir por cuenta propia)

- Falta información esencial para completar una tarea.
- Se proponga **eliminar contenido** (capítulos, datos, fuentes, correcciones, archivos).
- Se proponga **cambiar el significado de los datos** (reevaluar categorías, denominadores, unidades, fuentes o corregir valores oficiales).
- Se proponga **publicar en GitHub** o modificar la configuración de alojamiento (GitHub Pages publica la raíz de `main`; no tocar sin aprobación).

## Estructura de referencia del repositorio

- `index.html`: entrada principal del dossier interactivo (12 capítulos).
- `assets/styles.css`, `assets/app.js`, `assets/data.js` (generado), `assets/favicon.svg`.
- `datos/justicia-juvenil.json`: datos normalizados con `sources` y `corrections`.
- `datos/original-pptx.json`: transcripción del material original.
- `datos/origen/ine-26027-2025.csv` … `ine-26030-2025.csv`: extractos oficiales del INE.
- `docs/metodologia.md`, `docs/verificacion.md`, `docs/analisis-previo.md`.
- `visualize/registro-y-condena.html`: vista compacta reutilizable (fragmento).
- `archivo/decision-studio.html`: demo anterior conservada íntegramente.
- `scripts/build-data.py`, `scripts/check-data.cjs`, `scripts/browser-test.cjs`.
- `test-results/`: capturas de pantalla generadas por las pruebas de navegador.

## Ejemplo de flujo de cambio de datos

### Excepción autorizada: laboratorio sintético de Madrid

El usuario ha autorizado expresamente generar y publicar una POC con expedientes completamente ficticios. La regla de no inventar cifras se mantiene para el dossier y las estadísticas oficiales. Los datos sintéticos se guardan exclusivamente en `datos/poc-madrid/`, con aviso explícito, fuentes demográficas y geográficas separadas y sin mezclarlos con `datos/justicia-juvenil.json`.

La capa operativa se genera con `scripts/build-madrid.py`; no editar a mano `assets/madrid-data.js`. Después de cambios en la demo ejecutar también `node scripts/check-madrid.cjs`. La publicación de esta entrega en GitHub y GitHub Pages ha sido solicitada expresamente por el usuario el 21/10/2026.

1. Editar `datos/justicia-juvenil.json` manteniendo fuentes y unidades.
2. `python3 scripts/build-data.py` (regenera `assets/data.js`).
3. `node scripts/check-data.cjs` (valida integridad: total 24.279, 19 territorios, desgloses, igualdad JSON/JS, SHA-256 del archivo).
4. Pruebas de navegador si tocó la presentación.
5. Reportar resultados y `git status --short`.
