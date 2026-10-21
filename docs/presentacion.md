# Guion del piloto de presentación

## Ampliación para el laboratorio territorial · 21/10/2026

La entrega pasa de cuatro a siete diapositivas. Las cuatro primeras conservan su contexto estadístico. La quinta distingue lugar del hecho y residencia, con referencia a Memoria ARRMI 2024, p. 58. La sexta abre `madrid.html` para demostrar el mapa, el seguimiento y el informe usando datos ficticios. La séptima plantea validar una pregunta, la extracción y la lectura con el equipo profesional. Los recursos de la presentación llevan ahora `?v=20261021-1`.

El recorrido propuesto es de siete diapositivas más una demostración interactiva; su duración depende de esa demostración y no se ha ensayado con público. El guion operativo, los supuestos y las unidades están en `docs/piloto-madrid.md`. Las referencias a cuatro diapositivas en las secciones siguientes documentan el piloto previo.

Edición: 19 de octubre de 2026. Documento de trabajo del modo presentación. Las notas del ponente viven solo aquí: no se insertan en `presentacion.html` ni se muestran en la pantalla del público.

## Hipótesis de trabajo

- Público: profesionales de justicia juvenil y educación.
- Duración de la exposición completa: 20 minutos, sin contar preguntas.
- Alcance de este piloto: cuatro diapositivas para evaluar el diseño antes de completar el guion. Estimación de 5 a 6 minutos.
- Idioma: español. Tono: expositivo, sin dramatizar y sin cerrar conclusiones que las fuentes no sostienen.

## Cómo abrir el piloto

Desde la raíz del repositorio:

```sh
python3 -m http.server 8000
```

Abrir `http://localhost:8000/presentacion.html`. También puede abrirse el archivo directamente, pero se recomienda el servidor local para que el navegador no aplique caché antigua a `assets/data.js`.

## Navegación y operación

- Flechas `←` y `→`, `PageUp`/`PageDown` y la barra espaciadora cambian de diapositiva.
- `Inicio` y `Fin` van a la primera y a la última.
- `F` entra y sale de pantalla completa. `Esc` sale de pantalla completa.
- La barra inferior derecha ofrece anterior, siguiente, pantalla completa y un enlace al dossier completo.
- La URL admite `#1`, `#2`, `#3` y `#4`; atrás y adelante del navegador recorren las diapositivas visitadas.
- Funciona sin conexión: no hay tipografías, imágenes ni guiones remotos. Los enlaces a fuentes externas solo se abren si el ponente hace clic.
- La pantalla pública no contiene notas. El guion se consulta en este documento o en una segunda pantalla, mejora posterior.

## Diapositivas del piloto

### 1. Portada · «Justicia juvenil. Cifras con contexto»

- Objetivo: fijar el punto de partida y anunciar los tres planos.
- Mensaje principal: 24.279 infracciones vinculadas a condenas registradas en 2025; la cifra se presenta con su unidad y su fuente.
- Evidencia dominante: el número 24.279.
- Fuente: INE, población condenada 2025; FGE, memoria 2026, III.6.2.
- Notas del ponente: abrir con el dato, no con el marco. Aclarar que 24.279 son infracciones, no personas, y que corresponden a condenas firmes inscritas, no a todos los hechos ocurridos. Anunciar que la presentación separa actividad procesal, condenas y lecturas sobre el entorno digital.
- Transición: «Antes de mirar cada bloque, conviene ver por qué no se pueden sumar».

### 2. Tres planos, tres unidades

- Objetivo: evitar el error de sumar universos distintos.
- Mensaje principal: Fiscalía mide actividad procesal; el INE mide condenas registradas; el entorno digital es una interpretación atribuida a las memorias.
- Evidencia dominante: dos carriles y una banda de interpretación.
- Fuente: FGE, memoria 2026, III.6.2; INE, población condenada 2025.
- Notas del ponente: insistir en que un expediente no es una sentencia y una sentencia no es una infracción. La banda digital no es un recuento: inmediatez, desinhibición y consentimiento son lecturas de FGE 2024, V.1.3, y de la Fiscalía de Madrid 2024, III; no son una medición causal. No hay una variable de medio de comisión en las tablas usadas.
- Transición: «Veamos primero el plano procesal».

