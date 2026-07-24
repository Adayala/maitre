# Objetivo — SPEC-067

## Propósito

Guest es una identidad opcional con alcance tenant para atención, contacto consentido y
privacidad; no equivale a User ni es contenedor de historial operacional.

## Resultado esperado

### CAD-067-01 — Guest minimiza atributos y declara metadata de tratamiento por campo

Guest posee canonicalId, aliases y sólo atributos mínimos con purpose, basis/consent,
source, visibility y retention.

### CAD-067-02 — Los ContactPoints son opcionales, normalizados y no deduplican por nombre

email/teléfono son ContactPoints normalizados, verificables y opcionales; nombre solo nunca
deduplica.

### CAD-067-03 — Merge converge con auditoría y máxima restricción de privacidad

merge es concurrente y auditable, conserva aliases y aplica la restricción de privacidad
más protectora.

### CAD-067-04 — Unmerge no revive PII borrada ni consentimiento revocado

unmerge no restaura PII eliminada ni consentimiento revocado.

### CAD-067-05 — Historial y workflows sensibles permanecen separados del perfil Guest

historial, conteos y preferencias son referencias/proyecciones separadas; export,
anonymize y retention tienen workflows explícitos.

### CAD-067-06 — La aprobación exige evidencia de duplicados, privacidad y aislamiento

La aprobación exige fixtures de duplicados, merge/unmerge, opt-out, redacción,
export/anonymize y aislamiento.
