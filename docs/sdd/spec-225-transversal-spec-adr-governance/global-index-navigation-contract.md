# Contrato de navegación de índices globales — SPEC-225

## Propósito

Definir cómo una persona navega desde los puntos de entrada globales hacia cada spec sin convertir
tres archivos en fuentes manuales contradictorias.

## Roots y responsabilidades

| Root | Rol | Responsabilidad |
| --- | --- | --- |
| `START_HERE.md` | `GUIDE` curada | explicar sistema y enlazar índices/recorridos principales |
| `INDEX.md` | `DERIVED` | índice completo y determinista de specs publicables |
| `SPECS.md` | `DERIVED`/roadmap | vista agregada de metadata/fase, con links a cada spec incluida |

La metadata autoritativa sigue en README de cada spec. Ningún root puede promover estado, prioridad,
owner o readiness manualmente.

## Cobertura publicable

Se distinguen:

```text
WORKTREE_PRESENT | VERSIONED_REGISTERED | PUBLISHED
```

- `WORKTREE_PRESENT`: directorio existe localmente.
- `VERSIONED_REGISTERED`: README está rastreado y cumple metadata mínima.
- `PUBLISHED`: incluido en INDEX/SPECS generado y alcanzable.

Un README no versionado no se publica sólo por existir. Hasta resolver ownership, las 136 specs
locales se reportan como deuda agregada, sin enlaces que legitimen contenido no revisado.

## INDEX

Cada entry contiene:

```yaml
id: SPEC-NNN
title: <README>
type: <README>
domain: <README>
state: <README>
readiness: <README>
phase: <README>
path: <README relativo>
```

Orden numérico por ID. El label enlaza `spec-NNN-slug/README.md`. El archivo es generado desde
README registrados, sin overrides manuales ni timestamps.

## SPECS

La tabla/lista conserva las vistas de fase/dominio, pero cada `SPEC-NNN` es link navegable. Los
valores se derivan del mismo registro que INDEX.

Secciones curadas pueden agrupar, pero no duplicar metadata manualmente. Una spec puede aparecer en
una sola fila autoritativa y en múltiples vistas derivadas.

## START_HERE

Debe enlazar:

- `INDEX.md` como inventario completo publicable;
- `SPECS.md` como roadmap;
- guía SDD/gobernanza;
- recorridos iniciales relevantes;
- explicación de cobertura y deuda.

No necesita enlazar directamente las 226 specs si existe camino válido vía INDEX.

## Línea base

Reachability Markdown desde roots:

| Root | README de specs alcanzables |
| --- | ---: |
| `START_HERE.md` | 0/226 |
| `INDEX.md` | 0/226 |
| `SPECS.md` | 0/226 |
| Unión de los tres | 0/226 |

Existen 90 README versionados/registrables y 136 locales sin ownership. Por lo tanto, el primer
target publicable es 90/90; el target final 226/226 depende de NAV-03.

## NAV-04A — Cobertura versionada

```yaml
batchId: NAV-04A
status: PLANNED
scope: 90 README versionados
beforeReachable: 0
targetReachable: 90
```

Cambios especificados:

1. derivar entries INDEX de los 90 README;
2. convertir sus IDs en SPECS a links;
3. asegurar START_HERE→INDEX/SPECS;
4. validar paths, metadata y determinismo;
5. registrar que 136 permanecen fuera por ownership.

## NAV-04B — Cobertura completa

```yaml
batchId: NAV-04B
status: BLOCKED
blocker: NAV-03 / ownership de 136 README
beforeReachable: 90
targetReachable: 226
```

Se ejecuta sólo después de que cada README local sea `VERSIONED_REGISTERED`.

## Drift

El gate compara:

- IDs/path de README registrados;
- entries de INDEX;
- filas/links de SPECS;
- reachability desde START_HERE.

Un nuevo README registrado sin entry/links falla. Un entry a README no registrado falla. Un cambio
manual del índice se reemplaza únicamente mediante regeneración revisada.

## Históricos

Specs `DEPRECATED`/`SUPERSEDED` siguen alcanzables con status/successor. Specs `RETIRED` pueden moverse
a índice histórico, pero conservan path o tombstone según contrato.

## Ratchets

NAV-04A:

```yaml
versionedReachable: 0 -> 90
newBrokenLinks: 0
unregisteredPublished: 0
metadataOverrides: 0
```

NAV-04B:

```yaml
registeredReachable: 90 -> 226
ownershipBlocked: 136 -> 0
newBrokenLinks: 0
```

## Criterios de salida

- [ ] START_HERE alcanza INDEX y SPECS.
- [ ] INDEX/SPECS alcanzan los 90 README versionados.
- [ ] Cero spec no registrada publicada.
- [ ] Índices deterministas y sin overrides.
- [ ] NAV-04B permanece bloqueado hasta NAV-03.

Los checks permanecen abiertos.
