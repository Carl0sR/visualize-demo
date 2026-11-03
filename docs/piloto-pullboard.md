# Piloto local con Pullboard

## Operativo

Clon de pruebas separado de visualize-demo. Pullboard 0.9.3 está instalado en el perfil de usuario; OpenCode usa un perfil aislado porque el perfil habitual devuelve «Database is not empty and has no session table». No se ha reparado ni migrado la base de datos habitual.

En terminal, desde este clon:

```sh
. ../pullboard-runtime/env.sh
pullboard status
pullboard view --project
```

También puede abrirse con `./scripts/pilot/abrir.sh`. Consultar el estado con `./scripts/pilot/continuar.sh status`. Para ejecutar una tarea disponible: `./scripts/pilot/continuar.sh docs` o `./scripts/pilot/continuar.sh qa`. Si el carril tiene entregas pendientes de revisión, el lanzador espera a que se resuelvan antes de apilar más trabajo.

El panel local requiere el enlace privado que imprime Pullboard. El registro del piloto es independiente del registro habitual. No requiere relay, inicio de sesión ni claves de API de pago. Los únicos modelos habilitados por el ejecutor son DeepSeek V4.1 Flash Free, GLM 5.3 Flash Free y Big Pickle; su disponibilidad gratuita puede cambiar.

Codex coordina y prepara la infraestructura. Los constructores trabajan en carriles separados: documentación y pruebas. Un revisor distinto comprueba el commit entregado. La coordinación y los adaptadores de ejecución siguen a cargo de Codex; no es una instalación que convierta por sí sola un panel en un equipo autónomo. Los hooks y el gate verifican el alcance y la integridad. Las pruebas existentes siguen ejecutándose y los datos oficiales no se modifican.

El ejecutor `../pullboard-runtime/bin/build-free` consume el contexto que genera Pullboard y utiliza OpenCode, sin llamadas directas a endpoints de inferencia. No delega y no cambia a modelos de pago. Cada llamada tiene un límite de 180 segundos. El runner se invoca con `--items 1 --attempts 2 --minutes 3`.

## Primera tanda

1. Corregir las referencias obsoletas a cuatro diapositivas del README.
2. Crear `docs/mapa-repositorio.md` con entradas, archivos generados y comandos.
3. Añadir `scripts/pilot/empty-selection.test.cjs` para verificar selección vacía, totales cero e inmutabilidad.

La aceptación automática comprueba hechos mínimos; el segundo agente debe evaluar también el contenido y reproducir un caso límite. Un gate verde no sustituye esa revisión. Las pruebas de documentación no garantizan por sí mismas una redacción correcta.

## Revisión independiente y confirmaciones

Las sesiones de construcción y revisión deben ser distintas también para Pullboard, no solo usar nombres de modelos distintos. Heredar la identidad de Codex entre procesos provocó rutas cruzadas y `SELF_SESSION_VERIFY`. Los constructores se ejecutan como agentes OpenCode sin heredar esa identidad. Los veredictos se registran desde una sesión independiente de Codex que ejecuta al modelo revisor gratuito; no se ha modificado Pullboard para eludir sus controles.

El adaptador `review-free` prepara el commit exacto, diff, criterio congelado, archivos relevantes y salidas de pruebas. El LLM evalúa ese paquete sin herramientas de escritura. Esto es una revisión de evidencia proporcionada por el ejecutor; no es navegación visual ni exploración libre del repositorio. Revisiones limitadas a 90 segundos.

El panel muestra ocho filas iniciales como «agent-approved; confirm or decline». Reflejan el alcance aprobado en el chat y transcrito por el agente. La confirmación personal interna del producto sigue pendiente: Carlos puede usar Confirm en Spec o en Needs you. El agente no ha pulsado esos botones ni se ha presentado como la persona.

## Resultados demostrados de la primera tanda

DeepSeek corrigió la documentación y construyó el mapa; GLM creó la prueba de selección vacía. La revisión cruzada encontró una carencia real: la prueba inicial no detectaba modificaciones del objeto de filtros. Una sonda en memoria añadió una propiedad a ese objeto: la entrega original pasó incorrectamente; la corregida falló con «el estado no debe mutarse». No se alteró el código del producto para esta demostración.

Las respuestas registradas de los modelos gratuitos declaran coste cero. No se ha medido todavía ahorro neto de tiempo o consumo frente a Codex solo. Los tiempos globales del tablero incluyen una interrupción por el límite de uso del coordinador y no deben interpretarse como latencia de los modelos.

## Previsto para siguientes tandas

Ampliar hasta 10–12 tareas: enlaces locales, pruebas adicionales y nuevos casos de recuperación. Ya se observaron rechazo y corrección, escalado por dependencia y reanudación tras una interrupción. Falta una comparación controlada con tareas equivalentes. Comparar tareas equivalentes con Codex y con modelos auxiliares. Estos experimentos todavía no se consideran ejecutados.

## Evaluación

Consultar `pullboard stats` para flujo, esperas y devoluciones. Anotar por tarea modelo exacto, intentos, tiempo, resultado, ayuda humana y retrabajo de Codex. El consumo y el coste proceden de los eventos de OpenCode; las estimaciones contrafactuales no son ahorro medido. La decisión de uso habitual queda pendiente de la comparación.

## Publicación y continuidad

Los commits son locales. No hacer push, publicar ni activar relay. GitHub Pages publica main del repositorio remoto; este clon no altera el sitio alojado. Las sesiones y el tablero local no se sincronizan por un push Git ordinario. Para continuar hay que conservar este clon y `../pullboard-runtime/`.
