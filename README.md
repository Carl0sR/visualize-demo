# Justicia juvenil 2025 · Cifras con contexto

## Laboratorio territorial de Madrid · 21/10/2026

Demostración con 4.800 expedientes completamente ficticios: [abrir laboratorio](madrid.html), [presentación de siete diapositivas](presentacion.html) y [guion del piloto](docs/piloto-madrid.md). Permite consultar municipios, distritos y barrios; alternar lugar del hecho y residencia simulados; revisar tareas y descargar informes y mapas agregados. La geografía y la población son públicas; los registros judiciales y las incidencias operativas son inventados.

La capa operativa se genera con `python3 scripts/build-madrid.py`. Ejecutar `npm test`, `npm run test:deck` y `npm run test:madrid`. D3 7.9.0 se distribuye localmente con su licencia; no hay peticiones de teselas, carga de documentos ni conexiones a sistemas judiciales. Esta entrega incluye la presentación local que estaba pendiente.

Dossier interactivo basado en la presentación «Radiografía de la Justicia Juvenil 2025», revisado contra las tablas públicas del INE y las memorias de Fiscalía.

**Sitio:** https://carl0sr.github.io/visualize-demo/

## Contenido

Doce capítulos, gráficos con denominadores explícitos y una biblioteca con datos, fuentes, correcciones, transcripciones del original y cobertura de las 23 diapositivas. Las causas de Fiscalía y las infracciones de condenas del INE se mantienen separadas. Las categorías generales no se presentan como un total de ciberdelitos.

Los datos por edad, sexo, nacionalidad y territorio proceden de las tablas INE 26027, 26028, 26029 y 26030, filtradas por 2025. Las tasas territoriales proceden de la nota de prensa del INE. Véase [metodología](docs/metodologia.md).

## Ejecución

Sitio estático sin instalación ni compilación. Desde la raíz:

```sh
python3 -m http.server 8000
```

Abrir `http://localhost:8000`. También puede abrirse `index.html` directamente. No hay peticiones a APIs, servicios de análisis, cookies ni credenciales. Los enlaces a fuentes externas se abren solo por acción del lector.

## Modo presentación (piloto)

`presentacion.html` contiene cuatro diapositivas para evaluar el diseño de proyección: portada, tres planos, actividad de Fiscalía y comparación territorial. Se abre con el mismo servidor:

```
http://localhost:8000/presentacion.html
```

Navegación con flechas, `PageUp`/`PageDown`, espacio y `Inicio`/`Fin`; `F` entra y sale de pantalla completa. El guion y las notas del ponente están en [docs/presentacion.md](docs/presentacion.md) y no se muestran en la pantalla. El piloto reutiliza `assets/data.js`; el dossier y el archivo histórico no se modifican.

## Estructura

- `index.html`: entrada principal.
- `presentacion.html`: piloto de modo presentación de cuatro diapositivas.
- `assets/`: estilos, comportamiento y datos del recorrido, más `presentacion.css` y `presentacion.js`.
- `datos/`: datos normalizados, extractos CSV oficiales y transcripción del PPTX.
- `docs/`: método, decisiones editoriales, guion de presentación y análisis previo.
- `visualize/`: vista compacta reutilizable dentro de la conversación.
- `scripts/`: regeneración de datos y comprobaciones, incluida `check-deck.cjs`.
- `archivo/decision-studio.html`: demo anterior conservada íntegramente.

## Actualizar y comprobar

Editar `datos/justicia-juvenil.json` manteniendo fuentes y unidades; después:

```sh
python3 scripts/build-data.py
node scripts/check-data.cjs
node scripts/check-deck.cjs
```

Si se regenera `assets/data.js` o se modifican `presentacion.css`/`presentacion.js` y se usa `presentacion.html`, actualizar el sufijo `?v=` de los recursos locales para evitar una copia cacheada.

Pruebas de navegador (requieren Playwright y Chrome/Chromium):

```sh
npm install
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/ruta/a/chrome node scripts/browser-test.cjs http://localhost:8000
```

GitHub Pages publica la raíz de `main`. No se modifica la configuración existente de alojamiento. El contenido de la demo anterior se conserva byte a byte.

## Alcance

Edición 17 de octubre de 2026. No es una publicación oficial del INE o Fiscalía. Los datos oficiales y sus fuentes se atribuyen en cada sección. Los ejemplos de modalidades digitales son ilustrativos y no constituyen calificaciones jurídicas automáticas. El informe previo documenta el diagnóstico anterior a la reconstrucción de las tablas; el registro de correcciones del sitio refleja la implementación actual.
