# Laboratorio territorial de Madrid

Edición 21/10/2026. Prueba de concepto para conversar con profesionales de justicia juvenil y agentes sociales. Todos los expedientes, hechos, sentencias, residencias, medidas y tareas son ficticios. El sitio es público y no tiene carga de documentos, autenticación ni conexión con sistemas judiciales.

## Qué se ha incorporado

`madrid.html` ofrece territorio, seguimiento, informe y fuentes. El dossier conserva sus estadísticas públicas y la presentación incorpora tres diapositivas para introducir el uso territorial, abrir la demo y discutir un piloto. Las cuatro diapositivas estadísticas iniciales conservan sus datos y unidades.

La memoria ARRMI 2024 describe el uso del domicilio habitual para planificar la intervención y una organización territorial por mancomunidades, municipios y distritos (p. 58). También documenta 2.672 informes de asesoramiento técnico a Fiscalía en 2024 (p. 49). Estos antecedentes orientan las preguntas del laboratorio, sin reutilizar esa distribución para inventar tasas locales ni atribuir funciones a un usuario concreto.

Fuente: https://gestiona3.madrid.org/bvirtual/BVCM051678.pdf

## Recorrido sugerido para la reunión

1. Abrir `presentacion.html`. Las primeras cuatro diapositivas explican el contexto estadístico. La quinta diferencia lugar del hecho y residencia. La sexta enlaza con la demostración y la séptima propone una validación con el equipo.
2. En Territorio, abrir Madrid capital a escala de distrito o barrio. Elegir lesiones o amenazas y alternar expedientes, hechos, sentencias e infracciones con condena. Mostrar los registros que no entran en el mapa por falta de localización suficiente.
3. Cambiar de lugar del hecho a residencia. Explicar que las dos referencias responden a preguntas diferentes. Las residencias también están inventadas; no implican un domicilio individual ni zonas reales de demanda.
4. En Seguimiento, consultar revisiones operativas, documentos por comprobar y medidas pendientes de inicio. Son tareas demostrativas: no plazos legales, asignaciones reales ni prioridades personales.
5. Seleccionar una zona y preparar un informe. Añadir una pregunta o contexto, revisar los filtros y descargar el HTML o imprimirlo como PDF. El documento conserva el aviso de simulación, la fecha de corte, las unidades y las fuentes.
6. Preguntar al equipo qué decisiones o comunicaciones requieren realmente esos resultados, qué campos constan de forma fiable y qué parte del registro documental necesita revisión.

## Datos operativos y transformación

La base de 4.800 expedientes se conserva en `datos/poc-madrid/expedientes.json`, con hechos y sentencias relacionados. La generación inicial, demografía y geometrías se documentan en `datos/poc-madrid/LEEME.md` y `fuentes.json`.

`scripts/build-madrid.py` añade una capa operativa reproducible con semilla 20261022: residencia territorial ficticia, precisión de localización, incidencias de extracción o índice, tareas de revisión y una medida demostrativa por sentencia condenatoria. Los parámetros son inventados; no son porcentajes observados. No se construye un expediente de ejecución completo ni se estima reincidencia.

Los casos con `sin_localizar` carecen de todos los códigos del lugar del hecho en la vista operativa. Los de precisión `municipio` conservan únicamente ese nivel. La residencia es otro conjunto de códigos simulados. No se deduce residencia de la ubicación del hecho. Los casos incompletos siguen en el universo regional y en Seguimiento; se excluyen del mapa a la escala que no se conoce. En Madrid capital no se pueden asignar a ese ámbito los casos sin municipio conocido.

La semilla produce 4.091 localizaciones de hecho validadas, 488 solo municipales y 221 desconocidas en el total de las dos cohortes. El subconjunto que aparece en cada vista depende de filtros, escala y referencia geográfica.

La unidad de expediente es reforma simulada. Los hechos no son condenas, una sentencia puede cubrir varios hechos y las medidas no se suman a expedientes para obtener personas. La medida por sentencia es una simplificación declarada para enseñar otra dimensión del seguimiento; no presupone equivalencia entre sentencias y medidas reales.

El periodo es la fecha de apertura; los estados y resultados se observan al 31/12/2025. Comparar cohortes por condenas introduce diferencias de maduración. Las aperturas mensuales no son una serie de hechos ocurridos. La variación frente a 2024 debe leerse con ese alcance.

## Exportaciones

El mapa agrupa los recuentos positivos en hasta cinco intervalos por cuantiles; el cero se muestra aparte. Los límites se recalculan al cambiar de selección para distinguir diferencias entre distritos o barrios. Para comparar vistas hay que consultar sus cifras e intervalos, no equiparar tonos sin comprobar la escala.

El CSV y el GeoJSON contienen agregados de la selección, no una exportación de expedientes personales. El informe HTML es autónomo, incluye un mapa y puede imprimirse. El texto libre del analista queda en la página y en el archivo descargado; no se envía a un servidor ni se guarda en almacenamiento del navegador.

La opción de ocultar celdas entre 1 y 4 solo demuestra una precaución editorial. Los totales y el mapa no se suprimen, y pueden permitir inferencias complementarias. No representa una garantía de anonimización; al usar datos reales habría que definir reglas sobre toda la salida y sus posibles cruces.

## Preparación de un piloto real

La necesidad de acceso autorizado, una base de datos y controles de uso no se resuelve mediante esta página. Antes de operar con documentos reales harían falta un responsable del tratamiento y del proyecto, extracción y geocodificación revisadas, reglas de deduplicación, relaciones entre expedientes y resoluciones, fechas y categorías validadas, control de accesos y salidas agregadas adecuadas a cada destinatario.

La demo ayuda a discutir una necesidad; no contiene valoración de riesgo individual, detección de culpabilidad, recomendación de medidas o asignación automática de recursos. Un volumen alto no acredita peligrosidad, causa de un problema, infradenuncia ni necesidad de una plaza concreta.

## Uso técnico

Sitio estático con recursos locales, incluido D3 7.9.0 y su licencia. Se puede servir desde la raíz del proyecto o publicar sin compilación en GitHub Pages. El mapa no pide teselas a terceros ni usa geocodificación remota.

Regenerar el conjunto operativo: `python3 scripts/build-madrid.py`. Comprobar: `npm test`, `npm run test:deck` y `npm run test:madrid`. La fuente operativa es `datos/poc-madrid/operativo.json`; `assets/madrid-data.js` es su salida generada. Los JSON estadísticos oficiales y sus comprobaciones se mantienen separados.