### 3. Lo que tramita Fiscalía

- Objetivo: dimensionar la actividad procesal sin confundirla con condenas.
- Mensaje principal: 74.538 diligencias preliminares (+10,6 %), 26.084 expedientes de reforma (+5,4 %) y 14.072 expedientes de ejecución (+4,2 %).
- Evidencia dominante: tres macrocifras con su unidad y su variación anual.
- Fuente: FGE, memoria 2026, III.6.2. Actividad de 2025; variación respecto a 2024.
- Notas del ponente: recalcar que son unidades distintas y no se suman. Los expedientes de ejecución no son «medidas en ejecución» ni equivalen a medidas impuestas. Las diligencias preliminares no son una cohorte de casos que llegue íntegra a sentencia. No presentar como embudo.
- Transición: «El segundo plano es el de las condenas registradas».

### 4. Concentración no es tasa

- Objetivo: mostrar que recuento y tasa responden a preguntas distintas.
- Mensaje principal: Madrid concentra más recuento; Castilla y León, más tasa.
- Evidencia dominante: dos paneles con los mismos cuatro territorios: Andalucía 4.028 (10,0), Cataluña 3.884 (10,6), Madrid 2.148 (6,9) y Castilla y León 1.534 (17,1).
- Fuente: INE, tabla 26030 y nota de prensa 2025. Lugar de condena; no residencia ni lugar de comisión. 19 territorios; 24.279 infracciones.
- Notas del ponente: la tasa se transcribe de la nota de prensa y se refiere a población de 14 a 17 años. El territorio es el lugar de condena, no el lugar de residencia ni el de comisión. La selección de cuatro territorios es ilustrativa: Andalucía y Cataluña encabezan el recuento; Madrid y Castilla y León muestran la inversión de orden. La referencia nacional que aparece en el dossier es 11,3 por 1.000; se puede mencionar de viva voz sin añadir otra cifra a la diapositiva.
- Transición: «Con estos tres planos claros, el guion completo puede entrar en edad, sexo, tipos y territorio».

## Decisiones para el guion completo

- Estructura prevista: 14 diapositivas principales y 4 o 5 anexos. El piloto cubre las cuatro primeras piezas de diseño.
- Se retiran las conformidades de la diapositiva del INE. Pertenecen a otro universo y a otro denominador; si se recuperan, irán en un anexo con su base explícita.
- Se simplifican las diapositivas digitales 9 y 11: se eliminan totales que no existen como variable y se conservan categorías separadas con su unidad.
- Fiscalía, condenas del INE e interpretaciones sobre el entorno digital se mantienen separados en todo el recorrido.
- No se presenta el subtotal de 4.756 como total de ciberdelitos. Las categorías generales se identifican como ámbitos de interés, no como recuento de hechos online.
- Las notas del ponente no se muestran en la pantalla pública. La segunda ventana es una mejora posterior; el piloto usa este Markdown.

## Datos reutilizados y ampliación del JSON

Las tres macrocifras de Fiscalía se centralizaron en el bloque `fiscalia` de `datos/justicia-juvenil.json`. Los valores son 74.538, 26.084 y 14.072, con su variación anual y su unidad. Proceden de FGE 2026, III.6.2, y coinciden con los que ya usaban `assets/app.js` y `visualize/registro-y-condena.html`. El dossier no consume ese bloque: `assets/data.js` se regeneró y `app.js` sigue usando sus constantes actuales. La unificación de esas constantes queda pendiente y no era necesaria para el piloto.

