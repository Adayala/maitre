# Registro de remediación de links rotos — SPEC-225

## Línea base

El escaneo Markdown excluye fenced code, URLs externas, anchors, `mailto:` y `data:`. En el checkout
actual existen dos links navegables rotos:

La semántica normativa del escaneo y su mapping a subcódigos `NAVL` está en
`markdown-link-reachability-contract.md`. Este registro conserva la identidad y decisión humana de
los findings.

| Finding | Source | Destino | Estado |
| --- | --- | --- | --- |
| `LINK-001` | `spec-002-entity-brand/README.md` | `notes.md` | `OWNERSHIP_BLOCKED` |
| `LINK-002` | `spec-145-api-arca-integration/README.md` | `notes.md` | `OWNERSHIP_BLOCKED` |

Ambos findings corresponden a `NAVL001`. La referencia histórica a “anchors excluidos” significa
que anchors puros no participaron del relevamiento original; el gate definitivo deberá validarlos
según el renderer aprobado y no heredará esa omisión como excepción.

Ambos destinos corresponden a archivos rastreados ausentes en el worktree. La eliminación local
preexiste a este registro.

## Estados

```text
OPEN | OWNERSHIP_BLOCKED | IN_REVIEW | RESOLVED | ACCEPTED_EXCEPTION
```

- `OPEN`: link/destino roto confirmado.
- `OWNERSHIP_BLOCKED`: intención/procedencia del cambio local no confirmada.
- `IN_REVIEW`: existe propuesta con owner/reviewer.
- `RESOLVED`: source/destino coherentes y verificados contra commit.
- `ACCEPTED_EXCEPTION`: sólo para indisponibilidad temporal con owner y vencimiento.

## Alternativas válidas

### Restaurar destino

Se usa si `notes.md` continúa siendo parte del paquete:

- recuperar contenido versionado o reconciliar una versión nueva;
- confirmar que no contiene decisiones stale;
- conservar historia;
- validar link;
- registrar review/commit.

Restaurar no significa aceptar automáticamente el contenido como vigente.

### Retirar link y documento

Se usa si la eliminación fue intencional:

- identificar dónde migró la información;
- comprobar que no quedan decisiones exclusivas;
- actualizar README/consumidores;
- registrar successor o razón de retiro;
- aceptar el deletion en review/commit.

Quitar el link sólo para lograr “cero rotos” no resuelve el lifecycle del documento.

### Reemplazar por successor

Se usa si otro documento asumió autoridad:

- successor explícito y existente;
- mapping de contenido/decisiones;
- link actualizado;
- documento anterior deprecado/superseded según corresponda.

## Reglas

1. No se crea un `notes.md` vacío.
2. No se elimina el link sin revisar la eliminación del destino.
3. No se restaura con checkout/reset destructivo sobre cambios locales.
4. El mismo commit resuelve source, destino/lifecycle y review record.
5. El scanner se ejecuta sobre el commit revisado.
6. Resolver LINK-001 no implica resolver LINK-002.

## Evidencia requerida

```yaml
findingId: LINK-001 | LINK-002
decision: RESTORE | RETIRE | REPLACE
owner: <asignación ACCEPTED>
reviewer: <asignación ACCEPTED>
sourceCommit: <sha completo>
targetOrSuccessor: <path>
contentReconciliation: <mapping/ref>
scanOutcome: PASS
reviewRef: DOC-REV-NNN
```

## Relación con NAV

- NAV-01/02 no tocan estos links.
- NAV-04A no debe ocultarlos ni aumentar su cantidad.
- Los ratchets usan `newBrokenLinks: 0` porque el baseline global ya contiene dos.
- El gate final requiere `LINK-001/002 RESOLVED` o excepción vigente.

## Criterios de salida

- [ ] Procedencia de ambos deletes confirmada.
- [ ] Decisión RESTORE/RETIRE/REPLACE por finding.
- [ ] Contenido/autoridad reconciliados.
- [ ] Cero links navegables rotos.
- [ ] DOC-REV sobre commit exacto.

Los checks permanecen abiertos; no se restauró ni retiró nada.
