# Método y decisiones editoriales

## Laboratorio sintético separado · 21/10/2026

`datos/poc-madrid/` contiene expedientes, hechos y sentencias completamente ficticios, separados de las estadísticas oficiales. La capa operativa añade residencias y tareas simuladas con semilla fija. `assets/madrid-data.js` se genera con `scripts/build-madrid.py`. El reparto demográfico, las fuentes y los límites están en `docs/piloto-madrid.md`. No se alteran los recuentos oficiales para construir el mapa ni se derivan de ellos cruces por barrio.

Edición: 17 de octubre de 2026. Periodo estadístico: 2025, salvo series históricas y memorias cualitativas identificadas.

## Fuentes y tratamiento

- INE 26027: infracciones según sexo.
- INE 26028: infracciones según edad (edad a la primera comisión).
- INE 26029: infracciones según nacionalidad.
- INE 26030: infracciones por lugar de condena.
- Nota de prensa INE 2025: tasa territorial por 1.000 habitantes de 14–17 años y magnitudes de personas condenadas.
- Memoria FGE 2026, III.6.2: actividad procesal de 2025 y serie histórica.
- Memoria FGE 2024, V.1.3 y memoria de Madrid 2024, III: contexto cualitativo.

Las URL completas y sus ámbitos están en `datos/justicia-juvenil.json`. Los CSV oficiales se descargaron de `https://www.ine.es/jaxiT3/files/t/es/csv_bdsc/ID.csv` y se filtraron por `Periodo=2025`. Se conservaron los encabezados, etiquetas y valores de origen. Los valores vacíos no se convirtieron en cero. Los gráficos usan recuentos enteros y porcentajes redondeados a un decimal. Los porcentajes se calculan antes del redondeo.

La tabla por edad del PPTX no reconciliaba con el total. Se reemplazaron sus valores con la tabla oficial, no con ajustes para forzar el cierre. La suma de categorías principales revisadas es 24.279. Se evitan dobles conteos entre categorías y subcategorías. Las dimensiones sexo y edad son marginales separadas, no un cruce.

En territorio se resolvieron las discrepancias con INE 26030, incluido Galicia, País Vasco y La Rioja además de las detectadas inicialmente. La suma de los 19 territorios es 24.279. Los ocho territorios del foco original suman 7.229. La selección se identifica como editorial, sin atribuir a todos una competencia administrativa común. El gráfico de barras sustituye al mapa para priorizar comparabilidad; no se usan contornos geográficos inventados.

Las tasas se transcriben de la nota de prensa del INE. No se calculan poblaciones implícitas a partir de tasas redondeadas. Los porcentajes territoriales identifican siempre la base nacional y la del conjunto seleccionado.

Se corrigen las macrocifras de expedientes de reforma, la denominación de expedientes de ejecución y el denominador de conformidades. Se conservan por separado los 1.364 registros de integridad moral de Fiscalía y las 1.346 infracciones del INE. No se atribuye el crecimiento de una serie a la otra.

## Ampliación para el modo presentación

El piloto `presentacion.html` usa tres macrocifras de actividad procesal centralizadas en el bloque `fiscalia` de `datos/justicia-juvenil.json`: 74.538 diligencias preliminares (+10,6 %), 26.084 expedientes de reforma (+5,4 %) y 14.072 expedientes de ejecución (+4,2 %). Proceden de FGE 2026, III.6.2, y coinciden con los valores ya usados en `assets/app.js` y `visualize/registro-y-condena.html`. Son unidades distintas y no se suman. La ampliación no cambia el comportamiento del dossier: `assets/data.js` se regenera y `app.js` sigue usando sus constantes actuales. La unificación de esas constantes queda pendiente.

## Contenido digital y contexto

No hay una variable de medio de comisión en las tablas usadas. Por ello, el subtotal de 4.756 de la presentación no se usa como total de ciberdelitos. Se conserva en el original para trazabilidad. Se retiran equivalencias jurídicas no justificadas y las modalidades digitales se identifican como ejemplos. No se estima la infradenuncia ni se representa mediante proporciones de un iceberg.

Las reflexiones de las memorias se resumen con atribución y límites. No se presentan como una estimación causal ni como diagnóstico individual. No se inventan recomendaciones evaluadas de prevención ni resultados de medidas.

## Conservación y privacidad

La biblioteca ofrece la cobertura de las 23 diapositivas, el registro de correcciones, tablas originales y el análisis previo. El PPTX y sus metadatos no se publican. La publicación contiene datos estadísticos agregados y documentación editorial, sin expedientes personales. No hay cuentas de usuario, seguimiento, almacenamiento de datos personales o claves de acceso.

La demo previa se conserva íntegra en `archivo/decision-studio.html`, SHA-256 `7dace552af35222a67e4d58a22ef9525b50d7afeacfc992093d6a46887cb2f39`.

## Visualize y publicación

La experiencia web aplica el recorrido y los principios de comparación de Visualize en un sitio estático independiente, sin dependencias del entorno de conversación. `visualize/registro-y-condena.html` conserva una vista compacta en formato de fragmento Visualize. La entrada principal es el dossier completo de doce capítulos, no un contenedor que dependa de APIs del anfitrión.
