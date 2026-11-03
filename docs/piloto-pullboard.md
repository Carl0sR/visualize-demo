# Piloto local con Pullboard

## Operativo

Clon de pruebas separado de visualize-demo. Pullboard 0.9.3 está instalado en el perfil de usuario; OpenCode usa un perfil aislado porque el perfil habitual devuelve «Database is not empty and has no session table». No se ha reparado ni migrado la base de datos habitual.

En terminal, desde este clon:

```sh
. ../pullboard-runtime/env.sh
pullboard status
pullboard view --project
```

El panel local requiere el enlace privado que imprime Pullboard. El registro del piloto es independiente del registro habitual. No requiere relay, inicio de sesión ni claves de API de pago. Los únicos modelos habilitados por el ejecutor son DeepSeek V4.1 Flash Free, GLM 5.3 Flash Free y Big Pickle; su disponibilidad gratuita puede cambiar.

Codex coordina y prepara la infraestructura. Los constructores trabajan en carriles separados: documentación y pruebas. Un revisor distinto comprueba el commit entregado. Los hooks y el gate verifican el alcance y la integridad. Las pruebas existentes siguen ejecutándose y los datos oficiales no se modifican.

El ejecutor `../pullboard-runtime/bin/build-free` consume el contexto que genera Pullboard y utiliza OpenCode, sin llamadas directas a endpoints de inferencia. No delega y no cambia a modelos de pago. Cada llamada tiene un límite de 180 segundos. El runner se invoca con `--items 1 --attempts 2 --minutes 3`.

## Primera tanda

1. Corregir las referencias obsoletas a cuatro diapositivas del README.
2. Crear `docs/mapa-repositorio.md` con entradas, archivos generados y comandos.
3. Añadir `scripts/pilot/empty-selection.test.cjs` para verificar selección vacía, totales cero e inmutabilidad.

La aceptación automática comprueba hechos mínimos; el segundo agente debe evaluar también el contenido y reproducir un caso límite. Un gate verde no sustituye esa revisión. Las pruebas de documentación no garantizan por sí mismas una redacción correcta.

## Previsto para siguientes tandas

Completar 10–12 tareas: enlaces locales, pruebas adicionales, fallo controlado, rechazo y corrección, escalado, interrupción y reanudación. Comparar tareas equivalentes con Codex y con modelos auxiliares. Estos experimentos todavía no se consideran ejecutados.

## Evaluación

Consultar `pullboard stats` para flujo, esperas y devoluciones. Anotar por tarea modelo exacto, intentos, tiempo, resultado, ayuda humana y retrabajo de Codex. El consumo y el coste proceden de los eventos de OpenCode; las estimaciones contrafactuales no son ahorro medido. La decisión de uso habitual queda pendiente de la comparación.

## Publicación y continuidad

Los commits son locales. No hacer push, publicar ni activar relay. GitHub Pages publica main del repositorio remoto; este clon no altera el sitio alojado. Las sesiones y el tablero local no se sincronizan por un push Git ordinario. Para continuar hay que conservar este clon y `../pullboard-runtime/`.
