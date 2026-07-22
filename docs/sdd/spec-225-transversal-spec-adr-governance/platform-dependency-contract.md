# Contrato de dependencias transversales

## Orientación normativa

El grafo debe ser acíclico y seguir esta dirección:

```text
Foundation/vision
  -> SPEC-225 governance rules
  -> SPEC-226 validation spikes
  -> ADR decisions
  -> platform contracts SPEC-207–224
  -> walking skeleton SPEC-213
  -> domain implementation
  -> release/operations evidence
```

Una dependencia significa “el contrato upstream debe estar decidido antes de aprobar el downstream”.
Evidencia posterior, consumer, verification o rollout no se registra como dependencia inversa.

## Ruptura de ciclos

- SPEC-226 depende sólo de preguntas/criterios de Foundation y SPEC-225; no depende de la adopción
  de SPEC-210/211/212 que está evaluando.
- ADR-002/003/004 consumen resultados de SPEC-226.
- SPEC-210/211/212 consumen ADRs aceptadas; no son dependencias de SPEC-226.
- SPEC-214 define configuración para una plataforma ya decidida y depende de SPEC-210; SPEC-210 no
  depende de SPEC-214 para decidirse.
- SPEC-220 consume la autoridad de datos de SPEC-210 para restore/retention; SPEC-210 no depende de
  SPEC-220. La demostración de salida es verification posterior de la decisión, no edge inverso.
- SPEC-207 y SPEC-221 definen gates; resultados de ejecutar gates son evidence, no dependencies.

## Gate

El registro machine-readable rechaza self-edge, ID inexistente y ciclo. La ruta I0 mínima es:
SPEC-225 -> SPEC-226 -> ADR-002/003/004 -> SPEC-207/209–212/214–224 -> SPEC-213. Ningún nodo se
promueve por el solo hecho de ordenar el grafo.
