# Contrato de relaciones y dependencias — SPEC-225

## Propósito

Este contrato distingue precedencia obligatoria de evaluación, validación y navegación. Su objetivo
es producir un DAG verificable sin convertir toda referencia cruzada en dependencia.

## Relaciones

| Relación | Semántica | Participa del DAG |
| --- | --- | --- |
| `Depende de` | la spec no puede alcanzar el gate indicado sin el predecessor | sí |
| `Evalúa` | un spike o revisión inspecciona una alternativa/candidato | no |
| `Valida` | una verificación posterior aporta evidencia sobre una decisión o implementación | no |
| `Relacionada con` | existe impacto o navegación, sin orden obligatorio | no |
| `Reemplaza` | lifecycle histórico entre contratos | no; se valida como sucesión |

`Depende de` no significa “menciona”, “usa conceptos de”, “será testeada por” ni “pertenece al mismo
incremento”.

## Valores de metadata

El campo `Depende de` admite:

- lista explícita de `SPEC-NNN` y/o `ADR-NNN`;
- `N/A` cuando se revisó la spec y se determinó que no posee predecessors;
- `UNASSESSED` cuando todavía no se realizó esa revisión.

Ausencia del campo y `UNASSESSED` representan deuda durante migración. En una spec nueva el campo es
obligatorio. `N/A` nunca se infiere de la ausencia.

Los rangos (`SPEC-001–016`) no son serialización canónica hasta que exista tooling que los expanda y
valide; se prefieren IDs directos explícitos.

## Gate calificado

Una dependencia debe indicar qué gate bloquea cuando no sea el lifecycle completo:

```yaml
predecessor: SPEC-NNN | ADR-NNN
requiredFor: READY_FOR_REVIEW | READY_FOR_IMPLEMENTATION | VERIFIED | <incremento>
reason: <criterio que no puede satisfacerse sin el predecessor>
```

El README puede usar una lista compacta cuando todas las dependencias aplican al mismo gate y el
detalle está en `specification.md` o un contrato enlazado.

## Reglas del DAG

1. Todo nodo existe y usa ID canónico.
2. No se permiten self-loops.
3. El grafo de `Depende de` debe ser acíclico.
4. Sólo se registran predecessors directos; las transitivas se calculan.
5. Una ADR debe alcanzar el estado requerido por el gate consumidor.
6. `Evalúa` y `Valida` no se invierten para fabricar precedencia.
7. Cambiar edges requiere reason, owner/reviewer y diff de ruta crítica.
8. Un ciclo bloquea el gate; no se rompe eliminando edges sin revisar semántica.

## Autoridad

El Domain Owner propone dependencias funcionales. Architecture Reviewer valida dirección,
granularidad y ciclos. Product Owner valida impacto en incremento/ruta crítica. Las dependencias de
seguridad, fiscalidad, trabajo o datos requieren además reviewer competente.

## Migración del checkout actual

- 20 de 90 README raíz versionados declaran `Depende de`.
- 70 de 90 no declaran el campo y se consideran `UNASSESSED`, no `N/A`.
- La propuesta de `reviews/dependency-dag-remediation.md` es material de revisión, no edges
  efectivos.
- Los 136 README locales no versionados se migran después de resolver ownership.

Orden seguro:

1. revisar por bloque contratos y gates;
2. clasificar referencias como dependencia/evalúa/valida/relacionada;
3. registrar IDs directos o `N/A` con reviewer;
4. comprobar ciclos y ruta crítica;
5. actualizar README y catálogo en el mismo cambio;
6. reevaluar readiness sin promoción automática.

## Criterios de salida

- [ ] Los 90 README versionados declaran lista explícita o `N/A`.
- [ ] Cero `UNASSESSED` en el subset que solicite readiness.
- [ ] Cero IDs inexistentes, self-loops o ciclos.
- [ ] Los edges I0 poseen gate y reason verificables.
- [ ] Architecture Reviewer aprueba el diff de ruta crítica.

Los checks permanecen abiertos hasta contar con decisiones y evidencia.
