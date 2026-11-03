# Piloto de colaboración con Pullboard

Alcance aprobado directamente por Carlos en este chat el 03/11/2026: piloto aislado sobre visualize-demo, Codex coordinador y modelos gratuitos de OpenCode para tareas acotadas. Sin publicación ni contratación de API.

## G · Objetivos aprobados
- G1 [approved, must] La documentación de la presentación describe sus siete diapositivas actuales sin referencias obsoletas a cuatro. | gate: node scripts/pilot/check-item.cjs readme
- G2 [approved, must] Una guía breve identifica entradas, datos generados y comandos de comprobación del repositorio. | gate: node scripts/pilot/check-item.cjs mapa
- G3 [approved, must] Una prueba automatizada demuestra que una selección vacía no produce totales espurios ni altera sus entradas. | gate: node scripts/pilot/check-item.cjs empty
- G4 [approved, must] El piloto permite observar tareas, entregas y verificación por agentes distintos en un panel local. | gate: review

## K · Límites aprobados
- K1 [approved, must] Solo se utilizan modelos gratuitos explícitos de OpenCode; no hay sustitución automática por modelos de pago. | gate: review
- K2 [approved, must] Los cambios permanecen en este clon; no se publica en GitHub ni se modifica Pages. | gate: review
- K3 [approved, must] Se conservan los datos originales, los recursos generados y el archivo histórico. | gate: node scripts/pilot/gate.cjs
- K4 [approved, must] Cada ejecución automática se limita a una tarea, dos intentos y tres minutos por intento como máximo. | gate: review
