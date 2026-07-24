# Estructura — SPEC-211

## Propósito

Este documento define la descomposición documental y los límites de responsabilidad de **Toolchain de implementación**. No prescribe una implementación adicional a la aprobada en `specification.md`.

## Artefactos autoritativos

- `specification.md`: comportamiento, políticas y criterios normativos.
- `plan.md`: secuencia de adopción y evidencias esperadas.
- `tasks.md`: unidades de trabajo trazables, sin sustituir criterios de aceptación.
- `objective.md`, `rules.md` y `verification.md`: intención, invariantes y evidencia esperada.
- `contract.md`: interfaz normativa resumida para consumidores.
- `structure.md`: límites, dependencias y ubicación de responsabilidades.

## Límites

- La spec es transversal: define contratos consumidos por dominios, aplicaciones y operación, pero no absorbe su lógica de negocio.
- Cada consumidor conserva la responsabilidad sobre sus invariantes locales y referencia este contrato cuando corresponda.
- Las excepciones requieren una decisión registrada y trazable; no se aceptan divergencias implícitas.

## Dependencias

- Entradas: decisiones y contratos enlazados desde `specification.md`.
- Salidas: restricciones verificables para planes, tareas y revisiones dependientes.
- La dirección de dependencia va desde los consumidores hacia este contrato transversal; este documento no crea dependencias de runtime.

## Evidencia estructural

- Los nueve artefactos base (`README`, specification, contract, objective, rules, structure, plan, tasks y verification) existen y comparten el identificador SPEC-211.
- Los enlaces relativos relevantes resuelven dentro de `docs/sdd`.
- Toda ampliación de alcance actualiza primero `specification.md` y luego sus artefactos derivados.
