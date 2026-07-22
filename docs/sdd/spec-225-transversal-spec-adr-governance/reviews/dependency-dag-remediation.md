# Propuesta de remediación del DAG transversal

Documento de decisión para PLAT-REV-002. No modifica los README autoritativos: propone edges y
criterios que deben ser revisados antes de migrar metadata, registry, baseline y tests.

## Problema

`Depende de` debe significar “este contrato no puede alcanzar su gate sin el predecessor”. Hoy
también se usa para expresar “este documento será evaluado por un spike posterior”, generando
ciclos imposibles.

Ciclos mínimos comprobados:

```text
SPEC-210 → SPEC-214 → SPEC-210
SPEC-210 → SPEC-220 → SPEC-210
SPEC-210 → SPEC-226 → ... → SPEC-210
SPEC-211 → SPEC-226 → ... → SPEC-211
SPEC-212 → SPEC-213 → SPEC-212
SPEC-212 → SPEC-224 → ... → SPEC-212
```

La flecha expresa “depende de”. Un candidato evaluado por un spike no debe depender del resultado
como si ya fuera una decisión; el spike debe preceder a la adopción.

## Tipos de relación

- `Depende de`: predecessor aprobado/necesario para el gate de la spec; participa del DAG.
- `Evalúa`: spike/review inspecciona un candidato; no es dependencia del candidato.
- `Valida`: gate posterior prueba una implementación/decisión ya adoptada; no bloquea redactar la
  spec, pero sí el lifecycle objetivo indicado.
- `Relacionada con`: navegación/impacto sin orden obligatorio.

Sólo `Depende de` entra al sort topológico. Incorporar los otros campos al schema requiere una
decisión de SPEC-225; hasta entonces deben quedar en texto normativo, no simular edges.

## Orden propuesto para I0

```text
SPEC-207 Engineering Quality
  └─ SPEC-208 Zero-Cost MVP
      └─ SPEC-209 Monorepo Architecture
          └─ SPEC-226 I0 Validation Spikes
              ├─ ADR-002 → SPEC-210 Data & Identity
              ├─ ADR-003 → SPEC-211 Toolchain
              └─ ADR-004 → SPEC-212 Design System
                              └─ SPEC-213 Walking Skeleton
                                  └─ SPEC-214 Environments/Secrets
                                      └─ SPEC-215 HTTP Standards
                                          └─ SPEC-216 Observability
                                              └─ SPEC-217 Events
                                                  └─ SPEC-218 Offline
                                                      └─ SPEC-219 Security
                                                          └─ SPEC-220 Lifecycle/DR
                                                              └─ SPEC-221 CI/CD
                                                                  └─ SPEC-222 Delivery Plan
                                                                      └─ SPEC-223 Realtime
                                                                          └─ SPEC-224 Testing
                                                                              └─ SPEC-225 Governance verification
```

En este diagrama de orden la flecha significa “desbloquea” (la inversa de `Depende de`). El
diagrama simplifica dependencias múltiples; no implica que toda spec espere implementación
secuencial. Define el orden de decisiones/gates necesario para evitar ciclos.

## Cambios propuestos

| Spec | Remover de `Depende de` | Mantener/agregar como dependencia | Relación no-DAG |
| --- | --- | --- | --- |
| 208 | — | 207 | — |
| 209 | — | 207, 208 | — |
| 226 | ADR-002, ADR-003, 210–225 | ADR-001, 207–209 | `Evalúa` ADR-002/003 candidates y SPEC-210–225 concerns |
| 210 | 214, 220 | ADR-002, 207–209, 226 | 220 `Valida` backup/exit después |
| 211 | — | ADR-003, 207–210, 226 | — |
| 212 | 213, 224 | ADR-004, 207–211, 226 | 224 `Valida` testing/a11y después |
| 213 | — | functional I0 specs, 207–212 | — |
| 214 | — | 207–213 | — |
| 215 | — | 016, 023, 207, 209, 211, 213, 214 | — |
| 216–221 | rangos redundantes permitidos sólo si tooling los expande | predecessors directos + requisitos funcionales reales | restantes como relacionadas |
| 222 | `SPEC-001–206` como bloqueo total | specs del incremento I0 + 207–221 | roadmap completo como cobertura |
| 223 | — | 217, 218, 219, 222 | 207–216 como transitivas |
| 224 | `209–223` como rango opaco | 207, 209, 211–223 relevantes | dependencias transitivas derivadas |
| 225 | — | 207, 221, 222 | valida registry/ADRs de todas |

Los rangos en metadata sólo son válidos si el parser los expande y valida. Para evitar
ambigüedad inicial, preferir IDs explícitos o dependencias directas mínimas; el catálogo puede
calcular transitivas.

## Reglas del DAG

1. Todo ID existe y no referencia la propia spec.
2. El grafo de `Depende de` es acíclico.
3. ADR dependency exige estado compatible con el gate objetivo.
4. No se agrega un edge sólo porque dos specs se mencionan o se prueban mutuamente.
5. Preferir dependencias directas; no enumerar transitivas salvo requisito normativo real.
6. Foundations se referencia mediante IDs/ADRs concretos, no un nodo textual no validable.
7. Un cambio de edges regenera catálogo/índice y produce diff de ruta crítica.
8. El validador muestra el ciclo completo y falla antes de escribir proyecciones.

## Fixtures del validador

- DAG válido con varios predecessors y ADR aceptado.
- self-loop.
- ciclo de dos y de seis nodos.
- ID/ADR inexistente.
- ADR propuesta cuando el gate exige ACCEPTED.
- rango no soportado/ambiguo.
- relación `Evalúa/Valida` que no altera el sort.
- misma entrada produce orden topológico determinista por ID.

## Migración segura

1. Aprobar semántica y edges propuestos con owner/reviewer.
2. Actualizar schema/fixtures de SPEC-225.
3. Cambiar README autoritativos en un único commit documental.
4. Regenerar catálogo/índice y ejecutar cycle detection.
5. Publicar diff de ruta crítica y revisar consumidores.
6. Sólo entonces reevaluar PLAT-REV-002 y readiness; no auto-promover specs.
