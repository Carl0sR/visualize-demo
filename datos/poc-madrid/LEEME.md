# Prueba de concepto: expedientes y sentencias en Madrid

**Todos los registros judiciales de este paquete son ficticios.** La cartografía y los recuentos de población son públicos y reales. El reparto demográfico ayuda a hacer una demostración verosímil; no convierte los resultados en una estimación de incidentes reales.

La POC permite explicar a un trabajador interno cómo pasar de documentos en papel o escaneados a una vista territorial de actividad registrada. No se han consultado expedientes personales ni procesado documentos judiciales. Este documento describe el conjunto sintético inicial; su integración posterior en el repositorio y la capa operativa se documentan en `docs/piloto-madrid.md`.

## Revisión del proyecto de partida

Se revisaron la aplicación publicada, su capítulo territorial, `README.md`, `docs/metodologia.md`, `assets/app.js`, el esquema JSON, la entrada HTML y las comprobaciones de datos de [Carl0sR/visualize-demo](https://github.com/Carl0sR/visualize-demo), en el commit `362f386395cb0b0b3cfb1d78970886188ccc78ea`.

La aplicación es un dossier estático de doce capítulos con una biblioteca. Sus estadísticas agregadas separan registros de Fiscalía de infracciones vinculadas a condenas del INE. La vista territorial es un gráfico de barras por comunidad autónoma. No contiene microdatos de expedientes, coordenadas ni desgloses municipales o de barrio. Las tablas nacionales de edad, sexo y nacionalidad tampoco aportan cruces individuales ni perfiles territoriales.

Por tanto, estos datos nuevos necesitan una vista y un cargador propios. **No se debe reemplazar `datos/justicia-juvenil.json` o `assets/data.js` con estos archivos:** los esquemas y unidades son distintos. Se han reutilizado diez etiquetas y sus identificadores como vocabulario, sin utilizar sus recuentos ni sus proporciones.

## Contenido de la simulación

4.800 expedientes de reforma simulados: 2.200 abiertos en 2024 y 2.600 en 2025. Contienen 6.361 hechos, 2.385 sentencias simuladas —2.058 condenatorias y 327 absolutorias— y 2.532 infracciones con condena. Hay 1.979 expedientes pendientes al corte, 31/12/2025. Los archivos sin sentencia forman una categoría de cierre separada.

La cartografía cubre los 179 municipios de la Comunidad y, dentro de Madrid capital, 21 distritos y 131 barrios. En esta muestra hay expedientes en 132 municipios y 130 barrios. Cero expedientes ficticios no significa ausencia real de incidentes. Fuera de la capital la resolución de esta entrega es municipal, sin inventar barrios para otros ayuntamientos.

Cada expediente tiene uno a tres hechos de categorías distintas. Un expediente cerrado puede tener sentencia condenatoria, absolutoria o archivo. Una sentencia puede condenar por uno o más hechos de ese mismo expediente. El estado procesal y el soporte documental son simulaciones de producto, no una especificación validada del funcionamiento de un juzgado.

No se crean personas, nombres, direcciones, DNI, nacionalidades ni perfiles de riesgo. Todos los identificadores empiezan por `DEMO-`. La unidad tramitadora también es inventada y no implica competencia real de un tribunal concreto.

## Cómo se reparte

1. El municipio se selecciona con probabilidad proporcional a su población total INE a 01/01/2025 multiplicada por un factor aleatorio fijo entre 0,85 y 1,15.
2. Si corresponde a Madrid capital, se selecciona un barrio con probabilidad proporcional a su población de 14–17 años del padrón a 01/01/2025, también con un factor fijo entre 0,85 y 1,15. Los distritos se obtienen del barrio.
3. En 2025 se aplica un multiplicador demostrativo de 1,3 a tres municipios y de 1,4 a tres barrios seleccionados por semilla. Los códigos elegidos están en los metadatos. No son alertas reales ni responden a indicadores de delincuencia o vulnerabilidad.
4. Las categorías, el calendario, el número de hechos y los resultados se sortean con parámetros inventados. Dos categorías aleatorias reciben mayor peso en cada zona para que los filtros permitan ver patrones diferentes. No se ha usado información de renta, origen, sexo o delincuencia para asignar perfiles.
5. Las coordenadas se generan dentro del polígono de la zona y se comprueba su contención. Son ubicaciones inventadas; no siguen calles, edificios, centros escolares ni domicilios. Todos los hechos de un expediente comparten punto en esta simplificación.

La semilla fija es `20261021`. El número de expedientes, su aumento anual y todos los porcentajes procesales son decisiones de demostración. No se han calibrado con cifras judiciales reales.

**La base demográfica tiene distinta resolución:** población total para los municipios, población adolescente para el reparto interno de la capital. Los datos de residentes solo proporcionan una aproximación de tamaño para esta simulación de lugares del hecho; no modelan movilidad, afluencia diurna o lugares reales de comisión. No permiten calcular tasas comparables de delincuencia juvenil por municipio con este paquete.

## Archivos para trabajar

| Archivo | Unidad y uso |
|---|---|
| `expedientes.json` | Un registro por expediente; fechas, estado, relaciones y zona. |
| `hechos.json` | Un registro por hecho; categoría y vínculo al expediente. |
| `sentencias.json` | Un registro por sentencia; resultado y hechos con condena. |
| `agregados.json` | Recuentos por municipio/distrito/barrio, cohorte y categoría. Incluye ceros. |
| `expedientes-puntos.geojson` | Un punto por expediente para GIS. Solo la primera categoría se muestra como principal. |
| `hechos-puntos.geojson` | Un punto por hecho para filtrar todas las categorías en GIS; varios puntos pueden compartir expediente. |
| `municipios-resumen-2025.geojson` | Municipios con indicadores de la cohorte 2025. |
| `distritos-resumen-2025.geojson` | Distritos de la capital con los mismos indicadores. |
| `barrios-resumen-2025.geojson` | Barrios de la capital con los mismos indicadores. |
| `municipios-madrid.geojson`, `distritos-madrid.geojson`, `barrios-madrid.geojson` | Geometrías públicas de referencia. |
| `poblacion-municipios-2025.json`, `poblacion-barrios-2025.json` | Contexto demográfico público que pondera el reparto. |
| `mapas-madrid.png`, `mapas-madrid.svg` | Lámina estática para presentar el ejemplo. |
| `catalogo.json`, `diccionario.json`, `fuentes.json` | Vocabulario, modelo, fuentes y atribuciones. |
| `generar.py`, `mapas.py`, `requirements.txt` | Regeneración reproducible sin red, a partir de las fuentes incluidas. |
| `validacion.json` | Resultados de las comprobaciones de integridad. |

`explorador-datos.json` contiene una versión compactable de geometría simplificada y máscaras de categorías para la exploración en conversación. Los datos completos y las geometrías de referencia se conservan en los otros archivos.

## Cómo interpretar los indicadores

El periodo selecciona **año de apertura del expediente**, con situación al 31/12/2025. No selecciona el año del hecho ni el año de la sentencia. Los hechos pueden ser anteriores a la apertura. Comparar cohortes recientes con antiguas por condenas introduce diferencias de tiempo de resolución; no demuestra una evolución de los hechos ocurridos.

Expedientes únicos cuenta una sola vez cada expediente con algún hecho de la categoría seleccionada. Hechos registrados cuenta hechos, aunque no haya condena. Sentencias condenatorias cuenta las sentencias que condenan por algún hecho de la categoría seleccionada. Infracciones con condena cuenta los hechos con resultado condenatorio simulado. Pendientes cuenta expedientes no cerrados al corte. Ningún indicador cuenta personas.

Un expediente con lesiones y amenazas aparece en ambas categorías. No se deben sumar categorías para obtener expedientes únicos ni sumar municipios y sus distritos o barrios. Los agregados inferiores de Madrid capital concilian con el municipio, pero no son observaciones adicionales.

Un volumen elevado sirve para formular preguntas sobre actividad y necesidades de análisis. No basta para etiquetar una zona como peligrosa o tensionada, ni permite atribuir causas o evaluar personas. Para una comunicación a un ayuntamiento harían falta una base validada, periodos comparables, localización comprobada y denominadores adecuados.

## Uso con RustGIS y con la aplicación

Para una primera vista GIS, abrir `municipios-resumen-2025.geojson` y aplicar colores al campo `expedientes`; después, usar `distritos-resumen-2025.geojson` o `barrios-resumen-2025.geojson` para acercarse a la capital. `sentencias_condenatorias`, `infracciones_condenadas` y `pendientes` son indicadores alternativos del mismo conjunto de expedientes.

Para filtrar tipos de hecho, usar `hechos-puntos.geojson` con `categoria_id` y `condena_simulada`. Contar puntos produce hechos, no expedientes; para obtener expedientes se requiere contar `expediente_id` distintos. La capa `expedientes-puntos.geojson` aporta una fila por expediente y solo una categoría principal de presentación.

Los archivos siguen GeoJSON WGS84, longitud/latitud. Se han validado como datos geográficos, pero **no se ha instalado RustGIS ni probado una sesión dentro de RustGIS** en esta entrega. El explorador de la conversación funciona directamente con estos mismos datos sin depender de RustGIS.

En `visualize-demo` convendría añadir una vista separada, por ejemplo `poc-madrid/`, con su aviso permanente de simulación, sin mezclar este material con el dossier de estadísticas públicas. Para esta POC no hace falta mantener una versión modificada del código de RustGIS.

## Reproducción y controles

Con Python y un entorno virtual, instalar `requirements.txt` y ejecutar `python generar.py` y `python mapas.py`. La generación no usa la red. Las bibliotecas se instalaron para preparar esta entrega en una carpeta de trabajo, fuera del paquete.

Se comprobaron identificadores únicos, referencias entre tablas, orden de fechas, pertenencia de cada punto a sus límites, correspondencia de los 179 códigos municipales con la población y de los 131 barrios con el padrón. Los agregados de todos los indicadores concilian entre municipios, distritos y barrios para las dos cohortes. La vista interactiva se comprobó en navegador, incluidos filtros y una anchura móvil de 345 píxeles sin desbordamiento horizontal.

Se excluyeron Los Baldios y El Redegüelo del servicio cartográfico municipal por ser unidades especiales con código no municipal. En la capa de barrios, el campo `NUM_BAR` de Sol no coincidía con su código territorial; se enlazó con la pareja `COD_DISB` y se verificó la correspondencia completa con los 131 barrios del padrón. Las intersecciones con municipio y distrito se usan para garantizar contención, no para sustituir las delimitaciones oficiales.

## Qué habría que validar con el trabajador interno

La demostración puede empezar por cambiar entre municipios, distritos y barrios, seleccionar amenazas o lesiones y contrastar expedientes, pendientes y sentencias. Después conviene comprobar qué decisiones o comunicaciones requieren realmente ese análisis y qué campos constan de forma fiable en sus documentos.

Un piloto con documentos autorizados necesitaría extracción estructurada y revisión humana, separación de lugar del hecho, residencia y órgano judicial, enlaces entre expedientes y resoluciones, control de duplicados y un estado explícito de localización desconocida. Los escaneos por sí solos no crean una base analítica fiable.

Para datos reales, la vista compartida debería trabajar con agregación geográfica y temporal y controlar celdas pequeñas: quitar nombres no garantiza anonimato cuando se combinan localización, fecha y un hecho infrecuente. Los puntos de esta POC son visibles porque todos están inventados. No hay aquí una evaluación de anonimización ni un sistema listo para decisiones operativas.

## Fuentes

Repositorio y vocabulario: [visualize-demo](https://github.com/Carl0sR/visualize-demo/tree/362f386395cb0b0b3cfb1d78970886188ccc78ea).

Población municipal: [INE, tabla 2881](https://www.ine.es/jaxiT3/Tabla.htm?t=2881), ambos sexos, datos de 2025 obtenidos por su API. Población por barrio: [Padrón municipal, enero de 2025](https://datos.madrid.es/id/dataset/209163-0-padron-municipal-historico/resource/209163-296-padron-municipal-historico-csv), suma de 14, 15, 16 y 17 años, sin conservar desglose por sexo u origen en el paquete.

Geometrías municipales: [servicio de municipios basado en el IGN](https://services1.arcgis.com/nCKYwcSONQTkPA4K/arcgis/rest/services/muni/FeatureServer), atribución del servicio BDLJE CC-BY 4.0 ign.es; es una redistribución, no una descarga directa del CNIG. Distritos y barrios: [servicio de límites del Ayuntamiento de Madrid](https://services-eu1.arcgis.com/UrtTdLP2PYSxwtI6/ArcGIS/rest/services/L%C3%ADmites_administrativos_oficiales_del_Ayuntamiento_de_Madrid/FeatureServer).

Descarga de fuentes: 21/10/2026. Se conservan enlaces, parámetros y huellas en `fuentes.json`. El padrón indica CC BY 4.0; las condiciones aplicables de cada fuente se enlazan para su atribución al redistribuir.