El piloto lee del JSON el total de infracciones, las tres cifras de Fiscalía y los cuatro territorios de la comparación. No hay cifras de Fiscalía ni de territorio escritas a mano en el HTML. `presentacion.html` carga CSS, JS y `data.js` con el sufijo `?v=20261019-1`: si se modifican esos recursos, hay que actualizar el sufijo para evitar cachés antiguas.

## Diseño

- Escenario fijo de 1600 × 900 (16:9) escalado al viewport. En 1024 × 768 el escenario se reduce a 1024 × 576 y deja bandas oscuras arriba y abajo; en 1280 × 720 llena la pantalla.
- Una idea por diapositiva. Sin tablas densas, sin desplazamiento y sin leyendas: las barras llevan etiqueta y valor directos.
- Márgenes amplios, alto contraste y tipografía grande. Tamaños efectivos calculados con la escala aplicada:

| Elemento | Escenario | 1280 × 720 | 1024 × 768 |
| --- | ---: | ---: | ---: |
| Titular | 94 px | 75 px | 60 px |
| Título de diapositiva | 76 px | 61 px | 49 px |
| Texto de apoyo | 40 px | 32 px | 26 px |
| Etiquetas y fuente | 30 px | 24 px | 19,2 px |
| Macrocifra de Fiscalía | 122 px | 98 px | 78 px |
| Cifra de portada | 170 px | 136 px | 109 px |

- Contraste comprobado con la fórmula WCAG: tinta sobre papel 13,04:1; texto atenuado 6,33:1; terracota 5,24:1; azul 10,30:1; barras sobre pista 9,13:1 (azul) y 4,64:1 (terracota). Ningún texto baja de 4,5:1.
- La barra de controles queda fuera del escenario escalado, de modo que en 4:3 se sitúa en la banda oscura y no tapa la fuente.

## Comprobaciones ejecutadas

- `python3 scripts/build-data.py`: regenera `assets/data.js` con el bloque `fiscalia`.
- `node scripts/check-data.cjs`: OK; 46 categorías, 19 territorios, 24.279, archivo histórico íntegro.
- `node scripts/check-deck.cjs`: OK; cuatro diapositivas, cifras de Fiscalía y territorios esperados, sin recursos remotos, sin la denominación «medidas en ejecución».
- Chrome real a 1280 × 720 y 1024 × 768: capturas de las cuatro diapositivas revisadas visualmente.
- Ajuste DOM a 1024 × 768, 1280 × 720 y 1600 × 900: cero elementos fuera del escenario y scroll de página igual al viewport.
- Apertura directa con `file://`: la portada y la actividad de Fiscalía renderizan con los datos locales.
- Navegador: teclado, `#1`–`#4`, atrás y adelante, botones de anterior y siguiente. Sin errores de consola.
- Pantalla completa: verificada con teclado y clic de confianza en Chrome headless; activa, muestra «Salir» y sale con `F` o `Esc`. En el panel de revisión integrado la activación no se pudo confirmar.
- Red: solo documento, hoja de estilos y dos guiones locales. Ninguna petición remota.
- Dossier: cargado con el `data.js` regenerado; 12 capítulos, navegación al capítulo siguiente y sin errores de consola.

## Pendiente de probar

- Proyector real y sala: contraste, tamaño percibido y distancia de lectura.
- Mando de presentación: las teclas habituales están cubiertas, pero conviene probar el modelo concreto.
- 1024 × 768 físico: aquí se revisó por captura; falta la comprobación en pantalla.
- Activación de pantalla completa desde el panel de revisión integrado.
- Duración real de las cuatro diapositivas y del guion completo de 20 minutos.
- Validación del público profesional y de educación.

## Archivos

- `presentacion.html`: las cuatro diapositivas.
- `assets/presentacion.css`: escenario, tipografía y componentes.
- `assets/presentacion.js`: lectura de datos, navegación, pantalla completa y barras.
- `datos/justicia-juvenil.json`: bloque `fiscalia` añadido.
- `assets/data.js`: regenerado.
- `scripts/check-deck.cjs`: comprobaciones del piloto.
- `docs/presentacion.md`: este guion.
