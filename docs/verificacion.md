# Verificación de la edición

17 de octubre de 2026.

## Datos

Comprobadas 46 categorías del INE: sus desgloses por edad, sexo y nacionalidad coinciden con el total de cada fila. Las categorías principales y los 19 territorios suman 24.279. El foco de ocho territorios suma 7.229. Las series conservan los valores ausentes como ausencia de dato.

Las 37 filas con diferencias de la tabla de edad o territorio del PPTX quedan registradas con sus valores originales y los oficiales. El resto de correcciones editoriales se documenta en la biblioteca. La demo anterior conserva su huella SHA-256.

## Navegador

Chrome en modo automatizado con Playwright. Revisión de los 12 capítulos a 320, 390, 768, 1024 y 1.440 píxeles. Sin desbordamiento horizontal de página. La biblioteca también se comprobó a 320, 768 y 1.440 píxeles. Las tablas amplias tienen desplazamiento horizontal propio.

Comprobados selectores de categoría, medida, territorio y universo; actualización de numeradores y denominadores; búsqueda de tablas; descarga CSV y contenido; navegación atrás del navegador; entrada por URL de capítulo; 23 entradas de cobertura; enlaces a ficheros locales; salto al contenido mediante teclado; y preferencia de movimiento reducido. Sin errores JavaScript durante la prueba.

Inspección visual de capturas de escritorio, territorio y móvil. La vista compacta de Visualize se comprobó a 320, 736 y 1.024 píxeles y en sus tres estados.

## Publicación

Revisión de los archivos destinados al repositorio: sin coincidencias de claves privadas, tokens habituales, asignaciones de contraseñas o rutas personales. No se publica el PPTX ni sus metadatos. La comprobación de patrones no constituye una garantía universal de ausencia de secretos; se complementó con la inspección del contenido y la lista de archivos.

## Límites

No se ha probado con todos los lectores de pantalla ni en dispositivos físicos. La implementación usa controles HTML nativos y ofrece tablas equivalentes a los gráficos. Los cambios posteriores requieren volver a ejecutar las comprobaciones.
