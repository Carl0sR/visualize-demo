# Justicia juvenil 2025 · Cifras con contexto

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

## Estructura

- `index.html`: entrada principal.
- `assets/`: estilos, comportamiento y datos del recorrido.
- `datos/`: datos normalizados, extractos CSV oficiales y transcripción del PPTX.
- `docs/`: método, decisiones editoriales y análisis previo.
- `visualize/`: vista compacta reutilizable dentro de la conversación.
- `scripts/`: regeneración de datos y comprobaciones.
- `archivo/decision-studio.html`: demo anterior conservada íntegramente.

## Actualizar y comprobar

Editar `datos/justicia-juvenil.json` manteniendo fuentes y unidades; después:

```sh
python3 scripts/build-data.py
node scripts/check-data.cjs
```

Pruebas de navegador (requieren Playwright y Chrome/Chromium):

```sh
npm install
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/ruta/a/chrome node scripts/browser-test.cjs http://localhost:8000
```

GitHub Pages publica la raíz de `main`. No se modifica la configuración existente de alojamiento. El contenido de la demo anterior se conserva byte a byte.

## Alcance

Edición 17 de octubre de 2026. No es una publicación oficial del INE o Fiscalía. Los datos oficiales y sus fuentes se atribuyen en cada sección. Los ejemplos de modalidades digitales son ilustrativos y no constituyen calificaciones jurídicas automáticas. El informe previo documenta el diagnóstico anterior a la reconstrucción de las tablas; el registro de correcciones del sitio refleja la implementación actual.
