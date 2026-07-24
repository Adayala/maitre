# Objetivo — SPEC-151

Definir el evento de invoice validada como señal previa a la autorización fiscal, corrigiendo el
nombre legado para que describa el momento real del ciclo de vida.

## Criterios de aceptación

### CAD-151-01 — El nombre canónico publicable es `fiscal.invoice.validated.v1`

el nombre publicable del evento es `fiscal.invoice.validated.v1`; `InvoiceGenerated`
queda sólo como alias legado no canónico.

### CAD-151-02 — El evento se emite sólo en `DRAFT -> VALIDATED`

el evento se emite cuando una invoice pasa de `DRAFT` a `VALIDATED`, no cuando ya existe
comprobante fiscal autorizado.

### CAD-151-03 — El payload sigue el envelope común con campos fiscales mínimos

el payload sigue el envelope común e incluye fiscalEntity, invoice, voucher type, currency,
totals, revisión de fuente y revisión agregada.

### CAD-151-04 — El evento omite PII y payloads fiscales sensibles no necesarios

el evento omite PII del receptor, secretos y payloads fiscales sensibles no necesarios para
consumidores.

### CAD-151-05 — Revalidaciones emiten revisiones superiores preservando orden y dedupe

una nueva validación después de cambios emite una revisión superior, preservando orden y
deduplicación at-least-once.

### CAD-151-06 — La aprobación exige evidencia de naming, revisiones y compatibilidad legacy

La aprobación exige fixtures de naming, transición válida, revisiones, redacción y
compatibilidad con consumidores legacy.
