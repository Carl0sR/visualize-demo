# Verificación de la edición

## Laboratorio de Madrid · 21/10/2026

- `node scripts/check-data.cjs`: OK; estadísticas originales, JSON/JS y archivo histórico íntegros.
- `node scripts/check-deck.cjs`: OK; siete diapositivas, datos oficiales conservados y enlace a la demo.
- `node scripts/check-madrid.cjs`: OK; 4.800 expedientes, hechos y resultados, filtros por categoría y cohorte, relaciones territoriales, casos sin localización y totales por residencia.
- HTTP local 200 para la nueva página; render y filtros del mapa comprobados en navegador.
- Seguimiento: consultados los casos sin localización suficiente para la escala elegida.
- Informe: descarga HTML real comprobada; contiene SVG, contexto del analista y avisos, sin scripts.
- Comprobaciones DOM móviles con ancho efectivo de 375 px: territorio, seguimiento e informe sin desbordamiento horizontal. No sustituyen una revisión en dispositivos físicos.
- Revisión visual real de las diapositivas nuevas y del laboratorio. Las pruebas en sala, proyector, mando y con profesionales siguen pendientes.
- El flujo de GitHub Actions comprueba los tres conjuntos de pruebas y la regeneración reproducible de la capa operativa. Su resultado de publicación se verifica tras el envío a GitHub.

17 de octubre de 2026.

## Datos

Comprobadas 46 categorías del INE: sus desgloses por edad, sexo y nacionalidad coinciden con el total de cada fila. Las categorías principales y los 19 territorios suman 24.279. El foco de ocho territorios suma 7.229. Las series conservan los valores ausentes como ausencia de dato.

Las 37 filas con diferencias de la tabla de edad o territorio del PPTX quedan registradas con sus valores originales y los oficiales. El resto de correcciones editoriales se documenta en la biblioteca. La demo anterior conserva su huella SHA-256.

Se añadió al JSON el bloque `fiscalia` para el piloto de presentación (74.538, 26.084 y 14.072), contrastado con FGE 2026 III.6.2. El dossier no consume ese bloque: `check-data.cjs` y una prueba de navegación con el `data.js` regenerado confirman que su comportamiento no cambia.

## Presentación (piloto)

`presentacion.html` se comprobó con Chrome a 1024 × 768, 1280 × 720 y 1600 × 900. Cuatro diapositivas, cero elementos fuera del escenario y scroll de página igual al viewport. El tamaño efectivo menor es 19,2 px tras el escalado a 1024 × 768; el texto de apoyo queda entre 20,5 y 25,6 px, y los titulares entre 49 y 60 px. Las etiquetas y la fuente no bajan de 19,2 px. Los contrastes calculados con la fórmula WCAG están entre 4,64:1 y 16,70:1; el texto supera 4,5:1.

La navegación por flechas, `PageUp`/`PageDown`, espacio, `Inicio` y `Fin` funciona; también los enlaces `#1`–`#4` y atrás/adelante del navegador. La pantalla completa se verificó con eventos de teclado y clic de confianza en Chrome headless: activa, cambia a «Salir» y sale con `F` o `Esc`. En el panel de revisión integrado la activación no se pudo confirmar. No hay peticiones remotas: solo documento, hoja y guiones locales.

## Navegador

Chrome en modo automatizado con Playwright. Revisión de los 12 capítulos a 320, 390, 768, 1024 y 1.440 píxeles. Sin desbordamiento horizontal de página. La biblioteca también se comprobó a 320, 768 y 1.440 píxeles. Las tablas amplias tienen desplazamiento horizontal propio.

Comprobados selectores de categoría, medida, territorio y universo; actualización de numeradores y denominadores; búsqueda de tablas; descarga CSV y contenido; navegación atrás del navegador; entrada por URL de capítulo; 23 entradas de cobertura; enlaces a ficheros locales; salto al contenido mediante teclado; y preferencia de movimiento reducido. Sin errores JavaScript durante la prueba.

Inspección visual de capturas de escritorio, territorio y móvil. La vista compacta de Visualize se comprobó a 320, 736 y 1.024 píxeles y en sus tres estados.

## Publicación

Revisión de los archivos destinados al repositorio: sin coincidencias de claves privadas, tokens habituales, asignaciones de contraseñas o rutas personales. No se publica el PPTX ni sus metadatos. La comprobación de patrones no constituye una garantía universal de ausencia de secretos; se complementó con la inspección del contenido y la lista de archivos.

## Límites

No se ha probado con todos los lectores de pantalla ni en dispositivos físicos. La implementación usa controles HTML nativos y ofrece tablas equivalentes a los gráficos. Los cambios posteriores requieren volver a ejecutar las comprobaciones.

### Rediseño de la mesa de trabajo (21/10/2026)

- `npm test`, `npm run test:deck`, `npm run test:madrid`, `node --check assets/madrid.js` y `git diff --check`: correctos.
- Navegador real: selección de Centro en tabla territorial y paso al seguimiento (24 expedientes del ámbito seleccionado; 10 en la cola de revisión); orden por días abierto; apertura y cierre de ficha lateral; búsqueda sin resultados; guardado de consulta y recuperación en nueva carga; eliminación de consulta; página 2 del listado; ocultación y restauración de columna; densidad compacta y panel de filtros plegado.
- Alternancia Mapa / Tabla / Ambos y segunda página territorial verificadas; informe HTML descargado con título y nota personalizados, unidades e intervalos explícitos. Consola sin errores ni advertencias durante estas pruebas.
- Revisión visual real en escritorio de 1440 px, vista de 1024 px y móvil de 390 px. Mediciones DOM en 1024 y 390 sin desbordamiento horizontal de la página. Las tablas mantienen desplazamiento propio cuando no caben sus columnas.
- Pendiente de validación con usuarios: preferencias de densidad, columnas habituales y vocabulario propio de cada equipo. La salida a impresora física no se ha probado en esta iteración.

### Cabecera unificada y espacio de trabajo (21/10/2026)

Se agrupan identidad, navegación, filtros/densidad y ayuda en la fila superior. Presentación y dossier pasan al menú «Documentación». Se elimina la fila visual redundante «Mesa de trabajo», conservando un título accesible y el contexto en la marca y el aviso de simulación. La selección y las consultas guardadas comparten una segunda barra; el botón de eliminación solo aparece cuando hay una consulta elegida.

Revisión visual real en 1366×768, 1920×1080 y 390×844. En 1366×768, el área de trabajo comienza en y=127 px y la página mide exactamente 768 px de alto; no necesita desplazamiento vertical general. El listado cómodo dispone de unos 237 px y desplazamiento propio, con paginación visible. En escritorio, filtros y contenido usan paneles desplazables cuando es necesario; en móvil se conserva el desplazamiento natural. Se verificaron navegación territorial, página siguiente, ficha de expediente y menú de documentación. Sin errores ni advertencias de consola. No se probó impresora física.
